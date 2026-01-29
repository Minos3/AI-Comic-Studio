import React, { useState } from 'react';

interface Item {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  status: 'pending' | 'generated';
}

const MOCK_ITEMS: Item[] = [
  {
    id: 'i1',
    name: '情趣手铐',
    description: '金属材质，表面镀铬发亮。手铐边缘包裹着一圈蓬松的粉色羽毛，链条短而结实，带有精细的锁芯结构。',
    imageUrl: 'https://picsum.photos/seed/handcuffs/600/400',
    status: 'generated'
  },
  {
    id: 'i2',
    name: '亲子鉴定报告',
    description: '几张A4规格的白纸，顶部印有“南城生物检测中心”字样。纸张边缘略有褶皱，盖有模糊的红色圆形公章...',
    status: 'pending'
  },
  {
    id: 'i3',
    name: '限量款鳄鱼皮包',
    description: '深紫色鳄鱼皮材质，纹理清晰且富有光泽。包身配有纯金色的金属锁扣，走线极其细密，尺寸约30厘米...',
    status: 'pending'
  },
  {
    id: 'i4',
    name: '古董簪子',
    description: '银质胎底，表面有精细的累丝工艺。簪头镶嵌着一颗圆润的珍珠，整体呈现出岁月的氧化感，刻有“南...”',
    status: 'pending'
  }
];

const ItemManager: React.FC = () => {
  const [items, setItems] = useState<Item[]>(MOCK_ITEMS);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [localGeneratingId, setLocalGeneratingId] = useState<string | null>(null);

  const handleManualGenerate = (id: string) => {
    setLocalGeneratingId(id);
    setTimeout(() => {
      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, status: 'generated', imageUrl: `https://picsum.photos/seed/${id}_gen/600/400` } : item
      ));
      setLocalGeneratingId(null);
    }, 2000);
  };

  const handleManualUpload = (id: string) => {
    // In a real app, this would trigger a file picker
    const fakeUrl = `https://picsum.photos/seed/upload_${id}/600/400`;
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, status: 'generated', imageUrl: fakeUrl } : item
    ));
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('确定要删除这个物品资产吗？')) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleOneClickGenerate = () => {
    setIsGeneratingAll(true);
    setTimeout(() => {
      setItems(prev => prev.map(item => ({
        ...item,
        status: 'generated',
        imageUrl: item.imageUrl || `https://picsum.photos/seed/${item.id}_batch/600/400`
      })));
      setIsGeneratingAll(false);
    }, 3000);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setItems(prev => prev.map(i => i.id === editingItem.id ? editingItem : i));
    setEditingItem(null);
  };

  return (
    <div className="h-full flex flex-col bg-[#05080f] text-slate-300 font-sans overflow-hidden">
      
      {/* Top Toolbar */}
      <div className="p-4 border-b border-slate-800/50 flex items-center justify-between bg-slate-900/20">
        <div className="flex gap-4">
          <h2 className="text-xl font-black text-white tracking-tight">物品资产</h2>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleOneClickGenerate}
            disabled={isGeneratingAll}
            className="flex items-center gap-1.5 text-[11px] font-bold text-white bg-primary px-4 py-1.5 rounded-lg shadow-lg shadow-primary/20 hover:brightness-110 transition-all disabled:opacity-50"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            {isGeneratingAll ? '生成中...' : '一键生成'}
          </button>
          <button className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 bg-slate-900 border border-slate-800 px-4 py-1.5 rounded-lg hover:text-white transition-all">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
            切换排序
          </button>
          <button className="flex items-center gap-1.5 text-[11px] font-bold text-white bg-secondary px-4 py-1.5 rounded-lg shadow-lg shadow-secondary/20 hover:brightness-110 transition-all">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
            新建物品
          </button>
        </div>
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map(item => (
            <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col group transition-all hover:border-slate-700">
              {/* Image Area */}
              <div className="relative aspect-[16/10] bg-slate-950 flex items-center justify-center overflow-hidden">
                {item.status === 'generated' ? (
                  <img src={item.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={item.name} />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3 opacity-20">
                     <svg className="w-12 h-12 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                )}
                
                {item.status === 'pending' && (
                  <div className="absolute top-3 left-3">
                    <span className="text-[9px] bg-yellow-500/90 text-black font-black px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1 tracking-wider uppercase">
                      <span className="w-1 h-1 bg-black rounded-full animate-pulse"></span>
                      待生成
                    </span>
                  </div>
                )}
              </div>

              {/* Info Area */}
              <div className="p-4 flex-1 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-bold text-white truncate group-hover:text-primary transition-colors">{item.name}</h5>
                  <button onClick={() => setEditingItem({...item})} className="text-slate-500 hover:text-white transition-colors p-1" title="编辑文案">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 line-clamp-3 leading-relaxed min-h-[45px]">
                  {item.description}
                </p>
                
                {/* Updated Action Area */}
                <div className="pt-3 flex flex-col gap-2 mt-auto border-t border-slate-800/50">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleManualGenerate(item.id)}
                      disabled={localGeneratingId === item.id}
                      className="flex-1 text-[11px] text-white bg-slate-800 border border-slate-700 px-3 py-2 rounded-xl hover:bg-slate-700 hover:border-slate-500 font-bold transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      {localGeneratingId === item.id ? (
                        <>
                          <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          生成中
                        </>
                      ) : '手动生成'}
                    </button>
                    <button 
                      onClick={() => handleManualUpload(item.id)}
                      className="flex-1 text-[11px] text-slate-300 bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl hover:text-white hover:border-slate-600 font-bold transition-all"
                    >
                      手动上传
                    </button>
                  </div>
                  <button 
                    onClick={() => handleDeleteItem(item.id)}
                    className="w-full text-[10px] text-red-400 border border-red-900/30 bg-red-900/10 py-1.5 rounded-lg hover:bg-red-900/20 transition-all flex items-center justify-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    删除物品
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center py-12 text-slate-700 text-[11px] tracking-widest uppercase font-bold">没有更多数据了</div>
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] flex items-center justify-center p-6 animate-fadeIn">
          <div className="bg-[#0b0f1a] border border-slate-700 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white">编辑物品信息</h3>
              <button onClick={() => setEditingItem(null)} className="text-slate-500 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">物品名称</label>
                <input 
                  type="text" 
                  value={editingItem.name} 
                  onChange={e => setEditingItem({...editingItem, name: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-primary transition-all shadow-inner" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">物品描述</label>
                <textarea 
                  value={editingItem.description} 
                  onChange={e => setEditingItem({...editingItem, description: e.target.value})}
                  className="w-full h-40 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-primary resize-none leading-relaxed transition-all shadow-inner" 
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setEditingItem(null)} className="px-6 py-2.5 text-slate-400 hover:text-white transition-colors text-sm font-medium">取消</button>
                <button type="submit" className="px-8 py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-indigo-600 transition-all text-sm">确认保存</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemManager;