# Mars Rover MCP Prompt Library

Use these prompts with the NASA Mars Rover MCP Connector and Plugin for Copilot Cowork.

The best prompts are explicit about:

- Which rover to use.
- Whether to use latest images, a sol, or an Earth date.
- Whether Copilot should call fresh connector data.
- What output format you want.
- Whether image links should be included.

## Prompt 1: Latest rover image briefing

```text
Using the NASA Mars rover connector, create a concise mission briefing for the latest available Curiosity and Perseverance images.

Pull fresh connector data for each rover. For each rover, include:
- latest sol
- Earth date
- cameras used
- number of images returned
- two or three representative image links
- a plain-English interpretation of what the camera activity suggests

End with a short comparison of how the two rovers' latest imaging activity differs.
```

## Prompt 2: Camera guide for a non-technical audience

```text
Using the NASA Mars rover connector, explain Curiosity's camera system for a non-technical business audience.

First list the supported Curiosity camera codes from the connector. Then group them by purpose:
- driving safety
- navigation
- science investigation
- color landscapes or context imaging

For each camera code, provide:
- full camera name if available
- one-line plain-English purpose
- an example of when a mission team might use it

Keep the tone executive-friendly and avoid deep engineering jargon.
```

## Prompt 3: Image search and storytelling

```text
Using the NASA Mars rover connector, find representative Mars rover images for a short story titled "A day of robotic exploration on Mars."

Use fresh connector data and include:
- one latest Curiosity image
- one latest Perseverance image
- the rover, camera, sol, and Earth date for each image
- clickable NASA image links
- a short narrative paragraph explaining what each image might represent in the rover's daily mission

Do not invent image metadata. If the connector returns no images for a rover or camera, say so and choose another valid camera from the connector.
```

## Prompt 4: Build a 7-slide PowerPoint mission briefing

```text
Using the NASA Mars rover connector, build a 7-slide PowerPoint deck titled "Mars Rovers: Live Mission Briefing" for a business audience. Pull fresh data for every slide; don't reuse earlier answers.

Title slide: title, today's date, and the subtitle "Live data from NASA's raw image feed".
The fleet: list every rover the connector knows about, with mission name and status (active or complete).
Mission at a glance: compare Curiosity and Perseverance in a table: landing date, latest sol, total photos, and number of cameras.
Curiosity today: its latest sol and Earth date, the camera(s) used, the number of images, and a plain-English explanation of what the rover was doing, worked out from where the cameras were pointing.
Perseverance today: the same as slide 4, for Perseverance.
Cameras explained: Curiosity's camera codes grouped by purpose (driving safety, navigation, science, colour landscapes), with a one-line description of each.
Key takeaways: three short points about what this data shows, plus clickable links to two or three of the newest NASA images.
```

## Tips for better results

1. Ask Copilot to **pull fresh connector data** when you need current/latest rover information.
2. Ask for **image links** explicitly if you want clickable NASA URLs.
3. Ask Copilot not to invent values when NASA returns no data.
4. Use the connector's exact rover and camera names when refining a search.
5. For presentation outputs, specify slide count, audience, title, and required content per slide.

