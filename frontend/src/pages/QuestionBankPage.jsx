import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { questionApi, interviewApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSkeleton from '../components/LoadingSkeleton';
import Modal from '../components/Modal';
import {
  HelpCircle,
  Sparkles,
  Plus,
  Video,
  Trash2,
  ChevronDown,
  ChevronUp,
  Tag,
  Lightbulb,
  CheckCircle,
  Layers,
  BookOpen,
} from 'lucide-react';

const QuestionBankPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [questionSets, setQuestionSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [expandedSetId, setExpandedSetId] = useState(null);

  // Generator form state
  const [formState, setFormState] = useState({
    title: '',
    role: user?.targetRole || 'Fullstack Software Engineer',
    difficulty: 'Mid-Level',
    count: 5,
    categories: ['DSA', 'System Design', 'Role-Specific Technical', 'Behavioral / HR'],
  });

  useEffect(() => {
    fetchQuestionSets();
  }, []);

  const fetchQuestionSets = async () => {
    try {
      setLoading(true);
      const res = await questionApi.getAll();
      setQuestionSets(res.data.questionSets || []);
      if (res.data.questionSets && res.data.questionSets.length > 0) {
        setExpandedSetId(res.data.questionSets[0]._id);
      }
    } catch (err) {
      console.error('Failed to load question sets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      setGenerating(true);
      const res = await questionApi.generate({
        ...formState,
        title: formState.title || `${formState.role} (${formState.difficulty}) Question Set`,
      });
      setIsModalOpen(false);
      await fetchQuestionSets();
      setExpandedSetId(res.data.questionSet._id);
    } catch (err) {
      console.error('Question generation failed:', err);
      alert('Failed to generate question set. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleStartInterview = async (questionSetId) => {
    try {
      const res = await interviewApi.start({ questionSetId });
      navigate(`/interview/${res.data.session._id}`);
    } catch (err) {
      console.error('Failed to start interview:', err);
      alert('Error launching interview session.');
    }
  };

  const handleDeleteSet = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this question set?')) return;
    try {
      await questionApi.delete(id);
      setQuestionSets(questionSets.filter((q) => q._id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const toggleCategory = (cat) => {
    setFormState((prev) => {
      const exists = prev.categories.includes(cat);
      if (exists && prev.categories.length === 1) return prev; // keep at least 1
      return {
        ...prev,
        categories: exists
          ? prev.categories.filter((c) => c !== cat)
          : [...prev.categories, cat],
      };
    });
  };

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <LoadingSkeleton count={3} height="h-40" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>AI Question Generator</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Question Banks & Practice Sets</h1>
          <p className="text-sm text-slate-400 mt-1">
            Generate customized technical, architectural, and behavioral question sets.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-sm font-semibold shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Generate New Question Set</span>
        </button>
      </div>

      {/* Question Set List */}
      <div className="space-y-4">
        {questionSets.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-surface-card border border-surface-border">
            <HelpCircle className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No Question Sets Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Click the generate button above to create a question set tailored to your resume and target role.
            </p>
          </div>
        ) : (
          questionSets.map((qSet) => {
            const isExpanded = expandedSetId === qSet._id;
            return (
              <div
                key={qSet._id}
                className="rounded-2xl bg-surface-card border border-surface-border overflow-hidden transition-all shadow-lg hover:border-indigo-500/30"
              >
                {/* Set Header */}
                <div
                  onClick={() => setExpandedSetId(isExpanded ? null : qSet._id)}
                  className="p-5 sm:p-6 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface/50 hover:bg-surface/80 transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-base font-bold text-white">{qSet.title}</h3>
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {qSet.difficulty}
                      </span>
                      {qSet.isPreset && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                          Curated Preset
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>{qSet.role}</span>
                      <span>•</span>
                      <span>{qSet.questions?.length || 0} Questions</span>
                      <span>•</span>
                      <span>
                        Created {new Date(qSet.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartInterview(qSet._id);
                      }}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 flex items-center gap-1.5 transition-all"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Start Mock Session</span>
                    </button>

                    {!qSet.isPreset && (
                      <button
                        onClick={(e) => handleDeleteSet(qSet._id, e)}
                        title="Delete Question Set"
                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <div className="p-1 text-slate-400">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Questions Breakdown (when expanded) */}
                {isExpanded && (
                  <div className="p-5 sm:p-6 border-t border-surface-border space-y-4 bg-surface/30">
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        Question Plan ({qSet.questions?.length} Prompts)
                      </span>
                    </div>

                    <div className="space-y-4">
                      {qSet.questions?.map((q, idx) => (
                        <div
                          key={q.id || idx}
                          className="p-4 rounded-xl bg-surface/80 border border-surface-border space-y-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="w-6 h-6 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-bold text-xs flex items-center justify-center">
                                  {idx + 1}
                                </span>
                                <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wide">
                                  {q.category}
                                </span>
                                <span className="text-[10px] text-slate-400 px-2 py-0.5 rounded bg-surface border border-surface-border">
                                  {q.difficulty}
                                </span>
                              </div>
                              <p className="text-sm text-slate-100 font-medium pt-1 leading-relaxed">{q.text}</p>
                            </div>
                          </div>

                          {q.hint && (
                            <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 text-xs text-amber-200/90 flex items-start gap-2">
                              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                              <div>
                                <strong className="font-semibold text-amber-300">Hint: </strong>
                                {q.hint}
                              </div>
                            </div>
                          )}

                          {q.expectedPoints && q.expectedPoints.length > 0 && (
                            <div className="pt-2">
                              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Key Evaluation Points</span>
                              </p>
                              <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 pl-1">
                                {q.expectedPoints.map((point, pIdx) => (
                                  <li key={pIdx}>{point}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Generator Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Generate AI Question Set">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Set Title (Optional)
            </label>
            <input
              type="text"
              value={formState.title}
              onChange={(e) => setFormState({ ...formState, title: e.target.value })}
              placeholder="e.g. Senior Frontend React & Next.js Onsite"
              className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-xs text-white placeholder-slate-500 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Target Role
              </label>
              <input
                type="text"
                required
                value={formState.role}
                onChange={(e) => setFormState({ ...formState, role: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-xs text-white focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Difficulty Tier
              </label>
              <select
                value={formState.difficulty}
                onChange={(e) => setFormState({ ...formState, difficulty: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-xs text-white focus:border-indigo-500"
              >
                <option value="Junior">Junior (0-2 yrs)</option>
                <option value="Mid-Level">Mid-Level (2-5 yrs)</option>
                <option value="Senior">Senior (5-8 yrs)</option>
                <option value="Lead">Lead / Principal (8+ yrs)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Include Categories
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['DSA', 'System Design', 'Role-Specific Technical', 'Behavioral / HR'].map((cat) => {
                const selected = formState.categories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`p-2 rounded-xl text-xs font-medium text-left border transition-all ${
                      selected
                        ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300'
                        : 'bg-surface border-surface-border text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-surface-border">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-surface hover:bg-slate-800 border border-surface-border text-xs font-semibold text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={generating}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 flex items-center gap-2 disabled:opacity-50"
            >
              {generating ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate with AI</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default QuestionBankPage;
