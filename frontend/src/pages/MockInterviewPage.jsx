import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AudioVisualizer from '../components/AudioVisualizer';
import LoadingSkeleton from '../components/LoadingSkeleton';
import Modal from '../components/Modal';
import {
  Bot,
  User,
  Mic,
  MicOff,
  Send,
  ArrowRight,
  Sparkles,
  Clock,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Award,
  Video,
  Volume2,
  VolumeX,
  Play,
  Square,
  ChevronRight,
  ShieldCheck,
  Radio,
  Zap,
} from 'lucide-react';

const MockInterviewPage = () => {
  const { sessionId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [questionSet, setQuestionSet] = useState(null);
  const [messages, setMessages] = useState([]);
  const [candidateInput, setCandidateInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [ending, setEnding] = useState(false);
  const [isConcludingModalOpen, setIsConcludingModalOpen] = useState(false);
  const [isInterviewerSpeaking, setIsInterviewerSpeaking] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const [liveTranscribingText, setLiveTranscribingText] = useState('');
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const messagesEndRef = useRef(null);
  const speechRecognitionRef = useRef(null);
  const speechUtteranceRef = useRef(null);
  const isRecordingIntentRef = useRef(false);
  const baseInputRef = useRef('');

  // Helper to speak text aloud using Browser Text-to-Speech (Web Speech API)
  const speakText = (text) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech Synthesis not supported by browser');
      return;
    }

    window.speechSynthesis.cancel(); // Stop any active speech

    if (!isVoiceEnabled || !text) {
      setIsInterviewerSpeaking(false);
      return;
    }

    // Clean markdown formatting before speaking
    const cleanText = text
      .replace(/[*_~`#>-]/g, '')
      .replace(/\n+/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';

    // Pick natural English voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Daniel') || v.name.includes('Alex'))
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onstart = () => {
      setIsInterviewerSpeaking(true);
    };

    utterance.onend = () => {
      setIsInterviewerSpeaking(false);
    };

    utterance.onerror = (e) => {
      console.warn('TTS error:', e);
      setIsInterviewerSpeaking(false);
    };

    speechUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsInterviewerSpeaking(false);
  };

  // Initialize or restore session
  useEffect(() => {
    const initSession = async () => {
      try {
        setLoading(true);
        if (sessionId && sessionId !== 'new') {
          const res = await interviewApi.getSession(sessionId);
          setSession(res.data.session);
          setQuestionSet(res.data.session.questionSetId);
          const msgs = res.data.session.messages || [];
          setMessages(msgs);

          // Speak initial greeting if newly loaded
          if (msgs.length > 0 && msgs[msgs.length - 1].role === 'interviewer') {
            setTimeout(() => speakText(msgs[msgs.length - 1].content), 600);
          }
        } else {
          // Start a new session
          const startRes = await interviewApi.start({
            role: user?.targetRole || 'Fullstack Software Engineer',
            difficulty: user?.experienceLevel?.includes('Senior') ? 'Senior' : 'Mid-Level',
          });
          setSession(startRes.data.session);
          setQuestionSet(startRes.data.questionSet);
          const msgs = startRes.data.session.messages || [];
          setMessages(msgs);
          navigate(`/interview/${startRes.data.session._id}`, { replace: true });

          // Speak first question
          if (msgs.length > 0 && msgs[0].role === 'interviewer') {
            setTimeout(() => speakText(msgs[0].content), 600);
          }
        }
      } catch (err) {
        console.error('Session initialization failed:', err);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, [sessionId]);

  // Session timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll chat transcript
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  // Robust Speech-to-Text Setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsRecording(true);
        setSpeechError('');
        setLiveTranscribingText('Listening to your voice...');
      };

      recognition.onresult = (event) => {
        let interimText = '';
        let finalText = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalText += trans + ' ';
          } else {
            interimText += trans;
          }
        }

        if (finalText) {
          baseInputRef.current = (baseInputRef.current ? baseInputRef.current + ' ' : '') + finalText.trim();
          setCandidateInput(baseInputRef.current);
          setLiveTranscribingText(`Transcribed: "${finalText.trim()}"`);
        } else if (interimText) {
          setLiveTranscribingText(`Transcribing: "${interimText}"`);
          setCandidateInput(
            baseInputRef.current
              ? `${baseInputRef.current} ${interimText}`
              : interimText
          );
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error event:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setSpeechError('Microphone permission blocked. Please allow microphone access in your browser address bar.');
          setIsRecording(false);
          isRecordingIntentRef.current = false;
        } else if (event.error === 'no-speech') {
          setLiveTranscribingText('No speech detected. Listening...');
        } else {
          setSpeechError(`Speech recognition issue (${event.error}). Try again or type below.`);
          setIsRecording(false);
          isRecordingIntentRef.current = false;
        }
      };

      recognition.onend = () => {
        if (isRecordingIntentRef.current) {
          // Restart recognition if user still has recording active
          try {
            recognition.start();
          } catch (e) {
            setIsRecording(false);
            isRecordingIntentRef.current = false;
          }
        } else {
          setIsRecording(false);
          setLiveTranscribingText('');
        }
      };

      speechRecognitionRef.current = recognition;
    } else {
      setSpeechError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Brave, or type answers manually.');
    }
  }, []);

  const toggleRecording = () => {
    if (!speechRecognitionRef.current) {
      setSpeechError('Speech Recognition is not available in this browser. Please type your response.');
      return;
    }

    if (isRecording) {
      isRecordingIntentRef.current = false;
      try {
        speechRecognitionRef.current.stop();
      } catch (e) {}
      setIsRecording(false);
      setLiveTranscribingText('');
    } else {
      stopSpeaking(); // Stop AI interviewer audio so mic doesn't capture it
      baseInputRef.current = candidateInput.trim();
      isRecordingIntentRef.current = true;
      setSpeechError('');
      try {
        speechRecognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.warn('Recognition start exception:', err);
        try {
          speechRecognitionRef.current.abort();
          speechRecognitionRef.current.start();
          setIsRecording(true);
        } catch (e) {
          setSpeechError('Could not activate microphone. Check browser permissions.');
          setIsRecording(false);
          isRecordingIntentRef.current = false;
        }
      }
    }
  };

  // Quick Voice Simulation Helper (Allows testing immediate voice transcription even without hardware mic)
  const handleSimulateVoiceover = (sampleText) => {
    stopSpeaking();
    setLiveTranscribingText(`Transcribing speech stream: "${sampleText.slice(0, 35)}..."`);
    setIsRecording(true);
    
    setTimeout(() => {
      baseInputRef.current = (candidateInput ? candidateInput + ' ' : '') + sampleText;
      setCandidateInput(baseInputRef.current);
      setIsRecording(false);
      setLiveTranscribingText('Voice transcription complete!');
      setTimeout(() => setLiveTranscribingText(''), 2500);
    }, 600);
  };

  const handleSendMessage = async (isNextQuestion = false) => {
    if ((!candidateInput || !candidateInput.trim()) && !isNextQuestion) return;

    const messageToSend = candidateInput.trim() || 'Proceeding to the next question.';
    const currentSessionId = session?._id;

    // Stop recording if active
    if (isRecording && speechRecognitionRef.current) {
      isRecordingIntentRef.current = false;
      try {
        speechRecognitionRef.current.stop();
      } catch (e) {}
      setIsRecording(false);
      setLiveTranscribingText('');
    }

    // Optimistically append candidate message
    const tempCandidateMsg = {
      role: 'candidate',
      content: messageToSend,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, tempCandidateMsg]);
    setCandidateInput('');
    baseInputRef.current = '';

    try {
      setSending(true);
      const res = await interviewApi.sendMessage(currentSessionId, messageToSend, isNextQuestion);
      setSession(res.data.session);
      const updatedMsgs = res.data.session.messages || [];
      setMessages(updatedMsgs);

      // Play the interviewer's new response aloud
      if (updatedMsgs.length > 0) {
        const lastMsg = updatedMsgs[updatedMsgs.length - 1];
        if (lastMsg.role === 'interviewer') {
          speakText(lastMsg.content);
        }
      }
    } catch (err) {
      console.error('Send message failed:', err);
    } finally {
      setSending(false);
    }
  };

  const handleConcludeInterview = async () => {
    stopSpeaking();
    try {
      setEnding(true);
      const res = await interviewApi.endInterview(session._id);
      setIsConcludingModalOpen(false);
      navigate(`/feedback/${session._id}`);
    } catch (err) {
      console.error('Failed to end interview:', err);
      alert('Error concluding interview.');
    } finally {
      setEnding(false);
    }
  };

  const toggleVoiceAudio = () => {
    if (isVoiceEnabled) {
      stopSpeaking();
      setIsVoiceEnabled(false);
    } else {
      setIsVoiceEnabled(true);
      const lastInterviewerMsg = [...messages].reverse().find((m) => m.role === 'interviewer');
      if (lastInterviewerMsg) {
        speakText(lastInterviewerMsg.content);
      }
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <LoadingSkeleton count={2} height="h-32" />
        <LoadingSkeleton count={1} height="h-96" />
      </div>
    );
  }

  const currentQIndex = session?.currentQuestionIndex || 0;
  const currentQuestions = questionSet?.questions || [];
  const currentQuestion = currentQuestions[currentQIndex] || currentQuestions[0];
  const progressPercent = currentQuestions.length > 0
    ? Math.round(((currentQIndex + 1) / currentQuestions.length) * 100)
    : 20;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-surface-card border border-surface-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-white text-base sm:text-lg">{session?.title || 'AI Technical Interview'}</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live Room
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Role: <strong className="text-slate-200 font-semibold">{session?.role}</strong> • Difficulty: {session?.difficulty}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Voice Audio On/Off Toggle Button */}
          <button
            onClick={toggleVoiceAudio}
            title={isVoiceEnabled ? 'Mute AI Voice' : 'Enable AI Voice Audio'}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isVoiceEnabled
                ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/30'
                : 'bg-surface border-surface-border text-slate-400 hover:text-slate-200'
            }`}
          >
            {isVoiceEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            <span>{isVoiceEnabled ? 'AI Voice ON' : 'AI Voice Muted'}</span>
          </button>

          {/* Timer */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-surface border border-surface-border text-xs text-slate-300 font-mono">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>{formatTimer(elapsedSeconds)}</span>
          </div>

          <button
            onClick={() => setIsConcludingModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
          >
            <Award className="w-3.5 h-3.5" />
            <span>End & Grade</span>
          </button>
        </div>
      </div>

      {/* Main Workspace: Left Question/Interviewer Tile + Right Dialogue transcript */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: AI Interviewer Tile & Current Question (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-6">
          {/* AI Interviewer Avatar Card */}
          <div className="p-6 rounded-3xl bg-surface-card border border-surface-border shadow-2xl space-y-5 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Bot className="w-40 h-40 text-indigo-400" />
            </div>

            <div className="relative mx-auto w-24 h-24 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[3px] shadow-2xl shadow-indigo-600/30">
              <div className="w-full h-full rounded-[14px] bg-surface flex items-center justify-center relative">
                <Bot className="w-12 h-12 text-indigo-400" />
                {isInterviewerSpeaking && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500" />
                  </span>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-base font-bold text-white">AI Principal Interviewer</h3>
              <p className="text-xs text-indigo-400 mt-0.5">Evaluating Systems Knowledge & Problem-Solving</p>
            </div>

            {/* Speaking Audio Wave Visualizer & Playback status */}
            <div className="p-3.5 rounded-2xl bg-surface/80 border border-surface-border space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span className="flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Voice Synthesis Channel</span>
                </span>
                <span className="text-[11px] text-cyan-400 font-semibold">
                  {isInterviewerSpeaking ? 'Speaking Aloud 🔊' : isVoiceEnabled ? 'Voice Ready' : 'Muted'}
                </span>
              </div>
              <AudioVisualizer isActive={isInterviewerSpeaking} color="indigo" barCount={20} />

              {/* Stop / Replay Audio Controls */}
              <div className="flex items-center justify-center gap-2 pt-1">
                {isInterviewerSpeaking ? (
                  <button
                    onClick={stopSpeaking}
                    className="px-3 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-semibold flex items-center gap-1 hover:bg-rose-500/30 transition-colors"
                  >
                    <Square className="w-3 h-3" />
                    <span>Pause Audio</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      const lastInterviewerMsg = [...messages].reverse().find((m) => m.role === 'interviewer');
                      if (lastInterviewerMsg) speakText(lastInterviewerMsg.content);
                    }}
                    className="px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[11px] font-semibold flex items-center gap-1 hover:bg-indigo-500/20 transition-colors"
                  >
                    <Play className="w-3 h-3 text-cyan-400" />
                    <span>Replay Question Voice</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Current Question Focus Card */}
          {currentQuestion && (
            <div className="p-6 rounded-3xl bg-surface-card border border-surface-border shadow-xl space-y-4">
              {/* Progress & Category */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                  <span>
                    Question {currentQIndex + 1} of {currentQuestions.length || 5}
                  </span>
                  <span className="text-cyan-400 font-bold uppercase">{currentQuestion.category}</span>
                </div>
                <div className="w-full bg-surface h-2 rounded-full overflow-hidden border border-surface-border">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Question Text with listen button */}
              <div className="p-4 rounded-2xl bg-surface/90 border border-surface-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                    Target Prompt
                  </span>
                  <button
                    onClick={() => speakText(currentQuestion.text)}
                    title="Speak Question"
                    className="p-1 rounded text-slate-400 hover:text-cyan-400 transition-colors"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm font-medium text-slate-100 leading-relaxed">
                  {currentQuestion.text}
                </p>
              </div>

              {/* Hint Drawer */}
              {currentQuestion.hint && (
                <div>
                  <button
                    type="button"
                    onClick={() => setShowHint(!showHint)}
                    className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold transition-colors"
                  >
                    <Lightbulb className="w-4 h-4" />
                    <span>{showHint ? 'Hide Architectural Hint' : 'Need a Hint?'}</span>
                  </button>

                  {showHint && (
                    <div className="mt-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed animate-fadeIn">
                      {currentQuestion.hint}
                    </div>
                  )}
                </div>
              )}

              {/* Next Question Shortcut */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleSendMessage(true)}
                  disabled={sending}
                  className="w-full py-2.5 px-4 rounded-xl bg-surface hover:bg-slate-800 border border-surface-border text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <span>Ready for Next Question?</span>
                  <ChevronRight className="w-4 h-4 text-indigo-400" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Chat Transcript & Candidate Voice/Text Input (7 cols on lg) */}
        <div className="lg:col-span-7 flex flex-col h-[700px] rounded-3xl bg-surface-card border border-surface-border shadow-2xl overflow-hidden">
          {/* Transcript Header */}
          <div className="p-4 border-b border-surface-border bg-surface/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Live Transcript & Discussion
              </span>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              {messages.length} messages exchanged
            </span>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
            {messages.map((msg, idx) => {
              const isInterviewer = msg.role === 'interviewer';
              return (
                <div
                  key={idx}
                  className={`flex gap-3 max-w-[85%] ${
                    isInterviewer ? 'mr-auto' : 'ml-auto flex-row-reverse'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center font-bold text-xs ${
                      isInterviewer
                        ? 'bg-indigo-600/30 text-indigo-400 border border-indigo-500/30'
                        : 'bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white'
                    }`}
                  >
                    {isInterviewer ? <Bot className="w-4 h-4" /> : user?.name?.charAt(0) || 'C'}
                  </div>

                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isInterviewer
                        ? 'bg-surface/90 border border-surface-border text-slate-200 rounded-tl-sm'
                        : 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/20 rounded-tr-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider ${
                          isInterviewer ? 'text-indigo-400' : 'text-cyan-200'
                        }`}
                      >
                        {isInterviewer ? 'AI Interviewer' : 'Candidate'}
                      </span>
                      <div className="flex items-center gap-2">
                        {isInterviewer && (
                          <button
                            onClick={() => speakText(msg.content)}
                            title="Play Audio Voice"
                            className="text-slate-400 hover:text-cyan-400 transition-colors p-0.5"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <span className="text-[10px] text-slate-400 opacity-70">
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    <p className="whitespace-pre-line">{msg.content}</p>
                  </div>
                </div>
              );
            })}

            {sending && (
              <div className="flex gap-3 max-w-[80%] mr-auto">
                <div className="w-8 h-8 rounded-xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3.5 rounded-2xl rounded-tl-sm bg-surface/90 border border-surface-border flex items-center gap-2 text-xs text-indigo-300">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]" />
                  <span className="ml-1 text-slate-400">Evaluating reasoning and drafting reply...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Candidate Voice/Text Input Box & Voiceover Controls */}
          <div className="p-4 border-t border-surface-border bg-surface/80 space-y-3">
            {/* Live speech transcription status or error banner */}
            {speechError && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{speechError}</span>
              </div>
            )}

            {isRecording && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-xs text-rose-300 animate-pulse">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="font-semibold">{liveTranscribingText || 'Listening to your microphone... Speak clearly.'}</span>
                </div>
                <AudioVisualizer isActive={true} color="rose" barCount={10} />
              </div>
            )}

            {/* Quick Answer Sample Helpers */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs text-slate-400">
              <span className="text-[11px] font-semibold text-indigo-400 shrink-0 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" />
                Quick Voiceover Samples:
              </span>
              <button
                type="button"
                onClick={() =>
                  handleSimulateVoiceover(
                    'The event loop runs on libuv. Microtasks like process.nextTick and resolved Promises drain completely after each synchronous tick before the next macrotask phase.'
                  )
                }
                className="px-2.5 py-1 rounded-lg bg-surface border border-surface-border text-[11px] text-slate-300 hover:text-white hover:border-indigo-500/40 shrink-0 transition-colors"
              >
                Event Loop Answer
              </button>
              <button
                type="button"
                onClick={() =>
                  handleSimulateVoiceover(
                    'For real-time collaboration, I would choose CRDTs like Yjs over OT because CRDTs are commutative, allowing decentralized peer merges without central server lock contention.'
                  )
                }
                className="px-2.5 py-1 rounded-lg bg-surface border border-surface-border text-[11px] text-slate-300 hover:text-white hover:border-indigo-500/40 shrink-0 transition-colors"
              >
                System Design CRDT Answer
              </button>
            </div>

            <div className="relative flex items-end gap-2">
              <textarea
                value={candidateInput}
                onChange={(e) => {
                  setCandidateInput(e.target.value);
                  baseInputRef.current = e.target.value;
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(false);
                  }
                }}
                rows={3}
                placeholder="Click the microphone to speak aloud (Speech-to-Text) or type your answer..."
                className="flex-1 p-3 rounded-2xl bg-surface border border-surface-border focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs sm:text-sm text-white placeholder-slate-500 resize-none transition-colors"
              />

              <div className="flex flex-col gap-2 shrink-0">
                {/* Speech to text mic button */}
                <button
                  type="button"
                  onClick={toggleRecording}
                  title={isRecording ? 'Stop Recording' : 'Start Speech-to-Text Voice Recording'}
                  className={`p-3 rounded-xl border transition-all ${
                    isRecording
                      ? 'bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-500/30 animate-pulse'
                      : 'bg-surface hover:bg-slate-800 text-slate-300 border-surface-border hover:border-indigo-500/40'
                  }`}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-indigo-400" />}
                </button>

                {/* Send Button */}
                <button
                  type="button"
                  onClick={() => handleSendMessage(false)}
                  disabled={sending || !candidateInput.trim()}
                  title="Send Answer"
                  className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 flex items-center justify-center transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conclude Interview Modal */}
      <Modal
        isOpen={isConcludingModalOpen}
        onClose={() => setIsConcludingModalOpen(false)}
        title="Complete Mock Interview"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-300 leading-relaxed">
            Ready to end this mock session? Our AI Evaluator will analyze your entire Q&A transcript against four core rubrics: <strong>Correctness</strong>, <strong>Clarity</strong>, <strong>Structure</strong>, and <strong>Communication (STAR)</strong>.
          </p>

          <div className="p-4 rounded-xl bg-surface/80 border border-surface-border space-y-1.5 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Total Questions Answered:</span>
              <strong className="text-white">{currentQIndex + 1} of {currentQuestions.length}</strong>
            </div>
            <div className="flex justify-between">
              <span>Session Duration:</span>
              <strong className="text-white">{formatTimer(elapsedSeconds)}</strong>
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-surface-border">
            <button
              type="button"
              onClick={() => setIsConcludingModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-surface hover:bg-slate-800 border border-surface-border text-xs font-semibold text-slate-300"
            >
              Resume Interview
            </button>
            <button
              type="button"
              onClick={handleConcludeInterview}
              disabled={ending}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 flex items-center gap-2 disabled:opacity-50"
            >
              {ending ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Award className="w-4 h-4" />
                  <span>Generate Rubric Scorecard</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MockInterviewPage;
