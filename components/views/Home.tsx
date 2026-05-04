import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Project, StyleTemplateOption } from '../../types';
import { api } from '../../src/lib/api';
import { useAuthStore } from '../../src/features/auth/useAuthStore';

interface HomeProps {
  onSelectProject: (project: Project) => void;
}

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

  const resetForm = () => {
    setCurrentId(null);
    setName('');
    setRemark('');
    setTemplateId('');
    setIsEditing(false);
    setError('');
  };

  const loadProjects = async () => {
    try {
      const res = await api.get('/projects');
      if (res.data.success) setProjects(res.data.data);
    } catch { setError('加载项目失败'); }
  };

  const loadTemplates = async () => {
    try {
      const res = await api.get('/templates');
      if (res.data.success) setTemplates(res.data.data);
    } catch { /* non-critical */ }
  };

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      await Promise.all([loadProjects(), loadTemplates()]);
    } catch {
      setError('加载数据失败，请刷新重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleOpenCreate = () => { resetForm(); setShowModal(true); };

  const handleOpenEdit = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setCurrentId(project.id);
    setName(project.name);
    setRemark(project.remark);
    setTemplateId(project.templateId ? String(project.templateId) : '');
    setIsEditing(true);
    setError('');
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !templateId) return;
    setSaving(true);
    setError('');
    try {
      if (isEditing && currentId !== null) {
        await api.patch(`/projects/${currentId}`, { name, templateId: Number(templateId), remark });
      } else {
        await api.post('/projects', { name, templateId: Number(templateId), remark });
      }
      await loadProjects();
      setShowModal(false);
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    if (!confirm(`确定归档项目「${project.name}」吗？`)) return;
    try {
      await api.patch(`/projects/${project.id}`, { status: 'archived' });
      await loadProjects();
    } catch { setError('归档失败'); }
  };

  const handleDelete = async (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    if (!confirm(`确定删除项目「${project.name}」吗？`)) return;
    try {
      await api.delete(`/projects/${project.id}`);
      await loadProjects();
    } catch { setError('删除失败'); }
  };

  const statusBadge = (status: Project['status']) => {
    const map = {
      active: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      archived: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      deleted: 'bg-red-500/10 text-red-400 border-red-500/20',
    };
    const labels = { active: '进行中', archived: '已归档', deleted: '已删除' };
    return (
      <span className={`px-2.5 py-1 rounded text-xs font-medium border ${map[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#050b14] p-8 text-slate-200 font-sans relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[100px]" />
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
            {user?.role === 'admin' && (
              <button
                onClick={() => navigate('/admin')}
                className="text-slate-400 hover:text-white px-4 py-3 rounded-lg border border-slate-700 hover:border-slate-500 transition-all text-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                后台管理
              </button>
            )}
            <div className="flex items-center gap-2 mr-4 text-sm text-slate-400">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              {projects.length} 个项目
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

        {error && !showModal && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
              <span className="text-slate-500 text-sm">加载项目中...</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => onSelectProject(project)}
                className="group bg-slate-900/50 border border-slate-800 hover:border-primary/50 rounded-xl p-6 cursor-pointer transition-all hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 backdrop-blur-sm relative"
              >
                <div className="flex justify-between items-start mb-4">
                  {statusBadge(project.status)}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={(e) => handleOpenEdit(e, project)} className="text-slate-500 hover:text-white p-1 hover:bg-slate-800 rounded" title="编辑">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={(e) => handleArchive(e, project)} className="text-slate-500 hover:text-yellow-300 p-1 hover:bg-slate-800 rounded" title="归档">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8l1 11h12l1-11M9 8V5a1 1 0 011-1h4a1 1 0 011 1v3" /></svg>
                    </button>
                    {user?.role === 'admin' && (
                      <button onClick={(e) => handleDelete(e, project)} className="text-slate-500 hover:text-red-400 p-1 hover:bg-slate-800 rounded" title="删除">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16" /></svg>
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors truncate">{project.name}</h3>

                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-2 text-sm text-slate-400 min-h-[40px]">
                    <svg className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h8m-8 4h6M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" /></svg>
                    <div className="flex flex-col">
                      <span className="truncate">{project.templateName || '未选择模板'}</span>
                      <span className="text-xs text-slate-500">已创建 {project.episodeCount} 个分集</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-2 h-10">{project.remark || '暂无备注'}</p>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <span>创建于 {new Date(project.createdAt).toLocaleDateString()}</span>
                  <span className="group-hover:translate-x-1 transition-transform text-primary flex items-center gap-1">
                    进入项目
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </span>
                </div>
              </div>
            ))}

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
        )}

        {!loading && projects.length === 0 && (
          <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900/40 px-6 py-10 text-center text-slate-500">
            还没有项目，点击"新增项目"开始创作
          </div>
        )}
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
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-primary outline-none"
                    placeholder="例如：第一季动画制作" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">风格模板</label>
                  <div className="relative">
                    <select value={templateId} onChange={(e) => setTemplateId(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-primary outline-none appearance-none" required>
                      <option value="">请选择风格模板</option>
                      {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                  {templateId && (
                    <p className="mt-2 text-xs text-slate-500">
                      {templates.find((t) => String(t.id) === templateId)?.description || '已选择模板'}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">备注 (可选)</label>
                  <textarea value={remark} onChange={(e) => setRemark(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-primary outline-none resize-none h-24"
                    placeholder="添加项目描述..." />
                </div>
                {error && <p className="text-sm text-red-400">{error}</p>}
              </div>
              <div className="p-6 pt-2 border-t border-slate-800 shrink-0">
                <button type="submit" disabled={saving}
                  className="w-full bg-primary hover:bg-indigo-500 text-white py-3 rounded-lg font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-60">
                  {saving ? '保存中...' : isEditing ? '保存修改' : '立即创建'}
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
