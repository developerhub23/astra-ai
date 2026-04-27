import React from 'react';
import { Plus, LogOut, LayoutDashboard, ShieldCheck, MessageSquare, Trash2, Zap } from 'lucide-react';
import { ChatSession, User } from '../types';
import { ASSISTANTS } from '../gemini';
import { motion } from 'motion/react';

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onViewChange: (view: 'chat' | 'analytics' | 'audit') => void;
  currentView: 'chat' | 'analytics' | 'audit';
  onDeleteSession: (id: string) => void;
  user: User | null;
  onSignOut: () => void;
}

const navItems = [
  { id: 'chat', icon: MessageSquare, label: 'Intelligence Engine' },
  { id: 'analytics', icon: LayoutDashboard, label: 'Analytics' },
  { id: 'audit', icon: ShieldCheck, label: 'Security Audit' },
] as const;

export default function Sidebar({ sessions, activeSessionId, onSelectSession, onNewChat, onViewChange, currentView, onDeleteSession, user, onSignOut }: SidebarProps) {
  return (
    <aside style={{ width: 280, height: '100%', display: 'flex', flexDirection: 'column', background: 'rgba(14,14,20,0.95)', backdropFilter: 'blur(24px)', borderRight: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
      <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: '#C8F135', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Zap size={18} color="#0C0C10" strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, color: '#F0EFE8', letterSpacing: '-0.02em' }}>Astra AI</span>
        </div>
        <button
          onClick={onNewChat}
          title="New chat"
          style={{ width: 32, height: 32, borderRadius: 9, border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(240,239,232,0.5)', transition: 'all 0.15s' }}
        >
          <Plus size={16} />
        </button>
      </div>

      <nav style={{ padding: '12px 10px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        {navItems.map(item => {
          const active = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
                marginBottom: 2, textAlign: 'left', transition: 'all 0.15s',
                background: active ? 'rgba(200,241,53,0.1)' : 'transparent',
                color: active ? '#C8F135' : 'rgba(240,239,232,0.45)',
                fontFamily: 'Syne, sans-serif', fontWeight: active ? 600 : 500, fontSize: 13,
                ...(active ? { border: '1px solid rgba(200,241,53,0.15)' } : { border: '1px solid transparent' })
              }}
            >
              <item.icon size={15} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
        {currentView === 'chat' && (
          <>
            <div className="mono-label" style={{ padding: '4px 10px', marginBottom: 8 }}>Recent Sessions</div>
            {sessions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: 'rgba(240,239,232,0.2)', fontSize: 12, fontStyle: 'italic' }}>
                No sessions yet.<br />Start a new chat above.
              </div>
            ) : (
              sessions.map(session => {
                const active = activeSessionId === session.id;
                const isAstra = session.assistantType === 'astra';
                return (
                  <motion.div key={session.id} whileHover={{ x: 2 }} style={{ position: 'relative', marginBottom: 2, borderRadius: 10, overflow: 'hidden' }}>
                    <button
                      onClick={() => onSelectSession(session.id)}
                      style={{
                        width: '100%', textAlign: 'left', padding: '9px 12px',
                        paddingRight: 36, border: active ? '1px solid rgba(200,241,53,0.15)' : '1px solid transparent',
                        borderRadius: 10, background: active ? 'rgba(200,241,53,0.07)' : 'transparent',
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: isAstra ? '#C8F135' : '#89D4F5', boxShadow: `0 0 8px ${isAstra ? 'rgba(200,241,53,0.7)' : 'rgba(137,212,245,0.7)'}` }} />
                        <div style={{ overflow: 'hidden' }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: active ? '#F0EFE8' : 'rgba(240,239,232,0.7)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'Syne, sans-serif' }}>{session.title || 'Untitled'}</div>
                          <div className="mono-label" style={{ marginTop: 2 }}>{ASSISTANTS[session.assistantType].name}</div>
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => onDeleteSession(session.id)}
                      title="Delete session"
                      style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', width: 24, height: 24, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(240,239,232,0.2)', opacity: 1, transition: 'all 0.15s' }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </motion.div>
                );
              })
            )}
          </>
        )}
      </div>

      <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: 'rgba(200,241,53,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(200,241,53,0.2)' }}>
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 13, color: '#C8F135' }}>{user?.email?.charAt(0).toUpperCase() ?? 'D'}</span>
            )}
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#F0EFE8', fontFamily: 'Syne, sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.displayName || user?.email?.split('@')[0] || 'Demo User'}</div>
            <div className="mono-label" style={{ color: 'rgba(200,241,53,0.6)', marginTop: 1 }}>StackBlitz Demo</div>
          </div>
          <button
            onClick={onSignOut}
            title="Sign out"
            style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(240,239,232,0.3)', transition: 'all 0.15s', flexShrink: 0 }}
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
