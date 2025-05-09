import {
  TypeTag,
  listApps,
  listFiles,
  Preference,
  listDevices,
  addPreference,
  deletePreference,
  changePreference,
  readPreferences,
} from "@charlesmuchene/pref-editor";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer(
  {
    name: "Pref-Editor",
    version: "0.2.3",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

const deviceSchema = {
  deviceId: z.string(),
};

const appSchema = Object.assign(deviceSchema, {
  appId: z.string(),
});

const fileSchema = Object.assign(appSchema, {
  filename: z.string(),
});

const prefSchema = {
  name: z.string(),
  value: z.string(),
  type: z.string(),
};

const addPrefSchema = {
  ...prefSchema,
  ...fileSchema,
};

const editPrefSchema = { ...addPrefSchema };

const deletePrefSchema = {
  name: z.string(),
  ...fileSchema,
};

const parseDataType = (type: string): TypeTag => {
  const result = TypeTag[type.toUpperCase() as keyof typeof TypeTag];
  if (result === undefined)
    throw new Error(
      `Invalid data type: '${type}'. Choose one of: integer, boolean, float, double, long or string`
    );
  return result;
};

server.tool(
  "change_preference",
  "Changes the value of an existing preference. Requires the name, new value, data type (integer, boolean, float, double, long or string), device ID, app ID and filename.",
  editPrefSchema,
  async ({ name, value, type, ...connection }) => {
    const pref: Preference = {
      value,
      key: name,
      type: parseDataType(type),
    };
    try {
      await changePreference(pref, connection);
      return {
        content: [
          {
            type: "text",
            text: `Preference changed`,
          },
        ],
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
  "delete_preference",
  "Deletes an existing preference. Requires the preference name, device ID, app ID and filename.",
  deletePrefSchema,
  async ({ name, ...connection }) => {
    try {
      await deletePreference({ key: name }, connection);
      return {
        content: [
          {
            type: "text",
            text: `Preference deleted`,
          },
        ],
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
  "add_preference",
  "Adds a new preference given the name, value, data type (integer, boolean, float, double, long or string), device ID, app ID and filename.",
  addPrefSchema,
  async ({ name, value, type, ...connection }) => {
    try {
      const pref: Preference = {
        key: name,
        value,
        type: parseDataType(type),
      };
      await addPreference(pref, { ...connection });
      return {
        content: [
          {
            type: "text",
            text: `Preference added`,
          },
        ],
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
  "list_devices",
  "Lists connected Android devices and their serial numbers.",
  async () => {
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
  }
);

server.tool(
  "list_apps",
  "Lists apps installed on a specific device. Requires the device ID.",
  deviceSchema,
  async ({ deviceId }) => {
    try {
      return {
        content: (await listApps({ deviceId })).map((app) => ({
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
  "Lists preference files for a specific app on a device. Requires the device ID and app ID.",
  appSchema,
  async (connection) => {
    try {
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
  "Reads all user preferences in a specific file. Requires the device ID, app ID and filename.",
  fileSchema,
  async (connection) => {
    try {
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

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
