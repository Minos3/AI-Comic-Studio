import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppView, Project } from '@/types';
import Sidebar from '@/components/Sidebar';
import Home from '@/components/views/Home';
import ScriptCreate from '@/components/views/ScriptCreate';
import ScriptBreakdown from '@/components/views/ScriptBreakdown';
import AssetManager from '@/components/views/AssetManager';
import ItemManager from '@/components/views/ItemManager';
import SceneManager from '@/components/views/SceneManager';
import CreatureManager from '@/components/views/CreatureManager';
import CreationTasks from '@/components/views/CreationTasks';
import LoginPage from './features/auth/LoginPage';
import AppLayout from './components/layout/AppLayout';
import AdminLayout from './components/layout/AdminLayout';
import UserManagementPage from './features/admin/UserManagementPage';
import TemplateManagementPage from './features/admin/TemplateManagementPage';
import ModelManagementPage from './features/admin/ModelManagementPage';
import { useAuthStore } from './features/auth/useAuthStore';

// Legacy workspace wrapping existing views with sidebar
const LegacyWorkspace: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.CREATION_TASKS);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleProjectUpdated = (project: Project) => {
    setSelectedProject(project);
  };

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
        return <AssetManager type={currentView} projectId={selectedProject?.id} />;
      case AppView.ASSETS_ITEMS:
        return <ItemManager projectId={selectedProject?.id} />;
      case AppView.ASSETS_IMAGES:
        return <SceneManager projectId={selectedProject?.id} />;
      case AppView.ASSETS_GENERAL:
        return <CreatureManager projectId={selectedProject?.id} />;
      case AppView.ASSETS_VIDEO:
      case AppView.ASSETS_OFFICIAL:
        return <AssetManager type={currentView} projectId={selectedProject?.id} />;
      case AppView.CREATION_TASKS:
        return <CreationTasks project={selectedProject} onProjectUpdated={handleProjectUpdated} />;
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

const App: React.FC = () => {
  const token = useAuthStore((s) => s.token);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/" replace /> : <LoginPage />} />

        {/* Admin routes with shared sidebar layout */}
        <Route element={<AppLayout requireAdmin />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/users" element={<UserManagementPage />} />
            <Route path="/admin/templates" element={<TemplateManagementPage />} />
            <Route path="/admin/models" element={<ModelManagementPage />} />
            <Route path="/admin" element={<UserManagementPage />} />
          </Route>
        </Route>

        {/* Protected routes */}
        <Route element={<AppLayout />}>
          <Route path="/*" element={<LegacyWorkspace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
