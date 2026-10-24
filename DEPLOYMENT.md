# Deployment guide

This guide walks through deploying the NASA Mars Rover MCP connector from scratch. It is written for readers who are new to Azure, AKS, Microsoft Entra app registrations, and Copilot plugin packaging.

## 1. Prerequisites

Install these tools on your workstation:

- Node.js 20 or newer
- npm
- PowerShell 7 or newer
- Azure CLI
- kubectl

You also need:

- An Azure subscription.
- Permission to create or use an Azure Container Registry.
- Permission to create or use an AKS cluster.
- Permission to create Microsoft Entra app registrations.
- Access to a Copilot/Cowork environment that supports remote MCP connectors.

Sign in to Azure:

```powershell
az login
az account show
```

## 2. Clone the repository

```powershell
git clone https://github.com/ukpkumar/copilot-cowork-mcp-lab.git
cd copilot-cowork-mcp-lab
```

If you are using your own fork, replace the GitHub URL with your fork URL.

Important: run `npm` commands only after you are inside the repository folder.
If your prompt still shows `PS C:\Users\...>`, you are not in the repo root yet.

Quick check:

```powershell
Get-Location
Get-ChildItem package.json
```

Expected: `package.json` is found in the current folder.

Install and build:

```powershell
npm install
npm run build
```

## 3. Create the Microsoft Entra app registration

1. Open the Microsoft Entra admin center.
2. Go to **Applications** > **App registrations**.
3. Select **New registration**.
4. Use a name such as `nasa-mars-rover-mcp`.
5. For supported account types, choose **Accounts in any organizational directory**.
6. Create the app.
7. Copy the **Application (client) ID**. This is `REPLACE_WITH_APP_CLIENT_ID`.

## 4. Expose an API scope

In the app registration:

1. Open **Expose an API**.
2. Set the Application ID URI to:

   ```text
   api://REPLACE_WITH_APP_CLIENT_ID
   ```

3. Add a delegated scope:

   ```text
   MarsRover.Read
   ```

4. Use an admin consent display name such as:

   ```text
   Read NASA Mars Rover Photos
   ```

The normal token audience is:

```text
api://REPLACE_WITH_APP_CLIENT_ID
```

## 5. Create or identify the Copilot OAuthPluginVault connection

In your Copilot/Cowork connector setup, create an OAuthPluginVault connection that uses your Entra app.

Record:

```text
REPLACE_WITH_OAUTH_CONNECTION_ID
REPLACE_WITH_OAUTH_PLUGIN_VAULT_REFERENCE_ID
```

The Cowork SSO audience usually follows this pattern:

```text
api://auth-REPLACE_WITH_OAUTH_CONNECTION_ID/REPLACE_WITH_APP_CLIENT_ID
```

The MCP server should accept both audiences:

```text
api://REPLACE_WITH_APP_CLIENT_ID,api://auth-REPLACE_WITH_OAUTH_CONNECTION_ID/REPLACE_WITH_APP_CLIENT_ID
```

## 6. Create Azure resources

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

Create AKS and attach ACR:

```powershell
az aks create `
  --resource-group $resourceGroup `
  --name $aksName `
  --node-count 1 `
  --attach-acr $acrName `
  --generate-ssh-keys
```

Get Kubernetes credentials:

```powershell
az aks get-credentials `
  --resource-group $resourceGroup `
  --name $aksName `
  --overwrite-existing
```

Check the node:

```powershell
kubectl get nodes
```

## 7. Deploy with a LoadBalancer for first test

This is the simplest first deployment because it does not require DNS or TLS.

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

Get the public IP:

```powershell
kubectl -n nasa-mars-rover-mcp get svc nasa-mars-rover-mcp
```

Health check:

```powershell
Invoke-WebRequest http://REPLACE_WITH_EXTERNAL_IP/healthz
```

Expected:

```json
{"status":"ok"}
```

## 8. Deploy with HTTPS ingress for production-like use

Most Copilot/Cowork MCP clients require HTTPS. Configure an ingress controller, DNS, and TLS certificate for:

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

Health check:

```powershell
Invoke-WebRequest https://REPLACE_WITH_MCP_HOST/healthz
```

## 9. Verify MCP auth behavior

An unauthenticated `/mcp` request should fail with `missing_bearer_token`. That is expected.

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

## 10. Configure the Copilot app package

Edit `appPackage/manifest.json`:

```json
"id": "REPLACE_WITH_APP_PACKAGE_ID"
```

Set your MCP URL:

```json
"mcpServerUrl": "https://REPLACE_WITH_MCP_HOST/mcp"
```

Set the OAuth reference:

```json
"referenceId": "REPLACE_WITH_OAUTH_PLUGIN_VAULT_REFERENCE_ID"
```

## 11. Build the plugin zip

```powershell
Compress-Archive `
  -Path .\appPackage\* `
  -DestinationPath .\nasa-mars-rover-cowork-plugin.zip `
  -Force
```

Upload the zip to Copilot/Cowork.

## 12. Multi-tenant checklist

For another tenant to use the same backend:

- The Entra app must be multi-tenant.
- The other tenant must be able to consent to the app/scope.
- The OAuthPluginVault reference must be valid for that Copilot/Cowork environment.
- The backend must use `ENTRA_TENANT_ID=organizations`.
- The backend must accept the token audience emitted by the OAuth flow.

## 13. Useful Kubernetes commands

```powershell
kubectl -n nasa-mars-rover-mcp get pods
kubectl -n nasa-mars-rover-mcp get deployment
kubectl -n nasa-mars-rover-mcp logs deployment/nasa-mars-rover-mcp
kubectl -n nasa-mars-rover-mcp describe pod -l app=nasa-mars-rover-mcp
```
