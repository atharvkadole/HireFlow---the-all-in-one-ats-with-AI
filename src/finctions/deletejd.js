import { supabase } from "../main/supabase";

const deleteJd = async (jdId) => {
  if (!jdId) {
    throw new Error("JD ID is required");
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

  const deleteUrl = import.meta.env.VITE_DELETE_JD_URL;

  if (!deleteUrl) {
    throw new Error("Delete JD URL is not configured");
  }

  const response = await fetch(deleteUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ jd_id: jdId }),
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
      `Delete failed (${response.status})`;
    throw new Error(message);
  }

  return payload;
};

export default deleteJd;
