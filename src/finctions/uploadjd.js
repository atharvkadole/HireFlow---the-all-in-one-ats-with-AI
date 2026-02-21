// export default async function sendJdPdf(file, userId) {
//   const formData = new FormData();
//   formData.append("file", file); 
//   formData.append("user_id", userId); // <-- Add the user ID to the form data

//   const webhookUrl = import.meta.env.VITE_UPLOAD_JD;

//   try {
//     const response = await fetch(webhookUrl, {
//       method: "POST",
//       body: formData,
//     });

//     if (!response.ok) {
//       throw new Error("Server responded with an error.");
//     }

//     const data = await response.json();
//     return data;

//   } catch (error) {
//     console.error("Error uploading JD:", error);
//     throw new Error("Failed to upload Job Description. Please check your webhook URL.");
//   }
// }


import { supabase } from "../main/supabase";

const sendJdPdf = async (file) => {
  if (!file) {
    throw new Error("No file provided");
  }

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

  const token = session.access_token;

  const formData = new FormData();
  formData.append("data", file);

  const uploadUrl = import.meta.env.VITE_UPLOAD_JD;
  if (!uploadUrl) {
    throw new Error("Upload URL is not configured");
  }

  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      (payload && payload.message) ||
      (payload && payload.error) ||
      (typeof payload === "string" && payload) ||
      `Upload failed (${response.status})`;
    throw new Error(message);
  }

  return payload;
};

export default sendJdPdf;
