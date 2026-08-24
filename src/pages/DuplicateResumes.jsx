import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { supabase } from "../main/supabase";
import { fetchSupabasePages } from "../main/supabasePagination";
import { showSnackbar } from "../slice/uiSlice";
import deleteResume from "../finctions/deleteresume";

const normalizeName = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

const getResumeTimestamp = (resume) => {
  const timestamp = new Date(resume.created_at || 0).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const formatResumeDate = (value) => {
  if (!value) return "Unknown date";

  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return "Unknown date";

  return new Date(timestamp).toLocaleDateString();
};

const buildDuplicateGroups = (allResumes) => {
  const groupsByName = new Map();

  allResumes.forEach((resume) => {
    const normalizedName = normalizeName(resume.name);
    if (!normalizedName) return;

    const currentGroup = groupsByName.get(normalizedName) || {
      key: `name:${normalizedName}`,
      label: `Same candidate name: ${normalizedName}`,
      resumes: [],
    };

    currentGroup.resumes.push(resume);
    groupsByName.set(normalizedName, currentGroup);
  });

  return Array.from(groupsByName.values())
    .map((group) => {
      const sortedResumes = [...group.resumes].sort(
        (a, b) => getResumeTimestamp(b) - getResumeTimestamp(a)
      );

      return {
        ...group,
        resumes: sortedResumes,
        duplicateCopies: sortedResumes.slice(1),
      };
    })
    .filter((group) => group.resumes.length > 1)
    .sort(
      (a, b) =>
        b.duplicateCopies.length - a.duplicateCopies.length ||
        a.label.localeCompare(b.label)
    );
};

export default function DuplicateResumes() {
  const [duplicateGroups, setDuplicateGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [bulkDeletingDuplicates, setBulkDeletingDuplicates] = useState(false);
  const dispatch = useDispatch();

  const fetchDuplicateResumes = useCallback(async () => {
    setLoading(true);

    try {
      const allResumes = await fetchSupabasePages((from, to) =>
        supabase
          .from("resumes")
          .select("*")
          .order("created_at", { ascending: false })
          .range(from, to)
      );

      setDuplicateGroups(buildDuplicateGroups(allResumes));
    } catch (error) {
      console.error("Error fetching duplicate resumes:", error.message);
      setDuplicateGroups([]);
      dispatch(
        showSnackbar({
          message: error.message || "Failed to load duplicate resumes",
          type: "error",
        })
      );
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchDuplicateResumes();
  }, [fetchDuplicateResumes]);

  const handleDeleteResume = async (resume) => {
    const confirmed = window.confirm(
      `Delete ${resume.name || "this resume"}? This will remove the resume record and its PDF.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(resume.id);
      dispatch(
        showSnackbar({
          message: "Deleting resume...",
          type: "info",
        })
      );

      await deleteResume(resume.id);

      dispatch(
        showSnackbar({
          message: "Resume deleted successfully!",
          type: "success",
        })
      );

      await fetchDuplicateResumes();
    } catch (error) {
      dispatch(
        showSnackbar({
          message: error.message || "Failed to delete resume",
          type: "error",
        })
      );
    } finally {
      setDeletingId("");
    }
  };

  const handleBulkDeleteDuplicateCopies = async () => {
    const duplicateCopies = duplicateGroups.flatMap(
      (group) => group.duplicateCopies
    );

    if (duplicateCopies.length === 0) {
      return;
    }

    const confirmed = window.confirm(
      `Delete ${duplicateCopies.length} duplicate resume copies? The newest resume in each duplicate name group will be kept.`
    );

    if (!confirmed) {
      return;
    }

    let deletedCount = 0;

    try {
      setBulkDeletingDuplicates(true);
      dispatch(
        showSnackbar({
          message: "Deleting duplicate resume copies...",
          type: "info",
        })
      );

      for (const resume of duplicateCopies) {
        await deleteResume(resume.id);
        deletedCount += 1;
      }

      dispatch(
        showSnackbar({
          message: `${deletedCount} duplicate resume copies deleted`,
          type: "success",
        })
      );

      await fetchDuplicateResumes();
    } catch (error) {
      dispatch(
        showSnackbar({
          message:
            error.message ||
            `Failed after deleting ${deletedCount} duplicate resume copies`,
          type: "error",
        })
      );
    } finally {
      setBulkDeletingDuplicates(false);
    }
  };

  const duplicateCopyCount = duplicateGroups.reduce(
    (total, group) => total + group.duplicateCopies.length,
    0
  );

  return (
    <div className="max-w-6xl mx-auto w-full">
      <div className="bg-white border border-orange-200 p-6 rounded-xl shadow-sm mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Duplicate Resumes
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Matches are based only on candidate name, ignoring uppercase and lowercase differences.
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {loading
                ? "Checking all resumes..."
                : `${duplicateGroups.length} duplicate groups found. ${duplicateCopyCount} extra copies can be deleted while keeping the newest resume in each group.`}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={fetchDuplicateResumes}
              disabled={loading || bulkDeletingDuplicates}
              className="bg-white text-gray-800 border border-gray-300 px-5 py-2.5 rounded-lg hover:bg-gray-50 transition shadow-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
            <button
              type="button"
              onClick={handleBulkDeleteDuplicateCopies}
              disabled={
                loading || bulkDeletingDuplicates || duplicateCopyCount === 0
              }
              className="bg-red-600 text-white px-5 py-2.5 rounded-lg hover:bg-red-700 transition shadow-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {bulkDeletingDuplicates
                ? "Deleting Extra Copies..."
                : `Delete ${duplicateCopyCount} Extra Copies`}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {duplicateGroups.map((group) => (
          <div
            key={group.key}
            className="bg-white border border-orange-100 rounded-xl shadow-sm p-5"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
              <p className="text-sm font-semibold text-orange-900">
                {group.label}
              </p>
              <span className="text-xs bg-orange-50 text-orange-700 border border-orange-200 px-2.5 py-1 rounded-md font-medium w-fit">
                {group.resumes.length} records
              </span>
            </div>

            <div className="divide-y divide-gray-100">
              {group.resumes.map((resume, index) => (
                <div
                  key={resume.id}
                  className="py-4 first:pt-2 last:pb-0 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-gray-900">
                        {resume.name || "Unnamed candidate"}
                      </p>
                      {index === 0 && (
                        <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md font-semibold">
                          Keep newest
                        </span>
                      )}
                      {resume.interview_taken && (
                        <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md font-semibold">
                          Interviewed
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {resume.current_company || "No company"} - Uploaded {formatResumeDate(resume.created_at)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {resume.file_name || "No file name"}
                      {resume.phone ? ` - ${resume.phone}` : ""}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {resume.resume_url && (
                      <a
                        href={resume.resume_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-white text-gray-700 border border-gray-200 px-3 py-1.5 rounded-md hover:bg-gray-100 transition font-medium"
                      >
                        View PDF
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteResume(resume)}
                      disabled={
                        deletingId === resume.id || bulkDeletingDuplicates
                      }
                      className="text-xs bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-md hover:bg-red-100 transition font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {deletingId === resume.id
                        ? "Deleting..."
                        : "Delete This Copy"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {!loading && duplicateGroups.length === 0 && (
          <div className="text-center p-10 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500 text-lg">
              No duplicate resumes found by candidate name.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
