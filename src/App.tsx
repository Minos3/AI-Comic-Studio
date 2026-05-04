import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import { AppView, Project } from '@/types';
import { api } from './lib/api';
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

// URL segment ↔ AppView mapping
const VIEW_TO_SEGMENT: Record<AppView, string> = {
  [AppView.CREATION_TASKS]: 'tasks',
  [AppView.SCRIPT_BREAKDOWN]: 'script',
  [AppView.SCRIPT_CREATE]: 'create',
  [AppView.ASSETS_CHARACTERS]: 'characters',
  [AppView.ASSETS_ITEMS]: 'items',
  [AppView.ASSETS_IMAGES]: 'scenes',
  [AppView.ASSETS_GENERAL]: 'creatures',
  [AppView.ASSETS_VIDEO]: 'video',
  [AppView.ASSETS_OFFICIAL]: 'official',
  [AppView.HOME]: 'home',
  [AppView.LOGIN]: 'login',
};

const SEGMENT_TO_VIEW: Record<string, AppView> = {};
for (const [view, seg] of Object.entries(VIEW_TO_SEGMENT)) {
  SEGMENT_TO_VIEW[seg] = view as AppView;
}

// Workspace with URL-persisted state
const Workspace: React.FC = () => {
  const { projectId: pid, view: viewSeg } = useParams<{ projectId: string; view: string }>();
  const navigate = useNavigate();
  const projectId = pid ? parseInt(pid, 10) : null;
  const currentView = (viewSeg && SEGMENT_TO_VIEW[viewSeg]) ? SEGMENT_TO_VIEW[viewSeg] : AppView.CREATION_TASKS;

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(!!projectId);

  // Load project from API on mount (survives refresh)
  useEffect(() => {
    if (projectId) {
      setLoading(true);
      api.get(`/projects/${projectId}`)
        .then((res) => {
          if (res.data.success) setSelectedProject(res.data.data);
        })
        .catch(() => navigate('/', { replace: true }))
        .finally(() => setLoading(false));
    } else {
      setSelectedProject(null);
      setLoading(false);
    }
  }, [projectId]);

  const handleChangeView = (view: AppView) => {
    if (projectId) {
      navigate(`/project/${projectId}/${VIEW_TO_SEGMENT[view] || 'tasks'}`, { replace: true });
    }
  };

  const handleSelectProject = (project: Project) => {
    navigate(`/project/${project.id}/tasks`, { replace: true });
  };

  const handleBackToProjects = () => {
    navigate('/', { replace: true });
  };

  const handleProjectUpdated = (project: Project) => {
    setSelectedProject(project);
  };

  if (!projectId) {
    return <Home onSelectProject={handleSelectProject} />;
  }

  if (loading) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-slate-800 border-t-indigo-400 animate-spin" />
          <span className="text-slate-500 text-sm">加载项目...</span>
        </div>
      </div>
    );
  }

  if (!selectedProject) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">项目不存在或无权访问</p>
          <button onClick={handleBackToProjects} className="text-indigo-400 hover:underline text-sm">返回项目列表</button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (currentView) {
      case AppView.SCRIPT_CREATE:
        return <ScriptCreate />;
      case AppView.SCRIPT_BREAKDOWN:
        return <ScriptBreakdown onChangeView={handleChangeView} project={selectedProject} />;
      case AppView.ASSETS_CHARACTERS:
        return <AssetManager type={currentView} projectId={selectedProject.id} />;
      case AppView.ASSETS_ITEMS:
        return <ItemManager projectId={selectedProject.id} />;
      case AppView.ASSETS_IMAGES:
        return <SceneManager projectId={selectedProject.id} />;
      case AppView.ASSETS_GENERAL:
        return <CreatureManager projectId={selectedProject.id} />;
      case AppView.ASSETS_VIDEO:
      case AppView.ASSETS_OFFICIAL:
        return <AssetManager type={currentView} projectId={selectedProject.id} />;
      case AppView.CREATION_TASKS:
      default:
        return <CreationTasks project={selectedProject} onProjectUpdated={handleProjectUpdated} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      <Sidebar
        currentView={currentView}
        onChangeView={handleChangeView}
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

        {/* Admin routes */}
        <Route element={<AppLayout requireAdmin />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/users" element={<UserManagementPage />} />
            <Route path="/admin/templates" element={<TemplateManagementPage />} />
            <Route path="/admin/models" element={<ModelManagementPage />} />
            <Route path="/admin" element={<UserManagementPage />} />
          </Route>
        </Route>

        {/* Workspace with URL-persisted project + view */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomeWrapper />} />
          <Route path="/project/:projectId/:view?" element={<Workspace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

// Wrapper to match the Home props pattern
const HomeWrapper: React.FC = () => {
  const navigate = useNavigate();
  return <Home onSelectProject={(project) => navigate(`/project/${project.id}/tasks`)} />;
};

export default App;
