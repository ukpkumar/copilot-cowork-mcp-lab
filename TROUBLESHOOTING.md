# Troubleshooting

## `Authentication failed. Please try again.`

This usually means Copilot/Cowork reached `/mcp`, but the MCP server rejected the bearer token.

Check the live logs:

```powershell
kubectl -n nasa-mars-rover-mcp logs deployment/nasa-mars-rover-mcp --since=30m
```

Check the configured auth values:

```powershell
kubectl -n nasa-mars-rover-mcp get secret nasa-mars-rover-mcp-secrets -o json
```

Decode `ENTRA_TENANT_ID` and `ENTRA_AUDIENCE`. They should look like:

```text
ENTRA_TENANT_ID=organizations
ENTRA_AUDIENCE=api://REPLACE_WITH_APP_CLIENT_ID,api://auth-REPLACE_WITH_OAUTH_CONNECTION_ID/REPLACE_WITH_APP_CLIENT_ID
```

## `missing_bearer_token`

This means the request did not include an `Authorization: Bearer ...` header.

For manual unauthenticated tests, this is expected. For Copilot/Cowork, check the OAuthPluginVault configuration.

## `invalid_token`

Likely causes:

- Wrong audience.
- Wrong issuer.
- Token was issued for a different app.
- Tenant consent was not granted.
- The OAuthPluginVault connection uses a different app registration than the MCP backend expects.

## Pod is stuck in `Pending`

Check scheduling events:

```powershell
kubectl -n nasa-mars-rover-mcp describe pod -l app=nasa-mars-rover-mcp
```

Common cause on small AKS clusters:

```text
Insufficient cpu
```

Fix options:

- Use 1 replica.
- Lower CPU requests.
- Increase node size.
- Add another node.

## Health URL fails

Check if AKS is running:

```powershell
az aks show `
  --resource-group "REPLACE_WITH_RESOURCE_GROUP" `
  --name "REPLACE_WITH_AKS_CLUSTER_NAME" `
  --query powerState
```

Start it if stopped:

```powershell
az aks start `
  --resource-group "REPLACE_WITH_RESOURCE_GROUP" `
  --name "REPLACE_WITH_AKS_CLUSTER_NAME"
```

## Plugin package fails to install

Confirm the zip contains files at the package root:

```text
manifest.json
color.png
outline.png
tools/nasa-mars-rover-tools.json
skills/...
```

Do not zip the parent `appPackage` folder itself. Zip the contents of `appPackage`.

## Tool approval appears every time

The tool metadata marks tools as read-only and non-destructive. If the client still asks every time, this is usually controlled by Copilot/Cowork client behavior or tenant/admin policy.
