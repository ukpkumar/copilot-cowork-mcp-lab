import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import { createAuthMiddleware, getAuthConfig } from "./auth.js";
import { CameraSchema, NasaMarsRoverClient, RoverSchema } from "./nasa.js";

const port = Number(process.env.PORT ?? 8000);
const nasaApiKey = process.env.NASA_API_KEY ?? "DEMO_KEY";
const nasaBaseUrl = process.env.NASA_BASE_URL;

const nasa = new NasaMarsRoverClient({ apiKey: nasaApiKey, baseUrl: nasaBaseUrl });

function readOnlyAnnotations(title: string) {
  return {
    title,
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true
  };
}

function createServer() {
  const server = new McpServer({
    name: "nasa-mars-rover-mcp",
    version: "0.1.6"
  });

  server.tool(
    "list_rovers",
    "List supported NASA Mars rovers and basic mission metadata.",
    {},
    readOnlyAnnotations("List Mars Rovers"),
    async () => ({
      content: [{ type: "text", text: JSON.stringify(nasa.listRovers(), null, 2) }]
    })
  );

  server.tool(
    "list_rover_cameras",
    "List camera codes supported by each rover, or by a specific rover.",
    {
      rover: RoverSchema.optional().describe("Optional rover name: curiosity, perseverance, opportunity, or spirit.")
    },
    readOnlyAnnotations("List Rover Cameras"),
    async ({ rover }) => ({
      content: [{ type: "text", text: JSON.stringify(nasa.listCameras(rover), null, 2) }]
    })
  );

  server.tool(
    "get_rover_photos",
    "Fetch Mars rover photos by rover and either Martian sol or Earth date.",
    {
      rover: RoverSchema.describe("Rover name: curiosity, perseverance, opportunity, or spirit."),
      sol: z.number().int().nonnegative().optional().describe("Martian solar day. Use either sol or earthDate."),
      earthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe("Earth date in YYYY-MM-DD format."),
      camera: CameraSchema.describe("Optional NASA camera or instrument code, such as FHAZ, NAVCAM, MAST, CHEMCAM_RMI, or ZCAM."),
      page: z.number().int().positive().optional().describe("NASA API page number."),
      limit: z.number().int().positive().max(100).optional().describe("Maximum photos returned to the client.")
    },
    readOnlyAnnotations("Get Rover Photos"),
    async (params) => ({
      content: [{ type: "text", text: JSON.stringify(await nasa.getPhotos(params), null, 2) }]
    })
  );

  server.tool(
    "get_latest_rover_photos",
    "Fetch the latest available photos for a rover.",
    {
      rover: RoverSchema.describe("Rover name: curiosity, perseverance, opportunity, or spirit."),
      camera: CameraSchema.describe("Optional NASA camera or instrument code."),
      limit: z.number().int().positive().max(100).optional().describe("Maximum photos returned to the client.")
    },
    readOnlyAnnotations("Get Latest Rover Photos"),
    async (params) => ({
      content: [{ type: "text", text: JSON.stringify(await nasa.getLatestPhotos(params), null, 2) }]
    })
  );

  server.tool(
    "get_rover_manifest",
    "Fetch mission manifest metadata, including available sols and photo counts.",
    {
      rover: RoverSchema.describe("Rover name: curiosity, perseverance, opportunity, or spirit.")
    },
    readOnlyAnnotations("Get Rover Manifest"),
    async ({ rover }) => ({
      content: [{ type: "text", text: JSON.stringify(await nasa.getManifest(rover), null, 2) }]
    })
  );

  server.prompt(
    "compare_rover_activity",
    "Guide the assistant to compare image activity across rovers, dates, sols, or cameras.",
    {
      rover: z.string().optional(),
      dateOrSol: z.string().optional()
    },
    ({ rover, dateOrSol }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Use the NASA Mars Rover tools to compare rover image activity${rover ? ` for ${rover}` : ""}${
              dateOrSol ? ` around ${dateOrSol}` : ""
            }. Summarize notable cameras, photo counts, and representative image URLs.`
          }
        }
      ]
    })
  );

  return server;
}

const app = express();
app.use(express.json({ limit: "2mb" }));

app.get("/healthz", (_request, response) => {
  response.json({ status: "ok" });
});

app.post("/mcp", createAuthMiddleware(getAuthConfig()), async (request, response) => {
  const server = createServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined
  });

  response.on("close", () => {
    void transport.close();
    void server.close();
  });

  await server.connect(transport);
  await transport.handleRequest(request, response, request.body);
});

app.listen(port, () => {
  console.log(`NASA Mars Rover MCP server listening on port ${port}`);
});
