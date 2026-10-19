import { describe, it, expect } from "vitest";
import { resolveBaseUrl, makeApiUrl } from "./baseUrl";

describe("resolveBaseUrl", () => {
  it("returns the localhost default when the variable is undefined", () => {
    expect(resolveBaseUrl(undefined)).toBe("http://localhost:8080");
  });

  it("returns an empty string (same origin) when the variable is an empty string", () => {
    expect(resolveBaseUrl("")).toBe("");
  });

  it("strips a trailing slash from a non-empty value", () => {
    expect(resolveBaseUrl("https://api.example.com/")).toBe("https://api.example.com");
    expect(resolveBaseUrl("https://api.example.com//")).toBe("https://api.example.com");
  });

  it("leaves a value without a trailing slash unchanged", () => {
    expect(resolveBaseUrl("https://api.example.com")).toBe("https://api.example.com");
  });
});

describe("makeApiUrl", () => {
  it("returns the bare path when the base URL is empty", () => {
    expect(makeApiUrl("")("/api/resume")).toBe("/api/resume");
  });

  it("never starts with // for any base", () => {
    for (const raw of [undefined, "", "/", "https://api.example.com/", "http://localhost:8080"]) {
      expect(makeApiUrl(resolveBaseUrl(raw))("/api/resume").startsWith("//")).toBe(false);
    }
  });

  it("prefixes the base URL otherwise", () => {
    expect(makeApiUrl("http://localhost:8080")("/api/resume")).toBe("http://localhost:8080/api/resume");
  });
});
