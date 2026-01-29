import React, { useState } from 'react';

interface Creature {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  status: 'pending' | 'generated';
}

const MOCK_CREATURES: Creature[] = [
  {
    id: 'cr1',
    name: '通灵白狐',
    description: '浑身雪白无暇，毛发如绸缎般顺滑。双眼呈琥珀色，透着非凡的灵性。尾部硕大且蓬松，奔跑时如同在林间跃动的白色闪电。',
    imageUrl: 'https://picsum.photos/seed/whitefox/600/400',
    status: 'generated'
  },
  {
    id: 'cr2',
    name: '冥界地狱犬',
    description: '体型硕大如牛，浑身肌肉虬结。通体漆黑，颈部有暗红色的鬃毛。双眼喷吐着幽绿色的冥火，每走一步都会在地面留下焦灼的足迹。',
    status: 'pending'
  },
  {
    id: 'cr3',
    name: '沈家护院獒犬',
    description: '藏獒品种，体型雄壮，性格忠诚且凶猛。毛发浓密呈铁锈红色，眼神中透着一股威慑力，守护在沈家大门两侧。',
    status: 'pending'
  },
  {
    id: 'cr4',
    name: '机械侦察蜂',
    description: '只有指甲盖大小，通体由精密合金打造。透明的振动翼频率极高，复眼处集成了高倍摄影与红外侦测模块。',
    status: 'pending'
  }
];

const CreatureManager: React.FC = () => {
  const [creatures, setCreatures] = useState<Creature[]>(MOCK_CREATURES);
  const [editingCreature, setEditingCreature] = useState<Creature | null>(null);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [localGeneratingId, setLocalGeneratingId] = useState<string | null>(null);

  const handleManualGenerate = (id: string) => {
    setLocalGeneratingId(id);
    setTimeout(() => {
      setCreatures(prev => prev.map(cr => 
        cr.id === id ? { ...cr, status: 'generated', imageUrl: `https://picsum.photos/seed/${id}_gen/600/400` } : cr
      ));
      setLocalGeneratingId(null);
    }, 2000);
  };

  const handleManualUpload = (id: string) => {
    const fakeUrl = `https://picsum.photos/seed/upload_${id}/600/400`;
    setCreatures(prev => prev.map(cr => 
      cr.id === id ? { ...cr, status: 'generated', imageUrl: fakeUrl } : cr
    ));
  };

  const handleDeleteCreature = (id: string) => {
    if (confirm('确定要删除这个生物资产吗？')) {
      setCreatures(prev => prev.filter(cr => cr.id !== id));
    }
  };

  const handleOneClickGenerate = () => {
    setIsGeneratingAll(true);
    setTimeout(() => {
      setCreatures(prev => prev.map(cr => ({
        ...cr,
        status: 'generated',
        imageUrl: cr.imageUrl || `https://picsum.photos/seed/${cr.id}_batch/600/400`
      })));
      setIsGeneratingAll(false);
    }, 3000);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCreature) return;
    setCreatures(prev => prev.map(cr => cr.id === editingCreature.id ? editingCreature : cr));
    setEditingCreature(null);
  };

  return (
    <div className="h-full flex flex-col bg-[#05080f] text-slate-300 font-sans overflow-hidden">
      
      {/* Top Toolbar */}
      <div className="p-4 border-b border-slate-800/50 flex items-center justify-between bg-slate-900/20">
        <div className="flex gap-4">
          <h2 className="text-xl font-black text-white tracking-tight">生物资产</h2>
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
          <button className="flex items-center gap-1.5 text-[11px] font-bold text-white bg-cyan-600 px-4 py-1.5 rounded-lg shadow-lg shadow-cyan-600/20 hover:brightness-110 transition-all">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
            新建生物
          </button>
        </div>
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {creatures.map(cr => (
            <div key={cr.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col group transition-all hover:border-slate-700">
              {/* Image Area */}
              <div className="relative aspect-[16/10] bg-slate-950 flex items-center justify-center overflow-hidden">
                {cr.status === 'generated' ? (
                  <img src={cr.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={cr.name} />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3 opacity-20">
                     <svg className="w-12 h-12 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                )}
                
                {cr.status === 'pending' && (
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
                  <h5 className="text-sm font-bold text-white truncate group-hover:text-primary transition-colors">{cr.name}</h5>
                  <button onClick={() => setEditingCreature({...cr})} className="text-slate-500 hover:text-white transition-colors p-1" title="编辑文案">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 line-clamp-3 leading-relaxed min-h-[45px]">
                  {cr.description}
                </p>
                
                {/* Action Area */}
                <div className="pt-3 flex flex-col gap-2 mt-auto border-t border-slate-800/50">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleManualGenerate(cr.id)}
                      disabled={localGeneratingId === cr.id}
                      className="flex-1 text-[11px] text-white bg-slate-800 border border-slate-700 px-3 py-2 rounded-xl hover:bg-slate-700 hover:border-slate-500 font-bold transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      {localGeneratingId === cr.id ? (
                        <>
                          <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          生成中
                        </>
                      ) : '手动生成'}
                    </button>
                    <button 
                      onClick={() => handleManualUpload(cr.id)}
                      className="flex-1 text-[11px] text-slate-300 bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl hover:text-white hover:border-slate-600 font-bold transition-all"
                    >
                      手动上传
                    </button>
                  </div>
                  <button 
                    onClick={() => handleDeleteCreature(cr.id)}
                    className="w-full text-[10px] text-red-400 border border-red-900/30 bg-red-900/10 py-1.5 rounded-lg hover:bg-red-900/20 transition-all flex items-center justify-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    删除生物
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center py-12 text-slate-700 text-[11px] tracking-widest uppercase font-bold">没有更多数据了</div>
      </div>

      {/* Edit Modal */}
      {editingCreature && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] flex items-center justify-center p-6 animate-fadeIn">
          <div className="bg-[#0b0f1a] border border-slate-700 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white">编辑生物信息</h3>
              <button onClick={() => setEditingCreature(null)} className="text-slate-500 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">生物名称</label>
                <input 
                  type="text" 
                  value={editingCreature.name} 
                  onChange={e => setEditingCreature({...editingCreature, name: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-primary transition-all shadow-inner" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">外形描述</label>
                <textarea 
                  value={editingCreature.description} 
                  onChange={e => setEditingCreature({...editingCreature, description: e.target.value})}
                  className="w-full h-40 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-primary resize-none leading-relaxed transition-all shadow-inner" 
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setEditingCreature(null)} className="px-6 py-2.5 text-slate-400 hover:text-white transition-colors text-sm font-medium">取消</button>
                <button type="submit" className="px-8 py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-indigo-600 transition-all text-sm">确认保存</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatureManager;