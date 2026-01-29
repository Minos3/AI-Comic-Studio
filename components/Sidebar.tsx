import React from 'react';
import { AppView, Project } from '../types';

interface SidebarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  project: Project;
  onBackToProjects: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, project, onBackToProjects }) => {
  
  const NavButton = ({ view, label, icon, isHighlighted = false }: { view: AppView; label: string; icon: React.ReactNode; isHighlighted?: boolean }) => {
    const isActive = currentView === view;
    
    return (
      <button
        onClick={() => onChangeView(view)}
        className={`w-full flex flex-col items-center gap-1.5 py-4 transition-all duration-200 group relative
          ${isHighlighted 
            ? 'bg-primary/10 text-primary' 
            : isActive 
              ? 'text-primary' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }
          ${isHighlighted ? 'rounded-2xl mx-auto w-[80%] mb-2' : ''}
        `}
      >
        <span className={`${isActive ? 'text-primary' : 'text-slate-400 group-hover:text-white'}`}>
          {icon}
        </span>
        <span className="text-[11px] font-medium tracking-wide">{label}</span>
        {isActive && !isHighlighted && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-l-full"></div>
        )}
      </button>
    );
  };

  return (
    <div className="w-[100px] h-full bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 z-30 overflow-hidden">
      
      {/* Top Header Section */}
      <div className="pt-6 flex flex-col items-center gap-6 border-b border-slate-800 pb-6">
        <button 
          onClick={onBackToProjects}
          className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
        
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-xs font-bold text-slate-300 px-2 text-center leading-tight">
            {project.name}
          </h1>
        </div>
      </div>

      {/* Navigation Space */}
      <nav className="flex-1 py-4 flex flex-col items-center overflow-y-auto custom-scrollbar">
        
        <NavButton 
          view={AppView.SCRIPT_BREAKDOWN} 
          label="剧本" 
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} 
        />

        <NavButton 
          view={AppView.ASSETS_CHARACTERS} 
          label="角色" 
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>} 
        />
        
        <NavButton 
          view={AppView.ASSETS_ITEMS} 
          label="物品" 
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>} 
        />

        <NavButton 
          view={AppView.ASSETS_IMAGES} 
          label="场景" 
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} 
        />
        
        <NavButton 
          view={AppView.ASSETS_GENERAL} 
          label="生物" 
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} 
        />

        {/* Fragments Highlighted Section */}
        <div className="w-full pt-4 mt-auto">
          <NavButton 
            view={AppView.CREATION_TASKS} 
            label="片段" 
            isHighlighted={true}
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>} 
          />
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;