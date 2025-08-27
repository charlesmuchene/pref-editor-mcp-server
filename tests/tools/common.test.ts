import { describe, it, expect, vi, beforeEach } from "vitest";
import { configureCommonTools } from "../../src/tools/common";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Mock the external dependencies
vi.mock("@charlesmuchene/pref-editor", () => ({
  listDevices: vi.fn(),
  listApps: vi.fn(),
  listFiles: vi.fn(),
  readPreferences: vi.fn(),
}));

vi.mock("../../src/utils.js", () => ({
  validate: vi.fn(),
}));

import {
  listDevices,
  listApps,
  listFiles,
  readPreferences,
} from "@charlesmuchene/pref-editor";
import { validate } from "../../src/utils.js";

describe("common.ts", () => {
  let mockServer: McpServer;
  let toolHandlers: Map<string, any>;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Create a mock server that captures tool registrations
    toolHandlers = new Map();
    mockServer = {
      tool: vi.fn(
        (name: string, description: string, schema: any, handler?: any) => {
          // Handle both 3-arg and 4-arg versions of tool()
          const actualHandler = handler || schema;
          toolHandlers.set(name, actualHandler);
        }
      ),
    } as any;

    // Configure the tools
    configureCommonTools(mockServer);
  });

  describe("devices tool", () => {
    it("should register devices tool with correct parameters", () => {
      expect(mockServer.tool).toHaveBeenCalledWith(
        "devices",
        "Lists connected Android devices",
        expect.any(Function)
      );
    });

    it("should return device serials on success", async () => {
      const mockDevices = [
        { serial: "device1" },
        { serial: "device2" },
        { serial: "device3" },
      ];

      vi.mocked(listDevices).mockResolvedValue(mockDevices);

      const handler = toolHandlers.get("devices");
      const result = await handler();

      expect(listDevices).toHaveBeenCalledOnce();
      expect(result).toEqual({
        content: [
          { type: "text", text: "device1" },
          { type: "text", text: "device2" },
          { type: "text", text: "device3" },
        ],
      });
    });

    it("should handle empty device list", async () => {
      vi.mocked(listDevices).mockResolvedValue([]);

      const handler = toolHandlers.get("devices");
      const result = await handler();

      expect(result).toEqual({
        content: [],
      });
    });

    it("should handle errors from listDevices", async () => {
      const error = new Error("Failed to list devices");
      vi.mocked(listDevices).mockRejectedValue(error);

      const handler = toolHandlers.get("devices");
      const result = await handler();

      expect(result).toEqual({
        isError: true,
        content: [
          {
            type: "text",
            text: "Failed to list devices",
          },
        ],
      });
    });

    it("should handle non-Error exceptions", async () => {
      vi.mocked(listDevices).mockRejectedValue("String error");

      const handler = toolHandlers.get("devices");
      const result = await handler();

      expect(result).toEqual({
        isError: true,
        content: [
          {
            type: "text",
            text: "Unknown error",
          },
        ],
      });
    });
  });

  describe("list_apps tool", () => {
    it("should register list_apps tool with correct parameters", () => {
      expect(mockServer.tool).toHaveBeenCalledWith(
        "list_apps",
        "Lists apps installed on device",
        expect.any(Object), // DeviceSchema.shape
        expect.any(Function)
      );
    });

    it("should return app package names on success", async () => {
      const connection = { deviceId: "device123" };
      const mockApps = [
        { packageName: "com.example.app1" },
        { packageName: "com.example.app2" },
        { packageName: "com.example.app3" },
      ];

      vi.mocked(validate).mockImplementation(() => {});
      vi.mocked(listApps).mockResolvedValue(mockApps);

      const handler = toolHandlers.get("list_apps");
      const result = await handler(connection);

      expect(validate).toHaveBeenCalledWith(connection, expect.any(Object));
      expect(listApps).toHaveBeenCalledWith(connection);
      expect(result).toEqual({
        content: [
          { type: "text", text: "com.example.app1" },
          { type: "text", text: "com.example.app2" },
          { type: "text", text: "com.example.app3" },
        ],
      });
    });

    it("should handle validation errors", async () => {
      const connection = { invalidField: "test" };
      const validationError = new Error("Invalid input: Required");

      vi.mocked(validate).mockImplementation(() => {
        throw validationError;
      });

      const handler = toolHandlers.get("list_apps");
      const result = await handler(connection);

      expect(validate).toHaveBeenCalledWith(connection, expect.any(Object));
      expect(listApps).not.toHaveBeenCalled();
      expect(result).toEqual({
        isError: true,
        content: [
          {
            type: "text",
            text: "Invalid input: Required",
          },
        ],
      });
    });

    it("should handle errors from listApps", async () => {
      const connection = { deviceId: "device123" };
      const error = new Error("Failed to list apps");

      vi.mocked(validate).mockImplementation(() => {});
      vi.mocked(listApps).mockRejectedValue(error);

      const handler = toolHandlers.get("list_apps");
      const result = await handler(connection);

      expect(result).toEqual({
        isError: true,
        content: [
          {
            type: "text",
            text: "Failed to list apps",
          },
        ],
      });
    });

    it("should handle empty app list", async () => {
      const connection = { deviceId: "device123" };

      vi.mocked(validate).mockImplementation(() => {});
      vi.mocked(listApps).mockResolvedValue([]);

      const handler = toolHandlers.get("list_apps");
      const result = await handler(connection);

      expect(result).toEqual({
        content: [],
      });
    });

    it("should handle non-Error exceptions", async () => {
      const connection = { deviceId: "device123" };

      vi.mocked(validate).mockImplementation(() => {});
      vi.mocked(listApps).mockRejectedValue("String error");

      const handler = toolHandlers.get("list_apps");
      const result = await handler(connection);

      expect(result).toEqual({
        isError: true,
        content: [
          {
            type: "text",
            text: "Unknown error",
          },
        ],
      });
    });
  });

  describe("list_files tool", () => {
    it("should register list_files tool with correct parameters", () => {
      expect(mockServer.tool).toHaveBeenCalledWith(
        "list_files",
        "Lists preference files for an app",
        expect.any(Object), // AppSchema.shape
        expect.any(Function)
      );
    });

    it("should return file names on success", async () => {
      const connection = { deviceId: "device123", appId: "com.example.app" };
      const mockFiles = [
        { name: "preferences.xml" },
        { name: "settings.xml" },
        { name: "user_data.xml" },
      ];

      vi.mocked(validate).mockImplementation(() => {});
      vi.mocked(listFiles).mockResolvedValue(mockFiles);

      const handler = toolHandlers.get("list_files");
      const result = await handler(connection);

      expect(validate).toHaveBeenCalledWith(connection, expect.any(Object));
      expect(listFiles).toHaveBeenCalledWith(connection);
      expect(result).toEqual({
        content: [
          { type: "text", text: "preferences.xml" },
          { type: "text", text: "settings.xml" },
          { type: "text", text: "user_data.xml" },
        ],
      });
    });

    it("should handle validation errors", async () => {
      const connection = { deviceId: "device123" }; // missing appId
      const validationError = new Error("Invalid input: Required");

      vi.mocked(validate).mockImplementation(() => {
        throw validationError;
      });

      const handler = toolHandlers.get("list_files");
      const result = await handler(connection);

      expect(validate).toHaveBeenCalledWith(connection, expect.any(Object));
      expect(listFiles).not.toHaveBeenCalled();
      expect(result).toEqual({
        isError: true,
        content: [
          {
            type: "text",
            text: "Invalid input: Required",
          },
        ],
      });
    });

    it("should handle errors from listFiles", async () => {
      const connection = { deviceId: "device123", appId: "com.example.app" };
      const error = new Error("Failed to list files");

      vi.mocked(validate).mockImplementation(() => {});
      vi.mocked(listFiles).mockRejectedValue(error);

      const handler = toolHandlers.get("list_files");
      const result = await handler(connection);

      expect(result).toEqual({
        isError: true,
        content: [
          {
            type: "text",
            text: "Failed to list files",
          },
        ],
      });
    });

    it("should handle empty file list", async () => {
      const connection = { deviceId: "device123", appId: "com.example.app" };

      vi.mocked(validate).mockImplementation(() => {});
      vi.mocked(listFiles).mockResolvedValue([]);

      const handler = toolHandlers.get("list_files");
      const result = await handler(connection);

      expect(result).toEqual({
        content: [],
      });
    });

    it("should handle non-Error exceptions", async () => {
      const connection = { deviceId: "device123", appId: "com.example.app" };

      vi.mocked(validate).mockImplementation(() => {});
      vi.mocked(listFiles).mockRejectedValue("String error");

      const handler = toolHandlers.get("list_files");
      const result = await handler(connection);

      expect(result).toEqual({
        isError: true,
        content: [
          {
            type: "text",
            text: "Unknown error",
          },
        ],
      });
    });
  });

  describe("read_preferences tool", () => {
    it("should register read_preferences tool with correct parameters", () => {
      expect(mockServer.tool).toHaveBeenCalledWith(
        "read_preferences",
        "Reads all user preferences in a file",
        expect.any(Object), // FileSchema.shape
        expect.any(Function)
      );
    });

    it("should return preferences as JSON on success", async () => {
      const connection = {
        deviceId: "device123",
        appId: "com.example.app",
        filename: "preferences.xml",
      };
      const mockPreferences = [
        { name: "theme", value: "dark", type: "string" },
        { name: "notifications", value: "true", type: "boolean" },
        { name: "max_items", value: "50", type: "integer" },
      ];

      vi.mocked(validate).mockImplementation(() => {});
      vi.mocked(readPreferences).mockResolvedValue(mockPreferences);

      const handler = toolHandlers.get("read_preferences");
      const result = await handler(connection);

      expect(validate).toHaveBeenCalledWith(connection, expect.any(Object));
      expect(readPreferences).toHaveBeenCalledWith(connection);
      expect(result).toEqual({
        content: [
          {
            type: "text",
            mimeType: "application/json",
            text: JSON.stringify(mockPreferences[0], null, 2),
          },
          {
            type: "text",
            mimeType: "application/json",
            text: JSON.stringify(mockPreferences[1], null, 2),
          },
          {
            type: "text",
            mimeType: "application/json",
            text: JSON.stringify(mockPreferences[2], null, 2),
          },
        ],
      });
    });

    it("should handle validation errors", async () => {
      const connection = { deviceId: "device123", appId: "com.example.app" }; // missing filename
      const validationError = new Error("Invalid input: Required");

      vi.mocked(validate).mockImplementation(() => {
        throw validationError;
      });

      const handler = toolHandlers.get("read_preferences");
      const result = await handler(connection);

      expect(validate).toHaveBeenCalledWith(connection, expect.any(Object));
      expect(readPreferences).not.toHaveBeenCalled();
      expect(result).toEqual({
        isError: true,
        content: [
          {
            type: "text",
            text: "Invalid input: Required",
          },
        ],
      });
    });

    it("should handle errors from readPreferences", async () => {
      const connection = {
        deviceId: "device123",
        appId: "com.example.app",
        filename: "preferences.xml",
      };
      const error = new Error("Failed to read preferences");

      vi.mocked(validate).mockImplementation(() => {});
      vi.mocked(readPreferences).mockRejectedValue(error);

      const handler = toolHandlers.get("read_preferences");
      const result = await handler(connection);

      expect(result).toEqual({
        isError: true,
        content: [
          {
            type: "text",
            text: "Failed to read preferences",
          },
        ],
      });
    });

    it("should handle empty preferences list", async () => {
      const connection = {
        deviceId: "device123",
        appId: "com.example.app",
        filename: "preferences.xml",
      };

      vi.mocked(validate).mockImplementation(() => {});
      vi.mocked(readPreferences).mockResolvedValue([]);

      const handler = toolHandlers.get("read_preferences");
      const result = await handler(connection);

      expect(result).toEqual({
        content: [],
      });
    });

    it("should handle complex preference objects", async () => {
      const connection = {
        deviceId: "device123",
        appId: "com.example.app",
        filename: "preferences.xml",
      };
      const mockPreferences = [
        {
          name: "user_settings",
          value: '{"theme": "dark", "language": "en"}',
          type: "string",
          metadata: { created: "2023-01-01", modified: "2023-12-01" },
        },
      ];

      vi.mocked(validate).mockImplementation(() => {});
      vi.mocked(readPreferences).mockResolvedValue(mockPreferences);

      const handler = toolHandlers.get("read_preferences");
      const result = await handler(connection);

      expect(result).toEqual({
        content: [
          {
            type: "text",
            mimeType: "application/json",
            text: JSON.stringify(mockPreferences[0], null, 2),
          },
        ],
      });
    });

    it("should handle non-Error exceptions", async () => {
      const connection = {
        deviceId: "device123",
        appId: "com.example.app",
        filename: "preferences.xml",
      };

      vi.mocked(validate).mockImplementation(() => {});
      vi.mocked(readPreferences).mockRejectedValue("String error");

      const handler = toolHandlers.get("read_preferences");
      const result = await handler(connection);

      expect(result).toEqual({
        isError: true,
        content: [
          {
            type: "text",
            text: "Unknown error",
          },
        ],
      });
    });
  });

  describe("configureCommonTools integration", () => {
    it("should register all four tools", () => {
      expect(mockServer.tool).toHaveBeenCalledTimes(4);
      expect(toolHandlers.has("devices")).toBe(true);
      expect(toolHandlers.has("list_apps")).toBe(true);
      expect(toolHandlers.has("list_files")).toBe(true);
      expect(toolHandlers.has("read_preferences")).toBe(true);
    });

    it("should handle multiple tool registrations", () => {
      // Clear and reconfigure to test multiple registrations
      vi.clearAllMocks();
      toolHandlers.clear();

      configureCommonTools(mockServer);
      configureCommonTools(mockServer);

      // Should be called twice for each tool
      expect(mockServer.tool).toHaveBeenCalledTimes(8);
    });
  });
});
