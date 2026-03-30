import { useState } from 'react';
import './index.css';
import Sidebar from './components/Sidebar';
import FactoryFloor from './components/FactoryFloor';
import SkillMemory from './components/SkillMemory';
import SystemResources from './components/SystemResources';
import AdminConfig from './components/AdminConfig';

type Page = 'factory' | 'settings' | 'skills' | 'system';

function App() {
  const [activePage, setActivePage] = useState<Page>('factory');

  const renderPage = () => {
    switch (activePage) {
      case 'factory':
        return <FactoryFloor />;
      case 'skills':
        return <SkillMemory />;
      case 'system':
        return <SystemResources />;
      case 'settings':
        return <AdminConfig />;
      default:
        return <FactoryFloor />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
