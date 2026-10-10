# NASA Mars Rover MCP Connector for Microsoft Copilot

This repository contains a beginner-friendly sample for building, deploying, and packaging a remote Model Context Protocol (MCP) server for Microsoft Copilot/Cowork. The MCP server exposes read-only NASA Mars rover image tools backed by current public `mars.nasa.gov` image feeds.

The sample includes:

- A Node.js + TypeScript MCP server.
- Microsoft Entra ID bearer-token validation.
- Multi-tenant authentication support with `ENTRA_TENANT_ID=organizations`.
- Azure Container Registry (ACR) and Azure Kubernetes Service (AKS) deployment assets.
- A Copilot app package with MCP tool metadata and agent skills.

## What the connector can do

The MCP server exposes these read-only tools:

| Tool | Purpose |
| --- | --- |
| `list_rovers` | List supported Mars rovers and mission metadata. |
| `list_rover_cameras` | List valid rover camera/instrument codes. |
| `get_rover_photos` | Fetch rover photos by sol or Earth date. |
| `get_latest_rover_photos` | Fetch the latest available photos for a rover. |
| `get_rover_manifest` | Fetch mission manifest metadata and photo counts. |

## Architecture

```text
Microsoft Copilot / Cowork
  -> OAuthPluginVault sign-in
  -> Remote MCP connector from appPackage/manifest.json
  -> HTTPS POST /mcp
  -> AKS ingress or LoadBalancer
  -> Node.js MCP server
  -> NASA mars.nasa.gov public feeds
```

The server has two HTTP endpoints:

| Endpoint | Auth | Purpose |
| --- | --- | --- |
| `/healthz` | Public | Health probe for Kubernetes, ingress, and manual checks. |
| `/mcp` | Bearer token required | MCP protocol endpoint used by Copilot/Cowork. |

## Repository layout

```text
.
├─ appPackage/                  # Copilot app package files
│  ├─ manifest.json             # Remote MCP connector definition
│  ├─ tools/                    # MCP tool descriptions
│  └─ skills/                   # Agent skill instructions
├─ k8s/                         # Kubernetes manifests
├─ src/                         # MCP server source
├─ deploy.ps1                   # ACR build + AKS deploy helper
├─ Dockerfile
├─ package.json
├─ DEPLOYMENT.md                # Detailed deployment walkthrough
├─ TROUBLESHOOTING.md
└─ SECURITY.md
```

## Quick start

Install dependencies and build locally:

```powershell
npm install
npm run build
```

Run locally without authentication for development:

```powershell
Copy-Item .env.example .env
# Edit .env and set AUTH_REQUIRED=false for local unauthenticated testing.
npm run dev
```

Check health:

```powershell
Invoke-WebRequest http://localhost:8000/healthz
```

Expected response:

```json
{"status":"ok"}
```

## Important placeholders

Before deploying or packaging, replace these placeholders:

| Placeholder | Meaning |
| --- | --- |
| `REPLACE_WITH_APP_CLIENT_ID` | Microsoft Entra application/client ID for your MCP API. |
| `REPLACE_WITH_APP_PACKAGE_ID` | Unique app package ID for your Copilot/Teams app package. |
| `REPLACE_WITH_MCP_HOST` | Public hostname for your MCP server, without `https://`. |
| `REPLACE_WITH_OAUTH_CONNECTION_ID` | OAuth connection ID used by Copilot/Cowork. |
| `REPLACE_WITH_OAUTH_PLUGIN_VAULT_REFERENCE_ID` | OAuthPluginVault reference ID created in your Copilot/Cowork environment. |
| `REPLACE_WITH_NASA_API_KEY` | NASA API key. `DEMO_KEY` works only for light testing. |

## Deployment overview

1. Create a multi-tenant Microsoft Entra app registration.
2. Expose an API scope such as `MarsRover.Read`.
3. Create/configure an OAuthPluginVault connection in Copilot/Cowork.
4. Deploy the MCP server to AKS.
5. Update `appPackage/manifest.json` with your public MCP URL and OAuthPluginVault reference.
6. Zip the `appPackage` folder and upload it to Copilot/Cowork.

For step-by-step instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

## Authentication model

For multi-tenant use, deploy the backend with:

```text
ENTRA_TENANT_ID=organizations
```

The MCP server dynamically reads the token tenant (`tid`) and validates:

- token signature
- token issuer
- token expiry
- token audience

For Copilot/Cowork, the server often needs to accept two possible audiences:

```text
api://REPLACE_WITH_APP_CLIENT_ID
api://auth-REPLACE_WITH_OAUTH_CONNECTION_ID/REPLACE_WITH_APP_CLIENT_ID
```

Set both as a comma-separated value:

```text
ENTRA_AUDIENCE=api://REPLACE_WITH_APP_CLIENT_ID,api://auth-REPLACE_WITH_OAUTH_CONNECTION_ID/REPLACE_WITH_APP_CLIENT_ID
```

## Package the Copilot plugin

After editing `appPackage/manifest.json`, create the zip:

```powershell
Compress-Archive `
  -Path .\appPackage\* `
  -DestinationPath .\nasa-mars-rover-cowork-plugin.zip `
  -Force
```

Upload `nasa-mars-rover-cowork-plugin.zip` to your Copilot/Cowork environment.

## Troubleshooting

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common issues such as `Authentication failed`, `missing_bearer_token`, invalid audience errors, pod scheduling issues, and plugin packaging mistakes.

## Security

Do not commit secrets or tenant-specific generated files. See [SECURITY.md](SECURITY.md).
