import { supabase } from "../main/supabase";

export const MAX_BULK_RESUME_FILES = 10;

const getAccessToken = async () => {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw new Error(sessionError.message || "Failed to get session");
  }

  if (!session) {
    throw new Error("Not authenticated");
  }

  return session.access_token;
};

const readResponsePayload = async (response) => {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  const text = await response.text();

  if (!text) {
    return "";
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const getPayloadMessage = (payload, fallback) => {
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    return payload.message || payload.error || fallback;
  }

  if (typeof payload === "string" && payload.trim()) {
    return payload;
  }

  return fallback;
};

const postResumeFormData = async (uploadUrl, formData) => {
  if (!uploadUrl) {
    throw new Error("Upload URL is not configured");
  }

  const token = await getAccessToken();

  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const payload = await readResponsePayload(response);

  if (!response.ok) {
    throw new Error(getPayloadMessage(payload, `Upload failed (${response.status})`));
  }

  return payload;
};

const isPdfFile = (file) =>
  file?.type === "application/pdf" || file?.name?.toLowerCase().endsWith(".pdf");

const sendPdf = async (file) => {
  if (!file) {
    throw new Error("No file provided");
  }

  if (!isPdfFile(file)) {
    throw new Error("Please upload a PDF file");
  }

  const formData = new FormData();
  formData.append("data", file);

  return postResumeFormData(import.meta.env.VITE_UPLOAD_URL, formData);
};

export const sendBulkPdfs = async (files) => {
  const resumeFiles = Array.from(files || []);

  if (resumeFiles.length === 0) {
    throw new Error("No files provided");
  }

  if (resumeFiles.length > MAX_BULK_RESUME_FILES) {
    throw new Error(`You can bulk upload up to ${MAX_BULK_RESUME_FILES} resumes at a time`);
  }

  const invalidFile = resumeFiles.find((file) => !isPdfFile(file));
  if (invalidFile) {
    throw new Error(`${invalidFile.name || "One selected file"} is not a PDF`);
  }

  const formData = new FormData();
  resumeFiles.forEach((file, index) => {
    formData.append(`resume_${index + 1}`, file, file.name);
  });

  return postResumeFormData(import.meta.env.VITE_BULK_UPLOAD_URL, formData);
};

export default sendPdf;
