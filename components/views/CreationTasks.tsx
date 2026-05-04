import React, { useState, useEffect } from 'react';
import { Project, EpisodeSummary, Asset } from '../../types';
import { api } from '../../src/lib/api';
import AssetSelectorModal from '../AssetSelectorModal';
import EpisodePreview from './EpisodePreview';

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

type EpisodeStatus = 'broken' | 'unbroken' | 'manual';

interface EpisodeLocal {
  id: string;
  displayId: string;
  apiId: number;
  title: string;
  status: EpisodeStatus;
  description: string;
  shots: Shot[];
}

const CreationTasks: React.FC<{ project: Project | null; onProjectUpdated: (p: Project) => void }> = ({ project, onProjectUpdated }) => {
  const [episodes, setEpisodes] = useState<EpisodeLocal[]>([]);
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string>('');
  const [selectedShotId, setSelectedShotId] = useState<string>('');
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEpisodeModal, setShowEpisodeModal] = useState(false);
  const [editingEpisodeId, setEditingEpisodeId] = useState<number | null>(null);
  const [episodeTitle, setEpisodeTitle] = useState('');
  const [episodeSortOrder, setEpisodeSortOrder] = useState('0');

  const loadEpisodes = async () => {
    if (!project) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/projects/${project.id}/episodes`);
      if (res.data.success) {
        const apiEpisodes: EpisodeSummary[] = res.data.data;
        const mapped: EpisodeLocal[] = apiEpisodes.map((ep, i) => {
          const existing = episodes.find((e) => e.apiId === ep.id);
          return {
            id: `ep_${ep.id}`,
            displayId: `E${String(i + 1).padStart(2, '0')}`,
            apiId: ep.id,
            title: ep.title,
            status: (existing?.status || 'unbroken') as EpisodeStatus,
            description: `排序 ${ep.sortOrder} · ${new Date(ep.createdAt).toLocaleDateString()}`,
            shots: existing?.shots || [],
          };
        });
        setEpisodes(mapped);
        if (mapped.length > 0) {
          setSelectedEpisodeId((prev) => {
            const exists = mapped.find((e) => e.id === prev);
            return exists ? prev : mapped[0].id;
          });
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || '加载分集失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (project) loadEpisodes();
  }, [project?.id]);

  const currentEpisode = episodes.find((e) => e.id === selectedEpisodeId);
  const shots = currentEpisode?.shots || [];
  const currentShot = shots.find((s) => s.id === selectedShotId) || null;
  const activeMaterial = currentShot?.materials.find((m) => m.id === currentShot?.activeMaterialId) || null;

  const openCreateEpisode = () => {
    setEditingEpisodeId(null);
    setEpisodeTitle(`第${episodes.length + 1}集`);
    setEpisodeSortOrder(String(episodes.length));
    setShowEpisodeModal(true);
  };

  const openEditEpisode = (ep: EpisodeLocal) => {
    setEditingEpisodeId(ep.apiId);
    setEpisodeTitle(ep.title);
    setEpisodeSortOrder(String(0));
    setShowEpisodeModal(true);
  };

  const handleEpisodeSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    try {
      if (editingEpisodeId) {
        await api.patch(`/projects/${project.id}/episodes/${editingEpisodeId}`, { title: episodeTitle, sortOrder: Number(episodeSortOrder) });
      } else {
        await api.post(`/projects/${project.id}/episodes`, { title: episodeTitle, sortOrder: Number(episodeSortOrder) });
      }
      setShowEpisodeModal(false);
      loadEpisodes();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || '保存失败');
    }
  };

  const handleDeleteEpisode = async (apiId: number) => {
    if (!project || !confirm('确定删除该分集？')) return;
    try {
      await api.delete(`/projects/${project.id}/episodes/${apiId}`);
      loadEpisodes();
    } catch { setError('删除失败'); }
  };

  const handleStartBreakdown = () => {
    if (!project || !currentEpisode) return;
    setIsBreakingDown(true);
    setBreakdownProgress(0);

    // Call real API
    api.post(`/projects/${project.id}/episodes/${currentEpisode.apiId}/breakdown`)
      .then(() => {
        setBreakdownProgress(100);
        setTimeout(() => {
          setEpisodes((prev) => prev.map((ep) => ep.id === currentEpisode.id ? { ...ep, status: 'broken' as EpisodeStatus } : ep));
          setIsBreakingDown(false);
          loadEpisodes(); // Reload to get panels
        }, 500);
      })
      .catch((err) => {
        setIsBreakingDown(false);
        alert(err.response?.data?.error?.message || '拆解失败，请确认已上传剧本且已配置 Gemini API Key');
      });

    // Animate progress while waiting
    const interval = setInterval(() => {
      setBreakdownProgress((prev) => {
        if (prev >= 90) { clearInterval(interval); return 90; }
        return prev + Math.random() * 15;
      });
    }, 300);
  };

  const handleAddShot = () => {
    if (!currentEpisode) return;
    const newId = 's_' + Date.now();
    const newShot: Shot = {
      id: newId, index: shots.length + 1, name: `新分镜 #${shots.length + 1}`, duration: 3,
      description: '点击修改分镜描述...', prompt: '', status: 'pending', materials: [],
    };
    setEpisodes((prev) => prev.map((ep) => ep.id === currentEpisode.id ? { ...ep, shots: [...ep.shots, newShot] } : ep));
    setSelectedShotId(newId);
  };

  const handleShotClick = (id: string) => setSelectedShotId(id);
  const handleMaterialSelect = (materialId: string) => {
    if (!currentEpisode) return;
    setEpisodes((prev) => prev.map((ep) => ep.id === currentEpisode.id ? {
      ...ep, shots: ep.shots.map((s) => s.id === selectedShotId ? { ...s, activeMaterialId: materialId } : s),
    } : ep));
  };

  const handleDeleteMaterial = (e: React.MouseEvent, materialId: string) => {
    e.stopPropagation();
    if (!currentEpisode || !confirm('确认删除该素材？')) return;
    setEpisodes((prev) => prev.map((ep) => ep.id === currentEpisode.id ? {
      ...ep, shots: ep.shots.map((s) => {
        if (s.id !== selectedShotId) return s;
        const newMaterials = s.materials.filter((m) => m.id !== materialId);
        const newActiveId = s.activeMaterialId === materialId ? (newMaterials[0]?.id) : s.activeMaterialId;
        return { ...s, materials: newMaterials, activeMaterialId: newActiveId };
      }),
    } : ep));
  };

  const handleDragStart = (index: number) => setDraggedShotIndex(index);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (index: number) => {
    if (draggedShotIndex === null || !currentEpisode) return;
    const newShots = [...shots];
    const [dragged] = newShots.splice(draggedShotIndex, 1);
    newShots.splice(index, 0, dragged);
    const updated = newShots.map((s, i) => ({ ...s, index: i + 1 }));
    setEpisodes((prev) => prev.map((ep) => ep.id === currentEpisode.id ? { ...ep, shots: updated } : ep));
    setDraggedShotIndex(null);
  };

  const handleGenerate = async () => {
    if (!currentShot || !project) return;
    const prompt = currentShot.prompt || currentShot.description;
    if (!prompt) { alert('请先填写提示词'); return; }
    setIsGenerating(true);
    try {
      const res = await api.post('/tasks', {
        panelId: 0, type: genTab, modelId: genTab === 'image' ? 1 : 3,
        prompt: genTab === 'image' ? `${prompt}, 16:9, high quality` : `${prompt}, smooth motion, ${aspectRatio}`,
      });
      if (res.data.success) {
        alert('任务已提交！WebSocket 将实时推送生成状态。');
      }
    } catch (err: any) {
      alert('提交失败：' + (err.response?.data?.error?.message || '请先配置 AI 模型'));
    } finally {
      setIsGenerating(false);
    }
  };

  const StatusBadge = ({ status }: { status: EpisodeStatus }) => {
    const configs: Record<EpisodeStatus, { label: string; color: string }> = {
      broken: { label: '已拆解', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
      unbroken: { label: '未拆解', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
      manual: { label: '手动创建', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    };
    const c = configs[status];
    return <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold ${c.color}`}>{c.label}</span>;
  };

  const imageModels = ['nanobanana', 'jimeng', 'gemini-image', 'gpt-image', 'grok-image'];
  const videoModels = ['seedance', 'sora', 'grok-video'];

  // ---- RENDER ----
  if (!project) {
    return <div className="h-full flex items-center justify-center text-slate-500">请先选择一个项目</div>;
  }

  return (
    <div className="h-full flex bg-[#05080f] text-slate-300 font-sans overflow-hidden">
      {/* LEFT: Episode list */}
      <div className="w-[280px] shrink-0 border-r border-slate-800/50 flex flex-col bg-[#0b0f1a] z-20">
        <div className="p-4 border-b border-slate-800/50 flex items-center justify-between bg-slate-900/40">
          <h3 className="font-bold text-white text-base">分集列表</h3>
          <button onClick={openCreateEpisode} className="text-xs bg-primary text-white px-2.5 py-1 rounded shadow-lg shadow-primary/20 hover:bg-indigo-600 transition-all flex items-center gap-1 font-bold">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
            新建
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
          {loading ? (
            <div className="text-center py-8 text-slate-600 text-xs">加载中...</div>
          ) : episodes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600 text-xs mb-3">还没有分集</p>
              <button onClick={openCreateEpisode} className="text-xs text-primary hover:underline">创建第一个分集</button>
            </div>
          ) : (
            episodes.map((ep) => (
              <div key={ep.id} onClick={() => setSelectedEpisodeId(ep.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer group flex flex-col gap-2 ${
                  selectedEpisodeId === ep.id ? 'bg-primary/10 border-primary ring-1 ring-primary/20' : 'bg-slate-900/50 border-transparent hover:bg-slate-800 hover:border-slate-700'
                }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center font-bold text-xs ${selectedEpisodeId === ep.id ? 'bg-primary text-white' : 'bg-slate-950 text-slate-500'}`}>
                      {ep.displayId}
                    </div>
                    <span className={`text-sm font-bold truncate ${selectedEpisodeId === ep.id ? 'text-white' : 'text-slate-300'}`}>{ep.title}</span>
                  </div>
                  <StatusBadge status={ep.status} />
                </div>
                <div className="flex items-center justify-end gap-1">
                  <button onClick={(e) => { e.stopPropagation(); openEditEpisode(ep); }} className="text-[10px] text-slate-500 hover:text-white">编辑</button>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteEpisode(ep.apiId); }} className="text-[10px] text-slate-500 hover:text-red-400">删除</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {!currentEpisode || currentEpisode.status === 'unbroken' ? (
          /* ---- EMPTY or UNBROKEN STATE ---- */
          <div className="flex-1 flex items-center justify-center bg-[#05080f] relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-md w-full p-8 text-center relative z-10">
              {isBreakingDown ? (
                <div className="space-y-8">
                  <div className="relative w-24 h-24 mx-auto">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
                      <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" fill="transparent"
                        strokeDasharray="263.89" strokeDashoffset={263.89 - (263.89 * Math.min(breakdownProgress, 100)) / 100}
                        className="text-primary transition-all duration-300" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-xl font-black text-white">{Math.round(breakdownProgress)}%</div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-lg font-bold text-white">AI 智能拆解中</h4>
                    <p className="text-sm text-slate-500 font-mono">正在分析剧本情节、角色动作及场景构图...</p>
                  </div>
                </div>
              ) : episodes.length === 0 ? (
                <div className="space-y-6">
                  <div className="w-20 h-20 bg-slate-900 border border-slate-800 rounded-3xl mx-auto flex items-center justify-center text-slate-600">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-white">创建第一个分集</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">点击左侧「新建」按钮创建分集，然后上传剧本开始AI拆解。</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="w-20 h-20 bg-slate-900 border border-slate-800 rounded-3xl mx-auto flex items-center justify-center text-primary shadow-2xl">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.628.282a2 2 0 01-1.806 0l-.628-.282a6 6 0 00-3.86-.517l-2.387.477a2 2 0 00-1.022.547l-.514.514a2 2 0 000 2.828l1.255 1.255a2 2 0 002.828 0l.514-.514a2 2 0 011.022-.547l2.387-.477a6 6 0 013.86.517l.628.282a2 2 0 001.806 0l.628-.282a6 6 0 013.86-.517l2.387.477a2 2 0 011.022.547l.514.514a2 2 0 002.828 0l-1.255-1.255a2 2 0 00-2.828 0l.514-.514z" /></svg>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-white">需要拆分分镜</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">当前分集尚未进行分镜解析，点击下方按钮，AI将自动识别关键分镜、对白与构图建议。</p>
                  </div>
                  <button onClick={handleStartBreakdown}
                    className="w-full py-4 bg-primary hover:bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    立即智能拆解
                  </button>
                  <p className="text-[10px] text-slate-600">需先上传剧本到当前分集 | 消耗一次 AI 调用</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ---- BROKEN: SHOW SHOTS EDITOR ---- */
          <>
            <div className="flex-1 flex min-h-0 border-b border-slate-800/50">
              {/* AI Generate Panel */}
              <div className="w-[310px] shrink-0 border-r border-slate-800/50 flex flex-col bg-[#0b0f1a]">
                <div className="p-4 border-b border-slate-800/50 flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm">AI 生成</h3>
                  <div className="flex bg-slate-900 rounded p-1">
                    <button onClick={() => setGenTab('image')} className={`px-3 py-1 text-xs rounded transition-all ${genTab === 'image' ? 'bg-primary text-white' : 'text-slate-500'}`}>生图</button>
                    <button onClick={() => setGenTab('video')} className={`px-3 py-1 text-xs rounded transition-all ${genTab === 'video' ? 'bg-primary text-white' : 'text-slate-500'}`}>生视频</button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
                  <div className="space-y-2">
                    <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">AI 模型</label>
                    <select className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-primary outline-none cursor-pointer">
                      {(genTab === 'image' ? imageModels : videoModels).map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-400 border-b border-slate-800 pb-1">
                      <button onClick={() => setGenMode('ref_image')} className={`pb-1 px-1 transition-colors ${genMode === 'ref_image' ? 'border-b-2 border-primary text-primary' : 'hover:text-slate-300'}`}>参考生图</button>
                      <button onClick={() => setGenMode('text_image')} className={`pb-1 px-1 transition-colors ${genMode === 'text_image' ? 'border-b-2 border-primary text-primary' : 'hover:text-slate-300'}`}>文本生图</button>
                    </div>

                    {genMode === 'ref_image' && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">关联资源</label>
                          <button onClick={() => setIsAssetModalOpen(true)} className="text-[10px] text-primary hover:underline">选择资源</button>
                        </div>
                        {selectedAssets.length === 0 && (
                          <div onClick={() => setIsAssetModalOpen(true)}
                            className="w-full py-3 border border-dashed border-slate-700 rounded-lg flex items-center justify-center text-xs text-slate-500 hover:text-slate-300 hover:border-slate-500 cursor-pointer transition-all">
                            + 点击关联角色/场景/道具
                          </div>
                        )}
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">图片比例</label>
                      <div className="grid grid-cols-4 gap-2">
                        {['16:9', '9:16', '1:1', '4:3'].map((r) => (
                          <button key={r} onClick={() => setAspectRatio(r)}
                            className={`py-1.5 text-[10px] font-bold rounded border transition-all ${aspectRatio === r ? 'bg-primary text-white border-primary' : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-500'}`}>{r}</button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">提示词</label>
                        <button className="text-[10px] text-primary hover:underline">润色</button>
                      </div>
                      <textarea value={currentShot?.prompt || ''} readOnly
                        className="w-full min-h-[100px] bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm text-slate-300 resize-y focus:border-primary outline-none"
                        placeholder="选择分镜后显示提示词..." />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-900/50 border-t border-slate-800/50">
                  <button onClick={handleGenerate} disabled={isGenerating || !currentShot}
                    className="w-full py-3 bg-primary hover:bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                    {isGenerating ? '生成中...' : `生成${genTab === 'image' ? '图片' : '视频'}`}
                  </button>
                </div>
              </div>

              {/* Preview area */}
              <div className="flex-1 flex flex-col bg-black relative">
                <div className="h-12 bg-[#0b0f1a] border-b border-slate-800/50 flex items-center justify-between px-6 z-20">
                  <div className="flex items-center gap-6">
                    <button onClick={() => setShowPreview(true)} className="text-xs text-primary hover:text-indigo-400 font-bold flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      预览
                    </button>
                  </div>
                </div>
                <div className="flex-1 flex items-center justify-center p-8">
                  <div className="relative w-full max-w-4xl aspect-video bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex items-center justify-center shadow-2xl">
                    {activeMaterial ? (
                      activeMaterial.type === 'video' ? <video key={activeMaterial.url} src={activeMaterial.url} className="w-full h-full object-contain" controls /> : <img src={activeMaterial.url} className="w-full h-full object-contain" />
                    ) : (
                      <div className="text-slate-600 text-sm">{currentShot ? '分镜暂无素材，点击左侧生成' : '选择分镜开始创作'}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Materials panel */}
              <div className="w-[300px] shrink-0 border-l border-slate-800/50 flex flex-col bg-[#0b0f1a]">
                <div className="p-4 border-b border-slate-800/50 flex justify-between items-center">
                  <h3 className="font-bold text-white text-sm">素材区</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
                  {currentShot?.materials && currentShot.materials.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {currentShot.materials.map((mat) => (
                        <div key={mat.id} onClick={() => handleMaterialSelect(mat.id)}
                          className={`relative group rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${currentShot.activeMaterialId === mat.id ? 'border-primary' : 'border-slate-800'}`}>
                          <img src={mat.thumbnail} className="w-full aspect-video object-cover" />
                          <button onClick={(e) => handleDeleteMaterial(e, mat.id)}
                            className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center bg-black/60 hover:bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-all">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                          <div className="p-1.5 bg-slate-900/90 text-[9px] text-slate-400 truncate">{mat.name}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-600 text-xs">暂无素材</div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom timeline */}
            <div className="h-[260px] bg-[#0b0f1a] flex flex-col shrink-0">
              <div className="h-10 border-b border-slate-800/50 flex items-center justify-between px-6 bg-slate-900/30">
                <span className="text-xs text-slate-500">{shots.length} 个分镜</span>
                <button onClick={handleAddShot} className="flex items-center gap-1.5 text-xs text-white bg-primary px-4 py-1.5 rounded-lg hover:bg-indigo-600 transition-all font-bold">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                  新增分镜
                </button>
              </div>
              <div className="flex-1 overflow-x-auto p-4 custom-scrollbar">
                <div className="flex gap-4 min-w-max pb-4">
                  {shots.map((shot, index) => {
                    const activeMat = shot.materials.find((m) => m.id === shot.activeMaterialId);
                    return (
                      <div key={shot.id} draggable onDragStart={() => handleDragStart(index)} onDragOver={handleDragOver} onDrop={() => handleDrop(index)}
                        onClick={() => handleShotClick(shot.id)}
                        className={`w-[220px] bg-slate-900 border-2 rounded-xl p-3 cursor-grab active:cursor-grabbing transition-all flex flex-col gap-2 relative group ${
                          selectedShotId === shot.id ? 'border-primary shadow-xl scale-[1.02] z-10' : 'border-slate-800/50 hover:border-slate-700'
                        } ${draggedShotIndex === index ? 'opacity-40' : ''}`}>
                        <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-slate-800">
                          {activeMat ? (
                            <>
                              <img src={activeMat.thumbnail} className="w-full h-full object-cover" />
                              <div className="absolute top-1 left-1 bg-black/60 px-1 py-0.5 rounded text-[7px] text-white">{activeMat.type === 'video' ? '视频' : '图片'}</div>
                            </>
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 bg-slate-950 font-bold text-[10px]">空镜头</div>
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

      {/* Episode modal */}
      {showEpisodeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">{editingEpisodeId ? '编辑分集' : '新建分集'}</h3>
              <button onClick={() => setShowEpisodeModal(false)} className="text-slate-400 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleEpisodeSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">标题</label>
                <input value={episodeTitle} onChange={(e) => setEpisodeTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-primary outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">排序</label>
                <input type="number" value={episodeSortOrder} onChange={(e) => setEpisodeSortOrder(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <button type="submit" className="w-full bg-primary hover:bg-indigo-600 text-white py-3 rounded-lg font-bold transition-all">
                {editingEpisodeId ? '保存修改' : '立即创建'}
              </button>
            </form>
          </div>
        </div>
      )}

      {showPreview && currentEpisode && project && (
        <EpisodePreview
          projectId={project.id}
          episodeId={currentEpisode.apiId}
          episodeTitle={currentEpisode.title}
          onClose={() => setShowPreview(false)}
        />
      )}

      <AssetSelectorModal isOpen={isAssetModalOpen} onClose={() => setIsAssetModalOpen(false)}
        onSelect={(assets) => setSelectedAssets(assets)} selectedAssets={selectedAssets} />
    </div>
  );
};

export default CreationTasks;
