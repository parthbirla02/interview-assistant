import React, { useEffect, useState, useRef } from 'react';
import { resumeApi, authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSkeleton from '../components/LoadingSkeleton';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  GraduationCap,
  Sparkles,
  Plus,
  X,
  Save,
  Tag,
  Award,
} from 'lucide-react';

const ResumeUploadPage = () => {
  const { user, updateUserProfile } = useAuth();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [skills, setSkills] = useState([]);
  const [targetRole, setTargetRole] = useState(user?.targetRole || 'Fullstack Software Engineer');
  const [experienceLevel, setExperienceLevel] = useState(user?.experienceLevel || 'Mid-Level (2-5 yrs)');
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchResume();
  }, []);

  const fetchResume = async () => {
    try {
      setLoading(true);
      const res = await resumeApi.getResume();
      if (res.data.resume) {
        setResume(res.data.resume);
        setSkills(res.data.resume.extractedSkills || []);
      } else if (user?.targetSkills) {
        setSkills(user.targetSkills);
      }
    } catch (err) {
      console.error('Failed to load resume:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    const allowed = ['.pdf', '.docx', '.doc', '.txt'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowed.includes(ext)) {
      setError('Please select a valid PDF, DOCX, or TXT file');
      return;
    }

    try {
      setError('');
      setSuccessMsg('');
      setUploading(true);

      const formData = new FormData();
      formData.append('resume', file);

      const res = await resumeApi.upload(formData);
      setResume(res.data.resume);
      setSkills(res.data.resume.extractedSkills || []);
      setSuccessMsg('Resume parsed and skills extracted successfully with AI!');
      updateUserProfile({ targetSkills: res.data.resume.extractedSkills });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload and parse resume');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    if (!skills.includes(newSkill.trim())) {
      const updated = [...skills, newSkill.trim()];
      setSkills(updated);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSaveProfile = async () => {
    try {
      setError('');
      setSuccessMsg('');
      await resumeApi.updateSkills(skills);
      await authApi.updateProfile({
        targetRole,
        experienceLevel,
        targetSkills: skills,
      });
      updateUserProfile({ targetRole, experienceLevel, targetSkills: skills });
      setSuccessMsg('Candidate profile and skills updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save changes');
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <LoadingSkeleton count={3} height="h-36" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Automated Skill Extraction</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Resume & Profile Intelligence</h1>
        <p className="text-sm text-slate-400 mt-1">
          Upload your resume to extract key technical skills, experience metrics, and tailor your mock interview questions.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-400 text-xs">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-400 text-xs">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Upload Dropzone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="relative group cursor-pointer p-8 sm:p-12 rounded-3xl bg-surface-card/60 border-2 border-dashed border-surface-border hover:border-indigo-500/60 hover:bg-surface-card transition-all text-center"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
          accept=".pdf,.docx,.doc,.txt"
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-600/20 transition-all">
            {uploading ? (
              <span className="w-8 h-8 border-3 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
            ) : (
              <UploadCloud className="w-8 h-8" />
            )}
          </div>

          <div>
            <p className="text-base font-bold text-white">
              {uploading ? 'Parsing Resume with AI...' : 'Drag and drop your resume here, or browse files'}
            </p>
            <p className="text-xs text-slate-400 mt-1">Supports PDF, DOCX, DOC, or TXT up to 10MB</p>
          </div>

          {resume && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-surface-border text-xs text-slate-300">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Current file: <strong>{resume.fileName}</strong></span>
              <span className="text-[10px] text-slate-500">
                ({new Date(resume.uploadedAt).toLocaleDateString()})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Extracted Skills & Customizer */}
      <div className="p-6 sm:p-8 rounded-2xl bg-surface-card border border-surface-border space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-border">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Tag className="w-5 h-5 text-indigo-400" />
              <span>Extracted & Target Skills</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              These skills will be used to generate personalized technical questions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
              placeholder="Add skill (e.g. GraphQL)"
              className="px-3 py-1.5 rounded-lg bg-surface border border-surface-border text-xs text-white placeholder-slate-500 focus:border-indigo-500"
            />
            <button
              onClick={handleAddSkill}
              type="button"
              className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Skill Badges */}
        <div className="flex flex-wrap gap-2.5">
          {skills.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No skills listed yet. Upload a resume or add manually.</p>
          ) : (
            skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-semibold group hover:border-indigo-500/40 transition-all"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="p-0.5 text-indigo-400 hover:text-rose-400 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))
          )}
        </div>

        {/* Target Profile Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-surface-border">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Target Interview Role
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-surface border border-surface-border text-xs text-white focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Experience Level
            </label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-surface border border-surface-border text-xs text-white focus:border-indigo-500"
            >
              <option value="Junior (0-2 yrs)">Junior (0-2 yrs)</option>
              <option value="Mid-Level (2-5 yrs)">Mid-Level (2-5 yrs)</option>
              <option value="Senior (5-8 yrs)">Senior (5-8 yrs)</option>
              <option value="Lead / Principal (8+ yrs)">Lead / Principal (8+ yrs)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSaveProfile}
            type="button"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile & Skills</span>
          </button>
        </div>
      </div>

      {/* Extracted Past Roles & Details */}
      {resume && resume.pastRoles && resume.pastRoles.length > 0 && (
        <div className="p-6 sm:p-8 rounded-2xl bg-surface-card border border-surface-border space-y-6 shadow-xl">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-cyan-400" />
            <span>Parsed Career History</span>
          </h3>

          <div className="space-y-4">
            {resume.pastRoles.map((role, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-surface/70 border border-surface-border space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                  <h4 className="font-semibold text-sm text-white">{role.title}</h4>
                  <span className="text-xs text-indigo-400 font-medium">{role.company} • {role.duration}</span>
                </div>
                {role.highlights && role.highlights.length > 0 && (
                  <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 pl-1">
                    {role.highlights.map((point, pIdx) => (
                      <li key={pIdx}>{point}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeUploadPage;
