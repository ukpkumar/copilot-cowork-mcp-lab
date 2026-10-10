---
name: list-mars-rovers
description: |
  Lists the Mars rovers supported by the NASA Mars Rover MCP server and summarizes basic mission metadata.
license: MIT
metadata:
  author: NASA Mars Rover MCP
  version: "0.1.0"
---

# List Mars Rovers

Use the `list_rovers` MCP tool when the user asks which Mars rovers are available or needs supported rover names before searching photos.

## Workflow

1. Call `list_rovers`.
2. Summarize the supported rovers and mission metadata.
3. Use the exact rover names returned by the tool for follow-up photo, camera, or manifest requests. Curiosity and Perseverance have current public raw-image feeds.

## Answer Requirements

- Do not invent unsupported rovers.
- Mention supported rover identifiers clearly.
- Suggest `list_rover_cameras` when the user needs valid camera filters.
