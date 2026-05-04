import React, { useState, useEffect } from 'react';
import { api } from '../../src/lib/api';

interface SceneVariation {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  status: 'pending' | 'generated';
}

interface SceneAsset {
  id: string;
  name: string;
  description: string;
  mainImageUrl: string;
  variations: SceneVariation[];
}

const MOCK_SCENES: SceneAsset[] = [
  {
    id: 's1',
    name: '南城别墅大厅',
    description: '极尽奢华的现代中式风格。挑高六米的客厅，正面是巨大的落地窗，窗外隐约可见修剪整齐的园林。室内摆放着名贵的红木家具与现代真皮沙发的混搭，地毯纹路复杂且具有艺术感。',
    mainImageUrl: 'https://picsum.photos/seed/mansion_hall/800/450',
    variations: [
      { id: 'v1', name: '清晨斜阳光影', description: '清晨时分，阳光穿过落地窗在地板上留下长长的光影，空气中可见细微尘埃，氛围宁静。', imageUrl: 'https://picsum.photos/seed/mansion_morning/600/337', status: 'generated' },
      { id: 'v2', name: '夜晚宴会氛围', description: '华灯初上，巨大的水晶吊灯亮起，室内光影暧昧且奢靡，桌上有未收走的红酒杯。', status: 'pending' },
      { id: 'v3', name: '雨天阴沉冷色调', description: '室外阴雨连绵，室内色调转为冷灰，巨大的落地窗上布满水珠，整体氛围压抑。', status: 'pending' },
    ]
  },
  {
    id: 's2',
    name: '沈家老宅书房',
    description: '充满岁月痕迹的古旧书房。四周全是通顶的实木书架，堆满了发黄的古籍。空气中仿佛能闻到墨香与檀香的味道。',
    mainImageUrl: 'https://picsum.photos/seed/old_study/800/450',
    variations: []
  },
  {
    id: 's3',
    name: '铃芽学院走廊',
    description: '充满英伦风格的学院走廊。墙壁贴着深木色的护墙板，挂着历届杰出校友的油画头像。地面铺着黑白方格地砖，窗台上有盛开的红色郁金香。',
    mainImageUrl: 'https://picsum.photos/seed/school_hall/800/450',
    variations: []
  }
];

const SceneManager: React.FC<{ projectId?: number }> = ({ projectId }) => {
  const [scenes, setScenes] = useState<SceneAsset[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [editingVariation, setEditingVariation] = useState<SceneVariation | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadScenes = async () => {
    if (!projectId) { setLoading(false); return; }
    try {
      const res = await api.get(`/projects/${projectId}/scenes`);
      if (res.data.success && res.data.data.length > 0) {
        const mapped: SceneAsset[] = res.data.data.map((s: any) => ({
          id: String(s.id),
          name: s.name,
          description: s.description || '',
          mainImageUrl: s.mainImageUrl || `https://picsum.photos/seed/${s.id}/800/450`,
          variations: [],
        }));
        setScenes(mapped);
        setSelectedId((prev) => mapped.find((s) => s.id === prev) ? prev : mapped[0].id);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadScenes(); }, [projectId]);

  const activeScene = scenes.find(s => s.id === selectedId) || scenes[0];

  const updateActiveScene = (updates: Partial<SceneAsset>) => {
    setScenes(prev => prev.map(s => s.id === selectedId ? { ...s, ...updates } : s));
  };

  const handleGenerateVariation = (varId: string) => {
    setIsGenerating(true);
    setTimeout(() => {
      setScenes(prev => prev.map(s => {
        if (s.id === selectedId) {
          return {
            ...s,
            variations: s.variations.map(v => v.id === varId ? { ...v, status: 'generated', imageUrl: `https://picsum.photos/seed/${varId}_gen/600/337` } : v)
          };
        }
        return s;
      }));
      setIsGenerating(false);
    }, 2000);
  };

  const handleDeleteVariation = (varId: string) => {
    if (confirm('确定要删除这个场景分支吗？')) {
      setScenes(prev => prev.map(s => {
        if (s.id === selectedId) {
          return {
            ...s,
            variations: s.variations.filter(v => v.id !== varId)
          };
        }
        return s;
      }));
    }
  };

  const handleSaveVariationEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVariation) return;

    setScenes(prev => prev.map(s => {
      if (s.id === selectedId) {
        return {
          ...s,
          variations: s.variations.map(v => v.id === editingVariation.id ? editingVariation : v)
        };
      }
      return s;
    }));
    setEditingVariation(null);
  };

  const handleDeleteScene = () => {
    if (confirm('确定要删除当前场景资产吗？')) {
      const remaining = scenes.filter(s => s.id !== selectedId);
      if (remaining.length > 0) {
        setScenes(remaining);
        setSelectedId(remaining[0].id);
      }
    }
  };

  return (
    <div className="h-full flex bg-[#05080f] text-slate-300 font-sans overflow-hidden">
      
      {/* --- Left Sidebar: Scene List --- */}
      <div className="w-[300px] shrink-0 border-r border-slate-800/50 flex flex-col bg-[#0b0f1a] z-20">
        <div className="p-4 border-b border-slate-800/50 bg-slate-900/40">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-white text-base tracking-tight">场景资产</h3>
            <button className="text-[10px] bg-primary text-white px-2.5 py-1 rounded shadow-lg shadow-primary/20 hover:bg-indigo-600 transition-all flex items-center gap-1 font-bold">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
              新建
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          {scenes.map(scene => (
            <div 
              key={scene.id}
              onClick={() => setSelectedId(scene.id)}
              className={`p-3 rounded-xl border transition-all cursor-pointer group flex items-center gap-4 ${
                selectedId === scene.id 
                  ? 'bg-primary/10 border-primary shadow-lg shadow-primary/5' 
                  : 'bg-slate-900/40 border-transparent hover:bg-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="w-16 h-10 shrink-0 rounded-lg overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
                <img src={scene.mainImageUrl} alt={scene.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <span className={`text-sm font-bold truncate block ${selectedId === scene.id ? 'text-white' : 'text-slate-300'}`}>
                  {scene.name}
                </span>
                <p className="text-[10px] text-slate-600 line-clamp-1 mt-0.5">
                  {scene.variations.length}个细分场景
                </p>
              </div>
            </div>
          ))}
          <div className="text-center py-6 text-slate-700 text-[10px] tracking-widest uppercase">没有更多数据了</div>
        </div>
      </div>

      {/* --- Main Workspace --- */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#05080f]">
        <div className="flex-1 flex min-h-0">
          
          {/* Middle Panel: Base Info Editor */}
          <div className="w-[360px] shrink-0 border-r border-slate-800/50 flex flex-col bg-[#0b0f1a] overflow-y-auto custom-scrollbar p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">基础信息</h4>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">场景名称</label>
                <input 
                  type="text" 
                  value={activeScene.name}
                  onChange={(e) => updateActiveScene({ name: e.target.value })}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-lg px-3 py-2 text-xl font-black text-white outline-none focus:border-primary transition-all shadow-inner" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">场景描述</label>
                <textarea 
                  value={activeScene.description}
                  onChange={(e) => updateActiveScene({ description: e.target.value })}
                  className="w-full h-40 bg-slate-900/50 border border-slate-800 rounded-lg p-3 text-sm text-slate-400 leading-relaxed outline-none focus:border-primary resize-none transition-all shadow-inner"
                  placeholder="请输入对该场景环境、风格、光影的详细描述..."
                />
              </div>

              <div className="space-y-4 pt-4">
                <div className="aspect-video rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl group relative">
                  <img src={activeScene.mainImageUrl} alt={activeScene.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                    <button className="py-2 bg-white/10 backdrop-blur-md rounded-lg text-[10px] font-bold hover:bg-white/20 transition-all border border-white/5">手动更换主图</button>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                   <div className="grid grid-cols-2 gap-2">
                     <button className="text-[11px] text-white bg-primary px-3 py-2.5 rounded-xl font-bold transition-all hover:bg-indigo-600 shadow-lg shadow-primary/10 flex items-center justify-center gap-1.5">
                       <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                       手动生成
                     </button>
                     <button className="text-[11px] text-slate-300 border border-slate-800 bg-slate-900 px-3 py-2.5 rounded-xl hover:text-white hover:bg-slate-800 transition-all font-bold">手动上传</button>
                   </div>
                   <button 
                     onClick={handleDeleteScene}
                     className="w-full text-[11px] text-red-400 border border-red-900/30 bg-red-900/10 px-3 py-2.5 rounded-xl hover:bg-red-900/20 transition-all flex items-center justify-center gap-2"
                   >
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                     删除场景
                   </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Variations */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#05080f]">
            <div className="p-4 border-b border-slate-800/50 flex items-center justify-between bg-slate-900/20">
              <div className="flex gap-4">
                <button className="text-primary text-xs font-bold border-b-2 border-primary pb-1">全部场景 ({activeScene.variations.length})</button>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-1.5 text-[11px] font-bold text-white bg-primary px-4 py-1.5 rounded-lg shadow-lg shadow-primary/20 hover:brightness-110 transition-all">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  一键生成
                </button>
                <button className="flex items-center gap-1.5 text-[11px] font-bold text-white bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 px-4 py-1.5 rounded-lg hover:bg-indigo-500/30 transition-all">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                  新增场景
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-6">
                {activeScene.variations.map(variation => (
                  <div key={variation.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col group relative">
                    <div className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden">
                      {variation.status === 'generated' ? (
                        <img src={variation.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-3 opacity-20">
                           <svg className="w-12 h-12 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        {variation.status === 'pending' && <span className="text-[9px] bg-yellow-500/90 text-black font-bold px-2 py-0.5 rounded-full shadow-lg">待生成</span>}
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <h5 className="text-sm font-bold text-white truncate">{variation.name}</h5>
                        <button onClick={() => setEditingVariation({...variation})} className="p-1 text-slate-500 hover:text-white transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed h-[30px]">{variation.description}</p>
                      <div className="pt-3 flex flex-col gap-2 mt-auto border-t border-slate-800/50">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleGenerateVariation(variation.id)}
                            disabled={isGenerating}
                            className="flex-1 text-[10px] text-white bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-500 font-bold transition-all disabled:opacity-50"
                          >
                            {isGenerating && variation.status === 'pending' ? '生成中...' : '手动生成'}
                          </button>
                          <button className="flex-1 text-[10px] text-slate-400 border border-slate-800 bg-slate-950 px-3 py-1.5 rounded-lg hover:text-white hover:border-slate-700 transition-all font-bold">上传</button>
                        </div>
                        <button 
                          onClick={() => handleDeleteVariation(variation.id)}
                          className="w-full text-[10px] text-red-500/70 py-1 hover:text-red-400 transition-colors flex items-center justify-center gap-1"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          删除场景
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center py-12 text-slate-700 text-[11px] tracking-widest uppercase">没有更多数据了</div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Edit Variation Modal --- */}
      {editingVariation && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] flex items-center justify-center p-6 animate-fadeIn">
          <div className="bg-[#0b0f1a] border border-slate-700 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white">编辑分镜场景信息</h3>
              <button onClick={() => setEditingVariation(null)} className="text-slate-500 hover:text-white"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <form onSubmit={handleSaveVariationEdit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">子场景名称</label>
                <input type="text" value={editingVariation.name} onChange={e => setEditingVariation({...editingVariation, name: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-primary transition-all shadow-inner" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">分镜描述</label>
                <textarea value={editingVariation.description} onChange={e => setEditingVariation({...editingVariation, description: e.target.value})} className="w-full h-32 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-primary resize-none leading-relaxed transition-all shadow-inner" />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setEditingVariation(null)} className="px-6 py-2.5 text-slate-400 hover:text-white transition-colors text-sm font-medium">取消</button>
                <button type="submit" className="px-8 py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-indigo-600 transition-all text-sm">确认保存</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SceneManager;