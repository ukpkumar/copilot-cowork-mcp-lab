param(
  [Parameter(Mandatory = $true)]
  [string] $ResourceGroup,

  [Parameter(Mandatory = $true)]
  [string] $AksCluster,

  [Parameter(Mandatory = $true)]
  [string] $AcrName,

  [Parameter(Mandatory = $true)]
  [string] $McpHost,

  [Parameter(Mandatory = $true)]
  [string] $NasaApiKey,

  [Parameter(Mandatory = $true)]
  [string] $EntraTenantId,

  [Parameter(Mandatory = $true)]
  [string] $EntraAudience,

  [string] $ImageTag = "0.1.6",

  [switch] $UseLoadBalancer
)

$ErrorActionPreference = "Stop"

az acr build `
  --registry $AcrName `
  --image "nasa-mars-rover-mcp:$ImageTag" `
  .

az aks get-credentials `
  --resource-group $ResourceGroup `
  --name $AksCluster `
  --overwrite-existing

kubectl apply -f .\k8s\namespace.yaml

kubectl create secret generic nasa-mars-rover-mcp-secrets `
  --namespace nasa-mars-rover-mcp `
  --from-literal NASA_API_KEY="$NasaApiKey" `
  --from-literal ENTRA_TENANT_ID="$EntraTenantId" `
  --from-literal ENTRA_AUDIENCE="$EntraAudience" `
  --dry-run=client `
  -o yaml | kubectl apply -f -

$manifestPath = if ($UseLoadBalancer) { ".\k8s\deployment.loadbalancer.yaml" } else { ".\k8s\deployment.yaml" }
$manifest = Get-Content $manifestPath -Raw
$manifest = $manifest.Replace('${ACR_NAME}', $AcrName)
$manifest = $manifest.Replace('${IMAGE_TAG}', $ImageTag)
if (-not $UseLoadBalancer) {
  $manifest = $manifest.Replace('${MCP_HOST}', $McpHost)
}
$tempManifest = Join-Path $env:TEMP "nasa-mars-rover-mcp-k8s.yaml"
Set-Content -Path $tempManifest -Value $manifest -Encoding utf8

kubectl apply -f $tempManifest
kubectl rollout status deployment/nasa-mars-rover-mcp -n nasa-mars-rover-mcp

if ($UseLoadBalancer) {
  Write-Host "Waiting for external IP..."
  kubectl get svc nasa-mars-rover-mcp -n nasa-mars-rover-mcp
  Write-Host "MCP endpoint: http://<EXTERNAL-IP>/mcp"
  Write-Host "Health endpoint: http://<EXTERNAL-IP>/healthz"
} else {
  Write-Host "MCP endpoint: https://$McpHost/mcp"
  Write-Host "Health endpoint: https://$McpHost/healthz"
}
