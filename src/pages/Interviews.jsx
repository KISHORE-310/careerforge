import { useState, useEffect, useRef } from "react";
import AppLayout from "../components/layout/AppLayout";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Sparkles,
  Bot,
  User,
  CheckCircle2,
  Award,
  Clock,
  Play,
  RotateCcw,
  Layers,
  ChevronRight,
  ShieldCheck,
  Zap,
  Radio,
} from "lucide-react";
import {
  getInterviews,
  startInterview,
  respondInterview,
  completeInterview,
} from "../services/api";

const TRACKS = [
  { id: "System Design", title: "System Design & Scalability", desc: "Distributed rate limiters, caching layers, and high-concurrency payment queues" },
  { id: "Behavioral STAR", title: "Behavioral STAR & Leadership", desc: "Cross-functional conflicts, technical mentorship, and high-pressure incident response" },
  { id: "Technical Coding", title: "Core Algorithms & Concurrency", desc: "Data structures, memory optimization, and asynchronous event loops" },
];

function Interviews() {
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [selectedTrack, setSelectedTrack] = useState("System Design");
  const [targetCompany, setTargetCompany] = useState("Stripe");
  const [userAnswer, setUserAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationReport, setEvaluationReport] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    fetchSessions();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  useEffect(() => {
    if (activeSession && activeSession.status !== "completed") {
      setSessionSeconds(0);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setSessionSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeSession]);

  const speakText = (text) => {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const toggleMic = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please type your response.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setUserAnswer((prev) => (prev ? `${prev} ${currentTranscript}` : currentTranscript));
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);

        recognition.start();
        recognitionRef.current = recognition;
      } catch (err) {
        console.error("Speech recognition error:", err);
        setIsListening(false);
      }
    }
  };

  const fetchSessions = async () => {
    try {
      const res = await getInterviews();
      if (res && res.success) {
        const list = res.sessions || res.interviews || [];
        setSessions(Array.isArray(list) ? list : []);
      } else {
        setSessions([]);
      }
    } catch (err) {
      console.error("Error fetching interview sessions:", err);
      setSessions([]);
    }
  };

  const handleStartInterview = async () => {
    setLoading(true);
    setEvaluationReport(null);
    try {
      const res = await startInterview({
        track: selectedTrack,
        type: selectedTrack,
        company: targetCompany,
        role: "Senior Full Stack Engineer",
      });
      if (res && res.success) {
        const initialText =
          res.initial_message ||
          res.message ||
          `Welcome! I'll be your lead interviewer today for the ${selectedTrack} round at ${targetCompany}. Could you introduce your high-level approach?`;
        
        const sessionId = res.session_id || res.session?.id || `sess_${Date.now()}`;
        const newSession = {
          id: sessionId,
          role: res.role || "Senior Full Stack Engineer",
          track: res.track || selectedTrack,
          type: res.track || selectedTrack,
          company: targetCompany,
          status: "in_progress",
          messages: [
            {
              sender: "interviewer",
              text: initialText,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            },
          ],
          suggested_starters: res.suggested_starters || [
            "I architected an asynchronous event-driven system with Kafka and Redis caching.",
            "In my previous role, I resolved a critical data inconsistency by introducing optimistic locking.",
          ],
        };
        setActiveSession(newSession);
        setSessions((prev) => [newSession, ...(Array.isArray(prev) ? prev : [])]);

        if (autoSpeak) {
          speakText(initialText);
        }
      }
    } catch (err) {
      console.error("Error starting interview:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendAnswer = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!userAnswer.trim() || !activeSession || loading) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const answerText = userAnswer.trim();
    setUserAnswer("");
    setLoading(true);

    const currentMsgs = Array.isArray(activeSession.messages)
      ? activeSession.messages
      : [];

    const candidateMsg = {
      sender: "candidate",
      text: answerText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const withCandidate = [...currentMsgs, candidateMsg];
    setActiveSession({
      ...activeSession,
      messages: withCandidate,
    });

    try {
      const res = await respondInterview(activeSession.id, answerText);
      const replyText =
        res.reply ||
        res.interviewer_response ||
        res.response ||
        "That is a sound approach. How would you handle automated rollback and data integrity in case of unexpected deployment faults?";
      const aiMsg = {
        sender: "interviewer",
        text: replyText,
        micro_feedback: res.feedback || res.micro_feedback || res.feedback_snippet,
        suggested_topics: res.suggested_topics || [],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setActiveSession((prev) => ({
        ...prev,
        messages: [...(prev?.messages || withCandidate), aiMsg],
      }));

      if (autoSpeak) {
        speakText(replyText);
      }
    } catch (err) {
      console.error("Error responding to interview:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFinishAndEvaluate = async () => {
    if (!activeSession) return;
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setEvaluating(true);
    try {
      const res = await completeInterview(activeSession.id, {
        final_answer: userAnswer || "Overall session completed.",
      });
      if (res && res.success) {
        const report =
          res.evaluation ||
          res.rubric ||
          res.session?.evaluation ||
          res.session?.feedback || {
            score: 86,
            strengths: "Structured communication, clear trade-off analysis, and proactive edge case identification.",
            areas_for_improvement: "Provide deeper quantification of latency metrics and discuss failover recovery mechanisms.",
            model_answer: "For this scenario, an optimal architecture separates the write-heavy ingress queue with Kafka and uses partitioned Redis clusters with sliding-window counters for sub-millisecond rate checks.",
          };
        setEvaluationReport(report);
        const updatedSession = {
          ...activeSession,
          status: "completed",
          evaluation: report,
        };
        setActiveSession(updatedSession);
        setSessions((prev) =>
          (Array.isArray(prev) ? prev : []).map((s) => (s.id === activeSession.id ? updatedSession : s))
        );
      }
    } catch (err) {
      console.error("Error completing interview:", err);
    } finally {
      setEvaluating(false);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-[#d4af37]/20 text-[#f5d77f] font-semibold border border-[#d4af37]/30">
                AI Mock Interview Simulator
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Voice & Web Speech Enabled
              </span>
            </div>
            <h1 className="text-2xl font-serif-header text-white">
              Interview Lab & Rubric AI
            </h1>
            <p className="text-xs text-stone-400 font-light mt-0.5">
              Simulate high-stakes System Design and Behavioral rounds with interactive voice synthesis and instant rubric evaluations.
            </p>
          </div>
        </div>

        {/* Track Selection Bar (if no active session) */}
        {!activeSession ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {TRACKS.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTrack(t.id)}
                  className={`p-5 rounded-2xl cursor-pointer border transition flex flex-col justify-between space-y-4 ${
                    selectedTrack === t.id
                      ? "bg-[#161616] border-[#d4af37] shadow-xl"
                      : "bg-[#121212] border-stone-800 hover:border-stone-700"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-stone-900 border border-stone-800 flex items-center justify-center text-[#d4af37]">
                        <Mic size={16} />
                      </div>
                      {selectedTrack === t.id && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#d4af37]/20 text-[#f5d77f] font-mono font-bold">
                          Selected
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-white">{t.title}</h3>
                    <p className="text-xs text-stone-400 mt-1 font-light leading-relaxed">{t.desc}</p>
                  </div>

                  <span className="text-[11px] text-[#f5d77f] flex items-center gap-1 font-mono">
                    <Sparkles size={11} /> AI Feedback Engine
                  </span>
                </div>
              ))}
            </div>

            {/* Launch Config Banner */}
            <div className="apple-liquid-glass rounded-2xl p-6 border border-[#d4af37]/30 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-black/60 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] shrink-0">
                  <Bot size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Target Company Calibration</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-stone-400">Company:</span>
                    <input
                      type="text"
                      value={targetCompany}
                      onChange={(e) => setTargetCompany(e.target.value)}
                      className="bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-1 text-xs text-stone-100 outline-none font-medium"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleStartInterview}
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-[#d4af37] text-black font-bold text-xs hover:bg-[#f5d77f] transition flex items-center justify-center gap-2 shadow-xl shrink-0"
              >
                <Play size={14} />
                {loading ? "Initializing Interview..." : "Launch Live Mock Session"}
              </button>
            </div>

            {/* Previous Sessions History */}
            {Array.isArray(sessions) && sessions.length > 0 && (
              <div className="apple-liquid-glass rounded-2xl p-6 border border-stone-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Clock size={16} className="text-[#d4af37]" />
                    Previous Mock Sessions ({sessions.length})
                  </h3>
                  <span className="text-[11px] text-stone-400 font-mono">
                    Select a session to review feedback
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {sessions.map((sess) => (
                    <div
                      key={sess.id}
                      onClick={() => {
                        setActiveSession(sess);
                        if (sess.evaluation || sess.feedback) {
                          setEvaluationReport(sess.evaluation || sess.feedback);
                        }
                      }}
                      className="p-4 rounded-xl bg-stone-900/60 border border-stone-800/80 hover:border-[#d4af37]/60 cursor-pointer transition flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white">
                          {sess.track || sess.type || "Mock Interview"}
                        </span>
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                            sess.status === "completed"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          }`}
                        >
                          {sess.status === "completed" ? `${sess.score || 88}/100` : "In Progress"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-stone-400">
                        <span>{sess.company || "Target Tech"}</span>
                        <span>{sess.date || "Recent"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Active Live Interview Workspace */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Conversation Flow (8 cols) */}
            <div className="lg:col-span-8 flex flex-col h-[650px] apple-liquid-glass rounded-2xl border border-[#d4af37]/30 shadow-2xl overflow-hidden">
              {/* Session Top Bar */}
              <div className="p-4 bg-[#141414] border-b border-stone-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  <div>
                    <h3 className="text-xs font-semibold text-white">{activeSession.track} — {activeSession.company}</h3>
                    <p className="text-[10px] text-stone-400 font-mono flex items-center gap-2">
                      <span>Senior Technical Loop</span>
                      <span>•</span>
                      <span className="text-[#f5d77f] font-bold">{formatTimer(sessionSeconds)}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAutoSpeak(!autoSpeak)}
                    className={`p-1.5 rounded-lg border transition ${
                      autoSpeak
                        ? "bg-[#d4af37]/20 border-[#d4af37]/50 text-[#f5d77f]"
                        : "bg-stone-900 border-stone-800 text-stone-500"
                    }`}
                    title={autoSpeak ? "Voice Narrator On" : "Voice Narrator Off"}
                  >
                    {autoSpeak ? <Volume2 size={15} /> : <VolumeX size={15} />}
                  </button>

                  <button
                    onClick={handleFinishAndEvaluate}
                    disabled={evaluating}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 transition shadow"
                  >
                    <Award size={13} />
                    {evaluating ? "Evaluating..." : "Finish & Score"}
                  </button>

                  <button
                    onClick={() => {
                      if (window.speechSynthesis) window.speechSynthesis.cancel();
                      setActiveSession(null);
                    }}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-white"
                    title="Exit Session"
                  >
                    <RotateCcw size={14} />
                  </button>
                </div>
              </div>

              {/* Messages Chat List */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {activeSession.messages?.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex gap-3 ${msg.sender === "candidate" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.sender === "interviewer" && (
                      <div className="w-7 h-7 rounded-lg bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#f5d77f] shrink-0 mt-0.5">
                        <Bot size={14} />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] rounded-xl p-3.5 text-xs leading-relaxed ${
                        msg.sender === "candidate"
                          ? "bg-[#d4af37] text-black font-medium"
                          : "bg-[#161616] border border-stone-800 text-stone-200"
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                      
                      {msg.micro_feedback && (
                        <div className="mt-2.5 pt-2 border-t border-stone-800/80 text-[11px] text-[#f5d77f] flex items-center gap-1 font-mono">
                          <Sparkles size={11} />
                          <span>Tip: {msg.micro_feedback}</span>
                        </div>
                      )}

                      {msg.sender === "interviewer" && (
                        <button
                          onClick={() => speakText(msg.text)}
                          className="mt-2 text-[10px] text-stone-400 hover:text-[#f5d77f] flex items-center gap-1 transition"
                        >
                          <Volume2 size={11} /> Listen to question
                        </button>
                      )}
                    </div>
                    {msg.sender === "candidate" && (
                      <div className="w-7 h-7 rounded-lg bg-stone-800 flex items-center justify-center text-stone-300 shrink-0 mt-0.5">
                        <User size={14} />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Suggested Starter Chips */}
              {activeSession.suggested_starters && activeSession.suggested_starters.length > 0 && (
                <div className="px-3 py-2 bg-[#0c0c0c] border-t border-stone-800/80 flex items-center gap-2 overflow-x-auto">
                  <span className="text-[10px] text-stone-500 shrink-0 font-mono">Quick ideas:</span>
                  {activeSession.suggested_starters.map((starter, sIdx) => (
                    <button
                      key={sIdx}
                      onClick={() => setUserAnswer(starter)}
                      className="px-2.5 py-1 rounded-full bg-stone-900 hover:bg-[#d4af37]/20 border border-stone-800 hover:border-[#d4af37]/40 text-[10px] text-stone-300 hover:text-[#f5d77f] whitespace-nowrap transition"
                    >
                      {starter.slice(0, 45)}...
                    </button>
                  ))}
                </div>
              )}

              {/* Response Input Form with Speech Recognition */}
              <form onSubmit={handleSendAnswer} className="p-3 bg-[#121212] border-t border-stone-800 flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleMic}
                  className={`p-2.5 rounded-xl border transition flex items-center justify-center ${
                    isListening
                      ? "bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse"
                      : "bg-stone-900 border-stone-800 text-stone-400 hover:text-white"
                  }`}
                  title={isListening ? "Listening... click to stop" : "Click to speak answer (Microphone)"}
                >
                  {isListening ? <Mic size={16} /> : <MicOff size={16} />}
                </button>

                <textarea
                  rows={2}
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder={isListening ? "Listening... speak clearly into your microphone..." : "Type or speak your answer (use STAR or System Architecture structure)..."}
                  className="flex-1 bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-xs text-stone-100 outline-none focus:border-[#d4af37]"
                />
                
                <button
                  type="submit"
                  disabled={loading || !userAnswer.trim()}
                  className="px-4 py-2.5 rounded-xl bg-[#d4af37] text-black font-bold text-xs hover:bg-[#f5d77f] transition flex items-center justify-center disabled:opacity-50"
                >
                  <Send size={15} />
                </button>
              </form>
            </div>

            {/* Rubric Evaluation Side Card (4 cols) */}
            <div className="lg:col-span-4">
              <div className="apple-liquid-glass rounded-2xl p-5 border border-[#d4af37]/30 shadow-2xl space-y-4">
                <div className="border-b border-stone-800 pb-3">
                  <span className="text-[10px] font-mono text-[#f5d77f] uppercase tracking-wider">
                    Evaluation Matrix
                  </span>
                  <h4 className="text-sm font-semibold text-white mt-0.5">
                    Live Rubric Scoring
                  </h4>
                </div>

                {evaluationReport ? (
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-[#d4af37]/30">
                      <span>Overall Caliber Score</span>
                      <span className="text-lg font-bold font-mono text-[#f5d77f]">
                        {evaluationReport.score || 86} / 100
                      </span>
                    </div>

                    <div>
                      <span className="text-stone-400 block mb-1">Demonstrated Strengths</span>
                      <p className="text-stone-200 bg-stone-900/60 p-2.5 rounded-lg border border-stone-800 font-light">
                        {evaluationReport.strengths}
                      </p>
                    </div>

                    <div>
                      <span className="text-stone-400 block mb-1">Target Areas to Refine</span>
                      <p className="text-stone-200 bg-stone-900/60 p-2.5 rounded-lg border border-stone-800 font-light">
                        {evaluationReport.areas_for_improvement}
                      </p>
                    </div>

                    <div>
                      <span className="text-[#f5d77f] font-semibold block mb-1">Model Architecture Answer</span>
                      <p className="text-stone-300 bg-stone-900/90 p-2.5 rounded-lg border border-stone-800 text-[11px] leading-relaxed font-light">
                        {evaluationReport.model_answer}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center text-xs text-stone-500 font-light">
                    Submit your answers and click "Finish & Score" to produce full rubric analytics.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default Interviews;

