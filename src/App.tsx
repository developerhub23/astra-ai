import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ShieldCheck, Zap } from 'lucide-react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import { ASSISTANTS, AssistantType, generateAssistantReply } from './gemini';
import type { ChatSession, Message, User } from './types';

const demoUser: User = {
  uid: 'demo-user',
  email: 'demo@stackblitz.local',
  displayName: 'Demo User',
  photoURL: '',
};

const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `id_${Math.random().toString(36).slice(2, 10)}`;
};

const now = () => new Date();

const makeSession = (assistantType: AssistantType, title: string, lastMessage = ''): ChatSession => ({
  id: createId(),
  title,
  assistantType,
  updatedAt: now(),
  createdAt: now(),
  lastMessage,
  userId: demoUser.uid,
});

const seedSessions: ChatSession[] = [
  makeSession('astra', 'Productive morning planning', 'Astra can help turn rough notes into a clean plan.'),
  makeSession('lumina', 'EE study review', 'Structured analysis for exam revision.'),
].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

const seedMessages: Record<string, Message[]> = {
  [seedSessions[0].id]: [
    { id: createId(), senderId: demoUser.uid, senderType: 'user', content: 'Help me structure my day for study and project work.', createdAt: now() },
    { id: createId(), senderId: 'assistant', senderType: 'assistant', content: 'Here is a focused morning plan:\n\n1. 30 minutes review\n2. 2 hours deep work\n3. Short break\n4. Re-run the most difficult topic', createdAt: now() },
  ],
  [seedSessions[1].id]: [
    { id: createId(), senderId: demoUser.uid, senderType: 'user', content: 'Explain a single-phase transformer from scratch.', createdAt: now() },
    { id: createId(), senderId: 'assistant', senderType: 'assistant', content: 'A single-phase transformer transfers AC power between circuits by mutual induction. The primary creates alternating flux in the core, and the secondary receives induced emf.', createdAt: now() },
  ],
};

function sortSessions(list: ChatSession[]) {
  return [...list].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [messagesBySession, setMessagesBySession] = useState<Record<string, Message[]>>({});
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'chat' | 'analytics' | 'audit'>('chat');

  useEffect(() => {
    setSessions(seedSessions);
    setMessagesBySession(seedMessages);
    setActiveSessionId(seedSessions[0]?.id ?? null);
  }, []);

  const activeSession = useMemo(
    () => sessions.find(session => session.id === activeSessionId) ?? null,
    [sessions, activeSessionId]
  );

  const activeMessages = activeSessionId ? messagesBySession[activeSessionId] ?? [] : [];

  const handleEnterDemo = () => {
    setUser(demoUser);
  };

  const handleSignOut = () => {
    setUser(null);
    setCurrentView('chat');
    setActiveSessionId(seedSessions[0]?.id ?? null);
  };

  const handleNewSession = (type: AssistantType) => {
    const session = makeSession(type, 'New Session');
    setSessions(prev => sortSessions([session, ...prev]));
    setMessagesBySession(prev => ({ ...prev, [session.id]: [] }));
    setActiveSessionId(session.id);
    setCurrentView('chat');
  };

  const handleDeleteSession = (id: string) => {
    setSessions(prev => prev.filter(session => session.id !== id));
    setMessagesBySession(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    if (activeSessionId === id) {
      const nextSession = sessions.find(session => session.id !== id) ?? null;
      setActiveSessionId(nextSession?.id ?? null);
    }
  };

  const handleFeedback = (sessionId: string, messageId: string, feedback: number) => {
    setMessagesBySession(prev => ({
      ...prev,
      [sessionId]: (prev[sessionId] ?? []).map(message => (message.id === messageId ? { ...message, feedback } : message)),
    }));
  };

  const handleSendMessage = async (sessionId: string, content: string) => {
    const session = sessions.find(item => item.id === sessionId);
    if (!session) return;

    const userMessage: Message = {
      id: createId(),
      senderId: user?.uid ?? demoUser.uid,
      senderType: 'user',
      content,
      createdAt: now(),
    };

    const userHistory = [...(messagesBySession[sessionId] ?? []), userMessage];

    setMessagesBySession(prev => ({
      ...prev,
      [sessionId]: userHistory,
    }));

    setSessions(prev => sortSessions(prev.map(item => (
      item.id === sessionId
        ? {
            ...item,
            title: item.title === 'New Session' ? (content.length > 40 ? `${content.slice(0, 37)}...` : content) : item.title,
            lastMessage: content.slice(0, 100),
            updatedAt: now(),
          }
        : item
    ))));

    const assistantText = await generateAssistantReply({
      assistantType: session.assistantType,
      userContent: content,
      history: userHistory.map(message => ({
        role: message.senderType === 'user' ? 'user' : 'model',
        parts: [{ text: message.content }],
      })),
    });

    const assistantMessage: Message = {
      id: createId(),
      senderId: 'assistant',
      senderType: 'assistant',
      content: assistantText,
      createdAt: now(),
    };

    setMessagesBySession(prev => ({
      ...prev,
      [sessionId]: [...(prev[sessionId] ?? []), assistantMessage],
    }));

    setSessions(prev => sortSessions(prev.map(item => (
      item.id === sessionId
        ? {
            ...item,
            lastMessage: assistantText.slice(0, 100),
            updatedAt: now(),
          }
        : item
    ))));
  };

  if (!user) {
    return (
      <div className="h-screen w-screen flex overflow-hidden" style={{ background: '#0C0C10', fontFamily: 'Syne, sans-serif' }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '700px', height: '700px', background: 'radial-gradient(circle, rgba(200,241,53,0.06) 0%, transparent 70%)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(137,212,245,0.05) 0%, transparent 70%)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>

        <div className="flex-1 flex flex-col justify-between p-16 relative z-10">
          <div className="flex items-center gap-3">
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#C8F135', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={20} color="#0C0C10" strokeWidth={2.5} />
            </div>
            <span style={{ fontWeight: 800, fontSize: 18, color: '#F0EFE8', letterSpacing: '-0.02em' }}>Astra AI</span>
          </div>

          <div className="space-y-10 max-w-xl">
            <div className="pill" style={{ marginBottom: 24 }}>
              <span className="dot-live" />
              StackBlitz Preview Ready
            </div>
            <h1 style={{ fontWeight: 800, fontSize: 'clamp(52px, 6vw, 88px)', lineHeight: 0.88, letterSpacing: '-0.04em', color: '#F0EFE8' }}>
              Think<br />
              <span style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontWeight: 700 }} className="gradient-text">Deeper.</span><br />
              Move Faster.
            </h1>
            <p style={{ fontSize: 17, lineHeight: 1.7, color: 'rgba(240,239,232,0.55)', fontWeight: 400, maxWidth: 440 }}>
              Two specialized intelligence engines — creative and analytical — working in concert.
            </p>
          </div>

          <div className="flex gap-12">
            {[['Demo Mode', 'No Firebase required'], ['Browser Safe', 'No Google auth required'], ['Local Preview', 'Runs in StackBlitz']].map(([val, label]) => (
              <div key={label}>
                <div style={{ fontWeight: 800, fontSize: 20, color: '#F0EFE8', letterSpacing: '-0.02em' }}>{val}</div>
                <div className="mono-label">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full lg:w-[440px] flex flex-col justify-center p-16 relative z-10" style={{ background: 'rgba(20,20,26,0.6)', backdropFilter: 'blur(40px)', borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="max-w-xs w-full mx-auto space-y-8">
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 100, background: 'rgba(200,241,53,0.08)', border: '1px solid rgba(200,241,53,0.2)', marginBottom: 20 }}>
                <ShieldCheck size={11} color="#C8F135" />
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#C8F135' }}>Preview Access</span>
              </div>
              <h2 style={{ fontWeight: 800, fontSize: 36, letterSpacing: '-0.03em', color: '#F0EFE8', lineHeight: 1.05, marginBottom: 10 }}>
                Open the<br />Demo Workspace.
              </h2>
              <p style={{ fontSize: 13, color: 'rgba(240,239,232,0.45)', lineHeight: 1.7 }}>
                This version is StackBlitz-safe: local sessions, mock replies when no Gemini key is present, and no Firebase login dependency.
              </p>
            </div>

            <button onClick={handleEnterDemo} className="luxury-button" style={{ width: '100%' }}>
              Enter Demo Workspace
            </button>

            <div style={{ display: 'grid', gap: 12 }}>
              {[
                { label: 'Live chat shell', desc: 'Session list, dual-engine picker, message composer.' },
                { label: 'Fallback AI', desc: 'Mock replies if the Gemini key is missing.' },
                { label: 'Browser features', desc: 'Mic, camera, file attachment, and TTS fallbacks.' },
              ].map(item => (
                <div key={item.label} style={{ padding: 14, borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontWeight: 700, color: '#F0EFE8', marginBottom: 4 }}>{item.label}</div>
                  <div className="mono-label" style={{ lineHeight: 1.6 }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex overflow-hidden" style={{ background: '#0C0C10' }}>
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onNewChat={() => setActiveSessionId(null)}
        onViewChange={setCurrentView}
        currentView={currentView}
        onDeleteSession={handleDeleteSession}
        user={user}
        onSignOut={handleSignOut}
      />
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <AnimatePresence mode="wait">
          {currentView === 'chat' ? (
            <motion.div key="chat" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }} className="flex-1 h-full">
              <ChatInterface
                session={activeSession}
                messages={activeMessages}
                onNewSession={handleNewSession}
                onSendMessage={handleSendMessage}
                onFeedback={handleFeedback}
              />
            </motion.div>
          ) : currentView === 'analytics' ? (
            <motion.div key="analytics" initial={{ opacity: 0, scale: 0.99 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.01 }} transition={{ duration: 0.2 }} className="flex-1 h-full">
              <AnalyticsDashboard />
            </motion.div>
          ) : (
            <motion.div key="audit" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.2 }} className="flex-1 h-full overflow-y-auto p-10" style={{ background: '#0C0C10' }}>
              <div className="max-w-3xl mx-auto space-y-10">
                <header className="space-y-4">
                  <div className="pill w-fit">
                    <ShieldCheck size={10} />
                    Security Active
                  </div>
                  <h1 style={{ fontWeight: 800, fontSize: 52, letterSpacing: '-0.04em', lineHeight: 0.9, color: '#F0EFE8' }}>
                    Intelligence<br /><span className="gradient-text">Audit Log</span>
                  </h1>
                  <p style={{ color: 'rgba(240,239,232,0.5)', fontSize: 15, lineHeight: 1.7 }}>This view is illustrative in demo mode and is safe to preview in StackBlitz.</p>
                </header>

                <div className="glass-card overflow-hidden">
                  <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className="mono-label">Demo Event Stream</span>
                    <span className="mono-label">All systems nominal</span>
                  </div>
                  <div style={{ padding: 20, display: 'grid', gap: 12 }}>
                    {[
                      ['Session persistence', 'Local state only'],
                      ['AI transport', 'Gemini fallback or mock reply'],
                      ['Authentication', 'Disabled in demo preview'],
                      ['Camera / mic', 'Browser permission gated'],
                    ].map(([label, value]) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ color: '#F0EFE8', fontWeight: 600 }}>{label}</span>
                        <span className="mono-label">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
