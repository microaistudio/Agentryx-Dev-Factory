import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ═══════════════════════════════════════════════════════════
   FACTORY FLOOR — The Live Pipeline Visualization
   ═══════════════════════════════════════════════════════════ */

interface Agent {
  id: string;
  name: string;
  role: string;
  model: string;
  status: 'idle' | 'working' | 'online';
  cssClass: string;
}

interface Room {
  title: string;
  icon: string;
  agents: Agent[];
}

// Simulated agent data — will be replaced by WebSocket state in Sprint 7
const INITIAL_AGENTS: Agent[] = [
  { id: 'jane', name: 'Jane', role: 'PM / Triage', model: 'gemini-2.5-flash', status: 'idle', cssClass: 'jane' },
  { id: 'spock', name: 'Spock', role: 'Auto-Research', model: 'gemini-3.1-pro', status: 'idle', cssClass: 'spock' },
  { id: 'torres', name: 'Torres', role: 'Junior Dev', model: 'gemini-3.1-pro', status: 'working', cssClass: 'torres' },
  { id: 'data', name: 'Data', role: 'Sr. Architect', model: 'gemini-3.1-pro', status: 'idle', cssClass: 'data' },
  { id: 'tuvok', name: 'Tuvok', role: 'QA Reviewer', model: 'gemini-3.1-pro', status: 'online', cssClass: 'tuvok' },
  { id: 'obrien', name: "O'Brien", role: 'SRE / Deploy', model: 'gemini-2.5-flash', status: 'online', cssClass: 'obrien' },
];

// Simulated log entries
const SIMULATED_LOGS = [
  { time: '22:38', agent: 'jane', agentLabel: 'Jane', message: 'Parsed incoming ticket #187 — routing to Torres.' },
  { time: '22:37', agent: 'torres', agentLabel: 'Torres', message: 'Building NavBar component... running npm test.' },
  { time: '22:35', agent: 'spock', agentLabel: 'Spock', message: 'Research complete: React 19 Server Components recommended.' },
  { time: '22:33', agent: 'tuvok', agentLabel: 'Tuvok', message: 'Approved PR #84. No security regressions detected.' },
  { time: '22:30', agent: 'obrien', agentLabel: "O'Brien", message: 'Deployed v2.3.1 to staging. Waiting for CI.' },
  { time: '22:28', agent: 'data', agentLabel: 'Data', message: 'Resolved database migration conflict on users table.' },
  { time: '22:25', agent: 'jane', agentLabel: 'Jane', message: 'Morning triage complete. 3 tickets queued.' },
];

// Infrastructure services
const INFRA_SERVICES = [
  { name: 'Redis 7', detail: ':6379 • Message Queue', status: 'healthy' as const },
  { name: 'PostgreSQL 16', detail: ':5432 • Agent Memory', status: 'healthy' as const },
  { name: 'ChromaDB', detail: ':8000 • Vector / RAG', status: 'healthy' as const },
  { name: 'n8n', detail: ':5678 • Webhooks', status: 'healthy' as const },
  { name: 'LangFuse', detail: ':3000 • Tracing', status: 'healthy' as const },
  { name: 'Vite Dashboard', detail: ':5173 • This UI', status: 'healthy' as const },
];

const FactoryFloor: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isTerminalExpanded, setIsTerminalExpanded] = useState(false);

  const [liveAgents, setLiveAgents] = useState(INITIAL_AGENTS.map(a => ({...a, room: a.role === 'PM / Triage' ? 0 : a.role === 'Auto-Research' ? 1 : a.role === 'Junior Dev' || a.role === 'Sr. Architect' ? 2 : a.role === 'QA Reviewer' ? 3 : a.role === 'SRE / Deploy' ? 5 : 1})));
  const [liveLogs, setLiveLogs] = useState(SIMULATED_LOGS);
  const [workItems, setWorkItems] = useState<{id: string, name: string, room: number, color: string}[]>([]);
  const [completedItems, setCompletedItems] = useState<any[]>([]);
  const [showCompletedModal, setShowCompletedModal] = useState(false);

  const triggerSimulation = async () => {
    try {
      await fetch('http://localhost:4401/api/telemetry/simulate', { method: 'POST' });
    } catch(e) { console.error('Sim Error', e); }
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const sse = new EventSource('http://localhost:4401/api/telemetry/stream');
    sse.onmessage = (e) => {
        try {
            const state = JSON.parse(e.data);
            if (state.agents) setLiveAgents(state.agents);
            if (state.logs) setLiveLogs(state.logs);
            if (state.workItems) setWorkItems(state.workItems);
            if (state.completedItems) setCompletedItems(state.completedItems);
        } catch (err) { console.error('SSE Error:', err); }
    };
    return () => { clearInterval(timer); sse.close(); };
  }, []);

  const rooms: (Room & { workItems: any[] })[] = [
    { title: 'Backlog / Triage', icon: '📋', agents: liveAgents.filter(a => a.room === 0), workItems: workItems.filter(w => w.room === 0) },
    { title: 'Research Lab', icon: '🔬', agents: liveAgents.filter(a => a.room === 1), workItems: workItems.filter(w => w.room === 1) },
    { title: 'Build Sandbox', icon: '🔨', agents: liveAgents.filter(a => a.room === 2), workItems: workItems.filter(w => w.room === 2) },
    { title: 'Testing / QA', icon: '🧪', agents: liveAgents.filter(a => a.room === 3), workItems: workItems.filter(w => w.room === 3) },
    { title: 'Code Review', icon: '🔎', agents: liveAgents.filter(a => a.room === 4), workItems: workItems.filter(w => w.room === 4) },
    { title: 'Ship / Deploy', icon: '🚀', agents: liveAgents.filter(a => a.room === 5), workItems: workItems.filter(w => w.room === 5) },
  ];

  const totalAgents = liveAgents.length;
  const activeAgents = liveAgents.filter(a => a.status === 'working').length;
  const skillCount = 47; // Will be live from PostgreSQL

  return (
    <div className="fade-in" id="factory-floor-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Live Pipeline</h1>
          <p className="page-subtitle">
            {currentTime.toLocaleTimeString('en-US', { hour12: false })} IST • Factory Floor Telemetry
          </p>
        </div>
        <div className="header-badge badge-online">
          <span className="badge-dot" />
          All Systems Online
        </div>
      </div>

      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="glass-panel stat-card" id="stat-agents">
          <div className="stat-icon purple">👥</div>
          <div className="stat-data">
            <span className="stat-value">{totalAgents}</span>
            <span className="stat-label">Agents Online</span>
          </div>
        </div>
        <div className="glass-panel stat-card" id="stat-active">
          <div className="stat-icon blue">⚡</div>
          <div className="stat-data">
            <span className="stat-value">{activeAgents}</span>
            <span className="stat-label">Currently Working</span>
          </div>
        </div>
        <div className="glass-panel stat-card" id="stat-skills">
          <div className="stat-icon green">🧠</div>
          <div className="stat-data">
            <span className="stat-value">{skillCount}</span>
            <span className="stat-label">Skills Learned</span>
          </div>
        </div>
        <div className="glass-panel stat-card" id="stat-infra">
          <div className="stat-icon amber">🏗️</div>
          <div className="stat-data">
            <span className="stat-value">{INFRA_SERVICES.length}</span>
            <span className="stat-label">Services Running</span>
          </div>
        </div>
      </div>

      {/* Factory Floor Grid */}
      <div className="factory-grid" id="factory-grid">
        {rooms.map((room, idx) => (
          <div key={idx} className="glass-panel factory-room" id={`room-${idx}`}>
            <div className="room-header">
              <span className="room-title">{room.title}</span>
              <span className="room-count">{room.agents.length}</span>
            </div>
            <div className="agents-area">
              {room.agents.map((agent) => (
                <motion.div 
                  layoutId={`agent-${agent.id}`} 
                  key={agent.id} 
                  className="agent-sprite" 
                  title={`${agent.name} — ${agent.role} (${agent.model})`} 
                  transition={{ type: "spring", stiffness: 80, damping: 12, mass: 1 }}
                  whileHover={{ scale: 1.1, rotate: 2 }}
                >
                  <motion.div 
                    className="agent-avatar"
                    animate={agent.status === 'working' ? {
                      boxShadow: ['0px 0px 0px rgba(0,0,0,0)', '0px 0px 15px rgba(251, 146, 60, 0.8)', '0px 0px 0px rgba(0,0,0,0)'],
                      scale: [1, 1.05, 1],
                    } : {}}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <img 
                      src={`https://api.dicebear.com/9.x/${agent.role.includes('SRE') ? 'bottts' : 'pixel-art'}/svg?seed=${agent.name}`} 
                      alt={agent.name} 
                      style={{ width: '64px', height: '64px', imageRendering: 'pixelated' }} 
                    />
                    <span className={`agent-status-indicator ${agent.status}`} />
                  </motion.div>
                  <span className="agent-name">{agent.name}</span>
                  <span className="agent-role">{agent.role}</span>
                </motion.div>
              ))}

              {room.workItems.map((item) => (
                <motion.div 
                  layoutId={`work-${item.id}`} 
                  key={item.id} 
                  className="work-item-box"
                  transition={{ type: "spring", stiffness: 60, damping: 10, mass: 1 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', marginLeft: '12px' }}
                >
                  <div style={{ padding: '6px 8px', background: `${item.color}20`, border: `1px solid ${item.color}80`, borderRadius: '6px', fontSize: '1.2rem', boxShadow: `0 0 15px ${item.color}30` }}>
                    📦
                  </div>
                  <span style={{ fontSize: '0.6rem', color: item.color, fontWeight: 'bold' }}>{item.id}</span>
                </motion.div>
              ))}
              {room.agents.length === 0 && room.workItems.length === 0 && (
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  — Empty —
                </span>
              )}
            </div>
            <span className="room-icon">{room.icon}</span>
          </div>
        ))}
      </div>

      {/* Bottom Track Conveyor Belt */}
      <div className="pipeline-conveyor-tracker">
        <div className="conveyor-labels">
          <span>Backlog</span>
          <span>Build Sandbox</span>
          <span>QA Testing</span>
          <span>Code Review</span>
          <span>Deploy</span>
        </div>
        <div className="conveyor-stages">
          {[0, 2, 3, 4, 5].map((roomId, stageIdx) => (
            <div key={roomId} className="conveyor-stage-zone">
              {workItems.filter(w => w.room === roomId).map((item, idx) => (
                <motion.div 
                  layoutId={`belt-${item.id}`} 
                  key={item.id} 
                  className="belt-item"
                  transition={{ type: "spring", stiffness: 60, damping: 10, mass: 1 }}
                  style={{ 
                    background: `${item.color}20`, 
                    border: `1px solid ${item.color}`, 
                    boxShadow: `0 0 10px ${item.color}40`,
                    transform: `translateY(${idx * -5}px)`
                  }}
                >
                  <span style={{ fontSize: '1rem' }}>📦</span>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.6rem', color: item.color, fontWeight: 'bold' }}>{item.id}</span>
                    <span style={{ fontSize: '0.45rem', color: 'var(--text-muted)' }}>{item.name}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          ))}
        </div>
        <div className="conveyor-track"></div>
        {/* Shipped Warehouse Button inside the tracker */}
        <button 
          onClick={() => setShowCompletedModal(!showCompletedModal)}
          style={{ position: 'absolute', right: '10px', top: '10px', background: 'var(--accent-primary)', border: 'none', padding: '6px 12px', borderRadius: '4px', color: '#fff', cursor: 'pointer', zIndex: 10 }}
        >
          📦 Shipped ({completedItems.length})
        </button>
      </div>

      {showCompletedModal && (
        <div style={{ position: 'absolute', right: '20px', bottom: '150px', background: 'rgba(15, 20, 35, 0.95)', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '16px', zIndex: 100, backdropFilter: 'blur(10px)', width: '300px', boxShadow: '0 0 30px rgba(0,0,0,0.8)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px', marginBottom: '10px' }}>
            <span style={{ fontWeight: 'bold' }}>Shipped Modules</span>
            <button onClick={() => setShowCompletedModal(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>×</button>
          </div>
          {completedItems.length === 0 ? <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No modules shipped yet.</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
              {completedItems.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: item.color }}>📦</span>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: item.color }}>{item.id}</span>
                      <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{item.name}</span>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.65rem', background: '#34d39922', color: '#34d399', padding: '2px 6px', borderRadius: '10px' }}>{item.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bottom Panels */}
      <div className="bottom-panels">
        {/* Activity Log */}
        <div className={`glass-panel ${isTerminalExpanded ? 'expanded-terminal' : ''}`} id="activity-log">
          <div className="panel-header">
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span className="panel-title">📡 Agent Activity Log</span>
              <button onClick={triggerSimulation} style={{ background: 'var(--accent-primary)', border: 'none', color: '#fff', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem', marginLeft: '10px' }}>
                ▶ Start Demo Pipeline
              </button>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{isTerminalExpanded ? 'Live STDOUT Stream' : 'Awaiting WebSocket'}</span>
              <button 
                onClick={() => setIsTerminalExpanded(!isTerminalExpanded)}
                style={{ background: 'var(--bg-glass-hover)', border: '1px solid var(--border-glass)', color: '#fff', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem' }}
              >
                {isTerminalExpanded ? 'Shrink' : 'Expand Terminal'}
              </button>
            </div>
          </div>
          <div className="panel-body">
            <div className={`log-entries ${isTerminalExpanded ? 'terminal-mode' : ''}`}>
              <AnimatePresence initial={false}>
              {liveLogs.map((log, idx) => (
                <motion.div 
                  key={log.time + log.message + idx} 
                  className="log-entry"
                  initial={{ opacity: 0, x: -20, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="log-time">{log.time}</span>
                  <span className={`log-agent ${log.agent}`}>{log.agentLabel}</span>
                  <span className="log-message">{log.message}</span>
                </motion.div>
              ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Infrastructure Health */}
        <div className="glass-panel" id="infra-health">
          <div className="panel-header">
            <span className="panel-title">🏗️ Infrastructure Health</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--status-online)' }}>All Healthy</span>
          </div>
          <div className="panel-body">
            <div className="infra-grid">
              {INFRA_SERVICES.map((svc, idx) => (
                <div key={idx} className="infra-item">
                  <span className={`infra-dot ${svc.status}`} />
                  <div className="infra-info">
                    <span className="infra-name">{svc.name}</span>
                    <span className="infra-detail">{svc.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FactoryFloor;
