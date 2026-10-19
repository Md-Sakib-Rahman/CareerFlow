export const MAX_RESUME_BYTES = 4 * 1024 * 1024;

export const RESUME_ACCEPT =
  "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.pdf,.doc,.docx";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"];

export const getResumeLimit = (plan) =>
  plan === "executive" ? 100 : plan === "pro" ? 30 : 0;

export const validateResumeFile = (file) => {
  const name = (file?.name || "").toLowerCase();
  // some browsers report an empty MIME type for .doc/.docx
  const typeOk = ALLOWED_TYPES.includes(file?.type) || file?.type === "";
  const extOk = ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext));
  if (!typeOk || !extOk) {
    return { ok: false, message: "Only PDF, DOC or DOCX files are allowed" };
  }
  if (file.size > MAX_RESUME_BYTES) {
    return { ok: false, message: "File is too large. Maximum size is 4 MB" };
  }
  return { ok: true };
};
