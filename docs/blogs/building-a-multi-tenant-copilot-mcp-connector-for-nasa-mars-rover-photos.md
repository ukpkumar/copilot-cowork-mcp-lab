# Building a Multi-Tenant Microsoft Copilot MCP Connector for NASA Mars Rover Photos

This blog walks through building and deploying a remote Model Context Protocol (MCP) connector for Microsoft Copilot/Cowork. The connector lets Copilot search and retrieve NASA Mars rover photos using read-only MCP tools.

The goal is to make this guide understandable even if you are new to MCP, Azure Kubernetes Service, Microsoft Entra ID, or Copilot plugin packaging.

By the end, you will have:

- A Node.js MCP server running in Azure Kubernetes Service.
- Microsoft Entra ID authentication protecting the `/mcp` endpoint.
- A multi-tenant configuration that can work across organizational tenants.
- A Copilot/Cowork plugin package that connects to the remote MCP server.
- A GitHub repository structure you can reuse for your own connector.

## 1. What are we building?

We are building a remote MCP server called `nasa-mars-rover-mcp`.

The server exposes these tools:

| Tool | What it does |
| --- | --- |
| `list_rovers` | Lists supported Mars rovers. |
| `list_rover_cameras` | Lists cameras/instruments for each rover. |
| `get_rover_photos` | Gets rover photos by Martian sol or Earth date. |
| `get_latest_rover_photos` | Gets latest photos for a rover. |
| `get_rover_manifest` | Gets manifest-style mission metadata. |

The connector uses NASA's current public `mars.nasa.gov` image feeds instead of the older retired `api.nasa.gov/mars-photos` endpoint.

## 2. Architecture overview

Here is the high-level architecture:

```text
Microsoft Copilot / Cowork
        |
        | OAuthPluginVault authentication
        v
Copilot plugin manifest
        |
        | HTTPS MCP call
        v
Azure ingress or LoadBalancer
        |
        v
Node.js MCP server on AKS
        |
        v
NASA mars.nasa.gov public image feeds
```

The MCP server exposes two HTTP endpoints:

| Endpoint | Authentication | Purpose |
| --- | --- | --- |
| `/healthz` | Public | Used by Kubernetes and humans to confirm the service is alive. |
| `/mcp` | Bearer token required | Used by Copilot/Cowork to call MCP tools. |

When `/mcp` receives a request, it validates:

- token signature
- token issuer
- token expiry
- token audience

## 3. Repository layout

The repository is organized like this:

```text
nasa-mars-rover-mcp/
├─ README.md
├─ BLOG.md
├─ DEPLOYMENT.md
├─ TROUBLESHOOTING.md
├─ SECURITY.md
├─ package.json
├─ package-lock.json
├─ tsconfig.json
├─ Dockerfile
├─ deploy.ps1
├─ src/
│  ├─ index.ts
│  ├─ auth.ts
│  └─ nasa.ts
├─ k8s/
│  ├─ namespace.yaml
│  ├─ deployment.yaml
│  ├─ deployment.loadbalancer.yaml
│  ├─ letsencrypt-prod.yaml
│  └─ secret.template.yaml
└─ appPackage/
   ├─ manifest.json
   ├─ color.png
   ├─ outline.png
   ├─ tools/
   │  └─ nasa-mars-rover-tools.json
   └─ skills/
      ├─ mars-rover-photo-research/
      ├─ list-mars-rovers/
      ├─ list-rover-cameras/
      ├─ get-rover-photos/
      ├─ get-latest-rover-photos/
      └─ get-rover-manifest/
```

## 4. Prerequisites

Install these tools:

- Node.js 20 or newer
- npm
- PowerShell 7 or newer
- Azure CLI
- kubectl
- Git

You also need:

- An Azure subscription.
- Permission to create Azure resources.
- Permission to create Microsoft Entra app registrations.
- Access to a Copilot/Cowork environment that supports remote MCP connectors.

Sign in to Azure:

```powershell
az login
az account show
```

## 5. Clone and build the project

Clone your repository:

```powershell
git clone https://github.com/YOUR_GITHUB_ORG/nasa-mars-rover-mcp.git
cd nasa-mars-rover-mcp
```

Install packages:

```powershell
npm install
```

Build the TypeScript project:

```powershell
npm run build
```

If the build succeeds, the server source is valid.

## 6. Understand the local server

The server entry point is:

```text
src/index.ts
```

The authentication logic is:

```text
src/auth.ts
```

The NASA API/client logic is:

```text
src/nasa.ts
```

For local testing, copy the sample environment file:

```powershell
Copy-Item .env.example .env
```

For a simple unauthenticated local test, edit `.env`:

```text
AUTH_REQUIRED=false
NASA_BASE_URL=https://mars.nasa.gov
NASA_API_KEY=DEMO_KEY
```

Start the server:

```powershell
npm run dev
```

Open another terminal and test health:

```powershell
Invoke-WebRequest http://localhost:8000/healthz
```

Expected response:

```json
{"status":"ok"}
```

## 7. Create the Microsoft Entra app registration

The MCP server uses Microsoft Entra ID to validate requests from Copilot/Cowork.

In the Microsoft Entra admin center:

1. Go to **Applications**.
2. Select **App registrations**.
3. Select **New registration**.
4. Name the app:

   ```text
   nasa-mars-rover-mcp
   ```

5. For supported account types, choose:

   ```text
   Accounts in any organizational directory
   ```

6. Create the app.
7. Copy the **Application (client) ID**.

In this blog, we refer to that value as:

```text
REPLACE_WITH_APP_CLIENT_ID
```

## 8. Expose an API scope

Still in the app registration:

1. Go to **Expose an API**.
2. Set the Application ID URI to:

   ```text
   api://REPLACE_WITH_APP_CLIENT_ID
   ```

3. Add a scope:

   ```text
   MarsRover.Read
   ```

4. Use a consent display name such as:

   ```text
   Read NASA Mars Rover Photos
   ```

This creates the normal API audience:

```text
api://REPLACE_WITH_APP_CLIENT_ID
```

The MCP server will validate tokens against this audience.

## 9. Understand the Cowork OAuth audience

When using Copilot/Cowork with `OAuthPluginVault`, the token audience may use a Cowork-specific format:

```text
api://auth-REPLACE_WITH_OAUTH_CONNECTION_ID/REPLACE_WITH_APP_CLIENT_ID
```

So the MCP server should accept both:

```text
api://REPLACE_WITH_APP_CLIENT_ID
api://auth-REPLACE_WITH_OAUTH_CONNECTION_ID/REPLACE_WITH_APP_CLIENT_ID
```

In deployment, pass them as a comma-separated value:

```text
ENTRA_AUDIENCE=api://REPLACE_WITH_APP_CLIENT_ID,api://auth-REPLACE_WITH_OAUTH_CONNECTION_ID/REPLACE_WITH_APP_CLIENT_ID
```

## 10. Create the OAuthPluginVault connection

In your Copilot/Cowork environment, create an OAuth connection for this connector.

You need to capture:

```text
REPLACE_WITH_OAUTH_CONNECTION_ID
REPLACE_WITH_OAUTH_PLUGIN_VAULT_REFERENCE_ID
```

The plugin manifest uses the reference ID here:

```json
"authorization": {
  "type": "OAuthPluginVault",
  "referenceId": "REPLACE_WITH_OAUTH_PLUGIN_VAULT_REFERENCE_ID"
}
```

The MCP server itself does not create this reference. It comes from your Copilot/Cowork OAuth configuration.

## 11. Create Azure resources

Set variables:

```powershell
$resourceGroup = "REPLACE_WITH_RESOURCE_GROUP"
$location = "westus2"
$acrName = "REPLACE_WITH_ACR_NAME"
$aksName = "REPLACE_WITH_AKS_CLUSTER_NAME"
```

Create a resource group:

```powershell
az group create `
  --name $resourceGroup `
  --location $location
```

Create Azure Container Registry:

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

Get AKS credentials:

```powershell
az aks get-credentials `
  --resource-group $resourceGroup `
  --name $aksName `
  --overwrite-existing
```

Confirm the node is ready:

```powershell
kubectl get nodes
```

## 12. First deployment with a LoadBalancer

For first-time testing, a LoadBalancer is easier than configuring DNS and TLS.

Run:

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

This command:

1. Builds the container image using ACR.
2. Gets AKS credentials.
3. Creates the Kubernetes namespace.
4. Creates the Kubernetes secret.
5. Applies the deployment and service.
6. Waits for rollout.

Get the external IP:

```powershell
kubectl -n nasa-mars-rover-mcp get svc nasa-mars-rover-mcp
```

Test health:

```powershell
Invoke-WebRequest http://REPLACE_WITH_EXTERNAL_IP/healthz
```

Expected:

```json
{"status":"ok"}
```

## 13. Production-style deployment with HTTPS

Copilot/Cowork usually requires HTTPS for remote MCP servers.

For production-style hosting, configure:

- ingress controller
- DNS name
- TLS certificate

Your public host should look like:

```text
REPLACE_WITH_MCP_HOST
```

Then deploy without `-UseLoadBalancer`:

```powershell
.\deploy.ps1 `
  -ResourceGroup "REPLACE_WITH_RESOURCE_GROUP" `
  -AksCluster "REPLACE_WITH_AKS_CLUSTER_NAME" `
  -AcrName "REPLACE_WITH_ACR_NAME" `
  -McpHost "REPLACE_WITH_MCP_HOST" `
  -NasaApiKey "DEMO_KEY" `
  -EntraTenantId "organizations" `
  -EntraAudience "api://REPLACE_WITH_APP_CLIENT_ID,api://auth-REPLACE_WITH_OAUTH_CONNECTION_ID/REPLACE_WITH_APP_CLIENT_ID"
```

Test:

```powershell
Invoke-WebRequest https://REPLACE_WITH_MCP_HOST/healthz
```

Expected:

```json
{"status":"ok"}
```

## 14. Verify the MCP endpoint is protected

Send an unauthenticated MCP request:

```powershell
$body = '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'

Invoke-WebRequest `
  -Uri "https://REPLACE_WITH_MCP_HOST/mcp" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body `
  -SkipHttpErrorCheck
```

Expected response:

```json
{"error":"missing_bearer_token"}
```

This is good. It means `/mcp` is protected and requires Copilot/Cowork to send a bearer token.

## 15. Configure the Copilot plugin manifest

Open:

```text
appPackage/manifest.json
```

Replace the app package ID:

```json
"id": "REPLACE_WITH_APP_PACKAGE_ID"
```

Set your remote MCP server URL:

```json
"mcpServerUrl": "https://REPLACE_WITH_MCP_HOST/mcp"
```

Set your OAuthPluginVault reference:

```json
"referenceId": "REPLACE_WITH_OAUTH_PLUGIN_VAULT_REFERENCE_ID"
```

The tool description file should remain package-root-relative:

```json
"mcpToolDescription": {
  "file": "tools/nasa-mars-rover-tools.json"
}
```

## 16. Package the Copilot plugin

Create the zip from the contents of `appPackage`:

```powershell
Compress-Archive `
  -Path .\appPackage\* `
  -DestinationPath .\nasa-mars-rover-cowork-plugin.zip `
  -Force
```

Important: zip the contents of `appPackage`, not the parent folder itself.

The zip should contain:

```text
manifest.json
color.png
outline.png
tools/nasa-mars-rover-tools.json
skills/...
```

Upload this zip to your Copilot/Cowork environment.

## 17. Test from Copilot/Cowork

After installation, try prompts like:

```text
List the available Mars rovers.
```

```text
Show the latest Curiosity rover photos.
```

```text
Find Perseverance NAVCAM photos.
```

If authentication works, Copilot/Cowork should call the MCP tools.

## 18. Supporting multiple tenants

To support users from another tenant:

1. The Entra app must be multi-tenant.
2. The consuming tenant must consent to the app/scope.
3. The OAuthPluginVault reference must be valid in the Copilot/Cowork environment.
4. The MCP backend must use:

   ```text
   ENTRA_TENANT_ID=organizations
   ```

5. The MCP backend must accept the token audience that Cowork sends.

If users see:

```text
Authentication failed. Please try again.
```

check the Kubernetes logs:

```powershell
kubectl -n nasa-mars-rover-mcp logs deployment/nasa-mars-rover-mcp --since=30m
```

Also check the configured audiences:

```powershell
kubectl -n nasa-mars-rover-mcp get secret nasa-mars-rover-mcp-secrets -o json
```

## 19. Common troubleshooting

| Problem | Likely cause | Fix |
| --- | --- | --- |
| `missing_bearer_token` | No bearer token was sent | Expected for manual unauthenticated tests. Check OAuthPluginVault if seen from Copilot. |
| `invalid_token` | Issuer, signature, expiry, or audience failed | Check `ENTRA_TENANT_ID` and `ENTRA_AUDIENCE`. |
| `Authentication failed` | Cowork reached MCP but auth failed | Check token audience and tenant consent. |
| Pod stuck in `Pending` | AKS resource pressure | Use 1 replica, lower CPU requests, or scale the node pool. |
| Plugin upload fails | Incorrect zip structure | Zip contents of `appPackage`, not the folder itself. |
| Tools ask for approval every time | Client or tenant policy | Tools are marked read-only, but tenant policy may still require approval. |

## 20. Security notes

Do not commit:

```text
.env
*.zip
azure-deployment.generated.json
DEPLOYMENT-STEPS.md
real OAuthPluginVault reference IDs
tenant-specific secrets
```

Use placeholders in public repositories:

```text
REPLACE_WITH_APP_CLIENT_ID
REPLACE_WITH_OAUTH_CONNECTION_ID
REPLACE_WITH_OAUTH_PLUGIN_VAULT_REFERENCE_ID
REPLACE_WITH_MCP_HOST
```

Keep `/healthz` public, but keep `/mcp` protected.

Do not disable token validation in production.

## 21. Final checklist

Before you call the deployment complete, verify:

```text
[ ] npm run build succeeds
[ ] Entra app is multi-tenant
[ ] API scope exists
[ ] OAuthPluginVault reference is configured
[ ] AKS pod is running
[ ] /healthz returns 200
[ ] /mcp without token returns missing_bearer_token
[ ] appPackage/manifest.json has your MCP URL
[ ] appPackage/manifest.json has your OAuthPluginVault reference
[ ] plugin zip contains manifest.json at the root
[ ] Copilot/Cowork can connect
```

## Conclusion

You have now built a multi-tenant remote MCP connector for Microsoft Copilot/Cowork, deployed it to Azure Kubernetes Service, protected it with Microsoft Entra ID, and packaged it as a Copilot plugin.

The same pattern can be reused for other APIs: replace the NASA client logic, update tool descriptions, expose the right Entra API scope, and package the connector for Copilot.
