import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';

interface Template {
  id: number;
  name: string;
  description: string;
  breakdownPrompt: string;
  imagePrompt: string;
  videoPrompt: string;
  createdAt: string;
}

const emptyTemplate = { name: '', description: '', breakdownPrompt: '', imagePrompt: '', videoPrompt: '' };

const TemplateManagementPage: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyTemplate);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState('');

  const loadTemplates = async () => {
    try {
      const res = await api.get('/templates');
      if (res.data.success) setTemplates(res.data.data);
    } catch { /* handled by interceptor */ }
  };

  useEffect(() => { loadTemplates(); }, []);

  const resetForm = () => {
    setForm(emptyTemplate);
    setEditingId(null);
    setShowCreate(false);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await api.patch(`/templates/${editingId}`, form);
      } else {
        await api.post('/templates', form);
      }
      resetForm();
      loadTemplates();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed');
    }
  };

  const handleEdit = (t: Template) => {
    setEditingId(t.id);
    setForm({ name: t.name, description: t.description, breakdownPrompt: t.breakdownPrompt, imagePrompt: t.imagePrompt, videoPrompt: t.videoPrompt });
    setShowCreate(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个模版吗？')) return;
    try {
      await api.delete(`/templates/${id}`);
      loadTemplates();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to delete');
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">样式模版管理</h1>
        <button
          onClick={() => { resetForm(); setShowCreate(!showCreate); }}
          className="px-4 py-2 bg-primary hover:bg-indigo-600 text-white rounded-lg text-sm transition-colors"
        >
          {showCreate ? '取消' : '新建模版'}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleSubmit} className="bg-dark-800 rounded-lg p-6 mb-6 space-y-4">
          <h2 className="text-lg font-semibold text-white mb-2">
            {editingId ? '编辑模版' : '新建模版'}
          </h2>
          <div>
            <label className="block text-sm text-slate-300 mb-1">名称 *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 bg-dark-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-primary"
              placeholder="例如: 现代都市、古装仙侠"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">描述</label>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 bg-dark-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-primary"
              placeholder="简短描述此模版的风格"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">分镜提示词 (Breakdown Prompt)</label>
            <textarea
              value={form.breakdownPrompt}
              onChange={(e) => setForm({ ...form, breakdownPrompt: e.target.value })}
              className="w-full px-3 py-2 bg-dark-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-primary h-24 resize-y font-mono"
              placeholder="AI 分镜拆解的系统提示词..."
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">图片提示词 (Image Prompt)</label>
            <textarea
              value={form.imagePrompt}
              onChange={(e) => setForm({ ...form, imagePrompt: e.target.value })}
              className="w-full px-3 py-2 bg-dark-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-primary h-24 resize-y font-mono"
              placeholder="图片生成的系统提示词..."
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">视频提示词 (Video Prompt)</label>
            <textarea
              value={form.videoPrompt}
              onChange={(e) => setForm({ ...form, videoPrompt: e.target.value })}
              className="w-full px-3 py-2 bg-dark-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-primary h-24 resize-y font-mono"
              placeholder="视频生成的系统提示词..."
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            className="px-6 py-2 bg-primary hover:bg-indigo-600 text-white rounded-lg text-sm transition-colors"
          >
            {editingId ? '保存修改' : '创建模版'}
          </button>
        </form>
      )}

      <div className="bg-dark-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-slate-400">
              <th className="text-left p-3 w-12">ID</th>
              <th className="text-left p-3">名称</th>
              <th className="text-left p-3">描述</th>
              <th className="text-left p-3 w-24">分镜</th>
              <th className="text-left p-3 w-24">图片</th>
              <th className="text-left p-3 w-24">视频</th>
              <th className="text-left p-3 w-32">操作</th>
            </tr>
          </thead>
          <tbody>
            {templates.map((t) => (
              <tr key={t.id} className="border-b border-slate-700/50 text-slate-300 hover:bg-slate-700/30 transition-colors">
                <td className="p-3 text-slate-500">{t.id}</td>
                <td className="p-3 font-medium">{t.name}</td>
                <td className="p-3 text-slate-400 max-w-48 truncate">{t.description}</td>
                <td className="p-3">
                  <span className={`px-1.5 py-0.5 rounded text-xs ${t.breakdownPrompt ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-700/50 text-slate-500'}`}>
                    {t.breakdownPrompt ? '配置' : '未配置'}
                  </span>
                </td>
                <td className="p-3">
                  <span className={`px-1.5 py-0.5 rounded text-xs ${t.imagePrompt ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-700/50 text-slate-500'}`}>
                    {t.imagePrompt ? '配置' : '未配置'}
                  </span>
                </td>
                <td className="p-3">
                  <span className={`px-1.5 py-0.5 rounded text-xs ${t.videoPrompt ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700/50 text-slate-500'}`}>
                    {t.videoPrompt ? '配置' : '未配置'}
                  </span>
                </td>
                <td className="p-3 space-x-2">
                  <button onClick={() => handleEdit(t)} className="text-xs text-primary hover:underline">编辑</button>
                  <button onClick={() => handleDelete(t.id)} className="text-xs text-red-400 hover:underline">删除</button>
                </td>
              </tr>
            ))}
            {templates.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">暂无样式模版，点击"新建模版"创建第一个</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TemplateManagementPage;