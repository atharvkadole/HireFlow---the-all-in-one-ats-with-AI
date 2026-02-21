// import { useState } from "react";
// import { useDispatch, useSelector } from "react-redux"; // <-- Import useSelector
// import { showSnackbar } from "../slice/uiSlice";
// import sendJdPdf from "../finctions/uploadjd"; 

// export default function JDUploader({ onUploadSuccess }) {
//   const [uploading, setUploading] = useState(false);
//   const [fileError, setFileError] = useState("");
  
//   const dispatch = useDispatch();
//   const user = useSelector((state) => state.auth.user); // <-- Get the logged-in user

//   const handleUpload = async (file) => {
//     setFileError("");
//     if (!file) return;
//     if (file.type !== "application/pdf") {
//       setFileError("Please upload a PDF file");
//       dispatch(
//         showSnackbar({ message: "Please upload a PDF file", type: "error" })
//       );
//       return;
//     }

//     try {
//       setUploading(true);
//       dispatch(
//         showSnackbar({ message: "Uploading Job Description...", type: "info" })
//       );

//       // <-- Pass the user.id as the second argument
//       await sendJdPdf(file, user?.id); 
      
//       setFileError("");

//       dispatch(
//         showSnackbar({ message: "JD uploaded & parsed successfully!", type: "success" })
//       );
      
//       if (onUploadSuccess) onUploadSuccess();

//     } catch (err) {
//       setFileError(err.message || "Upload failed");
//       dispatch(
//         showSnackbar({ message: err.message || "Upload failed", type: "error" })
//       );
//     } finally {
//       setUploading(false);
//     }
//   };

//   return (
//     <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
//       <h3 className="text-lg font-semibold mb-4 text-gray-800">
//         Upload New Job Description
//       </h3>

//       <input
//         type="file"
//         accept="application/pdf"
//         disabled={uploading}
//         className="file-input file-input-bordered w-full max-w-xl"
//         onChange={(e) => {
//           const file = e.target.files?.[0];
//           handleUpload(file);
//           e.target.value = "";
//         }}
//       />
//       {fileError && (
//         <p className="mt-2 text-sm text-red-500">{fileError}</p>
//       )}
//     </div>
//   );
// }

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { showSnackbar } from "../slice/uiSlice";
import sendJdPdf from "../finctions/uploadjd"; 

export default function JDUploader({ onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [fileError, setFileError] = useState("");
  
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user); 

  const handleUpload = async (file) => {
    setFileError("");
    if (!file) return;
    if (file.type !== "application/pdf") {
      setFileError("Please upload a PDF file");
      dispatch(showSnackbar({ message: "Please upload a PDF file", type: "error" }));
      return;
    }

    try {
      setUploading(true);
      dispatch(showSnackbar({ message: "Uploading Job Description...", type: "info" }));

      await sendJdPdf(file, user?.id); 
      setFileError("");

      dispatch(showSnackbar({ message: "JD uploaded & parsed successfully!", type: "success" }));
      
      if (onUploadSuccess) onUploadSuccess();

    } catch (err) {
      setFileError(err.message || "Upload failed");
      dispatch(showSnackbar({ message: err.message || "Upload failed", type: "error" }));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 h-full flex flex-col justify-center">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-800">Upload Job Description</h3>
        <p className="text-sm text-gray-500">Add a new JD to start matching candidates instantly.</p>
      </div>

      <input
        type="file"
        accept="application/pdf"
        disabled={uploading}
        className="file-input file-input-bordered w-full"
        onChange={(e) => {
          const file = e.target.files?.[0];
          handleUpload(file);
          e.target.value = "";
        }}
      />
      {fileError && <p className="mt-2 text-sm text-red-500 font-medium">{fileError}</p>}
    </div>
  );
}