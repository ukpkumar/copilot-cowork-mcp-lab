# NASA Mars Rover Plugin for Copilot Cowork

This is a lab guide for packaging and installing the plugin.

This guide assumes your remote MCP server is already deployed and reachable. If not, first complete: [NASA Mars Rover MCP Connector and Plugin for Copilot Cowork](building-a-multi-tenant-copilot-mcp-connector-for-nasa-mars-rover-photos.md).

## What you will complete

1. Update plugin manifest values.
2. Build the plugin zip from `appPackage/`.
3. Upload and install the zip in Copilot Cowork.
4. Run a quick validation test.

## Before you start (required)

| Requirement | Why it is needed | Who usually provides it |
| --- | --- | --- |
| Access to this repository | To edit `appPackage/manifest.json` and package zip | Project owner |
| Running MCP endpoint (`https://<host>/mcp`) | Plugin calls this endpoint | Backend/deployment owner |
| OAuthPluginVault reference ID | Plugin auth configuration | Copilot Cowork admin |
| Unique app package ID (GUID) | Required in manifest `id` | Plugin owner |
| Access to upload plugins in Copilot Cowork | To install the zip | Copilot Cowork admin or authorized user |

## Plugin files used in this lab

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

## Get the 3 manifest values

Update these placeholders in `appPackage/manifest.json`:

| Placeholder | What to enter | Where to get it |
| --- | --- | --- |
| `REPLACE_WITH_APP_PACKAGE_ID` | Unique app ID (GUID) | Create one for your plugin package |
| `REPLACE_WITH_MCP_HOST` | Public host name only (no `https://`) | Your deployed MCP endpoint host |
| `REPLACE_WITH_OAUTH_PLUGIN_VAULT_REFERENCE_ID` | OAuthPluginVault reference ID | Copilot Cowork OAuth configuration |

Important:

- `mcpServerUrl` must be `https://<host>/mcp`
- Do not use `/healthz` in the manifest
- Keep these paths unchanged:
  - `tools/nasa-mars-rover-tools.json`
  - `skills/<skill-folder>/SKILL.md`

## Lab steps

### Step 0: Clone the repository (if not already cloned)

If you do not already have this repo on your machine, clone it first and enter the repo folder:

```powershell
git clone https://github.com/ukpkumar/copilot-cowork-mcp-lab.git
cd copilot-cowork-mcp-lab
```

### Step 1: Update `manifest.json`

Open `appPackage/manifest.json` and replace the 3 placeholders above.

### Step 2: Build the plugin zip

If you are doing only the plugin packaging lab, you do **not** need `npm install` or `npm run build`.

Run from repository root:

```powershell
Compress-Archive `
  -Path .\appPackage\* `
  -DestinationPath .\nasa-mars-rover-cowork-plugin.zip `
  -Force
```

Package the **contents** of `appPackage`, not the `appPackage` folder itself.

### Step 3: Validate zip layout

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

### Step 4: Upload in Copilot Cowork

In your Copilot Cowork environment, go to plugin/app upload, then upload:

```text
nasa-mars-rover-cowork-plugin.zip
```

Save/publish according to your tenant flow.

### Step 5: Validate in chat

After install, run quick tests:

1. `List Mars rovers`
2. `Show Perseverance cameras`
3. `Get latest photos from Curiosity`

You should see tool-backed responses from the plugin.

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

## Troubleshooting (symptom -> action)

| Symptom | Most likely cause | What to do |
| --- | --- | --- |
| Plugin upload fails | Wrong zip structure | Confirm `manifest.json` is at zip root (not inside `appPackage/`) |
| Auth failed | Wrong OAuthPluginVault reference or missing consent | Recheck `referenceId` and confirm OAuth consent is complete |
| `/mcp` returns `missing_bearer_token` | Auth not attached by plugin | Recheck manifest authorization block |
| `/mcp` returns `invalid_token` | Audience/issuer mismatch on backend | Recheck backend Entra audience/issuer configuration |
| Tools not visible | Tool file path issue | Confirm manifest points to `tools/nasa-mars-rover-tools.json` |

## Success criteria

The lab is complete when:

1. Plugin uploads successfully.
2. Authentication succeeds.
3. At least one rover tool call returns data in Copilot Cowork chat.

## Versioning tip

Use the same semantic version in:

1. `appPackage/manifest.json`
2. zip filename
3. GitHub release tag
