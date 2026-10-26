# Azure MCP customer demo runbook

Use this runbook to demonstrate the main MCP components in Azure during customer sessions.

## Demo goal

Show the end-to-end flow:

1. Copilot plugin calls `/mcp`
2. MCP server on AKS validates token
3. Tool executes and returns response

## Recommended duration

- 15-25 minutes total

## Pre-demo checklist (5 minutes before session)

1. Confirm Azure sign-in is correct tenant/subscription.
2. Confirm AKS cluster is running.
3. Confirm MCP health endpoint returns `{"status":"ok"}`.
4. Keep one Copilot chat tab ready with a sample prompt.

## Demo sequence (portal sections + talk track)

## 1) Resource Group view (architecture at a glance)

**Portal path:** `Azure Portal -> Resource groups -> nasa-rover-mcp-rg`

Show:

- AKS cluster
- ACR
- networking resources (public IP / load balancer / ingress-related resources)

Say:

- "This resource group is the full MCP runtime boundary for the demo."
- "Everything from identity-backed API runtime to ingress is grouped here."

## 2) Microsoft Entra app registration (identity and auth contract)

**Portal path:** `Microsoft Entra admin center -> App registrations -> <MCP app>`

Show:

- Supported account types (multi-tenant if configured)
- **Expose an API** scope (for example `MarsRover.Read`)
- Application (client) ID used in audience values

Say:

- "This defines who can request tokens and what scope MCP accepts."
- "The plugin requests a token, and the MCP server validates audience/issuer against this app configuration."

## 3) AKS cluster (runtime)

**Portal path:** `Azure Portal -> Kubernetes services -> nasa-rover-mcp-aks`

Show:

- Cluster overview and node pool
- Workloads/Pods in MCP namespace
- Service status

Say:

- "This is where the MCP server runs."
- "Pods are the serving units; deployments handle rollout and resiliency."

## 4) Ingress or LoadBalancer endpoint (API entry)

**Portal path:** `AKS -> Services and ingresses`

Show:

- External endpoint/host
- Route to `/mcp` and `/healthz`

Say:

- "`/healthz` is for health checks; `/mcp` is the authenticated protocol endpoint."
- "Copilot plugin manifest points to the HTTPS `/mcp` URL."

## 5) ACR (image supply chain)

**Portal path:** `Azure Portal -> Container registries -> <ACR name> -> Repositories`

Show:

- MCP image repository
- tags used by deployment

Say:

- "Build artifacts are versioned here, and AKS deploys from these tags."

## 6) Monitoring and troubleshooting (operations)

**Portal path:** `AKS -> Insights` (and/or `Log Analytics workspace -> Logs`)

Show:

- Pod/container logs
- Recent errors or request traces

Say:

- "This is where we verify runtime behavior and investigate auth/tool failures quickly."

## 7) Optional live proof in Copilot (business value close)

Run one prompt in Copilot:

- "List Mars rovers"
- "Show Perseverance cameras"

Say:

- "This confirms the full path: Copilot -> MCP endpoint -> tool execution -> grounded response."

## Fast fallback checks (if something fails during demo)

From terminal:

```powershell
kubectl -n nasa-mars-rover-mcp get pods
kubectl -n nasa-mars-rover-mcp logs deployment/nasa-mars-rover-mcp --tail=100
Invoke-WebRequest https://REPLACE_WITH_MCP_HOST/healthz
```

If auth fails:

1. Recheck plugin `referenceId` (OAuthPluginVault).
2. Recheck backend audience values.
3. Recheck Entra app scope/consent.

## Suggested opening and closing lines

Opening:

- "I’ll show identity, runtime, network entry, and operational visibility for this MCP server in Azure."

Closing:

- "You’ve seen the complete enterprise path from Copilot prompt to authenticated MCP tool response with Azure-native operations."
