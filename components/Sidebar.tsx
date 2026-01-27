import React from 'react';
import { AppView, Project } from '../types';

interface SidebarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  project: Project;
  onBackToProjects: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, project, onBackToProjects }) => {
  
  const NavButton = ({ view, label, icon, isSubItem = false }: { view: AppView; label: string; icon: React.ReactNode; isSubItem?: boolean }) => (
    <button
      onClick={() => onChangeView(view)}
      className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group
        ${currentView === view 
          ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-purple-900/50 font-medium' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }
        ${isSubItem ? 'pl-11 text-sm' : ''}
      `}
    >
      <span className={`${currentView === view ? 'text-white' : 'text-slate-500 group-hover:text-white'}`}>
        {icon}
      </span>
      {label}
    </button>
  );

  const GroupLabel = ({ label }: { label: string }) => (
    <div className="px-4 py-2 mt-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
      {label}
    </div>
  );

  return (
    <div className="w-64 h-full bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 overflow-y-auto">
      {/* Project Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900 sticky top-0 z-10">
        <button 
          onClick={onBackToProjects}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-xs mb-3 transition-colors"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          返回项目列表
        </button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm shrink-0">
             {project.name.substring(0, 1)}
          </div>
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold text-white truncate" title={project.name}>
              {project.name}
            </h1>
            <p className="text-xs text-slate-500 truncate" title={project.scripts.join(', ')}>
              {project.scripts.length > 0 ? `${project.scripts.length} 个剧本` : '无剧本'}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1">
        
        {/* Creation Space */}
        <GroupLabel label="创作空间 (Creation Space)" />
        <NavButton 
          view={AppView.SCRIPT_BREAKDOWN} 
          label="剧本拆分 (Breakdown)" 
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>} 
        />
        <NavButton 
          view={AppView.CREATION_TASKS} 
          label="创作任务 (Tasks)" 
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>} 
        />

        {/* Asset Management */}
        <GroupLabel label="资产管理 (Assets)" />
        <NavButton 
          view={AppView.ASSETS_GENERAL} 
          label="通用素材 (General)" 
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>} 
        />
        <NavButton 
          view={AppView.ASSETS_IMAGES} 
          label="图片素材 (Images)" 
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} 
        />
        <NavButton 
          view={AppView.ASSETS_VIDEO} 
          label="视频素材 (Videos)" 
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>} 
        />
        <NavButton 
          view={AppView.ASSETS_OFFICIAL} 
          label="官方素材 (Official)" 
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} 
        />
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <img src="https://picsum.photos/40/40" alt="User" className="w-9 h-9 rounded-full border border-slate-600" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">Comic Artist</span>
            <span className="text-xs text-slate-500">Pro Plan</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;