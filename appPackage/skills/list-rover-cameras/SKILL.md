---
name: list-rover-cameras
description: |
  Lists NASA Mars rover camera codes and camera names supported by the MCP server.
license: MIT
metadata:
  author: NASA Mars Rover MCP
  version: "0.1.0"
---

# List Rover Cameras

Use the `list_rover_cameras` MCP tool when the user asks for valid camera filters, camera codes, or camera names for Curiosity, Perseverance, Opportunity, or Spirit.

## Workflow

1. Determine whether the user specified a rover.
2. Call `list_rover_cameras` with the rover when provided, otherwise call it without a rover.
3. Explain the camera codes and use them exactly in follow-up photo queries.

## Answer Requirements

- Preserve camera codes exactly as returned, such as `FHAZ`, `NAVCAM`, `MAST`, or `PANCAM`.
- If the requested camera is not supported for a rover, suggest valid alternatives.
