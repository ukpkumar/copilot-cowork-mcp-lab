import type { Request, Response, NextFunction } from "express";
import { createRemoteJWKSet, decodeJwt, jwtVerify, type JWTVerifyGetKey } from "jose";

export interface AuthConfig {
  required: boolean;
  tenantId?: string;
  audience?: string[];
}

const jwksByTenantId = new Map<string, JWTVerifyGetKey>();

function isAnyOrganizationTenant(tenantId?: string) {
  return !tenantId || ["*", "any", "common", "organizations"].includes(tenantId.toLowerCase());
}

function getTenantJwks(tenantId: string) {
  const cached = jwksByTenantId.get(tenantId);
  if (cached) {
    return cached;
  }

  const jwks = createRemoteJWKSet(new URL(`https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`));
  jwksByTenantId.set(tenantId, jwks);
  return jwks;
}

function validIssuersForTenant(tenantId: string) {
  return [`https://login.microsoftonline.com/${tenantId}/v2.0`, `https://sts.windows.net/${tenantId}/`];
}

export function getAuthConfig(): AuthConfig {
  const audience = process.env.ENTRA_AUDIENCES ?? process.env.ENTRA_AUDIENCE;

  return {
    required: process.env.AUTH_REQUIRED !== "false",
    tenantId: process.env.ENTRA_TENANT_ID,
    audience: audience?.split(",").map((value) => value.trim()).filter(Boolean)
  };
}

export function createAuthMiddleware(config: AuthConfig) {
  if (!config.required) {
    return (_request: Request, _response: Response, next: NextFunction) => next();
  }

  if (!config.audience) {
    throw new Error("ENTRA_AUDIENCE or ENTRA_AUDIENCES is required when AUTH_REQUIRED is enabled.");
  }

  const acceptAnyOrganizationTenant = isAnyOrganizationTenant(config.tenantId);

  return async (request: Request, response: Response, next: NextFunction) => {
    try {
      const authorization = request.header("authorization");
      const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];

      if (!token) {
        response.status(401).json({ error: "missing_bearer_token" });
        return;
      }

      const tenantId = acceptAnyOrganizationTenant ? decodeJwt(token).tid : config.tenantId;
      if (typeof tenantId !== "string" || !/^[0-9a-f-]{36}$/i.test(tenantId)) {
        response.status(401).json({ error: "invalid_token", message: "Token is missing a valid tenant id." });
        return;
      }

      await jwtVerify(token, getTenantJwks(tenantId), {
        issuer: validIssuersForTenant(tenantId),
        audience: config.audience
      });

      next();
    } catch (error) {
      response.status(401).json({
        error: "invalid_token",
        message: error instanceof Error ? error.message : "Token validation failed."
      });
    }
  };
}
