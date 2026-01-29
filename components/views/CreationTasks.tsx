import React, { useState, useRef } from 'react';

interface Material {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail: string;
  name: string;
}

interface Shot {
  id: string;
  index: number;
  name: string;
  duration: number;
  description: string;
  prompt: string;
  status: 'pending' | 'completed';
  activeMaterialId?: string;
  materials: Material[];
}

interface Episode {
  id: string;
  displayId: string; // E01, E02...
  title: string;
  description: string;
  shots: Shot[];
}

const MOCK_SHOTS: Shot[] = [
  {
    id: 's1',
    index: 1,
    name: '鱼尾脚踏木板',
    duration: 3,
    description: '我，天天学掌门凌绝崖仰躺在青石板上，两脚高高抬起，用力踩着一块木板，表情专注，为杂技做准备。',
    prompt: '鱼尾脚踏木板，日漫风格，镜头拉近',
    status: 'pending',
    materials: []
  },
  {
    id: 's2',
    index: 2,
    name: '洛无霜高跪顶碟',
    duration: 5,
    description: '洛无霜踩着高跪站在木板上，头顶着一碟花生米，双手转着红手绢，神色紧张，随时可能摔倒。',
    prompt: '洛无霜高跪顶碟，动作摇晃，特写',
    status: 'pending',
    materials: []
  },
  {
    id: 's3',
    index: 3,
    name: '沈忘川悠闲吃瓜',
    duration: 5,
    description: '切换到另一边，祖师沈忘川戴着墨镜，一身沙滩服，悠闲地躺在吊床上吃西瓜，与旁边紧张的杂技形成鲜明对比。',
    prompt: '沈忘川悠闲吃瓜，沙滩服，吊床，阳光，日漫风',
    status: 'completed',
    activeMaterialId: 'm1',
    materials: [
      {
        id: 'm1',
        type: 'video',
        url: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
        thumbnail: 'https://picsum.photos/seed/melon/400/225',
        name: '沈忘川吃瓜_高清视频'
      },
      {
        id: 'm2',
        type: 'image',
        url: 'https://picsum.photos/seed/melon_img/800/450',
        thumbnail: 'https://picsum.photos/seed/melon_img/400/225',
        name: '沈忘川吃瓜_原画'
      }
    ]
  },
  {
    id: 's4',
    index: 4,
    name: '江有川轮椅瞌睡',
    duration: 3,
    description: '江有川坐在电动机轮椅上，头一点一点地打瞌睡，一副昏昏欲睡的样子。',
    prompt: '江有川打瞌睡，轮椅，背景模糊',
    status: 'pending',
    materials: []
  }
];

const MOCK_EPISODES: Episode[] = [
  {
    id: 'ep1',
    displayId: 'E01',
    title: '第1集',
    description: '标题：《我的仙人夫君有了白月光》 作者：城里 题材：都市修仙+高手下山+甜宠 设...',
    shots: MOCK_SHOTS
  },
  {
    id: 'ep2',
    displayId: 'E02',
    title: '第2集',
    description: '沈忘川身份暴露，引起各方关注。林幼薇身陷危机...',
    shots: []
  }
];

const CreationTasks: React.FC = () => {
  const [episodes, setEpisodes] = useState<Episode[]>(MOCK_EPISODES);
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string>(MOCK_EPISODES[0].id);
  const [selectedShotId, setSelectedShotId] = useState<string>(MOCK_SHOTS[2].id);
  const [genTab, setGenTab] = useState<'image' | 'video'>('image');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [draggedShotIndex, setDraggedShotIndex] = useState<number | null>(null);
  
  const currentEpisode = episodes.find(e => e.id === selectedEpisodeId) || episodes[0];
  const shots = currentEpisode.shots.length > 0 ? currentEpisode.shots : MOCK_SHOTS;
  const currentShot = shots.find(s => s.id === selectedShotId) || shots[0];
  const activeMaterial = currentShot?.materials.find(m => m.id === currentShot.activeMaterialId) || null;

  const handleShotClick = (id: string) => {
    setSelectedShotId(id);
  };

  const handleMaterialSelect = (materialId: string) => {
    setEpisodes(prev => prev.map(ep => {
      if (ep.id === selectedEpisodeId) {
        return {
          ...ep,
          shots: ep.shots.map(s => s.id === selectedShotId ? { ...s, activeMaterialId: materialId } : s)
        };
      }
      return ep;
    }));
  };

  const handleAddShot = () => {
    const newId = 's_' + Date.now();
    const newShot: Shot = {
      id: newId,
      index: shots.length + 1,
      name: `新分镜 #${shots.length + 1}`,
      duration: 3,
      description: '点击此处修改分镜描述...',
      prompt: '',
      status: 'pending',
      materials: []
    };

    setEpisodes(prev => prev.map(ep => {
      if (ep.id === selectedEpisodeId) {
        return {
          ...ep,
          shots: [...ep.shots, newShot]
        };
      }
      return ep;
    }));
    setSelectedShotId(newId);
  };

  const handleDragStart = (index: number) => {
    setDraggedShotIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (index: number) => {
    if (draggedShotIndex === null) return;
    
    const newShots = [...shots];
    const [draggedShot] = newShots.splice(draggedShotIndex, 1);
    newShots.splice(index, 0, draggedShot);
    
    // Re-index based on new order
    const updatedShots = newShots.map((s, i) => ({ ...s, index: i + 1 }));

    setEpisodes(prev => prev.map(ep => {
      if (ep.id === selectedEpisodeId) {
        return {
          ...ep,
          shots: updatedShots
        };
      }
      return ep;
    }));
    setDraggedShotIndex(null);
  };

  const simulateGeneration = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const newMaterial: Material = {
        id: 'new_' + Date.now(),
        type: genTab,
        url: genTab === 'video' ? 'https://media.w3.org/2010/05/sintel/trailer.mp4' : `https://picsum.photos/seed/${Date.now()}/800/450`,
        thumbnail: `https://picsum.photos/seed/${Date.now()}/400/225`,
        name: genTab === 'video' ? '新生成的视频' : '新生成的图片'
      };
      
      setEpisodes(prev => prev.map(ep => {
        if (ep.id === selectedEpisodeId) {
          return {
            ...ep,
            shots: ep.shots.map(s => {
              if (s.id === selectedShotId) {
                return {
                  ...s,
                  status: 'completed',
                  activeMaterialId: newMaterial.id,
                  materials: [newMaterial, ...s.materials]
                };
              }
              return s;
            })
          };
        }
        return ep;
      }));
      setIsGenerating(false);
    }, 3000);
  };

  return (
    <div className="h-full flex bg-[#05080f] text-slate-300 font-sans overflow-hidden">
      
      {/* --- Leftmost: Episode List (Full Height) --- */}
      <div className="w-[280px] shrink-0 border-r border-slate-800/50 flex flex-col bg-[#0b0f1a] z-20">
        <div className="p-4 border-b border-slate-800/50 flex items-center justify-between bg-slate-900/40">
          <h3 className="font-bold text-white text-base tracking-tight">分集列表</h3>
          <div className="flex items-center gap-2">
            <button className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded border border-slate-700 hover:text-white hover:bg-slate-700 transition-all">管理</button>
            <button className="text-xs bg-primary text-white px-2.5 py-1 rounded shadow-lg shadow-primary/20 hover:bg-indigo-600 transition-all flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
              新建分集
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
          {episodes.map(ep => (
            <div 
              key={ep.id}
              onClick={() => setSelectedEpisodeId(ep.id)}
              className={`p-3 rounded-xl border transition-all cursor-pointer group flex items-start gap-3 ${
                selectedEpisodeId === ep.id 
                  ? 'bg-primary/10 border-primary ring-1 ring-primary/20' 
                  : 'bg-slate-900/50 border-transparent hover:bg-slate-800 hover:border-slate-700'
              }`}
            >
              <div className={`w-12 h-12 shrink-0 rounded-lg flex items-center justify-center font-bold text-sm shadow-inner ${
                selectedEpisodeId === ep.id ? 'bg-primary text-white' : 'bg-slate-950 text-slate-500'
              }`}>
                {ep.displayId}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className={`text-sm font-bold truncate ${selectedEpisodeId === ep.id ? 'text-white' : 'text-slate-300'}`}>
                    {ep.title}
                  </span>
                  {selectedEpisodeId === ep.id && (
                    <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center shadow-lg">
                      <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                  {ep.description}
                </p>
              </div>
            </div>
          ))}
          <div className="text-center py-6 text-slate-700 text-[10px] tracking-widest">没有更多数据了</div>
        </div>
      </div>

      {/* --- Main Content Area (Right Side) --- */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        
        {/* Top: AI Generation and Preview Area */}
        <div className="flex-1 flex min-h-0 border-b border-slate-800/50">
          
          {/* AI Generation Panel */}
          <div className="w-[310px] shrink-0 border-r border-slate-800/50 flex flex-col bg-[#0b0f1a]">
            <div className="p-4 border-b border-slate-800/50 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">AI 生成</h3>
              <div className="flex bg-slate-900 rounded p-1">
                <button onClick={() => setGenTab('image')} className={`px-3 py-1 text-xs rounded transition-all ${genTab === 'image' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500'}`}>融合生图</button>
                <button onClick={() => setGenTab('video')} className={`px-3 py-1 text-xs rounded transition-all ${genTab === 'video' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500'}`}>生视频</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
              <div className="space-y-2">
                <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">AI 模型</label>
                <select className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-primary outline-none appearance-none cursor-pointer">
                  <option>Nanobanana Pro 2.5</option>
                  <option>Kling AI 1.0</option>
                  <option>Flux Pro</option>
                </select>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                  <button className="flex items-center gap-1 border-b-2 border-primary text-primary pb-1 px-1">参考生图</button>
                  <button className="flex items-center gap-1 pb-1 px-1">文本生图</button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button className="flex flex-col items-center justify-center gap-1 p-2 bg-slate-900 border border-slate-800 rounded-lg text-[10px] text-slate-500 hover:text-white transition-colors">关联资产</button>
                  <button className="flex flex-col items-center justify-center gap-1 p-2 bg-slate-900 border border-slate-800 rounded-lg text-[10px] text-slate-500 hover:text-white transition-colors">分镜素材</button>
                  <button className="col-span-2 py-2 bg-slate-800/50 border border-slate-800 rounded-lg text-[11px] text-slate-400 hover:bg-slate-800 transition-colors">上传参考图</button>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">提示词 (Prompt)</label>
                  <button className="text-[10px] text-primary hover:underline">润色优化</button>
                </div>
                <textarea 
                  value={currentShot?.prompt || ''}
                  className="w-full h-28 bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm text-slate-300 resize-none focus:border-primary outline-none"
                  placeholder="描述你想要的画面..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">图片尺寸</label>
                   <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-xs text-slate-300 outline-none">
                      <option value="16:9">16:9</option>
                      <option value="9:16">9:16</option>
                      <option value="1:1">1:1</option>
                   </select>
                 </div>
                 {genTab === 'video' && (
                   <div className="space-y-2">
                      <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">视频时长</label>
                      <select className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-xs text-slate-300 outline-none">
                        <option>5秒</option><option>10秒</option>
                      </select>
                   </div>
                 )}
              </div>
            </div>

            <div className="p-4 bg-slate-900/50 border-t border-slate-800/50">
               <button onClick={simulateGeneration} disabled={isGenerating} className="w-full py-3 bg-primary hover:bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                  {isGenerating ? '生成中...' : `生成${genTab === 'image' ? '图片' : '视频'}`}
               </button>
            </div>
          </div>

          {/* Viewer Area */}
          <div className="flex-1 flex flex-col bg-black relative">
            <div className="h-12 bg-[#0b0f1a] border-b border-slate-800/50 flex items-center justify-between px-6 z-20">
              <div className="flex items-center gap-6">
                 <button className="text-xs text-slate-400 hover:text-white">工具栏</button>
                 <button className="text-xs text-slate-400 hover:text-white">截帧</button>
                 <button className="text-xs text-slate-400 hover:text-white">一键高清</button>
              </div>
              <div className="flex items-center gap-4"><span className="text-xs text-slate-500">比例</span><select className="bg-slate-800 text-[10px] px-2 py-0.5 rounded outline-none text-slate-300"><option>16:9</option></select></div>
            </div>
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="relative w-full max-w-4xl aspect-video bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex items-center justify-center group shadow-2xl">
                {activeMaterial ? (
                  activeMaterial.type === 'video' ? <video key={activeMaterial.url} src={activeMaterial.url} className="w-full h-full object-contain" controls /> : <img src={activeMaterial.url} className="w-full h-full object-contain" />
                ) : <div className="text-slate-600 text-sm italic">当前分镜暂无素材</div>}
              </div>
            </div>
          </div>

          {/* Asset/Material Area */}
          <div className="w-[300px] shrink-0 border-l border-slate-800/50 flex flex-col bg-[#0b0f1a]">
            <div className="p-4 border-b border-slate-800/50 flex justify-between items-center">
              <h3 className="font-bold text-white text-sm">素材区</h3>
              <button className="text-[10px] text-slate-500">上传</button>
            </div>
            <div className="flex border-b border-slate-800/50 text-xs font-bold text-slate-500">
               <button className="flex-1 py-3 text-primary border-b-2 border-primary">分镜素材 ({currentShot?.materials.length || 0})</button>
               <button className="flex-1 py-3">收藏</button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
               <div className="grid grid-cols-2 gap-3">
                 {currentShot?.materials.map(mat => (
                   <div key={mat.id} onClick={() => handleMaterialSelect(mat.id)} className={`relative group rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${currentShot.activeMaterialId === mat.id ? 'border-primary' : 'border-slate-800'}`}>
                     <img src={mat.thumbnail} className="w-full aspect-[16/10] object-cover" />
                     <div className="p-1.5 bg-slate-900/90 text-[9px] text-slate-400 truncate">{mat.name}</div>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>

        {/* Bottom: Timeline Area (Scrollable & Draggable) */}
        <div className="h-[260px] bg-[#0b0f1a] flex flex-col shrink-0">
           <div className="h-10 border-b border-slate-800/50 flex items-center justify-between px-6 bg-slate-900/30">
              <div className="flex items-center gap-4 text-xs text-slate-500">
                 <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                    自动预览 · 可播放 {shots.filter(s => s.activeMaterialId).length} 镜头
                 </div>
                 <span>|</span>
                 <span className="font-mono">00:00 / 00:25</span>
              </div>
              <button 
                onClick={handleAddShot}
                className="flex items-center gap-1.5 text-xs text-white bg-primary px-4 py-1.5 rounded-lg hover:bg-indigo-600 transition-all shadow-lg shadow-primary/20 font-bold"
              >
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                 新增分镜
              </button>
           </div>

           <div className="flex-1 overflow-x-auto p-4 custom-scrollbar">
              <div className="flex gap-4 min-w-max pb-4">
                 {shots.map((shot, index) => {
                    const activeMat = shot.materials.find(m => m.id === shot.activeMaterialId);
                    return (
                      <div 
                        key={shot.id} 
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(index)}
                        onClick={() => handleShotClick(shot.id)}
                        className={`w-[220px] bg-slate-900 border-2 rounded-xl p-3 cursor-grab active:cursor-grabbing transition-all flex flex-col gap-2 relative group ${
                          selectedShotId === shot.id 
                          ? 'border-primary shadow-2xl shadow-primary/10 scale-[1.02] z-10' 
                          : 'border-slate-800/50 hover:border-slate-700'
                        } ${draggedShotIndex === index ? 'opacity-40 grayscale' : ''}`}
                      >
                        {/* Drag Handle Indicator */}
                        <div className="absolute top-1 left-1/2 -translate-x-1/2 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                           <div className="flex gap-0.5">
                             <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
                             <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
                             <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
                           </div>
                        </div>

                        <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-slate-800">
                           {activeMat ? (
                             <>
                               <img src={activeMat.thumbnail} className="w-full h-full object-cover" />
                               <div className="absolute top-1 left-1">
                                  <div className={`text-[7px] px-1 py-0.5 rounded text-white flex items-center gap-1 ${activeMat.type === 'video' ? 'bg-blue-500/80' : 'bg-pink-500/80'}`}>
                                     {activeMat.type === 'video' ? '视频' : '图片'}
                                  </div>
                               </div>
                             </>
                           ) : (
                             <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 bg-slate-950">
                                <span className="text-[10px] font-bold">空镜头</span>
                             </div>
                           )}
                           <div className="absolute top-1 right-1 bg-black/40 text-[9px] text-slate-400 px-1 rounded-sm">#{shot.index}</div>
                        </div>

                        <div className="flex-1 min-h-0 flex flex-col gap-1.5">
                           <h4 className={`text-[11px] font-bold truncate ${selectedShotId === shot.id ? 'text-primary' : 'text-slate-300'}`}>{shot.name}</h4>
                           <p className="text-[9px] text-slate-500 line-clamp-3 leading-relaxed">
                             {shot.description}
                           </p>
                        </div>
                      </div>
                    );
                 })}
                 {/* Quick Add Placeholder */}
                 <button 
                   onClick={handleAddShot}
                   className="w-[100px] border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-700 hover:text-primary hover:border-primary/50 transition-all hover:bg-primary/5"
                 >
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    <span className="text-[10px]">添加</span>
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CreationTasks;