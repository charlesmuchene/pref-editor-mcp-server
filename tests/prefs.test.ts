import { describe, it, expect, vi, beforeEach } from "vitest";
import { configurePreferenceTools } from "../src/tools/prefs";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { TypeTag } from "@charlesmuchene/pref-editor";

// Mock the external dependencies
vi.mock("@charlesmuchene/pref-editor", () => ({
  changePreference: vi.fn(),
  deletePreference: vi.fn(),
  addPreference: vi.fn(),
  TypeTag: {
    INTEGER: "INTEGER",
    BOOLEAN: "BOOLEAN",
    FLOAT: "FLOAT",
    DOUBLE: "DOUBLE",
    LONG: "LONG",
    STRING: "STRING",
  },
}));

vi.mock("../src/utils.js", () => ({
  validate: vi.fn(),
  parseDataType: vi.fn(),
}));

import {
  changePreference,
  deletePreference,
  addPreference,
} from "@charlesmuchene/pref-editor";
import { validate, parseDataType } from "../src/utils.js";

describe("prefs.ts", () => {
  let mockServer: McpServer;
  let toolHandlers: Map<string, any>;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Create a mock server that captures tool registrations
    toolHandlers = new Map();
    mockServer = {
      tool: vi.fn(
        (name: string, description: string, schema: any, handler: any) => {
          toolHandlers.set(name, handler);
        }
      ),
    } as any;

    // Configure the tools
    configurePreferenceTools(mockServer);
  });

  describe("change_preference tool", () => {
    it("should register change_preference tool with correct parameters", () => {
      expect(mockServer.tool).toHaveBeenCalledWith(
        "change_preference",
        "Changes the value of an existing preference",
        expect.any(Object), // EditPrefSchema.shape
        expect.any(Function)
      );
    });

    it("should change preference successfully", async () => {
      const input = {
        deviceId: "device123",
        appId: "com.example.app",
        filename: "preferences.xml",
        name: "theme",
        value: "dark",
      };

      vi.mocked(validate).mockImplementation(() => {});
      vi.mocked(changePreference).mockResolvedValue(undefined);

      const handler = toolHandlers.get("change_preference");
      const result = await handler(input);

      expect(validate).toHaveBeenCalledWith(input, expect.any(Object));
      expect(changePreference).toHaveBeenCalledWith(
        { value: "dark", key: "theme" },
        {
          deviceId: "device123",
          appId: "com.example.app",
          filename: "preferences.xml",
        }
      );
      expect(result).toEqual({
        content: [
          {
            type: "text",
            text: "Preference changed",
          },
        ],
      });
    });

    it("should handle validation errors", async () => {
      const input = { deviceId: "device123" }; // missing required fields
      const validationError = new Error("Invalid input: Required");

      vi.mocked(validate).mockImplementation(() => {
        throw validationError;
      });

      const handler = toolHandlers.get("change_preference");
      const result = await handler(input);

      expect(validate).toHaveBeenCalledWith(input, expect.any(Object));
      expect(changePreference).not.toHaveBeenCalled();
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

    it("should handle errors from changePreference", async () => {
      const input = {
        deviceId: "device123",
        appId: "com.example.app",
        filename: "preferences.xml",
        name: "theme",
        value: "dark",
      };
      const error = new Error("Failed to change preference");

      vi.mocked(validate).mockImplementation(() => {});
      vi.mocked(changePreference).mockRejectedValue(error);

      const handler = toolHandlers.get("change_preference");
      const result = await handler(input);

      expect(result).toEqual({
        isError: true,
        content: [
          {
            type: "text",
            text: "Failed to change preference",
          },
        ],
      });
    });

    it("should handle non-Error exceptions", async () => {
      const input = {
        deviceId: "device123",
        appId: "com.example.app",
        filename: "preferences.xml",
        name: "theme",
        value: "dark",
      };

      vi.mocked(validate).mockImplementation(() => {});
      vi.mocked(changePreference).mockRejectedValue("String error");

      const handler = toolHandlers.get("change_preference");
      const result = await handler(input);

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

    it("should properly destructure input parameters", async () => {
      const input = {
        deviceId: "device123",
        appId: "com.example.app",
        filename: "preferences.xml",
        name: "notifications",
        value: "true",
        extraField: "should be ignored",
      };

      vi.mocked(validate).mockImplementation(() => {});
      vi.mocked(changePreference).mockResolvedValue(undefined);

      const handler = toolHandlers.get("change_preference");
      await handler(input);

      expect(changePreference).toHaveBeenCalledWith(
        { value: "true", key: "notifications" },
        {
          deviceId: "device123",
          appId: "com.example.app",
          filename: "preferences.xml",
          extraField: "should be ignored",
        }
      );
    });
  });

  describe("delete_preference tool", () => {
    it("should register delete_preference tool with correct parameters", () => {
      expect(mockServer.tool).toHaveBeenCalledWith(
        "delete_preference",
        "Delete an existing preference",
        expect.any(Object), // DeletePrefSchema.shape
        expect.any(Function)
      );
    });

    it("should delete preference successfully", async () => {
      const input = {
        deviceId: "device123",
        appId: "com.example.app",
        filename: "preferences.xml",
        name: "old_setting",
      };

      vi.mocked(validate).mockImplementation(() => {});
      vi.mocked(deletePreference).mockResolvedValue(undefined);

      const handler = toolHandlers.get("delete_preference");
      const result = await handler(input);

      expect(validate).toHaveBeenCalledWith(input, expect.any(Object));
      expect(deletePreference).toHaveBeenCalledWith(
        { key: "old_setting" },
        {
          deviceId: "device123",
          appId: "com.example.app",
          filename: "preferences.xml",
        }
      );
      expect(result).toEqual({
        content: [
          {
            type: "text",
            text: "Preference deleted",
          },
        ],
      });
    });

    it("should handle validation errors", async () => {
      const input = { deviceId: "device123", appId: "com.example.app" }; // missing filename and name
      const validationError = new Error("Invalid input: Required");

      vi.mocked(validate).mockImplementation(() => {
        throw validationError;
      });

      const handler = toolHandlers.get("delete_preference");
      const result = await handler(input);

      expect(validate).toHaveBeenCalledWith(input, expect.any(Object));
      expect(deletePreference).not.toHaveBeenCalled();
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

    it("should handle errors from deletePreference", async () => {
      const input = {
        deviceId: "device123",
        appId: "com.example.app",
        filename: "preferences.xml",
        name: "old_setting",
      };
      const error = new Error("Failed to delete preference");

      vi.mocked(validate).mockImplementation(() => {});
      vi.mocked(deletePreference).mockRejectedValue(error);

      const handler = toolHandlers.get("delete_preference");
      const result = await handler(input);

      expect(result).toEqual({
        isError: true,
        content: [
          {
            type: "text",
            text: "Failed to delete preference",
          },
        ],
      });
    });

    it("should handle non-Error exceptions", async () => {
      const input = {
        deviceId: "device123",
        appId: "com.example.app",
        filename: "preferences.xml",
        name: "old_setting",
      };

      vi.mocked(validate).mockImplementation(() => {});
      vi.mocked(deletePreference).mockRejectedValue("String error");

      const handler = toolHandlers.get("delete_preference");
      const result = await handler(input);

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

    it("should properly destructure input parameters", async () => {
      const input = {
        deviceId: "device123",
        appId: "com.example.app",
        filename: "preferences.xml",
        name: "setting_to_delete",
        extraField: "should be ignored",
      };

      vi.mocked(validate).mockImplementation(() => {});
      vi.mocked(deletePreference).mockResolvedValue(undefined);

      const handler = toolHandlers.get("delete_preference");
      await handler(input);

      expect(deletePreference).toHaveBeenCalledWith(
        { key: "setting_to_delete" },
        {
          deviceId: "device123",
          appId: "com.example.app",
          filename: "preferences.xml",
          extraField: "should be ignored",
        }
      );
    });
  });

  describe("add_preference tool", () => {
    it("should register add_preference tool with correct parameters", () => {
      expect(mockServer.tool).toHaveBeenCalledWith(
        "add_preference",
        "Adds a new preference given the name, value and type.",
        expect.any(Object), // AddPrefSchema.shape
        expect.any(Function)
      );
    });

    it("should add preference successfully with string type", async () => {
      const input = {
        deviceId: "device123",
        appId: "com.example.app",
        filename: "preferences.xml",
        name: "username",
        value: "john_doe",
        type: "string",
      };

      vi.mocked(validate).mockImplementation(() => {});
      vi.mocked(parseDataType).mockReturnValue(TypeTag.STRING);
      vi.mocked(addPreference).mockResolvedValue(undefined);

      const handler = toolHandlers.get("add_preference");
      const result = await handler(input);

      expect(validate).toHaveBeenCalledWith(input, expect.any(Object));
      expect(parseDataType).toHaveBeenCalledWith("string");
      expect(addPreference).toHaveBeenCalledWith(
        { key: "username", value: "john_doe", type: TypeTag.STRING },
        {
          deviceId: "device123",
          appId: "com.example.app",
          filename: "preferences.xml",
        }
      );
      expect(result).toEqual({
        content: [
          {
            type: "text",
            text: "Preference added",
          },
        ],
      });
    });

    it("should add preference successfully with integer type", async () => {
      const input = {
        deviceId: "device123",
        appId: "com.example.app",
        filename: "preferences.xml",
        name: "max_items",
        value: "100",
        type: "integer",
      };

      vi.mocked(validate).mockImplementation(() => {});
      vi.mocked(parseDataType).mockReturnValue(TypeTag.INTEGER);
      vi.mocked(addPreference).mockResolvedValue(undefined);

      const handler = toolHandlers.get("add_preference");
      const result = await handler(input);

      expect(parseDataType).toHaveBeenCalledWith("integer");
      expect(addPreference).toHaveBeenCalledWith(
        { key: "max_items", value: "100", type: TypeTag.INTEGER },
        {
          deviceId: "device123",
          appId: "com.example.app",
          filename: "preferences.xml",
        }
      );
      expect(result).toEqual({
        content: [
          {
            type: "text",
            text: "Preference added",
          },
        ],
      });
    });

    it("should add preference successfully with boolean type", async () => {
      const input = {
        deviceId: "device123",
        appId: "com.example.app",
        filename: "preferences.xml",
        name: "notifications_enabled",
        value: "true",
        type: "boolean",
      };

      vi.mocked(validate).mockImplementation(() => {});
      vi.mocked(parseDataType).mockReturnValue(TypeTag.BOOLEAN);
      vi.mocked(addPreference).mockResolvedValue(undefined);

      const handler = toolHandlers.get("add_preference");
      await handler(input);

      expect(parseDataType).toHaveBeenCalledWith("boolean");
      expect(addPreference).toHaveBeenCalledWith(
        { key: "notifications_enabled", value: "true", type: TypeTag.BOOLEAN },
        {
          deviceId: "device123",
          appId: "com.example.app",
          filename: "preferences.xml",
        }
      );
    });

    it("should handle all supported data types", async () => {
      const types = [
        { type: "float", expected: TypeTag.FLOAT },
        { type: "double", expected: TypeTag.DOUBLE },
        { type: "long", expected: TypeTag.LONG },
      ];

      for (const { type, expected } of types) {
        vi.clearAllMocks();

        const input = {
          deviceId: "device123",
          appId: "com.example.app",
          filename: "preferences.xml",
          name: `test_${type}`,
          value: "123.45",
          type,
        };

        vi.mocked(validate).mockImplementation(() => {});
        vi.mocked(parseDataType).mockReturnValue(expected);
        vi.mocked(addPreference).mockResolvedValue(undefined);

        const handler = toolHandlers.get("add_preference");
        await handler(input);

        expect(parseDataType).toHaveBeenCalledWith(type);
        expect(addPreference).toHaveBeenCalledWith(
          { key: `test_${type}`, value: "123.45", type: expected },
          {
            deviceId: "device123",
            appId: "com.example.app",
            filename: "preferences.xml",
          }
        );
      }
    });

    it("should handle validation errors", async () => {
      const input = { deviceId: "device123" }; // missing required fields
      const validationError = new Error("Invalid input: Required");

      vi.mocked(validate).mockImplementation(() => {
        throw validationError;
      });

      const handler = toolHandlers.get("add_preference");
      const result = await handler(input);

      expect(validate).toHaveBeenCalledWith(input, expect.any(Object));
      expect(parseDataType).not.toHaveBeenCalled();
      expect(addPreference).not.toHaveBeenCalled();
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

    it("should handle parseDataType errors", async () => {
      const input = {
        deviceId: "device123",
        appId: "com.example.app",
        filename: "preferences.xml",
        name: "test_pref",
        value: "test_value",
        type: "invalid_type",
      };
      const parseError = new Error("Invalid data type: 'invalid_type'");

      vi.mocked(validate).mockImplementation(() => {});
      vi.mocked(parseDataType).mockImplementation(() => {
        throw parseError;
      });

      const handler = toolHandlers.get("add_preference");
      const result = await handler(input);

      expect(parseDataType).toHaveBeenCalledWith("invalid_type");
      expect(addPreference).not.toHaveBeenCalled();
      expect(result).toEqual({
        isError: true,
        content: [
          {
            type: "text",
            text: "Invalid data type: 'invalid_type'",
          },
        ],
      });
    });

    it("should handle errors from addPreference", async () => {
      const input = {
        deviceId: "device123",
        appId: "com.example.app",
        filename: "preferences.xml",
        name: "test_pref",
        value: "test_value",
        type: "string",
      };
      const error = new Error("Failed to add preference");

      vi.mocked(validate).mockImplementation(() => {});
      vi.mocked(parseDataType).mockReturnValue(TypeTag.STRING);
      vi.mocked(addPreference).mockRejectedValue(error);

      const handler = toolHandlers.get("add_preference");
      const result = await handler(input);

      expect(result).toEqual({
        isError: true,
        content: [
          {
            type: "text",
            text: "Failed to add preference",
          },
        ],
      });
    });

    it("should handle non-Error exceptions", async () => {
      const input = {
        deviceId: "device123",
        appId: "com.example.app",
        filename: "preferences.xml",
        name: "test_pref",
        value: "test_value",
        type: "string",
      };

      vi.mocked(validate).mockImplementation(() => {});
      vi.mocked(parseDataType).mockReturnValue(TypeTag.STRING);
      vi.mocked(addPreference).mockRejectedValue("String error");

      const handler = toolHandlers.get("add_preference");
      const result = await handler(input);

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

    it("should properly destructure input parameters", async () => {
      const input = {
        deviceId: "device123",
        appId: "com.example.app",
        filename: "preferences.xml",
        name: "new_setting",
        value: "new_value",
        type: "string",
        extraField: "should be ignored",
      };

      vi.mocked(validate).mockImplementation(() => {});
      vi.mocked(parseDataType).mockReturnValue(TypeTag.STRING);
      vi.mocked(addPreference).mockResolvedValue(undefined);

      const handler = toolHandlers.get("add_preference");
      await handler(input);

      expect(addPreference).toHaveBeenCalledWith(
        { key: "new_setting", value: "new_value", type: TypeTag.STRING },
        {
          deviceId: "device123",
          appId: "com.example.app",
          filename: "preferences.xml",
          extraField: "should be ignored",
        }
      );
    });
  });

  describe("configurePreferenceTools integration", () => {
    it("should register all three tools", () => {
      expect(mockServer.tool).toHaveBeenCalledTimes(3);
      expect(toolHandlers.has("change_preference")).toBe(true);
      expect(toolHandlers.has("delete_preference")).toBe(true);
      expect(toolHandlers.has("add_preference")).toBe(true);
    });

    it("should handle multiple tool registrations", () => {
      // Clear and reconfigure to test multiple registrations
      vi.clearAllMocks();
      toolHandlers.clear();

      configurePreferenceTools(mockServer);
      configurePreferenceTools(mockServer);

      // Should be called twice for each tool
      expect(mockServer.tool).toHaveBeenCalledTimes(6);
    });

    it("should register tools with unique names", () => {
      const toolNames = Array.from(toolHandlers.keys());
      const uniqueNames = new Set(toolNames);

      expect(toolNames.length).toBe(uniqueNames.size);
      expect(toolNames).toEqual([
        "change_preference",
        "delete_preference",
        "add_preference",
      ]);
    });
  });
});
