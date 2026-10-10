# End-to-End Lab: NASA Mars Rover MCP Connector and Plugin for Copilot Cowork

## Lab purpose

This lab teaches how to build, deploy, secure, publish, and troubleshoot a Copilot Cowork plugin backed by a remote Model Context Protocol (MCP) server hosted on Azure Kubernetes Service (AKS).

The lab uses a NASA Mars Rover scenario because it is visual, safe, read-only, and easy to understand. The same architecture can be reused for enterprise APIs, customer systems, internal tools, or line-of-business workflows.

## What participants will build

By the end of this lab, participants will understand and be able to reproduce:

1. A Node.js and TypeScript MCP server.
2. A set of read-only MCP tools.
3. Microsoft Entra authentication for `/mcp`.
4. Multi-tenant token validation with `ENTRA_TENANT_ID=organizations`.
5. Azure Container Registry image build.
6. AKS deployment.
7. Public HTTPS endpoint with DNS and certificate.
8. Copilot Cowork plugin package.
9. OAuthPluginVault authentication wiring.
10. Plugin packaging, publishing, validation, and troubleshooting.

## Recommended session format

| Section | Duration | Format |
| --- | ---: | --- |
| Concepts and architecture | 20 min | Slides |
| Local MCP server walkthrough | 20 min | Demo |
| Entra app and OAuth setup | 25 min | Demo + discussion |
| Azure network, AKS, DNS, TLS | 30 min | Slides + demo |
| Deploy MCP to AKS | 30 min | Hands-on |
| Build the Cowork plugin package | 25 min | Hands-on |
| Test, troubleshoot, and publish | 25 min | Hands-on |
| Wrap-up and Q&A | 10 min | Discussion |

Total recommended duration: 3 hours. For a shorter 90-minute session, present the deployment as a demo and let participants complete the hands-on lab later.

## Prerequisites

Participants need:

- Azure subscription access.
- Permission to create or use a resource group.
- Permission to create or use Azure Container Registry.
- Permission to create or use AKS.
- Permission to create Microsoft Entra app registrations.
- Access to a Copilot Cowork environment that supports remote MCP connectors.
- Git.
- Node.js 20 or newer.
- npm.
- PowerShell 7 or newer.
- Azure CLI.
- kubectl.

Instructor should prepare:

- A working demo deployment.
- A public HTTPS MCP endpoint.
- A test Copilot Cowork plugin package.
- A fallback recording or screenshots in case tenant policy blocks plugin upload.

## Architecture

```text
User in Copilot Cowork
  -> plugin manifest
  -> OAuthPluginVault sign-in
  -> bearer token
  -> HTTPS POST /mcp
  -> Azure ingress or LoadBalancer
  -> AKS service
  -> Node.js MCP server
  -> NASA mars.nasa.gov public feeds
```

The core principle is separation of responsibilities:

| Layer | Responsibility |
| --- | --- |
| Copilot Cowork plugin | Describes connector, tools, skills, auth reference, and MCP URL. |
| OAuthPluginVault | Handles user sign-in and token acquisition. |
| Entra app registration | Defines API audience and delegated scope. |
| MCP server | Validates token, exposes tools, fetches NASA data. |
| AKS and ingress | Hosts and exposes the MCP service securely. |
| DNS and TLS | Provide trusted public HTTPS access. |

## Lab 1: Clone and inspect the repository

Clone:

```powershell
git clone https://github.com/prasuk_microsoft/copilot-cowork-mcp-lab.git
cd copilot-cowork-mcp-lab
```

Inspect key folders:

```text
src/          MCP server code
k8s/          Kubernetes manifests
appPackage/   Copilot Cowork plugin package source
docs/         Blogs, lab guides, and session material
```

Build:

```powershell
npm install
npm run build
```

Expected result:

```text
tsc completes without TypeScript errors
```

## Lab 2: Understand the MCP server

Open:

```text
src/index.ts
```

Discuss:

- Express app.
- `/healthz` endpoint.
- `/mcp` endpoint.
- MCP server registration.
- Read-only tool registration.
- Tool annotations.

Open:

```text
src/auth.ts
```

Discuss:

- Bearer token extraction.
- `ENTRA_AUDIENCE`.
- `ENTRA_TENANT_ID`.
- `organizations` tenant mode.
- Dynamic tenant JWKS lookup.
- Issuer validation.
- Audience validation.

Open:

```text
src/nasa.ts
```

Discuss:

- Current `https://mars.nasa.gov` feeds.
- Curiosity and Perseverance support.
- Legacy rover limitations.
- Error handling and response shaping.

## Lab 3: Run locally

Create local environment file:

```powershell
Copy-Item .env.example .env
```

For local unauthenticated testing, set:

```text
AUTH_REQUIRED=false
NASA_BASE_URL=https://mars.nasa.gov
NASA_API_KEY=DEMO_KEY
```

Run:

```powershell
npm run dev
```

Health check:

```powershell
Invoke-WebRequest http://localhost:8000/healthz
```

Expected:

```json
{"status":"ok"}
```

Manual MCP smoke test:

```powershell
$body = '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'

Invoke-WebRequest `
  -Uri "http://localhost:8000/mcp" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

## Lab 4: Create the Entra app registration

In Microsoft Entra admin center:

1. Go to **App registrations**.
2. Select **New registration**.
3. Name:

   ```text
   nasa-mars-rover-mcp
   ```

4. Supported account types:

   ```text
   Accounts in any organizational directory
   ```

5. Copy the Application client ID.

Expose API:

```text
Application ID URI: api://<APP_CLIENT_ID>
Scope: MarsRover.Read
```

Record:

```text
APP_CLIENT_ID=<your app client id>
NORMAL_AUDIENCE=api://<APP_CLIENT_ID>
```

## Lab 5: Understand OAuthPluginVault and audiences

The plugin manifest uses:

```json
"authorization": {
  "type": "OAuthPluginVault",
  "referenceId": "REPLACE_WITH_OAUTH_PLUGIN_VAULT_REFERENCE_ID"
}
```

The normal Entra API audience is:

```text
api://<APP_CLIENT_ID>
```

The Copilot Cowork OAuth audience may be:

```text
api://auth-<OAUTH_CONNECTION_ID>/<APP_CLIENT_ID>
```

For best compatibility, deploy the backend with both:

```text
ENTRA_AUDIENCE=api://<APP_CLIENT_ID>,api://auth-<OAUTH_CONNECTION_ID>/<APP_CLIENT_ID>
```

## Lab 6: Azure hosting and network requirements

Minimum Azure components:

| Component | Purpose |
| --- | --- |
| Resource group | Logical container for resources. |
| Azure Container Registry | Stores the MCP server image. |
| AKS cluster | Runs the MCP server container. |
| Kubernetes namespace | Isolates the workload. |
| Kubernetes service | Exposes pods inside the cluster. |
| Ingress controller or LoadBalancer | Exposes the service externally. |
| Public DNS name | Stable hostname for Copilot Cowork. |
| TLS certificate | Trusted HTTPS endpoint. |

Network requirements:

1. Copilot Cowork must reach the MCP endpoint over public HTTPS.
2. `/mcp` must be reachable from Copilot service egress.
3. `/healthz` should be reachable for diagnostics.
4. AKS nodes need outbound access to pull from ACR.
5. The MCP server needs outbound HTTPS access to `mars.nasa.gov`.
6. Certificate validation must succeed from the Copilot client.

## Lab 7: Create Azure resources

Set variables:

```powershell
$resourceGroup = "REPLACE_WITH_RESOURCE_GROUP"
$location = "westus2"
$acrName = "REPLACE_WITH_ACR_NAME"
$aksName = "REPLACE_WITH_AKS_CLUSTER_NAME"
```

Create resource group:

```powershell
az group create `
  --name $resourceGroup `
  --location $location
```

Create ACR:

```powershell
az acr create `
  --resource-group $resourceGroup `
  --name $acrName `
  --sku Basic
```

Create AKS:

```powershell
az aks create `
  --resource-group $resourceGroup `
  --name $aksName `
  --node-count 1 `
  --attach-acr $acrName `
  --generate-ssh-keys
```

Get credentials:

```powershell
az aks get-credentials `
  --resource-group $resourceGroup `
  --name $aksName `
  --overwrite-existing
```

## Lab 8: First deployment with LoadBalancer

Use this for a quick endpoint test before DNS and TLS.

```powershell
.\deploy.ps1 `
  -ResourceGroup "REPLACE_WITH_RESOURCE_GROUP" `
  -AksCluster "REPLACE_WITH_AKS_CLUSTER_NAME" `
  -AcrName "REPLACE_WITH_ACR_NAME" `
  -McpHost "unused-for-loadbalancer" `
  -NasaApiKey "DEMO_KEY" `
  -EntraTenantId "organizations" `
  -EntraAudience "api://REPLACE_WITH_APP_CLIENT_ID,api://auth-REPLACE_WITH_OAUTH_CONNECTION_ID/REPLACE_WITH_APP_CLIENT_ID" `
  -UseLoadBalancer
```

Check:

```powershell
kubectl -n nasa-mars-rover-mcp get pods
kubectl -n nasa-mars-rover-mcp get svc
```

Health:

```powershell
Invoke-WebRequest http://<EXTERNAL_IP>/healthz
```

## Lab 9: Production-style HTTPS endpoint

For Copilot Cowork, use HTTPS.

Options:

| Option | When to use |
| --- | --- |
| Azure public IP + DNS label | Fast demo environments. |
| Custom DNS + ingress-nginx | Production-style training. |
| Application Gateway Ingress Controller | Enterprise ingress and WAF scenarios. |
| Azure Container Apps | Alternative to AKS for simpler hosting. |

For AKS with ingress:

1. Install an ingress controller.
2. Create or configure public IP.
3. Create DNS record:

   ```text
   mcp.contoso.com -> ingress public IP
   ```

4. Configure TLS certificate.
5. Deploy with `McpHost` set to the DNS hostname.

Health:

```powershell
Invoke-WebRequest https://REPLACE_WITH_MCP_HOST/healthz
```

Unauthenticated MCP check:

```powershell
$body = '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'

Invoke-WebRequest `
  -Uri "https://REPLACE_WITH_MCP_HOST/mcp" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body `
  -SkipHttpErrorCheck
```

Expected:

```json
{"error":"missing_bearer_token"}
```

## Lab 10: Build the Copilot Cowork plugin

Open:

```text
appPackage/manifest.json
```

Replace:

```text
REPLACE_WITH_APP_PACKAGE_ID
REPLACE_WITH_MCP_HOST
REPLACE_WITH_OAUTH_PLUGIN_VAULT_REFERENCE_ID
```

Confirm:

```json
"mcpServerUrl": "https://REPLACE_WITH_MCP_HOST/mcp"
```

Confirm tool file:

```json
"mcpToolDescription": {
  "file": "tools/nasa-mars-rover-tools.json"
}
```

Do not use:

```text
./tools/nasa-mars-rover-tools.json
```

Package:

```powershell
Compress-Archive `
  -Path .\appPackage\* `
  -DestinationPath .\nasa-mars-rover-cowork-plugin.zip `
  -Force
```

Validate zip layout:

```powershell
Expand-Archive .\nasa-mars-rover-cowork-plugin.zip .\plugin-test -Force
Get-ChildItem .\plugin-test
```

Expected:

```text
manifest.json
color.png
outline.png
tools/
skills/
```

## Lab 11: Publish and test options

Publishing options vary by tenant and preview program.

Common options:

| Option | Use case |
| --- | --- |
| Local upload/sideload | Developer testing. |
| Tenant app catalog | Controlled internal distribution. |
| Admin-managed deployment | Wider organizational rollout. |
| Separate plugin-only repo | Reusable plugin package independent of backend source. |
| GitHub release artifact | Versioned plugin zip download. |

Recommended release naming:

```text
nasa-mars-rover-cowork-plugin-0.1.6.zip
```

## Lab 12: Troubleshooting

Check ingress logs:

```powershell
kubectl -n ingress-nginx logs deployment/ingress-nginx-controller --since=30m
```

Check app logs:

```powershell
kubectl -n nasa-mars-rover-mcp logs deployment/nasa-mars-rover-mcp --since=30m
```

Common errors:

| Symptom | Likely issue |
| --- | --- |
| `missing_bearer_token` | No auth token was sent. |
| `invalid_token` | Audience, issuer, expiry, or signature mismatch. |
| `Authentication failed` | OAuthPluginVault or backend token validation issue. |
| Pod `Pending` | AKS node lacks CPU or memory request capacity. |
| Health fails | AKS stopped, ingress down, DNS wrong, or cert invalid. |
| Plugin install fails | Zip layout or manifest schema problem. |

## Lab 13: Instructor demo checklist

Before the session:

```text
[ ] Repo opens cleanly on GitHub.
[ ] `npm install` and `npm run build` succeed.
[ ] Demo AKS cluster is running.
[ ] `/healthz` returns 200.
[ ] `/mcp` returns `missing_bearer_token` without a token.
[ ] Plugin zip validates with manifest at zip root.
[ ] OAuthPluginVault reference is ready.
[ ] Copilot Cowork can install/connect to the plugin.
[ ] Backup screenshots are ready.
```

## Lab 14: Participant take-home exercises

1. Add a new MCP tool for a different public API.
2. Create a plugin-only repository.
3. Add GitHub Actions to package the plugin zip.
4. Replace AKS with Azure Container Apps.
5. Add structured logging for token validation failures.
6. Create a private enterprise connector using the same pattern.

## Wrap-up

Participants should leave with a full mental model:

```text
MCP server code -> container image -> AKS hosting -> HTTPS endpoint -> Entra auth -> OAuthPluginVault -> Copilot Cowork plugin -> user experience
```

That is the repeatable pattern for building secure remote MCP connectors for Copilot Cowork.

