import { useState, useEffect } from "react";
import { supabase } from "../main/supabase";

export default function Candidates() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState(''); 
  const [skillsInput, setSkillsInput] = useState(''); 
  const [minExperience, setMinExperience] = useState('');

  const fetchResumes = async () => {
    setLoading(true);
    let query = supabase.from('resumes').select('*');
    
    // 1. Text Search
    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%,current_company.ilike.%${searchTerm}%`);
    }

    // 2. Skill Overlap
    const requiredSkillsArray = skillsInput 
      ? skillsInput.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
      : [];

    if (requiredSkillsArray.length > 0) {
      query = query.overlaps('skills', requiredSkillsArray); 
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching resumes:", error.message);
      setLoading(false);
      return;
    }

    // --- SCORING ALGORITHM ---
    const scoredResumes = (data || []).map(resume => {
      let skillMatchScore = 100;
      let matchedSkills = [];
      let missingSkills = []; 

      const candidateSkillsLower = (resume.skills || []).map(s => s.toLowerCase());

      if (requiredSkillsArray.length > 0) {
        matchedSkills = requiredSkillsArray.filter(reqSkill => 
          candidateSkillsLower.includes(reqSkill)
        );
        missingSkills = requiredSkillsArray.filter(reqSkill => 
          !candidateSkillsLower.includes(reqSkill)
        );
        skillMatchScore = Math.round((matchedSkills.length / requiredSkillsArray.length) * 100);
      }

      let experienceScore = 100;
      const minExpNum = Number(minExperience);
      if (minExpNum > 0) {
        experienceScore = resume.total_years_experience >= minExpNum
          ? 100
          : Math.round((resume.total_years_experience / minExpNum) * 100);
      }

      // Weight: 70% Skills, 30% Experience
      const overallScore = Math.round((skillMatchScore * 0.7) + (experienceScore * 0.3));

      return {
        ...resume,
        skillMatchScore,
        experienceScore,
        overallScore,
        matchedSkills,
        missingSkills 
      };
    });

    // Sort from highest score to lowest
    scoredResumes.sort((a, b) => b.overallScore - a.overallScore);
    
    setResumes(scoredResumes);
    setLoading(false);
  };

  // Load all candidates initially
  useEffect(() => {
    fetchResumes();
  }, []);

  const getScoreColor = (score) => {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 50) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  // Helper function to convert a standard Cloudinary URL into a forced-download URL
  const getDownloadUrl = (url) => {
    if (!url) return "#";
    // Cloudinary uses the 'fl_attachment' flag to force the browser to download the file
    return url.replace('/upload/', '/upload/fl_attachment/');
  };

  return (
    <div className="max-w-6xl mx-auto w-full">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Filter & Score Candidates</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input 
            type="text" 
            placeholder="Search name or company..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
          <input 
            type="text" 
            placeholder="Required Skills (comma separated)" 
            value={skillsInput}
            onChange={(e) => setSkillsInput(e.target.value)}
            className="border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
          <input 
            type="number" 
            placeholder="Min Years Experience" 
            value={minExperience}
            onChange={(e) => setMinExperience(e.target.value)}
            className="border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
        </div>
        
        <button 
          onClick={fetchResumes}
          className="bg-gray-900 text-white px-5 py-2.5 rounded-lg hover:bg-gray-800 transition shadow-sm font-medium"
        >
          {loading ? 'Analyzing...' : 'Run Scoring Engine'}
        </button>
      </div>

      {/* Candidate List */}
      <div className="space-y-4">
        {resumes.map((resume) => (
          <div key={resume.id} className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-start hover:shadow-md transition">
            
            <div className="flex-1">
              
              {/* Header Row: Name + Buttons */}
              <div className="flex items-center gap-4 mb-2">
                <h3 className="text-xl font-bold text-gray-900">{resume.name}</h3>
                
                {resume.resume_url && (
                  <div className="flex items-center gap-2">
                    {/* View Button */}
                    <a 
                      href={resume.resume_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs bg-gray-50 text-gray-700 border border-gray-200 px-3 py-1.5 rounded-md hover:bg-gray-100 transition font-medium"
                    >
                      View PDF
                    </a>
                    
                    {/* Download Button */}
                    <a 
                      href={getDownloadUrl(resume.resume_url)} 
                      // The 'download' attribute is standard HTML, but Cloudinary's URL flag ensures it works across all browsers
                      download={resume.file_name || 'resume.pdf'} 
                      className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-md hover:bg-blue-100 transition font-medium"
                    >
                      Download
                    </a>
                  </div>
                )}
              </div>

              <p className="text-gray-600 mb-4 font-medium">{resume.current_company} • {resume.total_years_experience} YOE</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {resume.skills?.map(skill => {
                  const isMatched = resume.matchedSkills?.includes(skill.toLowerCase());
                  return (
                    <span 
                      key={skill} 
                      className={`text-sm px-3 py-1 rounded-full ${isMatched ? 'bg-blue-100 text-blue-800 font-semibold' : 'bg-gray-100 text-gray-600'}`}
                    >
                      {skill}
                    </span>
                  );
                })}
              </div>

              {resume.missingSkills?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Missing Requirements</p>
                  <div className="flex flex-wrap gap-2">
                    {resume.missingSkills.map(missingSkill => (
                      <span 
                        key={missingSkill} 
                        className="text-xs px-2 py-1 rounded-md bg-red-50 text-red-600 border border-red-100"
                      >
                        {missingSkill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className={`mt-4 md:mt-0 md:ml-6 px-5 py-3 rounded-xl font-bold text-xl text-center shrink-0 ${getScoreColor(resume.overallScore)}`}>
              {resume.overallScore}% Match
              <div className="text-xs font-medium mt-1 opacity-80">
                Skills: {resume.skillMatchScore}% • Exp: {resume.experienceScore}%
              </div>
            </div>

          </div>
        ))}
        
        {resumes.length === 0 && !loading && (
          <div className="text-center p-10 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500 text-lg">No candidates found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}