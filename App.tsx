import React, { useState } from 'react';
import { AppView, Project } from './types.ts';
import Login from './components/Login.tsx';
import Sidebar from './components/Sidebar.tsx';
import Home from './components/views/Home.tsx';
import ScriptCreate from './components/views/ScriptCreate.tsx';
import ScriptBreakdown from './components/views/ScriptBreakdown.tsx';
import AssetManager from './components/views/AssetManager.tsx';
import ItemManager from './components/views/ItemManager.tsx';
import SceneManager from './components/views/SceneManager.tsx';
import CreatureManager from './components/views/CreatureManager.tsx';
import CreationTasks from './components/views/CreationTasks.tsx';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>(AppView.CREATION_TASKS);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  const handleBackToProjects = () => {
    setSelectedProject(null);
  };

  const renderContent = () => {
    switch (currentView) {
      case AppView.HOME: 
         return <ScriptBreakdown onChangeView={setCurrentView} project={selectedProject} />;
      case AppView.SCRIPT_CREATE:
        return <ScriptCreate />;
      case AppView.SCRIPT_BREAKDOWN:
        return <ScriptBreakdown onChangeView={setCurrentView} project={selectedProject} />;
      case AppView.ASSETS_CHARACTERS:
        return <AssetManager type={currentView} />;
      case AppView.ASSETS_ITEMS:
        return <ItemManager />;
      case AppView.ASSETS_IMAGES:
        return <SceneManager />;
      case AppView.ASSETS_GENERAL:
        return <CreatureManager />;
      case AppView.ASSETS_VIDEO:
      case AppView.ASSETS_OFFICIAL:
        return <AssetManager type={currentView} />;
      case AppView.CREATION_TASKS:
        return <CreationTasks />;
      default:
        return <ScriptBreakdown onChangeView={setCurrentView} project={selectedProject} />;
    }
  };

  if (!selectedProject) {
    return (
      <Home 
        onSelectProject={(project) => {
          setSelectedProject(project);
          setCurrentView(AppView.CREATION_TASKS);
        }} 
      />
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        project={selectedProject}
        onBackToProjects={handleBackToProjects}
      />
      <main className="flex-1 overflow-hidden relative bg-[#0f172a]">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-slate-900 to-transparent pointer-events-none" />
        <div className="relative z-10 h-full overflow-y-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;