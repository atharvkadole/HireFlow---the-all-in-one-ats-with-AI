import { useState, useEffect } from "react";
import { supabase } from "../main/supabase";
import { 
  HiOutlineUsers, 
  HiOutlineDocumentText, 
  HiOutlineChartBar,
  HiOutlineTag
} from "react-icons/hi";

export default function Analytics() {
  const [stats, setStats] = useState({
    totalCandidates: 0,
    totalJDs: 0,
    avgExperience: 0,
    uniqueSkills: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    
    // 1. Fetch Resumes for total count, experience, and skills
    const { data: resumes, error: resumeError } = await supabase
      .from("resumes")
      .select("total_years_experience, skills");

    // 2. Fetch Job Descriptions for total count
    const { count: jdCount, error: jdError } = await supabase
      .from("job_descriptions")
      .select("*", { count: "exact", head: true });

    if (!resumeError && resumes) {
      const totalCandidates = resumes.length;
      
      // Calculate average experience
      const totalExp = resumes.reduce((sum, resume) => sum + (Number(resume.total_years_experience) || 0), 0);
      const avgExperience = totalCandidates > 0 ? (totalExp / totalCandidates).toFixed(1) : 0;

      // Calculate Total Unique Skills mapped across all resumes
      const allSkills = resumes.flatMap(resume => resume.skills || []);
      const uniqueSkillsCount = new Set(allSkills.map(skill => skill.toLowerCase())).size;

      setStats({
        totalCandidates,
        totalJDs: jdCount || 0,
        avgExperience,
        uniqueSkills: uniqueSkillsCount,
      });
    } else {
      console.error("Error fetching analytics:", resumeError || jdError);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white h-24 rounded-xl shadow-sm border border-gray-100 animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      
      {/* Stat Card 1: Total Candidates */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition duration-200">
        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <HiOutlineUsers size={24} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Total Candidates</p>
          <h3 className="text-2xl font-bold text-gray-900">{stats.totalCandidates}</h3>
        </div>
      </div>

      {/* Stat Card 2: Active JDs */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition duration-200">
        <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
          <HiOutlineDocumentText size={24} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Active JDs</p>
          <h3 className="text-2xl font-bold text-gray-900">{stats.totalJDs}</h3>
        </div>
      </div>

      {/* Stat Card 3: Avg Experience */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition duration-200">
        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <HiOutlineChartBar size={24} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Avg Experience</p>
          <h3 className="text-2xl font-bold text-gray-900">{stats.avgExperience} <span className="text-base font-normal text-gray-500">yrs</span></h3>
        </div>
      </div>

      {/* Stat Card 4: Unique Skills (NEW) */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition duration-200">
        <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
          <HiOutlineTag size={24} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Skills Tracked</p>
          <h3 className="text-2xl font-bold text-gray-900">{stats.uniqueSkills}</h3>
        </div>
      </div>

    </div>
  );
}