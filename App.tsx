import React, { useState } from 'react';
import { AppView, Project } from './types';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Home from './components/views/Home';
import ScriptCreate from './components/views/ScriptCreate';
import ScriptBreakdown from './components/views/ScriptBreakdown';
import AssetManager from './components/views/AssetManager';
import CreationTasks from './components/views/CreationTasks';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>(AppView.CREATION_TASKS); // Set default for ease of testing
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  // Handle exiting the project back to the list
  const handleBackToProjects = () => {
    setSelectedProject(null);
  };

  const renderContent = () => {
    switch (currentView) {
      // Note: AppView.HOME is now effectively replaced by the project selection state
      // inside the App component, but we keep the view enum for sidebar navigation.
      case AppView.HOME: 
         // If a user clicks "Home" inside a project, we could show a project dashboard 
         // or redirect to script breakdown. For now, let's default to Script Breakdown.
         return <ScriptBreakdown onChangeView={setCurrentView} />;
      case AppView.SCRIPT_CREATE:
        return <ScriptCreate />;
      case AppView.SCRIPT_BREAKDOWN:
        return <ScriptBreakdown onChangeView={setCurrentView} />;
      case AppView.ASSETS_IMAGES:
      case AppView.ASSETS_VIDEO:
      case AppView.ASSETS_GENERAL:
      case AppView.ASSETS_OFFICIAL:
        return <AssetManager type={currentView} />;
      case AppView.CREATION_TASKS:
        return <CreationTasks />;
      default:
        return <ScriptBreakdown onChangeView={setCurrentView} />;
    }
  };

  // If no project is selected, show the Project Hub (Home)
  if (!selectedProject) {
    return (
      <Home 
        onSelectProject={(project) => {
          setSelectedProject(project);
          setCurrentView(AppView.CREATION_TASKS); // Default view when entering a project to match prototype request
        }} 
      />
    );
  }

  // If project is selected, show the Workspace (Sidebar + Content)
  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        project={selectedProject}
        onBackToProjects={handleBackToProjects}
      />
      <main className="flex-1 overflow-hidden relative bg-[#0f172a]">
        {/* Subtle background glow for main area */}
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-slate-900 to-transparent pointer-events-none" />
        <div className="relative z-10 h-full overflow-y-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;