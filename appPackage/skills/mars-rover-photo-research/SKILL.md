---
name: mars-rover-photo-research
description: |
  Researches NASA Mars Rover imagery using the authenticated Mars Rover MCP server.
  Use when the user asks for rover photos, camera activity, mission manifests,
  or comparisons across Curiosity, Perseverance, Opportunity, and Spirit.
license: MIT
metadata:
  author: NASA Mars Rover MCP
  version: "0.1.0"
---

# Mars Rover Photo Research

Use the NASA Mars Rover MCP tools to retrieve mission metadata and photo records from NASA's current public mars.nasa.gov raw image APIs.

## Workflow

1. Determine whether the user is asking by Martian sol or Earth date. Use `get_rover_manifest` first when the available sols or dates are unclear.
2. Use `list_rovers` and `list_rover_cameras` to resolve valid rover and camera codes. Prefer Curiosity and Perseverance for current public image retrieval.
3. Use `get_rover_photos` for specific sols or Earth dates.
4. Use `get_latest_rover_photos` when the user asks for current/latest rover imagery.
5. Summarize the returned metadata with representative `img_src` URLs and camera full names.

## Answer Requirements

- Explain which rover, sol/date, and camera filters were used.
- If NASA returns no photos, suggest checking the manifest for available sols or trying a different camera.
- Do not invent image metadata or mission dates.
