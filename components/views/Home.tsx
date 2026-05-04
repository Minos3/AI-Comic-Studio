import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Project, StyleTemplateOption } from '../../types';
import { api } from '../../src/lib/api';
import { useAuthStore } from '../../src/features/auth/useAuthStore';

interface HomeProps {
  onSelectProject: (project: Project) => void;
}

// --- Subtle decorative elements ---
const GridBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black_40%,transparent_100%)]" />
    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-indigo-500/5 via-transparent to-transparent rounded-full blur-3xl" />
    <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-gradient-to-tr from-purple-500/5 via-transparent to-transparent rounded-full blur-3xl" />
  </div>
);

// --- Color palette for project card accent bars ---
const accentPalette = [
  'from-indigo-500 to-blue-500',
  'from-purple-500 to-pink-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-cyan-500 to-sky-500',
  'from-rose-500 to-red-500',
  'from-violet-500 to-fuchsia-500',
  'from-lime-500 to-green-500',
];

const getAccent = (id: number) => accentPalette[id % accentPalette.length];

const Home: React.FC<HomeProps> = ({ onSelectProject }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [templates, setTemplates] = useState<StyleTemplateOption[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [remark, setRemark] = useState('');
  const [templateId, setTemplateId] = useState('');
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const resetForm = () => { setCurrentId(null); setName(''); setRemark(''); setTemplateId(''); setIsEditing(false); setError(''); };
  const loadProjects = async () => {
    try { const res = await api.get('/projects'); if (res.data.success) setProjects(res.data.data); } catch { setError('加载失败'); }
  };
  const loadTemplates = async () => {
    try { const res = await api.get('/templates'); if (res.data.success) setTemplates(res.data.data); } catch {}
  };
  const loadData = async () => { setLoading(true); setError(''); try { await Promise.all([loadProjects(), loadTemplates()]); } catch { setError('加载数据失败'); } finally { setLoading(false); } };
  useEffect(() => { loadData(); }, []);

  const handleOpenCreate = () => { resetForm(); setShowModal(true); };
  const handleOpenEdit = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setCurrentId(project.id); setName(project.name); setRemark(project.remark);
    setTemplateId(project.templateId ? String(project.templateId) : ''); setIsEditing(true); setError(''); setShowModal(true);
  };
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); if (!name || !templateId) return; setSaving(true); setError('');
    try {
      if (isEditing && currentId !== null) await api.patch(`/projects/${currentId}`, { name, templateId: Number(templateId), remark });
      else await api.post('/projects', { name, templateId: Number(templateId), remark });
      await loadProjects(); setShowModal(false); resetForm();
    } catch (err: any) { setError(err.response?.data?.error?.message || '保存失败'); } finally { setSaving(false); }
  };
  const handleArchive = async (e: React.MouseEvent, project: Project) => {
    e.stopPropagation(); if (!confirm(`归档「${project.name}」？`)) return;
    try { await api.patch(`/projects/${project.id}`, { status: 'archived' }); await loadProjects(); } catch { setError('归档失败'); }
  };
  const handleDelete = async (e: React.MouseEvent, project: Project) => {
    e.stopPropagation(); if (!confirm(`删除「${project.name}」？此操作不可撤销。`)) return;
    try { await api.delete(`/projects/${project.id}`); await loadProjects(); } catch { setError('删除失败'); }
  };

  const activeCount = projects.filter((p) => p.status === 'active').length;

  return (
    <div className="min-h-screen bg-[#030712] text-slate-200 font-sans relative">
      <GridBackground />

      <div className="relative z-10 max-w-[1440px] mx-auto px-6 sm:px-10 py-10">
        {/* === HEADER === */}
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <p className="text-xs font-mono tracking-[0.3em] text-slate-500 uppercase">Dream AI Studio</p>
            <h1 className="text-4xl font-black tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">我的项目</span>
            </h1>
            <p className="text-slate-500 text-sm max-w-md leading-relaxed">
              {activeCount > 0 ? `${activeCount} 个项目进行中` : '创建你的第一个短剧项目'}
              {activeCount > 0 && <span className="text-slate-700"> — 选择一个继续创作</span>}
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-end">
            {user?.role === 'admin' && (
              <button onClick={() => navigate('/admin')}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl transition-all duration-200">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                后台
              </button>
            )}
            <button onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/10 hover:border-white/20 rounded-xl transition-all duration-200 active:scale-[0.98]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              新建项目
            </button>
          </div>
        </header>

        {/* === ERROR === */}
        {error && !showModal && (
          <div className="mb-8 px-5 py-3 bg-red-500/5 border border-red-500/10 rounded-2xl text-sm text-red-400 flex items-center gap-3">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {error}
          </div>
        )}

        {/* === LOADING === */}
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-10 h-10 rounded-full border-2 border-slate-800" />
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-400 animate-spin" />
              </div>
              <span className="text-sm text-slate-600">加载中</span>
            </div>
          </div>
        ) : (
          /* === PROJECT GRID === */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {projects.map((project) => (
              <article
                key={project.id}
                onClick={() => project.status === 'active' && onSelectProject(project)}
                className={`group relative bg-slate-900/60 backdrop-blur-sm border border-slate-800/80 rounded-2xl overflow-hidden transition-all duration-300 ${
                  project.status === 'active'
                    ? 'cursor-pointer hover:-translate-y-1 hover:border-slate-700 hover:shadow-2xl hover:shadow-black/40'
                    : 'opacity-50 cursor-default'
                }`}
              >
                {/* Colored accent bar at top */}
                <div className={`h-1 bg-gradient-to-r ${getAccent(project.id)}`} />

                <div className="p-5">
                  {/* Top row: status + actions */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                      project.status === 'active' ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/15' :
                      project.status === 'archived' ? 'bg-amber-500/5 text-amber-400 border-amber-500/15' :
                      'bg-red-500/5 text-red-400 border-red-500/15'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        project.status === 'active' ? 'bg-emerald-400' : project.status === 'archived' ? 'bg-amber-400' : 'bg-red-400'
                      }`} />
                      {project.status === 'active' ? '进行中' : project.status === 'archived' ? '已归档' : '已删除'}
                    </span>

                    {/* Actions — visible on hover */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button onClick={(e) => handleOpenEdit(e, project)}
                        className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors" title="编辑">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={(e) => handleArchive(e, project)}
                        className="p-1.5 text-slate-500 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors" title="归档">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8l1 11h12l1-11M9 8V5a1 1 0 011-1h4a1 1 0 011 1v3" /></svg>
                      </button>
                      {user?.role === 'admin' && (
                        <button onClick={(e) => handleDelete(e, project)}
                          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors" title="删除">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16" /></svg>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-white mb-3 truncate group-hover:text-slate-100 transition-colors">
                    {project.name}
                  </h3>

                  {/* Meta */}
                  <div className="space-y-2.5 mb-5">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/15 truncate max-w-[160px]">
                        {project.templateName || '未选模板'}
                      </span>
                    </div>
                    {project.remark ? (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{project.remark}</p>
                    ) : (
                      <p className="text-xs text-slate-700 italic">暂无备注</p>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="text-lg font-bold text-white leading-none">{project.episodeCount}</span>
                        <span className="text-[10px] text-slate-500 mt-0.5">分集</span>
                      </div>
                      <div className="w-px h-8 bg-slate-800" />
                      <div className="text-[10px] text-slate-600 leading-relaxed">
                        {new Date(project.createdAt).toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                    {project.status === 'active' && (
                      <span className="text-xs font-medium text-indigo-400 group-hover:translate-x-0.5 transition-transform duration-200 inline-flex items-center gap-1">
                        进入 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))}

            {/* Create card */}
            <button onClick={handleOpenCreate}
              className="flex flex-col items-center justify-center gap-4 p-6 rounded-2xl border border-dashed border-slate-800 hover:border-slate-600 hover:bg-slate-900/30 transition-all duration-200 cursor-pointer group min-h-[240px] text-slate-500 hover:text-slate-300">
              <div className="w-12 h-12 rounded-xl bg-slate-800/50 group-hover:bg-slate-800 flex items-center justify-center transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
              </div>
              <span className="text-sm font-medium">创建新项目</span>
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && projects.length === 0 && (
          <div className="py-20 text-center">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-slate-800/40 flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
            <h3 className="text-slate-400 font-semibold mb-1">还没有项目</h3>
            <p className="text-slate-600 text-sm mb-6">点击上方「新建项目」开始你的第一个短剧</p>
            <button onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-500/80 hover:bg-indigo-500 rounded-xl transition-all duration-200 active:scale-[0.98]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              创建第一个项目
            </button>
          </div>
        )}
      </div>

      {/* === MODAL === */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className="relative bg-[#0a0f1a] border border-slate-800/80 rounded-2xl w-full max-w-lg shadow-2xl shadow-black/60 overflow-hidden animate-fadeIn">
            {/* Modal header */}
            <div className="px-6 py-5 border-b border-slate-800/60 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">{isEditing ? '编辑项目' : '新建项目'}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{isEditing ? '修改项目信息和风格模板' : '选择一个风格模板开始创作'}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="px-6 py-5 space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">项目名称</label>
                  <input
                    type="text" value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all text-sm"
                    placeholder="给项目取个名字..." required autoFocus />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">风格模板</label>
                  <select
                    value={templateId} onChange={(e) => setTemplateId(e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all text-sm appearance-none cursor-pointer"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%2364748b' viewBox='0 0 16 16'%3E%3Cpath fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center' }}
                    required>
                    <option value="">选择风格模板...</option>
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                  {templateId && (
                    <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                      {templates.find((t) => String(t.id) === templateId)?.description || ''}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">备注</label>
                  <textarea
                    value={remark} onChange={(e) => setRemark(e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all text-sm resize-none h-20"
                    placeholder="项目描述、创作计划..." />
                </div>

                {error && (
                  <div className="px-4 py-3 bg-red-500/5 border border-red-500/10 rounded-xl text-sm text-red-400">{error}</div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-slate-800/60 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors">
                  取消
                </button>
                <button type="submit" disabled={saving}
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-600 rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
                  {saving ? '保存中...' : isEditing ? '保存修改' : '创建项目'}
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
