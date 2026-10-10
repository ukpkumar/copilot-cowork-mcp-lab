---
name: get-rover-photos
description: |
  Retrieves Mars rover photos by rover and either Martian sol or Earth date, with optional camera, page, and limit filters.
license: MIT
metadata:
  author: NASA Mars Rover MCP
  version: "0.1.0"
---

# Get Rover Photos

Use the `get_rover_photos` MCP tool when the user asks for Mars rover images from a specific rover and Martian sol or Earth date. Current public image retrieval is supported for Curiosity and Perseverance.

## Workflow

1. Identify the rover.
2. Determine whether the user supplied a Martian sol or an Earth date.
3. Use `list_rover_cameras` first if the camera filter is ambiguous.
4. Call `get_rover_photos` with rover, sol or earthDate, and optional camera/page/limit.
5. Summarize representative photos and include useful image URLs.

## Answer Requirements

- Use either `sol` or `earthDate` based on the user request.
- Do not invent photos when NASA returns no records.
- If no photos are found, suggest checking `get_rover_manifest` for available sols.
