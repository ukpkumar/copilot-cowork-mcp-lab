# NASA Mars Rover Plugin for Copilot Cowork

This is a short, plugin-only guide.

If your MCP server is already deployed and reachable, this is all you need to package and install the Copilot Cowork plugin.

For full backend deployment details, use the companion article: [NASA Mars Rover MCP Connector and Plugin for Copilot Cowork](building-a-multi-tenant-copilot-mcp-connector-for-nasa-mars-rover-photos.md).

For this sample, keep everything in the same repo:

- `appPackage/` as the plugin source
- `nasa-mars-rover-cowork-plugin.zip` as the installable plugin

## What this plugin does

The plugin tells Copilot Cowork:

1. Which remote MCP server to call (`/mcp`).
2. Which tool schemas are available (`tools/nasa-mars-rover-tools.json`).
3. Which skills are included (`appPackage/skills/*`).
4. How authentication works (`OAuthPluginVault`).

The remote MCP server handles token validation and NASA data retrieval.

## Plugin files

```text
appPackage/
├─ manifest.json
├─ color.png
├─ outline.png
├─ tools/
│  └─ nasa-mars-rover-tools.json
└─ skills/
   ├─ mars-rover-photo-research/SKILL.md
   ├─ list-mars-rovers/SKILL.md
   ├─ list-rover-cameras/SKILL.md
   ├─ get-rover-photos/SKILL.md
   ├─ get-latest-rover-photos/SKILL.md
   └─ get-rover-manifest/SKILL.md
```

## 5-step setup

### 1) Update manifest placeholders

Edit `appPackage/manifest.json` and replace:

| Placeholder | Value |
| --- | --- |
| `REPLACE_WITH_APP_PACKAGE_ID` | Unique app/package ID |
| `REPLACE_WITH_MCP_HOST` | Public hostname only (no `https://`) |
| `REPLACE_WITH_OAUTH_PLUGIN_VAULT_REFERENCE_ID` | OAuthPluginVault reference ID |

Important:

- `mcpServerUrl` must be `https://<host>/mcp`
- Do not use `/healthz` in the manifest

### 2) Keep tools + skills paths unchanged

The manifest should continue to reference:

- `tools/nasa-mars-rover-tools.json`
- `skills/<skill-folder>/SKILL.md`

### 3) Create the plugin zip

Run from repository root:

```powershell
Compress-Archive `
  -Path .\appPackage\* `
  -DestinationPath .\nasa-mars-rover-cowork-plugin.zip `
  -Force
```

Zip the **contents** of `appPackage`, not the `appPackage` folder itself.

If you just want to test quickly, you can also use the ready sample package in this repo:

```text
nasa-mars-rover-cowork-plugin.zip
```

### 4) Validate zip layout

```powershell
Expand-Archive `
  -Path .\nasa-mars-rover-cowork-plugin.zip `
  -DestinationPath .\plugin-test `
  -Force

Get-ChildItem .\plugin-test
```

Expected root:

```text
manifest.json
color.png
outline.png
tools/
skills/
```

### 5) Upload to Copilot Cowork

Upload `nasa-mars-rover-cowork-plugin.zip` in your Cowork environment (either the one you built in Step 3 or the sample zip from the repo).

## Included tools (read-only)

- `list_rovers`
- `list_rover_cameras`
- `get_rover_photos`
- `get_latest_rover_photos`
- `get_rover_manifest`

Supported rover IDs:

```text
curiosity
perseverance
opportunity
spirit
```

## Quick troubleshooting

| Symptom | Likely cause |
| --- | --- |
| Plugin install fails | Wrong zip layout or manifest issue |
| Auth failed | Incorrect OAuthPluginVault reference, audience, or consent |
| `/mcp` says `missing_bearer_token` | Auth not attached by plugin |
| `/mcp` says `invalid_token` | Audience/issuer mismatch on backend |

## Release tip

Use the same version across:

1. `appPackage/manifest.json`
2. zip filename
3. GitHub release tag
