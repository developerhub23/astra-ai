import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import { TrendingUp, Zap, Shield, BrainCircuit, Activity, Clock } from 'lucide-react';
import { motion } from 'motion/react';

const generateData = () => [
  { time: '00:00', astra: 420, lumina: 180 },
  { time: '03:00', astra: 310, lumina: 140 },
  { time: '06:00', astra: 180, lumina: 320 },
  { time: '09:00', astra: 640, lumina: 880 },
  { time: '12:00', astra: 720, lumina: 540 },
  { time: '15:00', astra: 860, lumina: 690 },
  { time: '18:00', astra: 590, lumina: 780 },
  { time: '21:00', astra: 430, lumina: 360 },
];

const latencyData = [
  { model: 'Flash', p50: 180, p95: 420 },
  { model: 'Pro', p50: 890, p95: 2100 },
  { model: 'TTS', p50: 320, p95: 760 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(14,14,20,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 16px', backdropFilter: 'blur(20px)' }}>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(240,239,232,0.4)', marginBottom: 8 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 14, color: '#F0EFE8' }}>{p.value}</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'rgba(240,239,232,0.35)', textTransform: 'uppercase' }}>{p.name}</span>
        </div>
      ))}
    </div>
  );
};

const kpis = [
  { label: 'Token Throughput', value: '2.4M', sub: '+18.3% vs last 24h', icon: Zap, color: '#C8F135' },
  { label: 'Active Sessions', value: '147', sub: 'Across both engines', icon: Activity, color: '#89D4F5' },
  { label: 'Auth Success Rate', value: '99.97%', sub: 'OAuth 2.0 verified', icon: Shield, color: '#C8F135' },
  { label: 'System Uptime', value: '99.98%', sub: '30-day rolling', icon: TrendingUp, color: '#89D4F5' },
];

export default function AnalyticsDashboard() {
  const [data] = useState(generateData());
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#0C0C10', padding: 32 }}>
      {/* Header */}
      <div style={{ marginBottom: 32, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 100, background: 'rgba(200,241,53,0.08)', border: '1px solid rgba(200,241,53,0.2)', marginBottom: 12 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#C8F135', boxShadow: '0 0 8px rgba(200,241,53,0.9)', display: 'inline-block', animation: 'pulse-live 2s ease-in-out infinite' }} />
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#C8F135' }}>Live Dashboard</span>
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 44, letterSpacing: '-0.04em', color: '#F0EFE8', lineHeight: 0.9, marginBottom: 8 }}>
            System<br/><span style={{ background: 'linear-gradient(135deg,#C8F135,#89D4F5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Analytics</span>
          </h1>
        </div>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'rgba(240,239,232,0.3)', textAlign: 'right' }}>
          <div>Last updated</div>
          <div style={{ color: '#C8F135' }}>{new Date().toLocaleTimeString()}</div>
        </div>
      </div>

      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {kpis.map((kpi, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            style={{ padding: 24, borderRadius: 16, background: 'rgba(20,20,26,0.8)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(24px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${kpi.color}12`, border: `1px solid ${kpi.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <kpi.icon size={16} color={kpi.color} />
              </div>
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: kpi.color, boxShadow: `0 0 8px ${kpi.color}`, marginTop: 8 }} />
            </div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(240,239,232,0.35)', marginBottom: 8 }}>{kpi.label}</div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 32, letterSpacing: '-0.03em', color: '#F0EFE8', lineHeight: 1, marginBottom: 6 }}>{kpi.value}</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: kpi.color, opacity: 0.7 }}>{kpi.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Inference Volume */}
        <div style={{ padding: 28, borderRadius: 16, background: 'rgba(20,20,26,0.8)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(24px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
            <div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18, color: '#F0EFE8', marginBottom: 4 }}>Inference Volume</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(240,239,232,0.35)' }}>24-hour window</div>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              {[{ label: 'Astra', color: '#C8F135' }, { label: 'Lumina', color: '#89D4F5' }].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.color }} />
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(240,239,232,0.4)' }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="gAstra" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C8F135" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#C8F135" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gLumina" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#89D4F5" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#89D4F5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontFamily: 'JetBrains Mono', fill: 'rgba(240,239,232,0.3)' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontFamily: 'JetBrains Mono', fill: 'rgba(240,239,232,0.3)' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="astra" stroke="#C8F135" strokeWidth={2} fillOpacity={1} fill="url(#gAstra)" />
                <Area type="monotone" dataKey="lumina" stroke="#89D4F5" strokeWidth={2} fillOpacity={1} fill="url(#gLumina)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Latency */}
        <div style={{ padding: 28, borderRadius: 16, background: 'rgba(20,20,26,0.8)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(24px)' }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18, color: '#F0EFE8', marginBottom: 4 }}>Model Latency</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(240,239,232,0.35)' }}>P50 / P95 in ms</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 12 }}>
            {latencyData.map(item => (
              <div key={item.model}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'rgba(240,239,232,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{item.model}</span>
                  <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13, color: '#C8F135' }}>{item.p50}ms</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.p50 / 2500) * 100}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                    style={{ height: '100%', borderRadius: 3, background: 'linear-gradient(90deg, #C8F135, #89D4F5)' }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 3 }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'rgba(240,239,232,0.25)', textTransform: 'uppercase' }}>P95: {item.p95}ms</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 28, padding: '14px 16px', borderRadius: 12, background: 'rgba(200,241,53,0.06)', border: '1px solid rgba(200,241,53,0.12)' }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#C8F135', marginBottom: 4 }}>Health Status</div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: '#F0EFE8' }}>All Systems Nominal</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'rgba(240,239,232,0.35)', marginTop: 2 }}>No incidents in 30d</div>
          </div>
        </div>
      </div>

      {/* Engine comparison */}
      <div style={{ padding: 28, borderRadius: 16, background: 'rgba(20,20,26,0.8)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(24px)' }}>
        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18, color: '#F0EFE8', marginBottom: 20 }}>Engine Comparison</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {[
            { name: 'Astra (Flash)', model: 'gemini-2.0-flash', color: '#C8F135', metrics: [{ label: 'Avg Response', val: '1.2s' }, { label: 'Context Window', val: '1M tokens' }, { label: 'Sessions Today', val: '83' }] },
            { name: 'Lumina (Pro)', model: 'gemini-2.5-pro', color: '#89D4F5', metrics: [{ label: 'Avg Response', val: '4.8s' }, { label: 'Context Window', val: '1M tokens' }, { label: 'Sessions Today', val: '64' }] },
          ].map(engine => (
            <div key={engine.name} style={{ padding: 20, borderRadius: 12, border: `1px solid ${engine.color}15`, background: `${engine.color}05` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: engine.color, boxShadow: `0 0 10px ${engine.color}` }} />
                <div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#F0EFE8' }}>{engine.name}</div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: engine.color, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{engine.model}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 20 }}>
                {engine.metrics.map(m => (
                  <div key={m.label}>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: engine.color, letterSpacing: '-0.02em' }}>{m.val}</div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(240,239,232,0.35)', marginTop: 2 }}>{m.label}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
