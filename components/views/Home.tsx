import React, { useState, useRef } from 'react';
import { Project, ProjectPreferences } from '../../types';

interface HomeProps {
  onSelectProject: (project: Project) => void;
}

const DEFAULT_PREFERENCES: ProjectPreferences = {
  imageModel: 'NanoBananaPro',
  videoModel: 'sora-2',
  textModel: 'gemini-3.0-pro',
  artStyle: '真人写实',
  videoRatio: '横屏 16:9',
};

const Home: React.FC<HomeProps> = ({ onSelectProject }) => {
  const [projects, setProjects] = useState<Project[]>([
    { 
      id: '1', 
      name: '仙人夫君', 
      scripts: ['仙人夫君_ep1.docx', '仙人夫君_ep2.docx'], 
      remark: '第一季动画制作', 
      description: '这是一个关于长生者下山后的故事。',
      createDate: '2024-05-10', 
      status: 'In Progress',
      preferences: { ...DEFAULT_PREFERENCES }
    },
    { 
      id: '2', 
      name: '赛博侦探实录', 
      scripts: ['cyber_detective.txt'], 
      remark: '测试Sora风格', 
      createDate: '2024-05-12', 
      status: 'Draft',
      preferences: { ...DEFAULT_PREFERENCES }
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form State
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [preferences, setPreferences] = useState<ProjectPreferences>(DEFAULT_PREFERENCES);
  const [existingScripts, setExistingScripts] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setCurrentId(null);
    setName('');
    setDescription('');
    setPreferences(DEFAULT_PREFERENCES);
    setExistingScripts([]);
    setIsEditing(false);
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setCurrentId(project.id);
    setName(project.name);
    setDescription(project.description || '');
    setPreferences(project.preferences || DEFAULT_PREFERENCES);
    setExistingScripts([...project.scripts]);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(f => f.name);
      setExistingScripts(prev => [...prev, ...newFiles]);
    }
  };

  const removeScript = (index: number) => {
    setExistingScripts(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const projectData: Partial<Project> = {
      name,
      description,
      scripts: existingScripts,
      remark: description.substring(0, 50),
      preferences,
    };

    if (isEditing && currentId) {
      setProjects(projects.map(p => 
        p.id === currentId ? { ...p, ...projectData } as Project : p
      ));
    } else {
      const newProject: Project = {
        id: Date.now().toString(),
        name,
        scripts: existingScripts,
        remark: description.substring(0, 50),
        description,
        createDate: new Date().toLocaleDateString(),
        status: 'Draft',
        preferences,
      };
      setProjects([newProject, ...projects]);
    }

    setShowModal(false);
    resetForm();
  };

  const PrefSelect = ({ label, sub, value, options, onChange }: { label: string, sub: string, value: string, options: string[], onChange: (v: string) => void }) => (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col gap-1.5 shadow-inner transition-colors hover:border-slate-700">
      <div className="flex flex-col">
        <span className="text-[12px] font-bold text-slate-200">{label}</span>
        <span className="text-[10px] text-slate-500">{sub}</span>
      </div>
      <div className="relative">
        <select 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-400 outline-none focus:border-primary appearance-none cursor-pointer"
        >
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050b14] p-8 text-slate-200 font-sans relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-primary/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <span className="font-bold text-white text-lg">AI</span>
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">梦境AI短剧平台</h1>
            </div>
            <p className="text-slate-400">选择一个项目开始创作，或创建新项目</p>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 mr-4 text-sm text-slate-400">
               <span className="w-2 h-2 rounded-full bg-green-500"></span>
               {projects.length} 个活跃项目
             </div>
             <button onClick={handleOpenCreate} className="bg-primary hover:bg-indigo-500 text-white px-6 py-3 rounded-lg font-medium shadow-lg shadow-primary/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                新增项目
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {projects.map((project) => (
            <div key={project.id} onClick={() => onSelectProject(project)} className="group bg-slate-900/50 border border-slate-800 hover:border-primary/50 rounded-xl p-6 cursor-pointer transition-all hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 backdrop-blur-sm relative">
              <div className="flex justify-between items-start mb-4">
                <div className={`px-2.5 py-1 rounded text-xs font-medium border ${project.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : project.status === 'Completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-slate-700/30 text-slate-400 border-slate-600/30'}`}>
                  {project.status === 'In Progress' ? '进行中' : project.status === 'Draft' ? '草稿' : '已完成'}
                </div>
                <button onClick={(e) => handleOpenEdit(e, project)} className="text-slate-500 hover:text-white p-1 hover:bg-slate-800 rounded transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002-2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
              </div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors truncate">{project.name}</h3>
              <div className="space-y-3 mb-6">
                 <div className="flex items-start gap-2 text-sm text-slate-400 min-h-[40px]">
                   <svg className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                   <div className="flex flex-col"><span className="truncate">{project.scripts[0]}</span>{project.scripts.length > 1 && <span className="text-xs text-slate-500">+{project.scripts.length - 1} 更多剧本</span>}</div>
                 </div>
                 <p className="text-sm text-slate-500 line-clamp-2 h-10">{project.description || project.remark || '暂无备注'}</p>
              </div>
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>创建于 {project.createDate}</span>
                <span className="group-hover:translate-x-1 transition-transform text-primary flex items-center gap-1">进入项目 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></span>
              </div>
            </div>
          ))}

          <button onClick={handleOpenCreate} className="border border-dashed border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center text-slate-500 hover:text-primary hover:border-primary hover:bg-slate-900/50 transition-all cursor-pointer group min-h-[220px]">
             <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
             </div>
             <span className="font-medium">创建新项目</span>
          </button>
        </div>
      </div>

      {/* --- Detailed Create/Edit Modal (Dark Style) --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-[#0b0f1a] w-full max-w-[1000px] rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-fadeIn flex flex-col max-h-[95vh] text-slate-200 border border-slate-800">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-slate-800 flex justify-between items-center bg-[#0b0f1a] sticky top-0 z-10">
              <h3 className="text-xl font-bold text-white tracking-tight">{isEditing ? '编辑项目' : '创建项目'}</h3>
              <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-500 transition-all hover:text-white">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-10 bg-[#05080f] custom-scrollbar items-start">
              
              {/* Left Column: Basic Info */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-slate-400">项目名称 <span className="text-red-500">*</span></label>
                    <span className="text-[11px] text-slate-600 font-mono">{name.length} / 100</span>
                  </div>
                  <div className="relative group">
                    <input 
                      type="text" 
                      value={name}
                      onChange={e => setName(e.target.value)}
                      maxLength={100}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                      placeholder="例如：真假千金：本宫在豪门"
                      required
                    />
                    {name && (
                      <button onClick={() => setName('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400">
                         <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-slate-400">项目描述</label>
                    <span className="text-[11px] text-slate-600 font-mono">{description.length} / 2000</span>
                  </div>
                  <textarea 
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    maxLength={2000}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-300 focus:ring-1 focus:ring-primary/50 focus:border-primary outline-none transition-all h-20 resize-none leading-relaxed"
                    placeholder="请输入项目描述（可选）"
                  />
                </div>

                {/* Script Files Management Section */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-slate-400">剧本文件 ({existingScripts.length})</label>
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs text-primary hover:text-indigo-400 flex items-center gap-1 font-bold transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      上传剧本
                    </button>
                    <input 
                      type="file" 
                      multiple 
                      className="hidden" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload}
                      accept=".txt,.doc,.docx,.pdf"
                    />
                  </div>
                  <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-2.5 space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar">
                    {existingScripts.length > 0 ? (
                      existingScripts.map((script, idx) => (
                        <div key={idx} className="flex items-center justify-between py-1.5 px-3 bg-slate-900 border border-slate-800/50 rounded-lg group">
                          <div className="flex items-center gap-2 min-w-0">
                             <svg className="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                             <span className="text-[11px] text-slate-300 truncate">{script}</span>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => removeScript(idx)}
                            className="text-slate-600 hover:text-red-400 p-0.5 opacity-0 group-hover:opacity-100 transition-all"
                          >
                             <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="py-4 text-center text-slate-600 text-xs italic">尚未上传任何剧本</div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400">项目封面</label>
                  <div className="border-2 border-dashed border-slate-800 bg-slate-900/30 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 group cursor-pointer hover:border-primary/50 transition-all relative">
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                    <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:scale-105 transition-transform shadow-inner">
                      <svg className="w-6 h-6 text-slate-600 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    </div>
                    <div className="text-center">
                      <p className="text-[11px] font-bold text-slate-500 group-hover:text-slate-300">点击上传封面</p>
                      <p className="text-[9px] text-slate-600 mt-0.5 uppercase tracking-widest font-mono">JPG/PNG/WEBP MAX 5MB</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Global Preferences - Optimized Spacing */}
              <div className="bg-[#0b0f1a]/80 border border-slate-800 rounded-[2rem] p-6 space-y-5 shadow-2xl relative overflow-hidden lg:mt-0">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                <h4 className="text-base font-black text-white flex items-center gap-2 tracking-tight">
                  <span className="w-1.5 h-5 bg-primary rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]"></span>
                  全局生成偏好
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <PrefSelect 
                    label="默认图片模型" sub="首选生图模型。" 
                    value={preferences.imageModel} options={['NanoBananaPro', '即梦4.5', '即梦5.0']} 
                    onChange={v => setPreferences({...preferences, imageModel: v})}
                  />
                  <PrefSelect 
                    label="默认视频模型" sub="分镜生成视频默认。" 
                    value={preferences.videoModel} options={['sora-2', 'Seedance2.0', 'VEO']} 
                    onChange={v => setPreferences({...preferences, videoModel: v})}
                  />
                  <PrefSelect 
                    label="默认文字模型" sub="文案生成默认。" 
                    value={preferences.textModel} options={['gemini-3.0-pro', 'gemini-3.0-flash']} 
                    onChange={v => setPreferences({...preferences, textModel: v})}
                  />
                  <PrefSelect 
                    label="默认画风" sub="统一视觉风格。" 
                    value={preferences.artStyle} options={['真人写实', '日漫风', '3D大片', '赛博朋克']} 
                    onChange={v => setPreferences({...preferences, artStyle: v})}
                  />
                  <div className="col-span-1 sm:col-span-2">
                    <PrefSelect 
                      label="导出视频比例" sub="视频与动效默认比例。" 
                      value={preferences.videoRatio} options={['横屏 16:9', '竖屏 9:16', '电影 2.35:1']} 
                      onChange={v => setPreferences({...preferences, videoRatio: v})}
                    />
                  </div>
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="col-span-1 lg:col-span-2 pt-4 mt-2 border-t border-slate-800 flex justify-end gap-3 sticky bottom-0 bg-[#05080f] pb-2 z-20">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2.5 text-slate-500 font-bold hover:text-white transition-colors text-sm">取消</button>
                <button type="submit" className="px-10 py-2.5 bg-primary hover:bg-indigo-500 text-white font-black text-xs tracking-widest rounded-xl shadow-xl shadow-primary/20 transition-all active:scale-[0.98] uppercase">
                  确认{isEditing ? '保存' : '创建'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;