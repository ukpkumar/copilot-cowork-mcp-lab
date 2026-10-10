---
name: get-latest-rover-photos
description: |
  Retrieves the latest available photos for a Mars rover, optionally filtered by camera.
license: MIT
metadata:
  author: NASA Mars Rover MCP
  version: "0.1.0"
---

# Get Latest Rover Photos

Use the `get_latest_rover_photos` MCP tool when the user asks for the latest or most recent Mars rover images. Current public image retrieval is supported for Curiosity and Perseverance.

## Workflow

1. Identify the rover.
2. Resolve any camera filter with `list_rover_cameras` if needed.
3. Call `get_latest_rover_photos` with rover and optional camera/limit.
4. Summarize the latest image metadata and representative image URLs.

## Answer Requirements

- State that results are the latest available from the NASA feed.
- Include rover, camera, sol/date, and image URLs when available.
- Do not imply the photos are real-time live camera feeds.
