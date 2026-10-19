import { describe, it, expect } from "vitest";
import { validateResumeFile, getResumeLimit } from "./validateResumeFile";

const file = (name, type, size = 1000) => ({ name, type, size });
const TYPE_ERROR = "Only PDF, DOC or DOCX files are allowed";

describe("validateResumeFile", () => {
  it("accepts a PDF", () => {
    expect(validateResumeFile(file("cv.pdf", "application/pdf")).ok).toBe(true);
  });

  it("accepts a DOC", () => {
    expect(validateResumeFile(file("cv.doc", "application/msword")).ok).toBe(true);
  });

  it("accepts a DOCX", () => {
    const type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    expect(validateResumeFile(file("cv.docx", type)).ok).toBe(true);
  });

  it("rejects a PNG with the type message", () => {
    expect(validateResumeFile(file("cv.png", "image/png"))).toEqual({
      ok: false,
      message: TYPE_ERROR,
    });
  });

  it("rejects an .exe even if it claims to be a PDF by name only", () => {
    expect(validateResumeFile(file("cv.exe", "application/octet-stream")).message).toBe(TYPE_ERROR);
  });

  it("accepts a .docx reported as application/octet-stream", () => {
    expect(validateResumeFile(file("cv.docx", "application/octet-stream")).ok).toBe(true);
  });

  it("rejects an octet-stream .png with the type message", () => {
    expect(validateResumeFile(file("cv.png", "application/octet-stream"))).toEqual({
      ok: false,
      message: TYPE_ERROR,
    });
  });

  it("rejects a 5 MB file with the size message", () => {
    const result = validateResumeFile(file("cv.pdf", "application/pdf", 5 * 1024 * 1024));
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/4 MB/);
  });
});

describe("getResumeLimit", () => {
  it("returns 0 / 30 / 100 by plan", () => {
    expect(getResumeLimit("starter")).toBe(0);
    expect(getResumeLimit("pro")).toBe(30);
    expect(getResumeLimit("executive")).toBe(100);
    expect(getResumeLimit(undefined)).toBe(0);
  });
});
