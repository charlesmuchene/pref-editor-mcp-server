import {
  listDevices,
  listApps,
  listFiles,
  readPreferences,
} from "@charlesmuchene/pref-editor";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { DeviceSchema, AppSchema, FileSchema } from "../schema.js";
import { validate } from "../utils.js";
import { z } from "zod";

export const configureCommonTools = (server: McpServer) => {
  server.tool("devices", "Lists connected Android devices", async () => {
    try {
      return {
        content: (await listDevices()).map((device) => ({
          type: "text",
          text: device.serial,
        })),
      };
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: error instanceof Error ? error.message : "Unknown error",
          },
        ],
      };
    }
  });

  server.tool(
    "list_apps",
    "Lists apps installed on device",
    DeviceSchema.shape,
    async (connection: z.infer<typeof DeviceSchema>) => {
      try {
        validate(connection, DeviceSchema);

        return {
          content: (await listApps(connection)).map((app) => ({
            type: "text",
            text: app.packageName,
          })),
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: error instanceof Error ? error.message : "Unknown error",
            },
          ],
        };
      }
    }
  );

  server.tool(
    "list_files",
    "Lists preference files for an app",
    AppSchema.shape,
    async (connection: z.infer<typeof AppSchema>) => {
      try {
        validate(connection, AppSchema);

        return {
          content: (await listFiles(connection)).map((file) => ({
            type: "text",
            text: file.name,
          })),
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: error instanceof Error ? error.message : "Unknown error",
            },
          ],
        };
      }
    }
  );

  server.tool(
    "read_preferences",
    "Reads all user preferences in a file",
    FileSchema.shape,
    async (connection: z.infer<typeof FileSchema>) => {
      try {
        validate(connection, FileSchema);

        return {
          content: (await readPreferences(connection)).map((pref) => ({
            type: "text",
            mimeType: "application/json",
            text: JSON.stringify(pref, null, 2),
          })),
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: error instanceof Error ? error.message : "Unknown error",
            },
          ],
        };
      }
    }
  );
};
