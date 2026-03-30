import React from 'react';

/* ═══════════════════════════════════════════════════════════
   SKILL MEMORY — Layer 5.5 Visualization
   Shows learned skills stored in PostgreSQL + ChromaDB
   ═══════════════════════════════════════════════════════════ */

interface SkillDocument {
  id: string;
  agent: string;
  agentClass: string;
  ticketType: string;
  techStack: string[];
  problem: string;
  solution: string;
  tokensSaved: number;
  createdAt: string;
}

// Simulated Skill Documents — will be live from PostgreSQL in Sprint 5
const SIMULATED_SKILLS: SkillDocument[] = [
  {
    id: 'sk-001',
    agent: 'Charlie',
    agentClass: 'charlie',
    ticketType: 'css-bug',
    techStack: ['React', 'CSS Grid'],
    problem: 'CSS Grid items overflowing their container on mobile viewports, causing horizontal scroll.',
    solution: 'Added min-width: 0 to all grid children and used minmax(0, 1fr) in grid-template-columns.',
    tokensSaved: 12400,
    createdAt: '2026-03-28',
  },
  {
    id: 'sk-002',
    agent: 'Henry',
    agentClass: 'henry',
    ticketType: 'db-migration',
    techStack: ['PostgreSQL', 'Prisma'],
    problem: 'Migration conflict when adding NOT NULL column to existing users table with 50k rows.',
    solution: 'Used a 3-step migration: add nullable column → backfill with default → alter to NOT NULL.',
    tokensSaved: 18200,
    createdAt: '2026-03-27',
  },
  {
    id: 'sk-003',
    agent: 'Charlie',
    agentClass: 'charlie',
    ticketType: 'api-endpoint',
    techStack: ['Node.js', 'Express', 'Zod'],
    problem: 'API endpoint returning 500 when request body has optional nested object set to null.',
    solution: 'Changed Zod schema from z.object({}).optional() to z.object({}).nullable().optional().',
    tokensSaved: 8700,
    createdAt: '2026-03-26',
  },
  {
    id: 'sk-004',
    agent: 'Ralph',
    agentClass: 'ralph',
    ticketType: 'security-review',
    techStack: ['React', 'Authentication'],
    problem: 'JWT stored in localStorage is vulnerable to XSS attacks.',
    solution: 'Moved JWT to httpOnly cookie with SameSite=Strict and added CSRF token rotation.',
    tokensSaved: 15000,
    createdAt: '2026-03-25',
  },
  {
    id: 'sk-005',
    agent: 'Charlie',
    agentClass: 'charlie',
    ticketType: 'ui-component',
    techStack: ['React', 'TypeScript', 'CSS'],
    problem: 'Modal dialog not trapping focus, allowing tab navigation to background elements.',
    solution: 'Implemented focus trap using useRef for first/last focusable elements with keydown listener.',
    tokensSaved: 9300,
    createdAt: '2026-03-24',
  },
];

const SkillMemory: React.FC = () => {
  const totalTokensSaved = SIMULATED_SKILLS.reduce((sum, s) => sum + s.tokensSaved, 0);
  const estimatedMoneySaved = (totalTokensSaved * 0.000003).toFixed(2); // Rough Gemini pricing

  return (
    <div className="fade-in" id="skill-memory-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Skill Memory</h1>
          <p className="page-subtitle">
            Layer 5.5 — Self-Improving Agent Knowledge Base (PostgreSQL + ChromaDB)
          </p>
        </div>
        <div className="skills-badge" style={{ padding: '6px 14px', fontSize: '0.72rem' }}>
          🧠 {SIMULATED_SKILLS.length} Skills Stored
        </div>
      </div>

      {/* Stats */}
      <div className="stats-bar" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="glass-panel stat-card">
          <div className="stat-icon purple">📚</div>
          <div className="stat-data">
            <span className="stat-value">{SIMULATED_SKILLS.length}</span>
            <span className="stat-label">Total Skills</span>
          </div>
        </div>
        <div className="glass-panel stat-card">
          <div className="stat-icon green">⚡</div>
          <div className="stat-data">
            <span className="stat-value">{(totalTokensSaved / 1000).toFixed(1)}K</span>
            <span className="stat-label">Tokens Saved</span>
          </div>
        </div>
        <div className="glass-panel stat-card">
          <div className="stat-icon amber">💰</div>
          <div className="stat-data">
            <span className="stat-value">${estimatedMoneySaved}</span>
            <span className="stat-label">Est. Cost Saved</span>
          </div>
        </div>
      </div>

      {/* Skill Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Learned Skill Documents
          </span>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
            Simulated • Awaiting Layer 5.5 integration
          </span>
        </div>

        {SIMULATED_SKILLS.map((skill) => (
          <div key={skill.id} className="glass-panel" style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className={`roster-avatar ${skill.agentClass}`} style={{ width: '28px', height: '28px', fontSize: '0.7rem', borderRadius: '6px' }}>
                  {skill.agent[0]}
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{skill.agent}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '8px' }}>{skill.createdAt}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{
                  fontSize: '0.6rem',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '100px',
                  background: 'rgba(99, 102, 241, 0.1)',
                  color: 'var(--accent-secondary)',
                  border: '1px solid rgba(99, 102, 241, 0.15)',
                }}>
                  {skill.ticketType}
                </span>
                <span style={{
                  fontSize: '0.6rem',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '100px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  color: 'var(--status-online)',
                  border: '1px solid rgba(16, 185, 129, 0.15)',
                }}>
                  ~{(skill.tokensSaved / 1000).toFixed(1)}K tokens saved
                </span>
              </div>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--status-error)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Problem
              </span>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
                {skill.problem}
              </p>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--status-online)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Solution
              </span>
              <p style={{
                fontSize: '0.82rem',
                color: 'var(--text-primary)',
                marginTop: '4px',
                lineHeight: 1.5,
                padding: '8px 12px',
                background: 'rgba(16, 185, 129, 0.04)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(16, 185, 129, 0.08)',
                fontFamily: 'var(--font-mono)',
              }}>
                {skill.solution}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {skill.techStack.map((tech, idx) => (
                <span key={idx} style={{
                  fontSize: '0.6rem',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-mono)',
                }}>
                  {tech}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillMemory;
