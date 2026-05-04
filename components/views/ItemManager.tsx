import React, { useState, useEffect } from 'react';
import { api } from '../../src/lib/api';

interface Item {
  id: number;
  name: string;
  description: string;
  imageUrl: string | null;
}

const ItemManager: React.FC<{ projectId?: number }> = ({ projectId }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Item | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [imgUrl, setImgUrl] = useState('');

  const load = async () => {
    if (!projectId) { setLoading(false); return; }
    try { const r = await api.get(`/projects/${projectId}/items`); if (r.data.success) setItems(r.data.data); } catch {}
    setLoading(false);
  };
  useEffect(() => { load(); }, [projectId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      if (editing) {
        await api.patch(`/items/${editing.id}`, { name, description: desc, imageUrl: imgUrl });
      } else {
        await api.post(`/projects/${projectId}/items`, { name, description: desc, imageUrl: imgUrl });
      }
      setShowNew(false); setEditing(null); setName(''); setDesc(''); setImgUrl(''); load();
    } catch { alert('保存失败'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('删除？')) return;
    await api.delete(`/items/${id}`); load();
  };

  const openEdit = (item: Item) => { setEditing(item); setName(item.name); setDesc(item.description); setImgUrl(item.imageUrl || ''); setShowNew(true); };

  return (
    <div className="h-full flex flex-col bg-[#05080f] text-slate-300 font-sans overflow-hidden">
      <div className="p-4 border-b border-slate-800/50 flex items-center justify-between bg-slate-900/20">
        <h2 className="text-xl font-black text-white">物品资产</h2>
        <button onClick={() => { if (!projectId) return alert('请先选择一个项目'); setEditing(null); setName(''); setDesc(''); setImgUrl(''); setShowNew(true); }}
          className="flex items-center gap-1.5 text-xs font-bold text-white bg-primary px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
          新建物品
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="text-center py-12 text-slate-600">加载中...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800/40 flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            </div>
            <p className="text-slate-500 text-sm">暂无物品</p>
            <p className="text-slate-600 text-xs mt-1">AI 拆解剧本后会自动提取，也可手动创建</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col group hover:border-slate-700 transition-colors">
                <div className="aspect-[16/10] bg-slate-950 flex items-center justify-center overflow-hidden">
                  {item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-cover" alt={item.name} /> : (
                    <svg className="w-12 h-12 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <h5 className="text-sm font-bold text-white truncate">{item.name}</h5>
                    <button onClick={() => openEdit(item)} className="text-slate-500 hover:text-white p-1"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                  </div>
                  <p className="text-[10px] text-slate-500 line-clamp-2">{item.description || '暂无描述'}</p>
                  <button onClick={() => handleDelete(item.id)} className="mt-auto text-[10px] text-red-400 hover:text-red-300 self-start">删除</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showNew && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b0f1a] border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex justify-between"><h3 className="font-bold text-white">{editing ? '编辑' : '新建'}物品</h3><button onClick={() => setShowNew(false)} className="text-slate-400 hover:text-white"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button></div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div><label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">名称</label><input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-primary" required /></div>
              <div><label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">描述</label><textarea value={desc} onChange={(e) => setDesc(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-primary h-24 resize-none" /></div>
              <div><label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">图片URL</label><input value={imgUrl} onChange={(e) => setImgUrl(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-primary" /></div>
              <button type="submit" className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-indigo-600 transition-colors">{editing ? '保存' : '创建'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemManager;
