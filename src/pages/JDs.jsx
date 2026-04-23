import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { supabase } from "../main/supabase";
import { showSnackbar } from "../slice/uiSlice";
import deleteJd from "../finctions/deletejd";
import JDUploader from "../components/JDUploader";

export default function JDs() {
  const [jds, setJds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const dispatch = useDispatch();

  const fetchJds = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("job_descriptions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching JDs:", error.message);
    } else {
      setJds(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchJds();
  }, []);

  const getDownloadUrl = (url) => {
    if (!url) return "#";
    return url.replace('/upload/', '/upload/fl_attachment/');
  };

  const handleDeleteJd = async (jd) => {
    const confirmed = window.confirm(
      `Delete ${jd.title || "this JD"}? This will remove the JD record and its PDF.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(jd.id);
      dispatch(
        showSnackbar({
          message: "Deleting JD...",
          type: "info",
        })
      );

      await deleteJd(jd.id);

      dispatch(
        showSnackbar({
          message: "JD deleted successfully!",
          type: "success",
        })
      );

      await fetchJds();
    } catch (error) {
      dispatch(
        showSnackbar({
          message: error.message || "Failed to delete JD",
          type: "error",
        })
      );
    } finally {
      setDeletingId("");
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full">
      {/* Uploader Section - Passes fetchJds so the list updates automatically after upload */}
      <JDUploader onUploadSuccess={fetchJds} />

      {/* JD List Section */}
      <h2 className="text-xl font-bold text-gray-800 mb-4">Active Job Descriptions</h2>
      
      {loading ? (
        <p className="text-gray-500">Loading Job Descriptions...</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {jds.map((jd) => (
            <div key={jd.id} className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md transition">
              
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{jd.title}</h3>
                  <p className="text-gray-600 font-medium">
                    {jd.company} {jd.location && `• ${jd.location}`} {jd.employment_type && `• ${jd.employment_type}`}
                  </p>
                </div>

                {/* PDF Action Buttons */}
                <div className="flex items-center gap-2">
                  {jd.jd_url && (
                    <>
                      <a 
                        href={jd.jd_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs bg-gray-50 text-gray-700 border border-gray-200 px-3 py-1.5 rounded-md hover:bg-gray-100 transition font-medium"
                      >
                        View PDF
                      </a>
                      <a 
                        href={getDownloadUrl(jd.jd_url)} 
                        download={jd.file_name || 'JD.pdf'} 
                        className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-md hover:bg-blue-100 transition font-medium"
                      >
                        Download
                      </a>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteJd(jd)}
                    disabled={deletingId === jd.id}
                    className="text-xs bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-md hover:bg-red-100 transition font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {deletingId === jd.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>

              {/* Experience & Summary */}
              <div className="mb-4 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <p><span className="font-semibold">Experience Required:</span> {jd.min_experience_years} {jd.max_experience_years ? `- ${jd.max_experience_years}` : '+'} Years</p>
                {jd.description_summary && (
                  <p className="mt-2 text-gray-600">{jd.description_summary}</p>
                )}
              </div>
              
              {/* Required Skills Tags */}
              <div className="flex flex-wrap gap-2">
                {jd.required_skills?.map(skill => (
                  <span 
                    key={skill} 
                    className="text-xs px-3 py-1.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>

            </div>
          ))}

          {jds.length === 0 && (
            <div className="text-center p-10 bg-white rounded-xl border border-gray-200">
              <p className="text-gray-500">No Job Descriptions found. Upload one above!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
