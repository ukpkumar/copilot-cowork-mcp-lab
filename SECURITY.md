# Security notes

## Do not commit secrets

Never commit:

- `.env`
- Kubernetes secret files with real values
- OAuthPluginVault reference IDs for private environments
- Tenant-specific generated deployment JSON
- Plugin zip files built for private tenants

This repo intentionally uses placeholders such as:

```text
REPLACE_WITH_APP_CLIENT_ID
REPLACE_WITH_OAUTH_CONNECTION_ID
REPLACE_WITH_OAUTH_PLUGIN_VAULT_REFERENCE_ID
REPLACE_WITH_MCP_HOST
```

## Keep `/mcp` protected

The `/healthz` endpoint is public so Kubernetes and ingress can test liveness.

The `/mcp` endpoint must remain protected by bearer token validation in production.

## Audience validation matters

Do not accept arbitrary Microsoft-issued tokens. The server must validate the token audience against the specific API audiences you expect:

```text
api://REPLACE_WITH_APP_CLIENT_ID
api://auth-REPLACE_WITH_OAUTH_CONNECTION_ID/REPLACE_WITH_APP_CLIENT_ID
```

## Multi-tenant mode

`ENTRA_TENANT_ID=organizations` allows tokens from any Microsoft Entra organizational tenant, but the server still validates:

- token signature
- token issuer
- token expiry
- token audience

Use this only when you intend to support cross-tenant access.
