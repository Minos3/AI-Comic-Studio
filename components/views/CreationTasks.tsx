import React, { useState } from 'react';
import AssetSelectorModal from '../AssetSelectorModal';
import EpisodePreview from './EpisodePreview';
import { Asset } from '../../types';

type EpisodeStatus = 'broken' | 'unbroken' | 'manual';

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
  displayId: string;
  title: string;
  description: string;
  status: EpisodeStatus;
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
    id: 's3',
    index: 2,
    name: '沈忘川悠闲吃瓜',
    duration: 5,
    description: '切换到另一边，祖师沈忘川戴着墨镜，一身沙滩服，悠闲地躺在吊床上吃西瓜。',
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
      }
    ]
  }
];

const MOCK_EPISODES: Episode[] = [
  {
    id: 'ep1',
    displayId: 'E01',
    title: '第1集',
    status: 'broken',
    description: '标题：《我的仙人夫君有了白月光》 题材：都市修仙',
    shots: MOCK_SHOTS
  },
  {
    id: 'ep2',
    displayId: 'E02',
    title: '第2集',
    status: 'unbroken',
    description: '沈忘川身份暴露，引起各方关注。林幼薇身陷危机...',
    shots: []
  },
  {
    id: 'ep3',
    displayId: 'E03',
    title: '第3集',
    status: 'manual',
    description: '手动创建的自定义剧集，暂无描述。',
    shots: []
  }
];

const CreationTasks: React.FC = () => {
  const [episodes, setEpisodes] = useState<Episode[]>(MOCK_EPISODES);
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string>(MOCK_EPISODES[0].id);
  const [selectedShotId, setSelectedShotId] = useState<string>(MOCK_SHOTS[0].id);
  const [genTab, setGenTab] = useState<'image' | 'video'>('image');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBreakingDown, setIsBreakingDown] = useState(false);
  const [breakdownProgress, setBreakdownProgress] = useState(0);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [draggedShotIndex, setDraggedShotIndex] = useState<number | null>(null);
  const [genMode, setGenMode] = useState<'ref_image' | 'text_image'>('ref_image');
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState<Asset[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  
  const currentEpisode = episodes.find(e => e.id === selectedEpisodeId) || episodes[0];
  const shots = currentEpisode.shots;
  const currentShot = shots.find(s => s.id === selectedShotId) || (shots.length > 0 ? shots[0] : null);
  const activeMaterial = currentShot?.materials.find(m => m.id === currentShot.activeMaterialId) || null;

  // AI Models
  const imageModels = ['nanobanana', '即梦4.0', '即梦4.5', '即梦5.0'];
  const videoModels = ['Sora', 'Seedance2.0', 'VEO'];

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

  const handleDeleteMaterial = (e: React.MouseEvent, materialId: string) => {
    e.stopPropagation();
    if (window.confirm('确认删除该素材吗？删除后将无法恢复。')) {
      setEpisodes(prev => prev.map(ep => {
        if (ep.id === selectedEpisodeId) {
          return {
            ...ep,
            shots: ep.shots.map(s => {
              if (s.id === selectedShotId) {
                const newMaterials = s.materials.filter(m => m.id !== materialId);
                let newActiveId = s.activeMaterialId;
                if (s.activeMaterialId === materialId) {
                   newActiveId = newMaterials.length > 0 ? newMaterials[0].id : undefined;
                }
                return { ...s, materials: newMaterials, activeMaterialId: newActiveId };
              }
              return s;
            })
          };
        }
        return ep;
      }));
    }
  };

  const handleStartBreakdown = () => {
    setIsBreakingDown(true);
    setBreakdownProgress(0);
    
    const interval = setInterval(() => {
      setBreakdownProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setEpisodes(prevEp => prevEp.map(ep => {
              if (ep.id === selectedEpisodeId) {
                return { ...ep, status: 'broken', shots: JSON.parse(JSON.stringify(MOCK_SHOTS)) };
              }
              return ep;
            }));
            setIsBreakingDown(false);
          }, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 40);
  };

  const handleAddShot = () => {
    const newId = 's_' + Date.now();
    const newShot: Shot = {
      id: newId, index: shots.length + 1, name: `新分镜 #${shots.length + 1}`, duration: 3,
      description: '点击此处修改分镜描述...', prompt: '', status: 'pending', materials: []
    };

    setEpisodes(prev => prev.map(ep => {
      if (ep.id === selectedEpisodeId) {
        return { ...ep, shots: [...ep.shots, newShot] };
      }
      return ep;
    }));
    setSelectedShotId(newId);
  };

  const handleDragStart = (index: number) => setDraggedShotIndex(index);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (index: number) => {
    if (draggedShotIndex === null) return;
    const newShots = [...shots];
    const [draggedShot] = newShots.splice(draggedShotIndex, 1);
    newShots.splice(index, 0, draggedShot);
    const updatedShots = newShots.map((s, i) => ({ ...s, index: i + 1 }));
    setEpisodes(prev => prev.map(ep => ep.id === selectedEpisodeId ? { ...ep, shots: updatedShots } : ep));
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
        name: genTab === 'video' ? 'AI 视频片段' : 'AI 生成原画'
      };
      setEpisodes(prev => prev.map(ep => ep.id === selectedEpisodeId ? {
        ...ep, shots: ep.shots.map(s => s.id === selectedShotId ? { ...s, status: 'completed', activeMaterialId: newMaterial.id, materials: [newMaterial, ...s.materials] } : s)
      } : ep));
      setIsGenerating(false);
    }, 3000);
  };

  const StatusBadge = ({ status }: { status: EpisodeStatus }) => {
    const configs = {
      broken: { label: '已拆解', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
      unbroken: { label: '未拆解', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
      manual: { label: '手动创建', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' }
    };
    const config = configs[status];
    return <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold ${config.color}`}>{config.label}</span>;
  };

  return (
    <div className="h-full flex bg-[#05080f] text-slate-300 font-sans overflow-hidden">
      
      {/* --- 左侧分集列表 --- */}
      <div className="w-[280px] shrink-0 border-r border-slate-800/50 flex flex-col bg-[#0b0f1a] z-20">
        <div className="p-4 border-b border-slate-800/50 flex items-center justify-between bg-slate-900/40">
          <h3 className="font-bold text-white text-base">分集列表</h3>
          <button className="text-xs bg-primary text-white px-2.5 py-1 rounded shadow-lg shadow-primary/20 hover:bg-indigo-600 transition-all flex items-center gap-1 font-bold">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
            新建
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
          {episodes.map(ep => (
            <div 
              key={ep.id}
              onClick={() => setSelectedEpisodeId(ep.id)}
              className={`p-3 rounded-xl border transition-all cursor-pointer group flex flex-col gap-2 ${
                selectedEpisodeId === ep.id 
                  ? 'bg-primary/10 border-primary ring-1 ring-primary/20 shadow-lg' 
                  : 'bg-slate-900/50 border-transparent hover:bg-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center font-bold text-xs ${
                    selectedEpisodeId === ep.id ? 'bg-primary text-white' : 'bg-slate-950 text-slate-500'
                  }`}>
                    {ep.displayId}
                  </div>
                  <span className={`text-sm font-bold truncate ${selectedEpisodeId === ep.id ? 'text-white' : 'text-slate-300'}`}>
                    {ep.title}
                  </span>
                </div>
                <StatusBadge status={ep.status} />
              </div>
              <p className="text-[10px] text-slate-500 line-clamp-1 leading-relaxed pl-10">
                {ep.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* --- 主内容区 --- */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        
        {currentEpisode.status === 'unbroken' ? (
          /* --- 未拆解状态展示 --- */
          <div className="flex-1 flex items-center justify-center bg-[#05080f] relative overflow-hidden">
            {/* 背景科技感修饰 */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
            
            <div className="max-w-md w-full p-8 text-center relative z-10 animate-fadeIn">
              {isBreakingDown ? (
                /* 拆解中：进度条展示 */
                <div className="space-y-8">
                  <div className="relative w-24 h-24 mx-auto">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
                      <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" 
                        strokeDasharray="263.89" 
                        strokeDashoffset={263.89 - (263.89 * breakdownProgress) / 100} 
                        className="text-primary transition-all duration-300" 
                        strokeLinecap="round" 
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-xl font-black text-white">{breakdownProgress}%</div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-lg font-bold text-white tracking-widest uppercase">AI 智能拆解中</h4>
                    <p className="text-sm text-slate-500 font-mono">正在分析剧本情节、角色动作及场景构图...</p>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 animate-shimmer" style={{ width: `${breakdownProgress}%`, backgroundSize: '200% 100%' }}></div>
                  </div>
                </div>
              ) : (
                /* 待拆解初始态 */
                <div className="space-y-6">
                  <div className="w-20 h-20 bg-slate-900 border border-slate-800 rounded-3xl mx-auto flex items-center justify-center text-primary shadow-2xl">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.628.282a2 2 0 01-1.806 0l-.628-.282a6 6 0 00-3.86-.517l-2.387.477a2 2 0 00-1.022.547l-.514.514a2 2 0 000 2.828l1.255 1.255a2 2 0 002.828 0l.514-.514a2 2 0 011.022-.547l2.387-.477a6 6 0 013.86.517l.628.282a2 2 0 001.806 0l.628-.282a6 6 0 00-3.86-.517l-2.387.477a2 2 0 00-1.022.547l-.514.514a2 2 0 000 2.828l1.255-1.255a2 2 0 002.828 0l-.514.514z" /></svg>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-white">需要拆分分镜</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">当前章节尚未进行分镜解析，点击下方按钮，AI将自动为您识别关键分镜、对白与构图建议。</p>
                  </div>
                  <button 
                    onClick={handleStartBreakdown}
                    className="w-full py-4 bg-primary hover:bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    立即智能拆解
                  </button>
                  <p className="text-[10px] text-slate-600 uppercase tracking-widest font-mono">Process will take approximately 10-15 seconds</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* --- 已拆解或手动创建：主编辑器界面 --- */
          <>
            <div className="flex-1 flex min-h-0 border-b border-slate-800/50">
              {/* AI 生成面板 */}
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
                      {(genTab === 'image' ? imageModels : videoModels).map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-4">
                    {/* Mode Tabs */}
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-400 border-b border-slate-800 pb-1">
                      <button 
                        onClick={() => setGenMode('ref_image')}
                        className={`flex items-center gap-1 pb-1 px-1 transition-colors ${genMode === 'ref_image' ? 'border-b-2 border-primary text-primary' : 'hover:text-slate-300'}`}
                      >
                        参考生图
                      </button>
                      <button 
                        onClick={() => setGenMode('text_image')}
                        className={`flex items-center gap-1 pb-1 px-1 transition-colors ${genMode === 'text_image' ? 'border-b-2 border-primary text-primary' : 'hover:text-slate-300'}`}
                      >
                        文本生图
                      </button>
                    </div>

                    {/* Reference Assets (Only for ref_image) */}
                    {genMode === 'ref_image' && (
                      <div className="space-y-2 animate-fadeIn">
                        <div className="flex justify-between items-center">
                          <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">关联资源</label>
                          <button 
                            onClick={() => setIsAssetModalOpen(true)}
                            className="text-[10px] text-primary hover:underline flex items-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            选择资源
                          </button>
                        </div>
                        
                        {selectedAssets.length > 0 ? (
                          <div className="grid grid-cols-4 gap-2">
                            {selectedAssets.map(asset => (
                              <div key={asset.id} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-700">
                                <img src={asset.url} className="w-full h-full object-cover" />
                                <button 
                                  onClick={() => setSelectedAssets(prev => prev.filter(a => a.id !== asset.id))}
                                  className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                              </div>
                            ))}
                            <button 
                              onClick={() => setIsAssetModalOpen(true)}
                              className="aspect-square rounded-lg border border-dashed border-slate-700 hover:border-slate-500 flex items-center justify-center text-slate-600 hover:text-slate-400 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            </button>
                          </div>
                        ) : (
                          <div 
                            onClick={() => setIsAssetModalOpen(true)}
                            className="w-full py-3 border border-dashed border-slate-700 rounded-lg flex items-center justify-center text-xs text-slate-500 hover:text-slate-300 hover:border-slate-500 cursor-pointer transition-all"
                          >
                            + 点击关联角色/场景/道具
                          </div>
                        )}
                      </div>
                    )}

                    {/* Aspect Ratio */}
                    <div className="space-y-2">
                      <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">图片比例</label>
                      <div className="grid grid-cols-4 gap-2">
                        {['16:9', '9:16', '1:1', '4:3'].map(ratio => (
                          <button
                            key={ratio}
                            onClick={() => setAspectRatio(ratio)}
                            className={`py-1.5 text-[10px] font-bold rounded border transition-all ${
                              aspectRatio === ratio 
                                ? 'bg-primary text-white border-primary' 
                                : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-500'
                            }`}
                          >
                            {ratio}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Prompt */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">提示词 (Prompt)</label>
                        <button className="text-[10px] text-primary hover:underline">润色优化</button>
                      </div>
                      <textarea 
                        value={currentShot?.prompt || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEpisodes(prev => prev.map(ep => ep.id === selectedEpisodeId ? {
                            ...ep, shots: ep.shots.map(s => s.id === selectedShotId ? { ...s, prompt: val } : s)
                          } : ep));
                        }}
                        className="w-full min-h-[120px] bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm text-slate-300 resize-y focus:border-primary outline-none shadow-inner custom-scrollbar"
                        placeholder="描述你想要的画面..."
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-900/50 border-t border-slate-800/50">
                   <button onClick={simulateGeneration} disabled={isGenerating || !currentShot} className="w-full py-3 bg-primary hover:bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                      {isGenerating ? '正在炼丹...' : `生成${genTab === 'image' ? '图片' : '视频'}`}
                   </button>
                </div>
              </div>

              {/* 预览播放器 */}
              <div className="flex-1 flex flex-col bg-black relative">
                <div className="h-12 bg-[#0b0f1a] border-b border-slate-800/50 flex items-center justify-between px-6 z-20">
                  <div className="flex items-center gap-6">
                     <button onClick={() => setShowPreview(true)} className="text-xs text-primary hover:text-indigo-400 font-bold flex items-center gap-1">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                       预览
                     </button>
                     <button className="text-xs text-slate-400 hover:text-white">画质增强</button>
                     <button className="text-xs text-slate-400 hover:text-white">一键高清</button>
                  </div>
                  <div className="flex items-center gap-2"><span className="text-[10px] text-slate-500 font-bold">比例: {aspectRatio}</span></div>
                </div>
                <div className="flex-1 flex items-center justify-center p-8">
                  <div className="relative w-full max-w-4xl aspect-video bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex items-center justify-center group shadow-2xl">
                    {activeMaterial ? (
                      activeMaterial.type === 'video' ? <video key={activeMaterial.url} src={activeMaterial.url} className="w-full h-full object-contain" controls /> : <img src={activeMaterial.url} className="w-full h-full object-contain" />
                    ) : <div className="text-slate-600 text-sm italic">当前分镜暂无素材，请先生成</div>}
                  </div>
                </div>
              </div>

              {/* 素材库 */}
              <div className="w-[300px] shrink-0 border-l border-slate-800/50 flex flex-col bg-[#0b0f1a]">
                <div className="p-4 border-b border-slate-800/50 flex justify-between items-center">
                  <h3 className="font-bold text-white text-sm">素材区</h3>
                  <button className="text-[10px] text-slate-500">上传</button>
                </div>
                <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
                   <div className="grid grid-cols-2 gap-3">
                     {currentShot?.materials.map(mat => (
                       <div key={mat.id} onClick={() => handleMaterialSelect(mat.id)} className={`relative group rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${currentShot.activeMaterialId === mat.id ? 'border-primary' : 'border-slate-800'}`}>
                         <img src={mat.thumbnail} className="w-full aspect-video object-cover" />
                         <div className="absolute top-1 left-1">
                            <div className={`text-[8px] px-1.5 py-0.5 rounded-sm text-white font-bold backdrop-blur-sm shadow-sm ${mat.type === 'video' ? 'bg-blue-600/80' : 'bg-purple-600/80'}`}>
                               {mat.type === 'video' ? '视频' : '图片'}
                            </div>
                         </div>
                         <button onClick={(e) => handleDeleteMaterial(e, mat.id)} className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center bg-black/60 hover:bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm shadow-sm">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                         </button>
                         <div className="p-1.5 bg-slate-900/90 text-[9px] text-slate-400 truncate border-t border-slate-800/50">{mat.name}</div>
                       </div>
                     ))}
                   </div>
                </div>
              </div>
            </div>

            {/* 底部时间线 */}
            <div className="h-[260px] bg-[#0b0f1a] flex flex-col shrink-0">
               <div className="h-10 border-b border-slate-800/50 flex items-center justify-between px-6 bg-slate-900/30">
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                     <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                        <span>可预览 {shots.filter(s => s.activeMaterialId).length} 个镜头</span>
                     </div>
                  </div>
                  <button onClick={handleAddShot} className="flex items-center gap-1.5 text-xs text-white bg-primary px-4 py-1.5 rounded-lg hover:bg-indigo-600 transition-all font-bold">
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
                              selectedShotId === shot.id ? 'border-primary shadow-xl scale-[1.02] z-10' : 'border-slate-800/50 hover:border-slate-700'
                            } ${draggedShotIndex === index ? 'opacity-40' : ''}`}
                          >
                            <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-slate-800">
                               {activeMat ? (
                                 <>
                                   <img src={activeMat.thumbnail} className="w-full h-full object-cover" />
                                   <div className="absolute top-1 left-1 bg-black/60 px-1 py-0.5 rounded text-[7px] text-white">
                                     {activeMat.type === 'video' ? '视频' : '图片'}
                                   </div>
                                 </>
                               ) : (
                                 <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 bg-slate-950 font-bold text-[10px]">待生成</div>
                               )}
                               <div className="absolute top-1 right-1 bg-black/40 text-[9px] text-slate-400 px-1 rounded-sm">#{shot.index}</div>
                            </div>
                            <h4 className={`text-[11px] font-bold truncate ${selectedShotId === shot.id ? 'text-primary' : 'text-slate-300'}`}>{shot.name}</h4>
                            <p className="text-[9px] text-slate-500 line-clamp-3 leading-relaxed">{shot.description}</p>
                          </div>
                        );
                     })}
                  </div>
               </div>
            </div>
          </>
        )}
      </div>

      {showPreview && (
        <EpisodePreview
          projectId={1}
          episodeId={parseInt(currentEpisode.id.replace(/\D/g, '')) || 1}
          episodeTitle={currentEpisode.title}
          onClose={() => setShowPreview(false)}
        />
      )}

      <AssetSelectorModal
        isOpen={isAssetModalOpen}
        onClose={() => setIsAssetModalOpen(false)}
        onSelect={(assets) => setSelectedAssets(assets)}
        selectedAssets={selectedAssets}
      />
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default CreationTasks;