import React, { useState } from 'react';
import { Project } from '../../types';

interface HomeProps {
  onSelectProject: (project: Project) => void;
}

const Home: React.FC<HomeProps> = ({ onSelectProject }) => {
  const [projects, setProjects] = useState<Project[]>([
    { id: '1', name: '仙人夫君', scripts: ['仙人夫君_ep1.docx', '仙人夫君_ep2.docx'], remark: '第一季动画制作', createDate: '2024-05-10', status: 'In Progress' },
    { id: '2', name: '赛博侦探实录', scripts: ['cyber_detective.txt'], remark: '测试Sora风格', createDate: '2024-05-12', status: 'Draft' },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // State for the form
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [remark, setRemark] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [existingScripts, setExistingScripts] = useState<string[]>([]);

  const resetForm = () => {
    setCurrentId(null);
    setName('');
    setRemark('');
    setUploadedFiles([]);
    setExistingScripts([]);
    setIsEditing(false);
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation(); // Prevent card click
    setCurrentId(project.id);
    setName(project.name);
    setRemark(project.remark);
    setExistingScripts([...project.scripts]);
    setUploadedFiles([]);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    // Combine existing script names with new file names
    const newFileNames = uploadedFiles.map(f => f.name);
    const finalScripts = [...existingScripts, ...newFileNames];

    if (finalScripts.length === 0) {
      alert("请至少上传一个剧本");
      return;
    }

    if (isEditing && currentId) {
      // Update existing project
      setProjects(projects.map(p => 
        p.id === currentId 
          ? { ...p, name, remark, scripts: finalScripts } 
          : p
      ));
    } else {
      // Create new project
      const project: Project = {
        id: Date.now().toString(),
        name,
        scripts: finalScripts,
        remark,
        createDate: new Date().toLocaleDateString(),
        status: 'Draft'
      };
      setProjects([project, ...projects]);
    }

    setShowModal(false);
    resetForm();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const removeUploadedFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingScript = (index: number) => {
    setExistingScripts(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-[#050b14] p-8 text-slate-200 font-sans relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-primary/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <span className="font-bold text-white text-lg">AI</span>
              </div>
              <h1 className="text-3xl font-bold text-white">Comic Studio</h1>
            </div>
            <p className="text-slate-400">选择一个项目开始创作，或创建新项目</p>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 mr-4 text-sm text-slate-400">
               <span className="w-2 h-2 rounded-full bg-green-500"></span>
               {projects.length} 个活跃项目
             </div>
             <button 
                onClick={handleOpenCreate}
                className="bg-primary hover:bg-indigo-500 text-white px-6 py-3 rounded-lg font-medium shadow-lg shadow-primary/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
             >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                新增项目
             </button>
          </div>
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {projects.map((project) => (
            <div 
              key={project.id}
              onClick={() => onSelectProject(project)}
              className="group bg-slate-900/50 border border-slate-800 hover:border-primary/50 rounded-xl p-6 cursor-pointer transition-all hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 backdrop-blur-sm relative"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`px-2.5 py-1 rounded text-xs font-medium border
                  ${project.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                    project.status === 'Completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                    'bg-slate-700/30 text-slate-400 border-slate-600/30'
                  }
                `}>
                  {project.status === 'In Progress' ? '进行中' : project.status === 'Draft' ? '草稿' : '已完成'}
                </div>
                {/* Edit Button */}
                <button 
                  onClick={(e) => handleOpenEdit(e, project)}
                  className="text-slate-500 hover:text-white p-1 hover:bg-slate-800 rounded transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
                  title="修改项目"
                >
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </button>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors truncate">
                {project.name}
              </h3>
              
              <div className="space-y-3 mb-6">
                 <div className="flex items-start gap-2 text-sm text-slate-400 min-h-[40px]">
                   <svg className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                   <div className="flex flex-col">
                     <span className="truncate">{project.scripts[0]}</span>
                     {project.scripts.length > 1 && (
                       <span className="text-xs text-slate-500">+{project.scripts.length - 1} 更多剧本</span>
                     )}
                   </div>
                 </div>
                 <p className="text-sm text-slate-500 line-clamp-2 h-10">
                   {project.remark || '暂无备注'}
                 </p>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>创建于 {project.createDate}</span>
                <span className="group-hover:translate-x-1 transition-transform text-primary flex items-center gap-1">
                  进入项目 
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </span>
              </div>
            </div>
          ))}

          {/* New Project Card Placeholder */}
          <button 
             onClick={handleOpenCreate}
             className="border border-dashed border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center text-slate-500 hover:text-primary hover:border-primary hover:bg-slate-900/50 transition-all cursor-pointer group min-h-[220px]"
          >
             <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
             </div>
             <span className="font-medium">创建新项目</span>
          </button>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-fadeIn flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center shrink-0">
              <h3 className="text-xl font-bold text-white">{isEditing ? '修改项目' : '新建项目'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSave} className="flex flex-col flex-1 min-h-0">
              <div className="p-6 space-y-5 overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">项目名称</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-primary outline-none"
                    placeholder="例如：第一季动画制作"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">上传剧本 (支持多选)</label>
                  
                  {/* File Upload Area */}
                  <div className="relative border border-dashed border-slate-700 bg-slate-800/50 rounded-lg p-6 hover:border-slate-500 transition-colors text-center cursor-pointer group mb-4">
                    <input 
                      type="file" 
                      accept=".txt,.docx"
                      multiple
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex flex-col items-center gap-2 pointer-events-none">
                      <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 group-hover:bg-slate-600 transition-colors">
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      </div>
                      <p className="text-sm text-slate-300 font-medium">点击添加剧本文件</p>
                      <p className="text-xs text-slate-500">支持 .txt, .docx 格式</p>
                    </div>
                  </div>

                  {/* File List */}
                  {(existingScripts.length > 0 || uploadedFiles.length > 0) && (
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {existingScripts.map((scriptName, idx) => (
                        <div key={`existing-${idx}`} className="flex items-center justify-between bg-slate-800 px-3 py-2 rounded border border-slate-700/50">
                           <div className="flex items-center gap-2 overflow-hidden">
                             <span className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/30 shrink-0">已存</span>
                             <span className="text-sm text-slate-300 truncate">{scriptName}</span>
                           </div>
                           <button type="button" onClick={() => removeExistingScript(idx)} className="text-slate-500 hover:text-red-400">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                           </button>
                        </div>
                      ))}
                      {uploadedFiles.map((file, idx) => (
                        <div key={`new-${idx}`} className="flex items-center justify-between bg-slate-800 px-3 py-2 rounded border border-slate-700/50">
                           <div className="flex items-center gap-2 overflow-hidden">
                             <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded border border-green-500/30 shrink-0">新</span>
                             <span className="text-sm text-slate-300 truncate">{file.name}</span>
                             <span className="text-xs text-slate-500">({(file.size / 1024).toFixed(1)} KB)</span>
                           </div>
                           <button type="button" onClick={() => removeUploadedFile(idx)} className="text-slate-500 hover:text-red-400">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                           </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">备注信息 (可选)</label>
                  <textarea 
                    value={remark}
                    onChange={e => setRemark(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-primary outline-none resize-none h-24"
                    placeholder="添加项目描述..."
                  />
                </div>
              </div>

              <div className="p-6 pt-2 border-t border-slate-800 shrink-0">
                <button 
                  type="submit"
                  className="w-full bg-primary hover:bg-indigo-500 text-white py-3 rounded-lg font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                >
                  {isEditing ? '保存修改' : '立即创建'}
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