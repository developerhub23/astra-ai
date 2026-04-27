import React, { useEffect, useRef, useState } from 'react';
import { Message, ChatSession } from '../types';
import { ASSISTANTS, AssistantType, speak } from '../gemini';
import { Send, Mic, Camera, Paperclip, ThumbsUp, ThumbsDown, Volume2, Zap, BrainCircuit, ArrowUp, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';

interface ChatInterfaceProps {
  session: ChatSession | null;
  messages: Message[];
  onNewSession: (type: AssistantType) => void;
  onSendMessage: (sessionId: string, content: string) => Promise<void>;
  onFeedback: (sessionId: string, messageId: string, feedback: number) => void;
}

export default function ChatInterface({ session, messages, onNewSession, onSendMessage, onFeedback }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showVideo, setShowVideo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        alert('Camera is not supported in this browser.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      setMediaStream(stream);
      setShowVideo(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(console.error);
        }
      }, 100);
    } catch (err) {
      console.error('Camera error:', err);
      alert('Please allow camera permissions in your browser settings.');
    }
  };

  const stopCamera = () => {
    mediaStream?.getTracks().forEach(track => track.stop());
    setMediaStream(null);
    setShowVideo(false);
  };

  const toggleSpeech = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const win = window as any;
    const SpeechRecognitionCtor = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results).map((r: any) => r[0].transcript).join('');
      setInput(transcript);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setInput(prev => prev + ` [Attached: ${file.name}]`);
  };

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }), 50);
  }, [messages, loading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px';
    }
  }, [input]);

  useEffect(() => () => {
    recognitionRef.current?.stop?.();
    mediaStream?.getTracks().forEach(track => track.stop());
  }, [mediaStream]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading || !session) return;

    const userContent = input.trim();
    setInput('');
    setLoading(true);

    try {
      await onSendMessage(session.id, userContent);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const asst = session ? ASSISTANTS[session.assistantType] : null;
  const isAstra = session?.assistantType === 'astra';

  if (!session) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center', background: '#0C0C10', height: '100%', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(200,241,53,0.04) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10 w-full max-w-2xl relative z-10">
          <div>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: 'rgba(200,241,53,0.08)', border: '1px solid rgba(200,241,53,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <Zap size={28} color="#C8F135" />
            </div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(36px,4vw,56px)', letterSpacing: '-0.04em', color: '#F0EFE8', lineHeight: 0.9, marginBottom: 12 }}>
              Choose Your<br /><span className="gradient-text">Engine</span>
            </h1>
            <p style={{ color: 'rgba(240,239,232,0.45)', fontSize: 15, lineHeight: 1.7, maxWidth: 360, margin: '0 auto' }}>
              Select a specialized intelligence profile to begin your session.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 640, margin: '0 auto', width: '100%' }}>
            {Object.values(ASSISTANTS).map((a) => {
              const isA = a.id === 'astra';
              const accentColor = isA ? '#C8F135' : '#89D4F5';
              return (
                <motion.button
                  key={a.id}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onNewSession(a.id as AssistantType)}
                  style={{
                    padding: 28, borderRadius: 20, border: '1px solid rgba(255,255,255,0.07)',
                    background: 'rgba(20,20,26,0.8)', cursor: 'pointer', textAlign: 'left',
                    transition: 'border-color 0.2s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = `${accentColor}30`; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.07)'; }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: `${accentColor}15`, border: `1px solid ${accentColor}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    {isA ? <Zap size={20} color={accentColor} /> : <BrainCircuit size={20} color={accentColor} />}
                  </div>
                  <div className="mono-label" style={{ color: accentColor, marginBottom: 6 }}>{a.role}</div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: '#F0EFE8', letterSpacing: '-0.02em', marginBottom: 8 }}>{a.name}</div>
                  <p style={{ fontSize: 12, color: 'rgba(240,239,232,0.45)', lineHeight: 1.6 }}>{a.description}</p>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </div>
    );
  }

  const accentColor = isAstra ? '#C8F135' : '#89D4F5';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', background: '#0C0C10' }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `${accentColor}15`, border: `1px solid ${accentColor}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isAstra ? <Zap size={18} color={accentColor} /> : <BrainCircuit size={18} color={accentColor} />}
          </div>
          <div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: '#F0EFE8' }}>{session.title || 'New Session'}</div>
            <div className="mono-label" style={{ marginTop: 1 }}>{asst?.name} · {asst?.role}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="dot-live" style={{ background: accentColor, boxShadow: `0 0 8px ${accentColor}90` }} />
          <span className="mono-label">Engine Active</span>
        </div>
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: 60, color: 'rgba(240,239,232,0.25)', fontSize: 14 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>✦</div>
            Start a conversation with {asst?.name}
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((m, idx) => {
            const isUser = m.senderType === 'user';
            return (
              <motion.div
                key={m.id || idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', gap: 12, alignItems: 'flex-start' }}
              >
                {!isUser && (
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: `${accentColor}12`, border: `1px solid ${accentColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    {isAstra ? <Zap size={14} color={accentColor} /> : <BrainCircuit size={14} color={accentColor} />}
                  </div>
                )}

                <div style={{ maxWidth: '72%' }}>
                  <div className="mono-label" style={{ marginBottom: 6, paddingLeft: 2 }}>
                    {isUser ? 'You' : asst?.name}
                    {m.createdAt && (
                      <span style={{ marginLeft: 8, opacity: 0.4 }}>
                        {format(m.createdAt, 'HH:mm')}
                      </span>
                    )}
                  </div>

                  <div style={{
                    padding: '14px 18px', borderRadius: isUser ? '18px 18px 6px 18px' : '6px 18px 18px 18px',
                    background: isUser ? accentColor : 'rgba(28,28,36,0.9)',
                    border: isUser ? 'none' : '1px solid rgba(255,255,255,0.06)',
                    color: isUser ? '#0C0C10' : '#F0EFE8',
                    fontSize: 14, lineHeight: 1.65,
                  }}>
                    {isUser ? (
                      <span style={{ fontWeight: 500 }}>{m.content}</span>
                    ) : (
                      <div className="prose-ai">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>

                  {!isUser && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, paddingLeft: 2 }}>
                      {[
                        { icon: ThumbsUp, label: 'Good response', value: 1 },
                        { icon: ThumbsDown, label: 'Bad response', value: -1 },
                        { icon: Volume2, label: 'Read aloud', action: () => speak(m.content) },
                      ].map(({ icon: Icon, label, value, action }) => (
                        <button
                          key={label}
                          title={label}
                          onClick={action ?? (() => onFeedback(session.id, m.id, value ?? 0))}
                          style={{ width: 26, height: 26, borderRadius: 7, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(240,239,232,0.2)', transition: 'all 0.15s' }}
                        >
                          <Icon size={12} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2, fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 12, color: 'rgba(240,239,232,0.6)' }}>
                    Y
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: `${accentColor}12`, border: `1px solid ${accentColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {isAstra ? <Zap size={14} color={accentColor} /> : <BrainCircuit size={14} color={accentColor} />}
            </div>
            <div style={{ padding: '14px 20px', borderRadius: '6px 18px 18px 18px', background: 'rgba(28,28,36,0.9)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 5, alignItems: 'center' }}>
              {[0, 1, 2].map(i => (
                <div key={i} className="thinking-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: accentColor }} />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
        {showVideo && (
          <div style={{ marginBottom: 12, position: 'relative', width: 200, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
            <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', display: 'block' }} />
            <button onClick={stopCamera} style={{ position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,0,0,0.8)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <X size={12} />
            </button>
          </div>
        )}

        <form onSubmit={handleSend} style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, background: 'rgba(28,28,36,0.9)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '10px 10px 10px 16px' }}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={1}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', resize: 'none', fontFamily: 'Syne, sans-serif', fontSize: 14, color: '#F0EFE8', lineHeight: 1.5, minHeight: 40, maxHeight: 160, overflowY: 'auto', paddingTop: 9 }}
              placeholder={`Ask ${asst?.name} anything... (Enter to send)`}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingBottom: 4, flexShrink: 0 }}>
              <button type="button" onClick={toggleSpeech} title="Voice input" style={{ width: 32, height: 32, borderRadius: 9, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', background: isRecording ? 'rgba(255,107,71,0.15)' : 'transparent', color: isRecording ? '#FF6B47' : 'rgba(240,239,232,0.3)' }}>
                <Mic size={15} />
              </button>
              <button type="button" onClick={showVideo ? stopCamera : startCamera} title="Camera" style={{ width: 32, height: 32, borderRadius: 9, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', background: showVideo ? `${accentColor}15` : 'transparent', color: showVideo ? accentColor : 'rgba(240,239,232,0.3)' }}>
                <Camera size={15} />
              </button>
              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept="image/*,application/pdf" style={{ display: 'none' }} />
              <button type="button" onClick={() => fileInputRef.current?.click()} title="Attach file" style={{ width: 32, height: 32, borderRadius: 9, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', background: 'transparent', color: 'rgba(240,239,232,0.3)' }}>
                <Paperclip size={15} />
              </button>

              <button
                type="submit"
                disabled={loading || !input.trim()}
                style={{
                  width: 36, height: 36, borderRadius: 10, border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
                  background: input.trim() && !loading ? accentColor : 'rgba(255,255,255,0.06)',
                  color: input.trim() && !loading ? '#0C0C10' : 'rgba(240,239,232,0.2)',
                  boxShadow: input.trim() && !loading ? `0 0 20px ${accentColor}40` : 'none',
                  transform: input.trim() && !loading ? 'scale(1)' : 'scale(0.95)'
                }}
              >
                <ArrowUp size={18} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8 }}>
            <span className="dot-live" style={{ width: 4, height: 4, background: accentColor, boxShadow: `0 0 6px ${accentColor}` }} />
            <span className="mono-label">{asst?.name} ready · Enter to send · Shift+Enter for newline</span>
          </div>
        </form>
      </div>
    </div>
  );
}
