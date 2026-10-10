---
name: get-rover-manifest
description: |
  Retrieves rover mission manifest metadata, including mission dates, status, available sols, and photo counts.
license: MIT
metadata:
  author: NASA Mars Rover MCP
  version: "0.1.0"
---

# Get Rover Manifest

Use the `get_rover_manifest` MCP tool when the user asks about rover mission metadata, available sols, photo counts, or whether a sol/date is likely to have images. Current manifest-style metadata is available for Curiosity and basic latest-feed metadata is available for Perseverance.

## Workflow

1. Identify the rover.
2. Call `get_rover_manifest`.
3. Use the manifest to explain mission status, landing date, max sol/date, total photos, and sol availability.
4. Recommend `get_rover_photos` for specific sols or Earth dates found in the manifest.

## Answer Requirements

- Do not invent mission dates or photo counts.
- Use the manifest to guide valid follow-up photo searches.
- If the user requested a date or sol outside the manifest range, explain that clearly.
