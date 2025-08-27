import { describe, it, expect } from "vitest";
import { parseDataType, validate } from "../src/utils";
import { TypeTag } from "@charlesmuchene/pref-editor";
import { z } from "zod";

describe("utils.ts", () => {
  describe("parseDataType", () => {
    it("should parse valid data types correctly", () => {
      expect(parseDataType("integer")).toBe(TypeTag.INTEGER);
      expect(parseDataType("boolean")).toBe(TypeTag.BOOLEAN);
      expect(parseDataType("float")).toBe(TypeTag.FLOAT);
      expect(parseDataType("double")).toBe(TypeTag.DOUBLE);
      expect(parseDataType("long")).toBe(TypeTag.LONG);
      expect(parseDataType("string")).toBe(TypeTag.STRING);
    });

    it("should handle case insensitive input", () => {
      expect(parseDataType("INTEGER")).toBe(TypeTag.INTEGER);
      expect(parseDataType("Boolean")).toBe(TypeTag.BOOLEAN);
      expect(parseDataType("FLOAT")).toBe(TypeTag.FLOAT);
      expect(parseDataType("Double")).toBe(TypeTag.DOUBLE);
      expect(parseDataType("LONG")).toBe(TypeTag.LONG);
      expect(parseDataType("String")).toBe(TypeTag.STRING);
    });

    it("should handle mixed case input", () => {
      expect(parseDataType("iNtEgEr")).toBe(TypeTag.INTEGER);
      expect(parseDataType("bOoLeAn")).toBe(TypeTag.BOOLEAN);
      expect(parseDataType("fLoAt")).toBe(TypeTag.FLOAT);
      expect(parseDataType("dOuBlE")).toBe(TypeTag.DOUBLE);
      expect(parseDataType("lOnG")).toBe(TypeTag.LONG);
      expect(parseDataType("sTrInG")).toBe(TypeTag.STRING);
    });

    it("should throw error for invalid data types", () => {
      expect(() => parseDataType("invalid")).toThrow(
        "Invalid data type: 'invalid'. Choose one of: integer, boolean, float, double, long or string"
      );
      expect(() => parseDataType("number")).toThrow(
        "Invalid data type: 'number'. Choose one of: integer, boolean, float, double, long or string"
      );
      expect(() => parseDataType("int")).toThrow(
        "Invalid data type: 'int'. Choose one of: integer, boolean, float, double, long or string"
      );
      expect(() => parseDataType("bool")).toThrow(
        "Invalid data type: 'bool'. Choose one of: integer, boolean, float, double, long or string"
      );
    });

    it("should throw error for empty string", () => {
      expect(() => parseDataType("")).toThrow(
        "Invalid data type: ''. Choose one of: integer, boolean, float, double, long or string"
      );
    });

    it("should throw error for whitespace-only string", () => {
      expect(() => parseDataType("   ")).toThrow(
        "Invalid data type: '   '. Choose one of: integer, boolean, float, double, long or string"
      );
    });

    it("should throw error for null or undefined input", () => {
      expect(() => parseDataType(null as any)).toThrow();
      expect(() => parseDataType(undefined as any)).toThrow();
    });
  });

  describe("validate", () => {
    it("should not throw for valid input", () => {
      const stringSchema = z.string();
      const numberSchema = z.number();
      const booleanSchema = z.boolean();
      const objectSchema = z.object({ name: z.string(), age: z.number() });

      expect(() => validate("hello", stringSchema)).not.toThrow();
      expect(() => validate(42, numberSchema)).not.toThrow();
      expect(() => validate(true, booleanSchema)).not.toThrow();
      expect(() =>
        validate({ name: "John", age: 30 }, objectSchema)
      ).not.toThrow();
    });

    it("should throw error for invalid string input", () => {
      const stringSchema = z.string();

      expect(() => validate(123, stringSchema)).toThrow(
        "Invalid input: Expected string, received number"
      );
      expect(() => validate(true, stringSchema)).toThrow(
        "Invalid input: Expected string, received boolean"
      );
      expect(() => validate(null, stringSchema)).toThrow(
        "Invalid input: Expected string, received null"
      );
      expect(() => validate(undefined, stringSchema)).toThrow(
        "Invalid input: Required"
      );
    });

    it("should throw error for invalid number input", () => {
      const numberSchema = z.number();

      expect(() => validate("123", numberSchema)).toThrow(
        "Invalid input: Expected number, received string"
      );
      expect(() => validate(true, numberSchema)).toThrow(
        "Invalid input: Expected number, received boolean"
      );
      expect(() => validate(null, numberSchema)).toThrow(
        "Invalid input: Expected number, received null"
      );
      expect(() => validate(undefined, numberSchema)).toThrow(
        "Invalid input: Required"
      );
    });

    it("should throw error for invalid boolean input", () => {
      const booleanSchema = z.boolean();

      expect(() => validate("true", booleanSchema)).toThrow(
        "Invalid input: Expected boolean, received string"
      );
      expect(() => validate(1, booleanSchema)).toThrow(
        "Invalid input: Expected boolean, received number"
      );
      expect(() => validate(null, booleanSchema)).toThrow(
        "Invalid input: Expected boolean, received null"
      );
      expect(() => validate(undefined, booleanSchema)).toThrow(
        "Invalid input: Required"
      );
    });

    it("should throw error for invalid object input", () => {
      const objectSchema = z.object({
        name: z.string(),
        age: z.number(),
      });

      expect(() => validate({ name: "John" }, objectSchema)).toThrow(
        "Invalid input: Required"
      );
      expect(() => validate({ age: 30 }, objectSchema)).toThrow(
        "Invalid input: Required"
      );
      expect(() => validate({ name: 123, age: 30 }, objectSchema)).toThrow(
        "Invalid input: Expected string, received number"
      );
      expect(() =>
        validate({ name: "John", age: "thirty" }, objectSchema)
      ).toThrow("Invalid input: Expected number, received string");
    });

    it("should handle multiple validation errors", () => {
      const objectSchema = z.object({
        name: z.string(),
        age: z.number(),
        email: z.string().email(),
      });

      expect(() =>
        validate(
          {
            name: 123,
            age: "thirty",
            email: "invalid-email",
          },
          objectSchema
        )
      ).toThrow(
        "Invalid input: Expected string, received number, Expected number, received string, Invalid email"
      );
    });

    it("should work with complex nested schemas", () => {
      const nestedSchema = z.object({
        user: z.object({
          name: z.string(),
          preferences: z.object({
            theme: z.enum(["light", "dark"]),
            notifications: z.boolean(),
          }),
        }),
        settings: z.array(z.string()),
      });

      const validData = {
        user: {
          name: "John",
          preferences: {
            theme: "dark" as const,
            notifications: true,
          },
        },
        settings: ["setting1", "setting2"],
      };

      expect(() => validate(validData, nestedSchema)).not.toThrow();

      const invalidData = {
        user: {
          name: 123,
          preferences: {
            theme: "invalid",
            notifications: "yes",
          },
        },
        settings: "not-an-array",
      };

      expect(() => validate(invalidData, nestedSchema)).toThrow();
    });

    it("should work with optional fields", () => {
      const optionalSchema = z.object({
        required: z.string(),
        optional: z.string().optional(),
      });

      expect(() =>
        validate({ required: "test" }, optionalSchema)
      ).not.toThrow();
      expect(() =>
        validate({ required: "test", optional: "also test" }, optionalSchema)
      ).not.toThrow();
      expect(() => validate({ optional: "test" }, optionalSchema)).toThrow(
        "Invalid input: Required"
      );
    });

    it("should work with array schemas", () => {
      const arraySchema = z.array(z.string());

      expect(() => validate(["a", "b", "c"], arraySchema)).not.toThrow();
      expect(() => validate([], arraySchema)).not.toThrow();
      expect(() => validate(["a", 123, "c"], arraySchema)).toThrow(
        "Invalid input: Expected string, received number"
      );
      expect(() => validate("not-an-array", arraySchema)).toThrow(
        "Invalid input: Expected array, received string"
      );
    });

    it("should work with union schemas", () => {
      const unionSchema = z.union([z.string(), z.number()]);

      expect(() => validate("hello", unionSchema)).not.toThrow();
      expect(() => validate(42, unionSchema)).not.toThrow();
      expect(() => validate(true, unionSchema)).toThrow(
        "Invalid input: Invalid input"
      );
    });
  });
});
