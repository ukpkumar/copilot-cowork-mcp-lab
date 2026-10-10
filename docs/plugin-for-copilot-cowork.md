# Plugin for Copilot Cowork

This document explains the Copilot Cowork plugin package included in this repository. It is written so the plugin can be understood, customized, packaged, and, if desired, published as a separate plugin-only project.

## What the plugin does

The plugin connects Microsoft Copilot Cowork to a remote NASA Mars Rover MCP server.

The plugin itself does not fetch NASA data. Instead, it tells Copilot Cowork:

1. Where the remote MCP server is.
2. Which MCP tools are available.
3. Which agent skills are packaged with the connector.
4. How authentication should be performed through `OAuthPluginVault`.

The remote MCP server then handles:

- Microsoft Entra token validation.
- NASA Mars rover data retrieval.
- Tool execution.
- Returning structured results to Copilot Cowork.

## Plugin folder

The plugin package source lives here:

```text
appPackage/
```

Current structure:

```text
appPackage/
├─ manifest.json
├─ color.png
├─ outline.png
├─ tools/
│  └─ nasa-mars-rover-tools.json
└─ skills/
   ├─ mars-rover-photo-research/
   │  └─ SKILL.md
   ├─ list-mars-rovers/
   │  └─ SKILL.md
   ├─ list-rover-cameras/
   │  └─ SKILL.md
   ├─ get-rover-photos/
   │  └─ SKILL.md
   ├─ get-latest-rover-photos/
   │  └─ SKILL.md
   └─ get-rover-manifest/
      └─ SKILL.md
```

## Manifest overview

The main plugin file is:

```text
appPackage/manifest.json
```

Important fields:

| Field | Purpose |
| --- | --- |
| `manifestVersion` | Teams/Copilot app manifest schema version. |
| `version` | Plugin package version. |
| `id` | Unique app package ID. Replace with your own package ID. |
| `developer` | Developer name, website, privacy URL, and terms URL. |
| `name.short` | Short plugin name shown in the client. |
| `name.full` | Full plugin name shown in plugin details. |
| `description` | Short and full plugin descriptions. |
| `icons` | App package icons. |
| `accentColor` | Theme/accent color. |
| `agentSkills` | Skill folders included in the package. |
| `agentConnectors` | Remote MCP connector configuration. |

## Connector configuration

The connector is defined under:

```json
"agentConnectors": [
  {
    "id": "nasa-mars-rover-mcp",
    "displayName": "NASA Mars Rover Photos",
    "description": "Authenticated NASA Mars Rover Photos MCP server.",
    "toolSource": {
      "remoteMcpServer": {
        "mcpServerUrl": "https://REPLACE_WITH_MCP_HOST/mcp",
        "mcpToolDescription": {
          "file": "tools/nasa-mars-rover-tools.json"
        },
        "authorization": {
          "type": "OAuthPluginVault",
          "referenceId": "REPLACE_WITH_OAUTH_PLUGIN_VAULT_REFERENCE_ID"
        }
      }
    }
  }
]
```

### `mcpServerUrl`

This is the public HTTPS endpoint for your remote MCP server:

```text
https://REPLACE_WITH_MCP_HOST/mcp
```

The health endpoint is separate:

```text
https://REPLACE_WITH_MCP_HOST/healthz
```

Use `/mcp` in the plugin manifest, not `/healthz`.

### `mcpToolDescription.file`

This must point to the tool description JSON inside the plugin package:

```text
tools/nasa-mars-rover-tools.json
```

The path is package-root-relative. Do not prefix it with `./`.

### `OAuthPluginVault.referenceId`

This value comes from the Copilot Cowork OAuth connection configuration.

Use a placeholder in public repos:

```text
REPLACE_WITH_OAUTH_PLUGIN_VAULT_REFERENCE_ID
```

Use the real value only in a private deployment package.

## Required placeholders

Before packaging, replace:

| Placeholder | Replace with |
| --- | --- |
| `REPLACE_WITH_APP_PACKAGE_ID` | Unique plugin package ID. |
| `REPLACE_WITH_MCP_HOST` | Public MCP hostname, without `https://`. |
| `REPLACE_WITH_OAUTH_PLUGIN_VAULT_REFERENCE_ID` | OAuthPluginVault reference ID from Copilot Cowork. |

The backend deployment also needs:

| Placeholder | Replace with |
| --- | --- |
| `REPLACE_WITH_APP_CLIENT_ID` | Entra app client ID for the MCP API. |
| `REPLACE_WITH_OAUTH_CONNECTION_ID` | OAuth connection ID used in the Cowork SSO audience. |

## Tool descriptions

The plugin declares five MCP tools in:

```text
appPackage/tools/nasa-mars-rover-tools.json
```

All tools are read-only:

```json
"annotations": {
  "readOnlyHint": true,
  "destructiveHint": false,
  "idempotentHint": true
}
```

These annotations tell Copilot Cowork that the tools do not modify external systems. Tenant or client policy may still require approval.

### Tools included

| Tool | Title | Purpose |
| --- | --- | --- |
| `list_rovers` | List Mars Rovers | Lists supported NASA Mars rovers and basic mission metadata. |
| `list_rover_cameras` | List Rover Cameras | Lists supported NASA camera codes by rover. |
| `get_rover_photos` | Get Rover Photos | Fetches photos by rover and either Martian sol or Earth date. |
| `get_latest_rover_photos` | Get Latest Rover Photos | Fetches the latest available rover photos. |
| `get_rover_manifest` | Get Rover Manifest | Fetches mission metadata, available sols, and photo counts. |

### Supported rover names

The tool schemas include:

```text
curiosity
perseverance
opportunity
spirit
```

Current public image retrieval is primarily available for Curiosity and Perseverance through current NASA feeds. Legacy rovers may have limited metadata depending on available public endpoints.

### `get_rover_photos` inputs

| Input | Type | Required | Notes |
| --- | --- | --- | --- |
| `rover` | string | Yes | One of the supported rover identifiers. |
| `sol` | integer | No | Martian solar day. |
| `earthDate` | string | No | Date in `YYYY-MM-DD` format. |
| `camera` | string | No | Camera/instrument code such as `FHAZ`, `NAVCAM`, `MAST`, or `ZCAM`. |
| `page` | integer | No | Page number, minimum `1`. |
| `limit` | integer | No | Maximum number of photos, `1` to `100`. |

Use either `sol` or `earthDate` for a search.

## Agent skills

The plugin includes six agent skills.

| Skill folder | Purpose |
| --- | --- |
| `mars-rover-photo-research` | General research workflow for rover imagery, manifests, latest photos, and comparisons. |
| `list-mars-rovers` | Guides Copilot to list supported rover identifiers and mission metadata. |
| `list-rover-cameras` | Guides Copilot to resolve camera codes and camera names. |
| `get-rover-photos` | Guides Copilot to retrieve rover photos by sol or Earth date. |
| `get-latest-rover-photos` | Guides Copilot to retrieve latest available photos. |
| `get-rover-manifest` | Guides Copilot to retrieve mission manifest metadata and photo counts. |

Each skill is stored as:

```text
appPackage/skills/<skill-name>/SKILL.md
```

## Authentication flow

The plugin uses:

```json
"authorization": {
  "type": "OAuthPluginVault"
}
```

High-level flow:

```text
Copilot Cowork
  -> starts OAuthPluginVault sign-in
  -> obtains bearer token for the configured Entra app/scope
  -> calls https://REPLACE_WITH_MCP_HOST/mcp
  -> remote MCP server validates the token
  -> MCP tool runs
```

For multi-tenant support, the backend should be configured with:

```text
ENTRA_TENANT_ID=organizations
```

The backend should accept both audiences when needed:

```text
api://REPLACE_WITH_APP_CLIENT_ID
api://auth-REPLACE_WITH_OAUTH_CONNECTION_ID/REPLACE_WITH_APP_CLIENT_ID
```

## Packaging command

Run this from the repository root:

```powershell
Compress-Archive `
  -Path .\appPackage\* `
  -DestinationPath .\nasa-mars-rover-cowork-plugin.zip `
  -Force
```

Important: zip the contents of `appPackage`, not the parent folder.

The zip root should contain:

```text
manifest.json
color.png
outline.png
tools/
skills/
```

## Validating the plugin zip

After packaging, inspect the zip:

```powershell
Expand-Archive `
  -Path .\nasa-mars-rover-cowork-plugin.zip `
  -DestinationPath .\plugin-test `
  -Force

Get-ChildItem .\plugin-test
```

You should see `manifest.json` directly under `plugin-test`, not under `plugin-test/appPackage`.

## Recommended separate plugin project

If you want to publish the plugin as a separate GitHub project, use this structure:

```text
nasa-mars-rover-cowork-plugin/
├─ README.md
├─ PACKAGING.md
├─ SECURITY.md
├─ appPackage/
│  ├─ manifest.json
│  ├─ color.png
│  ├─ outline.png
│  ├─ tools/
│  │  └─ nasa-mars-rover-tools.json
│  └─ skills/
│     ├─ mars-rover-photo-research/
│     ├─ list-mars-rovers/
│     ├─ list-rover-cameras/
│     ├─ get-rover-photos/
│     ├─ get-latest-rover-photos/
│     └─ get-rover-manifest/
└─ scripts/
   └─ package-plugin.ps1
```

The plugin-only project should not include:

```text
src/
k8s/
Dockerfile
deploy.ps1
package.json
package-lock.json
```

It should only include the installable Copilot Cowork plugin assets and documentation.

## Suggested plugin-only README title

```text
# NASA Mars Rover Plugin for Copilot Cowork
```

Suggested description:

```text
Installable Copilot Cowork plugin package for connecting Microsoft Copilot to a remote NASA Mars Rover MCP server.
```

## Versioning guidance

Use the same semantic version in:

```text
appPackage/manifest.json
plugin release tag
plugin zip filename
```

Example:

```text
manifest version: 0.1.6
zip filename: nasa-mars-rover-cowork-plugin-0.1.6.zip
GitHub release: v0.1.6
```

## Release checklist

Before releasing a plugin zip:

```text
[ ] manifest.json has the correct package ID.
[ ] manifest.json points to the correct MCP host.
[ ] OAuthPluginVault reference ID is correct for the target environment.
[ ] tools/nasa-mars-rover-tools.json is included.
[ ] all skill folders are included.
[ ] color.png and outline.png are included.
[ ] zip root contains manifest.json.
[ ] no real private tenant IDs are committed to the public repo.
[ ] plugin can authenticate and list tools from Copilot Cowork.
```

## Troubleshooting plugin connection failures

| Symptom | Likely cause | Where to check |
| --- | --- | --- |
| Plugin install fails | Bad zip layout or manifest error | Inspect zip root and `manifest.json`. |
| Authentication failed | OAuthPluginVault, consent, audience, or issuer mismatch | Check backend logs and `ENTRA_AUDIENCE`. |
| `/mcp` returns `missing_bearer_token` | Token was not sent | Check plugin auth configuration. |
| `/mcp` returns `invalid_token` | Token was sent but rejected | Check audience, tenant, and Entra app scope. |
| Tools ask approval every time | Client or tenant approval policy | Confirm read-only annotations; check tenant policy. |

