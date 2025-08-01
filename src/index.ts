#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { configurePreferenceTools } from "./tools/prefs.js";
import { configureCommonTools } from "./tools/common.js";
import pkg from "../package.json" with { type: "json" };

const server = new McpServer(
  {
    name: "Pref-Editor",
    version: pkg.version,
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

configurePreferenceTools(server);
configureCommonTools(server);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

try {
  await main()
} catch (error) {
  console.error("Error starting server:", error);
  process.exit(1);
} 