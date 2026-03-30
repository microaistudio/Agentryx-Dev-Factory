import React from 'react';

type Page = 'factory' | 'settings' | 'skills' | 'system';

interface SidebarProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
}

const navItems: { page: Page; icon: string; label: string }[] = [
  { page: 'factory', icon: '🏭', label: 'Factory Floor' },
  { page: 'skills', icon: '🧠', label: 'Skill Memory' },
  { page: 'system', icon: '📊', label: 'System Resources' },
  { page: 'settings', icon: '⚙️', label: 'Configuration' },
];

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage }) => {
  return (
    <aside className="sidebar" id="sidebar-nav">
      <div className="sidebar-brand">
        <div className="sidebar-brand-inner">
          <div className="brand-icon">PF</div>
          <div className="brand-text">
            <span className="brand-name">Pixel Factory</span>
            <span className="brand-tagline">Autonomous Dev Hub</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <div
            key={item.page}
            id={`nav-${item.page}`}
            className={`nav-item ${activePage === item.page ? 'active' : ''}`}
            onClick={() => setActivePage(item.page)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setActivePage(item.page)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-status">
          <span className="status-dot" />
          <span>5 services online</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
