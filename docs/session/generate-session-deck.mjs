import pptxgen from "pptxgenjs";

const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "Prasanth U K";
pptx.company = "Microsoft";
pptx.subject = "NASA Mars Rover MCP Connector and Plugin for Copilot Cowork";
pptx.title = "NASA Mars Rover MCP Connector and Plugin for Copilot Cowork";
pptx.lang = "en-US";
pptx.theme = {
  headFontFace: "Aptos Display",
  bodyFontFace: "Aptos",
  lang: "en-US"
};
pptx.defineLayout({ name: "LAYOUT_WIDE", width: 13.333, height: 7.5 });
pptx.layout = "LAYOUT_WIDE";
pptx.margin = 0;

const C = {
  navy: "182033",
  ink: "1F2937",
  slate: "475569",
  muted: "64748B",
  ice: "EAF2FF",
  cloud: "F8FAFC",
  white: "FFFFFF",
  orange: "F97316",
  amber: "FDBA74",
  red: "B91C1C",
  teal: "0F766E",
  cyan: "06B6D4",
  blue: "2563EB",
  green: "16A34A",
  purple: "7C3AED",
  line: "CBD5E1"
};

const W = 13.333;
const H = 7.5;

function addBg(slide, fill = C.cloud) {
  slide.background = { color: fill };
}

function addFooter(slide, n) {
  slide.addText("Copilot Cowork MCP Lab", {
    x: 0.55, y: 7.05, w: 4, h: 0.18, fontFace: "Aptos", fontSize: 8, color: C.muted, margin: 0
  });
  slide.addText(String(n).padStart(2, "0"), {
    x: 12.35, y: 7.03, w: 0.45, h: 0.2, fontFace: "Aptos", fontSize: 8, color: C.muted, align: "right", margin: 0
  });
}

function title(slide, text, subtitle, n) {
  slide.addText(text, {
    x: 0.55, y: 0.35, w: 8.9, h: 0.55, fontFace: "Aptos Display", fontSize: 27, bold: true, color: C.ink, margin: 0
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.57, y: 0.98, w: 8.8, h: 0.28, fontSize: 10.5, color: C.slate, margin: 0
    });
  }
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 10.0, y: 0.35, w: 2.75, h: 0.44, rectRadius: 0.06,
    fill: { color: C.ice }, line: { color: C.ice }
  });
  slide.addText("NASA Mars Rover MCP", {
    x: 10.18, y: 0.48, w: 2.4, h: 0.16, fontSize: 8.5, color: C.blue, bold: true, align: "center", margin: 0
  });
  addFooter(slide, n);
}

function card(slide, x, y, w, h, heading, body, color = C.blue) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.08,
    fill: { color: C.white },
    line: { color: "E2E8F0", transparency: 15 },
    shadow: { type: "outer", color: "D8DEE9", opacity: 0.15, blur: 1, angle: 45, distance: 1 }
  });
  slide.addShape(pptx.ShapeType.roundRect, {
    x: x + 0.18, y: y + 0.18, w: 0.4, h: 0.4, rectRadius: 0.06,
    fill: { color }, line: { color }
  });
  slide.addText(heading, {
    x: x + 0.72, y: y + 0.18, w: w - 0.95, h: 0.25, fontSize: 13, bold: true, color: C.ink, margin: 0
  });
  slide.addText(body, {
    x: x + 0.22, y: y + 0.72, w: w - 0.44, h: h - 0.95, fontSize: 9.5, color: C.slate,
    fit: "shrink", breakLine: false, margin: 0.02
  });
}

function pill(slide, x, y, text, color = C.orange, w = 1.65) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h: 0.33, rectRadius: 0.12,
    fill: { color }, line: { color }
  });
  slide.addText(text, {
    x, y: y + 0.1, w, h: 0.12, fontSize: 7.8, bold: true, color: C.white, align: "center", margin: 0
  });
}

function codeBox(slide, x, y, w, h, text, fontSize = 8.2) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.05,
    fill: { color: C.navy }, line: { color: C.navy }
  });
  slide.addText(text, {
    x: x + 0.18, y: y + 0.16, w: w - 0.36, h: h - 0.28,
    fontFace: "Consolas", fontSize, color: "D6E4FF", fit: "shrink", margin: 0
  });
}

function arrow(slide, x1, y1, x2, y2, color = C.orange) {
  slide.addShape(pptx.ShapeType.line, {
    x: x1, y: y1, w: x2 - x1, h: y2 - y1,
    line: { color, width: 2, beginArrowType: "none", endArrowType: "triangle" }
  });
}

function addTitleSlide() {
  const slide = pptx.addSlide();
  addBg(slide, C.navy);
  slide.addShape(pptx.ShapeType.arc, { x: 8.65, y: -1.25, w: 5.8, h: 5.8, line: { color: C.orange, transparency: 60, width: 2 } });
  slide.addShape(pptx.ShapeType.arc, { x: 9.2, y: -0.7, w: 4.6, h: 4.6, line: { color: C.cyan, transparency: 70, width: 2 } });
  slide.addShape(pptx.ShapeType.roundRect, { x: 0.72, y: 0.75, w: 2.3, h: 0.4, rectRadius: 0.12, fill: { color: C.orange }, line: { color: C.orange } });
  slide.addText("SESSION + HANDS-ON LAB", { x: 0.85, y: 0.87, w: 2.05, h: 0.11, fontSize: 8.2, bold: true, color: C.white, align: "center", margin: 0 });
  slide.addText("NASA Mars Rover MCP Connector and Plugin", {
    x: 0.7, y: 1.7, w: 8.7, h: 1.3, fontFace: "Aptos Display", fontSize: 40, bold: true, color: C.white, margin: 0
  });
  slide.addText("for Copilot Cowork", {
    x: 0.72, y: 3.02, w: 6.8, h: 0.55, fontFace: "Aptos Display", fontSize: 29, bold: true, color: C.amber, margin: 0
  });
  slide.addText("Build the MCP server, host it on AKS, secure it with Entra ID, package the Cowork plugin, and publish it for users.", {
    x: 0.76, y: 4.15, w: 7.2, h: 0.62, fontSize: 15, color: "D7E3F4", fit: "shrink", margin: 0
  });
  card(slide, 8.65, 4.6, 3.55, 1.15, "What you will leave with", "A repeatable blueprint for secure remote MCP connectors and installable Copilot Cowork plugins.", C.teal);
  slide.addText("copilot-cowork-mcp-lab", { x: 0.76, y: 6.85, w: 4.8, h: 0.22, fontSize: 10, color: "B9C7DA", margin: 0 });
}

function addAgenda() {
  const slide = pptx.addSlide();
  addBg(slide);
  title(slide, "Session map", "From idea to published Copilot Cowork plugin", 2);
  const items = [
    ["01", "Concepts", "MCP, Cowork plugins, OAuthPluginVault"],
    ["02", "Build", "TypeScript MCP server and read-only tools"],
    ["03", "Secure", "Entra app, audiences, tenant validation"],
    ["04", "Host", "ACR, AKS, network path, DNS, TLS"],
    ["05", "Package", "Manifest, tools, skills, plugin zip"],
    ["06", "Operate", "Publishing, troubleshooting, release model"]
  ];
  items.forEach((it, idx) => {
    const x = idx % 3 === 0 ? 0.7 : idx % 3 === 1 ? 4.65 : 8.6;
    const y = idx < 3 ? 1.75 : 4.25;
    slide.addShape(pptx.ShapeType.roundRect, { x, y, w: 3.25, h: 1.45, rectRadius: 0.1, fill: { color: C.white }, line: { color: "E2E8F0" } });
    slide.addText(it[0], { x: x + 0.2, y: y + 0.18, w: 0.55, h: 0.35, fontSize: 18, bold: true, color: C.orange, margin: 0 });
    slide.addText(it[1], { x: x + 0.82, y: y + 0.25, w: 2.1, h: 0.25, fontSize: 15, bold: true, color: C.ink, margin: 0 });
    slide.addText(it[2], { x: x + 0.22, y: y + 0.78, w: 2.75, h: 0.38, fontSize: 10, color: C.slate, fit: "shrink", margin: 0 });
  });
}

function addArchitecture() {
  const slide = pptx.addSlide();
  addBg(slide);
  title(slide, "Reference architecture", "Every layer has a job: describe, authenticate, host, execute, and observe", 3);
  const blocks = [
    ["User in Copilot Cowork", C.purple],
    ["Plugin manifest", C.blue],
    ["OAuthPluginVault", C.teal],
    ["HTTPS /mcp", C.orange],
    ["AKS MCP server", C.green],
    ["NASA mars.nasa.gov", C.red]
  ];
  blocks.forEach((b, i) => {
    const x = 0.65 + i * 2.03;
    slide.addShape(pptx.ShapeType.roundRect, { x, y: 2.25, w: 1.55, h: 1.0, rectRadius: 0.08, fill: { color: b[1] }, line: { color: b[1] } });
    slide.addText(b[0], { x: x + 0.12, y: 2.54, w: 1.31, h: 0.25, fontSize: 8.8, bold: true, color: C.white, align: "center", fit: "shrink", margin: 0 });
    if (i < blocks.length - 1) arrow(slide, x + 1.6, 2.75, x + 1.96, 2.75);
  });
  card(slide, 0.85, 4.25, 3.55, 1.28, "Plugin package", "Describes remote MCP URL, tool descriptions, agent skills, and OAuthPluginVault reference.", C.blue);
  card(slide, 4.9, 4.25, 3.55, 1.28, "MCP backend", "Validates bearer tokens, exposes tools, calls NASA feeds, returns structured results.", C.green);
  card(slide, 8.95, 4.25, 3.55, 1.28, "Azure hosting", "Provides public HTTPS reachability, DNS, certificate, ingress, and Kubernetes operations.", C.orange);
}

function addConcepts() {
  const slide = pptx.addSlide();
  addBg(slide);
  title(slide, "Core concepts", "What participants must understand before touching Azure", 4);
  card(slide, 0.75, 1.55, 3.65, 1.28, "MCP server", "A remote tool server that implements Model Context Protocol and exposes callable tools over HTTPS.", C.green);
  card(slide, 4.85, 1.55, 3.65, 1.28, "Cowork plugin", "An installable package that tells Copilot where the MCP server is and how to authenticate.", C.blue);
  card(slide, 8.95, 1.55, 3.65, 1.28, "OAuthPluginVault", "The Copilot-managed OAuth connection used to get a bearer token for the MCP call.", C.purple);
  card(slide, 0.75, 4.1, 3.65, 1.28, "Entra audience", "The token's intended API, usually api://<app-client-id> or a Cowork SSO audience.", C.orange);
  card(slide, 4.85, 4.1, 3.65, 1.28, "Tenant mode", "organizations lets the server validate tokens from any Entra organizational tenant.", C.teal);
  card(slide, 8.95, 4.1, 3.65, 1.28, "Read-only tools", "Tool annotations tell clients that NASA photo queries are non-destructive and idempotent.", C.red);
}

function addRepoMap() {
  const slide = pptx.addSlide();
  addBg(slide);
  title(slide, "Repository map", "Where the lab content lives", 5);
  codeBox(slide, 0.75, 1.55, 5.05, 4.2, `src/          MCP server code\nk8s/          Kubernetes manifests\nappPackage/   Cowork plugin package\ndocs/blogs/   Publishable blog posts\ndocs/labs/    Hands-on lab workbook\ndocs/session/ Instructor deck and scripts`, 9.2);
  card(slide, 6.05, 1.55, 2.95, 1.12, "Server", "index.ts registers tools, auth.ts validates tokens, nasa.ts calls current NASA feeds.", C.green);
  card(slide, 9.35, 1.55, 2.95, 1.12, "Plugin", "manifest.json points to /mcp and includes OAuthPluginVault reference.", C.blue);
  card(slide, 6.05, 3.32, 2.95, 1.12, "Deployment", "deploy.ps1 builds image, configures secrets, and applies Kubernetes manifests.", C.orange);
  card(slide, 9.35, 3.32, 2.95, 1.12, "Docs", "Blogs, troubleshooting, security notes, and this lab create the learning path.", C.purple);
}

function addMcpBuild() {
  const slide = pptx.addSlide();
  addBg(slide);
  title(slide, "Build the MCP server", "A small TypeScript service with a clear protocol boundary", 6);
  const steps = [
    ["1", "Express app", "Health endpoint and MCP endpoint"],
    ["2", "MCP tools", "list, manifest, latest, photo search"],
    ["3", "Auth middleware", "JWT verification before /mcp"],
    ["4", "NASA client", "Current mars.nasa.gov feeds"]
  ];
  steps.forEach((s, i) => {
    const y = 1.55 + i * 1.15;
    slide.addText(s[0], { x: 0.85, y, w: 0.45, h: 0.36, fontSize: 18, bold: true, color: C.orange, margin: 0 });
    slide.addText(s[1], { x: 1.5, y: y + 0.02, w: 2.5, h: 0.22, fontSize: 14, bold: true, color: C.ink, margin: 0 });
    slide.addText(s[2], { x: 4.25, y: y + 0.05, w: 4.2, h: 0.22, fontSize: 10.5, color: C.slate, margin: 0 });
  });
  codeBox(slide, 8.55, 1.55, 3.75, 3.15, `npm install\nnpm run build\nnpm run dev\n\nGET  /healthz\nPOST /mcp\n\n{"error":"missing_bearer_token"}`, 9.1);
  card(slide, 8.55, 4.95, 3.75, 1.02, "Local test goal", "Confirm the server responds and /mcp is protected before deploying.", C.teal);
}

function addAuth() {
  const slide = pptx.addSlide();
  addBg(slide);
  title(slide, "Authentication model", "Multi-tenant does not mean accepting every token", 7);
  card(slide, 0.75, 1.45, 3.75, 1.22, "Tenant", "Use ENTRA_TENANT_ID=organizations to support tokens from any Entra organizational tenant.", C.teal);
  card(slide, 4.8, 1.45, 3.75, 1.22, "Audience", "Accept only expected audiences for your API and Cowork SSO connection.", C.orange);
  card(slide, 8.85, 1.45, 3.75, 1.22, "JWKS", "Resolve signing keys for the token tenant and validate signature and issuer.", C.blue);
  codeBox(slide, 0.9, 3.35, 5.55, 2.15, `ENTRA_TENANT_ID=organizations\nENTRA_AUDIENCE=api://<APP_CLIENT_ID>,\n api://auth-<OAUTH_CONNECTION_ID>/<APP_CLIENT_ID>`);
  slide.addText("Validation checklist", { x: 7.0, y: 3.35, w: 2.7, h: 0.24, fontSize: 16, bold: true, color: C.ink, margin: 0 });
  ["signature", "issuer", "expiry", "audience", "tenant id"].forEach((t, i) => {
    pill(slide, 7.05 + (i % 2) * 2.0, 3.9 + Math.floor(i / 2) * 0.55, t, [C.green, C.blue, C.orange, C.purple, C.teal][i], 1.65);
  });
}

function addAzureNetwork() {
  const slide = pptx.addSlide();
  addBg(slide);
  title(slide, "Azure network requirements", "Cowork must reach a trusted public HTTPS MCP endpoint", 8);
  const rows = [
    ["Inbound", "Copilot Cowork -> HTTPS /mcp on your public host"],
    ["Health", "Operators and probes -> HTTPS /healthz"],
    ["Outbound", "AKS node/pod -> ACR image pull and mars.nasa.gov"],
    ["DNS", "Stable hostname -> ingress or public IP"],
    ["TLS", "Trusted certificate for the public hostname"]
  ];
  rows.forEach((r, i) => {
    const y = 1.55 + i * 0.78;
    slide.addShape(pptx.ShapeType.roundRect, { x: 0.8, y, w: 11.75, h: 0.48, rectRadius: 0.05, fill: { color: i % 2 === 0 ? C.white : C.ice }, line: { color: "E2E8F0" } });
    slide.addText(r[0], { x: 1.05, y: y + 0.14, w: 1.25, h: 0.14, fontSize: 9.5, bold: true, color: C.orange, margin: 0 });
    slide.addText(r[1], { x: 2.55, y: y + 0.13, w: 8.9, h: 0.14, fontSize: 9.5, color: C.ink, margin: 0 });
  });
  slide.addShape(pptx.ShapeType.roundRect, { x: 1.15, y: 5.62, w: 11.05, h: 0.62, rectRadius: 0.08, fill: { color: C.navy }, line: { color: C.navy } });
  slide.addText("Rule of thumb: if a browser cannot validate https://<host>/healthz, Copilot Cowork will not reliably call https://<host>/mcp.", {
    x: 1.45, y: 5.84, w: 10.45, h: 0.16, fontSize: 10.8, bold: true, color: C.white, align: "center", margin: 0
  });
}

function addAksDeploy() {
  const slide = pptx.addSlide();
  addBg(slide);
  title(slide, "Host MCP on AKS", "Container image, secret, deployment, service, ingress", 9);
  const items = [
    ["ACR build", "az acr build creates nasa-mars-rover-mcp:<tag>"],
    ["Secret", "NASA_API_KEY, ENTRA_TENANT_ID, ENTRA_AUDIENCE"],
    ["Deployment", "1 replica, resource requests, readiness/liveness probes"],
    ["Service", "ClusterIP or LoadBalancer routes to port 8000"],
    ["Ingress", "HTTPS host routes /mcp and /healthz"]
  ];
  items.forEach((it, i) => card(slide, 0.75 + (i % 2) * 5.95, 1.4 + Math.floor(i / 2) * 1.45, 5.3, 1.0, it[0], it[1], [C.blue, C.orange, C.green, C.purple, C.teal][i]));
}

function addDnsCert() {
  const slide = pptx.addSlide();
  addBg(slide);
  title(slide, "DNS and certificate path", "Publishing is not done until HTTPS is trusted", 10);
  slide.addText("1", { x: 1.0, y: 1.6, w: 0.45, h: 0.35, fontSize: 20, bold: true, color: C.orange, margin: 0 });
  slide.addText("Create public hostname", { x: 1.65, y: 1.65, w: 4.0, h: 0.22, fontSize: 15, bold: true, color: C.ink, margin: 0 });
  slide.addText("Example: mcp.contoso.com", { x: 1.65, y: 2.0, w: 4.0, h: 0.18, fontSize: 10.5, color: C.slate, margin: 0 });
  slide.addText("2", { x: 1.0, y: 2.8, w: 0.45, h: 0.35, fontSize: 20, bold: true, color: C.orange, margin: 0 });
  slide.addText("Point DNS to ingress public IP", { x: 1.65, y: 2.85, w: 4.8, h: 0.22, fontSize: 15, bold: true, color: C.ink, margin: 0 });
  slide.addText("A record or CNAME, depending on your design", { x: 1.65, y: 3.2, w: 4.8, h: 0.18, fontSize: 10.5, color: C.slate, margin: 0 });
  slide.addText("3", { x: 1.0, y: 4.0, w: 0.45, h: 0.35, fontSize: 20, bold: true, color: C.orange, margin: 0 });
  slide.addText("Issue trusted certificate", { x: 1.65, y: 4.05, w: 4.2, h: 0.22, fontSize: 15, bold: true, color: C.ink, margin: 0 });
  slide.addText("cert-manager, App Gateway, or managed TLS", { x: 1.65, y: 4.4, w: 4.8, h: 0.18, fontSize: 10.5, color: C.slate, margin: 0 });
  codeBox(slide, 7.0, 1.45, 4.65, 3.65, `Test from outside the cluster:\n\nInvoke-WebRequest https://<host>/healthz\n\nExpected:\n{"status":"ok"}\n\nThen verify /mcp is protected.`);
}

function addPluginPackage() {
  const slide = pptx.addSlide();
  addBg(slide);
  title(slide, "Build the Cowork plugin", "The plugin package is the contract between Copilot and the MCP server", 11);
  card(slide, 0.75, 1.4, 3.55, 1.05, "manifest.json", "Package metadata, MCP URL, connector, OAuthPluginVault reference.", C.blue);
  card(slide, 4.85, 1.4, 3.55, 1.05, "tools JSON", "Tool schemas, descriptions, read-only annotations.", C.green);
  card(slide, 8.95, 1.4, 3.55, 1.05, "skills", "Agent skill instructions that guide tool use and response behavior.", C.purple);
  codeBox(slide, 0.95, 3.2, 5.2, 2.0, `Compress-Archive \\\n  -Path .\\appPackage\\* \\\n  -DestinationPath .\\nasa-mars-rover-cowork-plugin.zip \\\n  -Force`);
  slide.addText("Zip root must contain manifest.json", { x: 7.05, y: 3.25, w: 4.0, h: 0.28, fontSize: 17, bold: true, color: C.ink, margin: 0 });
  slide.addText("Do not zip the parent appPackage folder. Zip the contents of appPackage.", { x: 7.05, y: 3.8, w: 4.6, h: 0.42, fontSize: 12, color: C.slate, margin: 0 });
  pill(slide, 7.05, 4.65, "manifest.json", C.orange, 1.55);
  pill(slide, 8.8, 4.65, "tools/", C.teal, 1.05);
  pill(slide, 10.05, 4.65, "skills/", C.purple, 1.05);
}

function addPublishing() {
  const slide = pptx.addSlide();
  addBg(slide);
  title(slide, "Publishing options", "Choose the right path for demo, pilot, or internal rollout", 12);
  const opts = [
    ["Developer upload", "Fastest for testing; depends on tenant policy.", C.green],
    ["Tenant catalog", "Controlled internal distribution for selected users.", C.blue],
    ["Admin rollout", "Managed availability and governance.", C.purple],
    ["Plugin-only repo", "Separate release artifact and versioned zip.", C.orange],
    ["GitHub release", "Publish zip with changelog and version tag.", C.teal]
  ];
  opts.forEach((o, i) => card(slide, i < 3 ? 0.8 + i * 4.15 : 2.85 + (i - 3) * 4.15, i < 3 ? 1.6 : 4.25, 3.35, 1.15, o[0], o[1], o[2]));
}

function addTroubleshooting() {
  const slide = pptx.addSlide();
  addBg(slide);
  title(slide, "Troubleshooting flow", "Separate OAuth, token validation, routing, and pod health", 13);
  const checks = [
    ["1", "Does /healthz return 200?", "If no: AKS, ingress, DNS, cert, or service issue."],
    ["2", "Does /mcp return missing_bearer_token without auth?", "If no: route or server issue."],
    ["3", "Does Cowork reach /mcp?", "Check ingress logs and user-agent."],
    ["4", "Does token validation fail?", "Check audience, tenant, issuer, consent."],
    ["5", "Do tools ask approval every time?", "Read-only annotations help; tenant policy may still decide."]
  ];
  checks.forEach((c, i) => {
    const y = 1.35 + i * 0.92;
    slide.addShape(pptx.ShapeType.roundRect, { x: 0.85, y, w: 11.55, h: 0.62, rectRadius: 0.05, fill: { color: C.white }, line: { color: "E2E8F0" } });
    slide.addText(c[0], { x: 1.08, y: y + 0.18, w: 0.25, h: 0.15, fontSize: 11, bold: true, color: C.orange, margin: 0 });
    slide.addText(c[1], { x: 1.55, y: y + 0.12, w: 3.3, h: 0.17, fontSize: 10.5, bold: true, color: C.ink, margin: 0 });
    slide.addText(c[2], { x: 5.1, y: y + 0.12, w: 6.2, h: 0.17, fontSize: 9.8, color: C.slate, margin: 0 });
  });
}

function addLabFlow() {
  const slide = pptx.addSlide();
  addBg(slide);
  title(slide, "Hands-on lab flow", "The sequence participants will follow", 14);
  const labs = [
    "Clone + build",
    "Run MCP locally",
    "Create Entra app",
    "Configure OAuth",
    "Deploy to AKS",
    "DNS + TLS",
    "Package plugin",
    "Install + test"
  ];
  labs.forEach((l, i) => {
    const x = 0.72 + (i % 4) * 3.1;
    const y = 1.55 + Math.floor(i / 4) * 2.0;
    slide.addShape(pptx.ShapeType.roundRect, { x, y, w: 2.45, h: 1.0, rectRadius: 0.08, fill: { color: i % 2 === 0 ? C.ice : C.white }, line: { color: "DCE6F2" } });
    slide.addText(String(i + 1), { x: x + 0.16, y: y + 0.18, w: 0.35, h: 0.25, fontSize: 15, bold: true, color: C.orange, margin: 0 });
    slide.addText(l, { x: x + 0.58, y: y + 0.29, w: 1.55, h: 0.18, fontSize: 10.8, bold: true, color: C.ink, align: "center", margin: 0 });
  });
  slide.addText("Lab workbook: docs/labs/nasa-mars-rover-mcp-cowork-end-to-end-lab.md", { x: 1.05, y: 6.05, w: 10.8, h: 0.26, fontSize: 12.5, bold: true, color: C.navy, align: "center", margin: 0 });
}

function addWrap() {
  const slide = pptx.addSlide();
  addBg(slide, C.navy);
  slide.addText("The repeatable pattern", { x: 0.75, y: 0.85, w: 5.4, h: 0.42, fontSize: 27, bold: true, color: C.white, margin: 0 });
  slide.addText("MCP server -> container -> AKS -> HTTPS -> Entra auth -> OAuthPluginVault -> Cowork plugin -> user experience", {
    x: 0.78, y: 1.55, w: 10.8, h: 0.65, fontSize: 19, color: C.amber, fit: "shrink", margin: 0
  });
  card(slide, 0.85, 3.05, 3.45, 1.25, "Build", "Define tools and make them safe, typed, and observable.", C.green);
  card(slide, 4.95, 3.05, 3.45, 1.25, "Secure", "Validate issuer, signature, expiry, tenant, and audience.", C.orange);
  card(slide, 9.05, 3.05, 3.45, 1.25, "Publish", "Package the plugin, document the release, and support users.", C.blue);
  slide.addText("Next: clone the repo, run the lab, and replace NASA with your own enterprise API.", { x: 1.0, y: 5.85, w: 10.9, h: 0.3, fontSize: 15, bold: true, color: C.white, align: "center", margin: 0 });
}

[
  addTitleSlide,
  addAgenda,
  addArchitecture,
  addConcepts,
  addRepoMap,
  addMcpBuild,
  addAuth,
  addAzureNetwork,
  addAksDeploy,
  addDnsCert,
  addPluginPackage,
  addPublishing,
  addTroubleshooting,
  addLabFlow,
  addWrap
].forEach((fn) => fn());

await pptx.writeFile({ fileName: "docs/session/nasa-mars-rover-mcp-cowork-session.pptx" });
