import React, { useEffect, useState } from 'react';
import { api } from '../../src/lib/api';

interface PreviewPanel {
  id: number;
  panelNumber: number;
  description: string;
  dialogue: string;
  status: string;
  imageUrl: string | null;
  videoUrl: string | null;
}

interface PreviewData {
  episode: { id: number; title: string; sortOrder: number };
  project: { id: number; name: string };
  panels: PreviewPanel[];
  totalPanels: number;
  completedPanels: number;
}

interface EpisodePreviewProps {
  projectId: number;
  episodeId: number;
  episodeTitle: string;
  onClose: () => void;
}

const EpisodePreview: React.FC<EpisodePreviewProps> = ({ projectId, episodeId, episodeTitle, onClose }) => {
  const [data, setData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activePanelIndex, setActivePanelIndex] = useState(0);

  useEffect(() => {
    loadPreview();
  }, [projectId, episodeId]);

  const loadPreview = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/projects/${projectId}/episodes/${episodeId}/preview`);
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || '加载预览失败');
    } finally {
      setLoading(false);
    }
  };

  const activePanel = data?.panels[activePanelIndex];

  const goNext = () => {
    if (data && activePanelIndex < data.panels.length - 1) {
      setActivePanelIndex(activePanelIndex + 1);
    }
  };

  const goPrev = () => {
    if (activePanelIndex > 0) {
      setActivePanelIndex(activePanelIndex - 1);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#020617] z-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-slate-500 text-sm">加载预览数据...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="fixed inset-0 bg-[#020617] z-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || '数据加载失败'}</p>
          <button onClick={onClose} className="px-6 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700">返回</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#020617] z-50 flex flex-col font-sans">
      {/* Top bar */}
      <div className="h-14 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/80 backdrop-blur shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="text-slate-400 hover:text-white flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <div>
            <span className="text-white font-bold">{data.project.name}</span>
            <span className="text-slate-500 mx-2">/</span>
            <span className="text-slate-300">{episodeTitle}</span>
            <span className="text-slate-500 mx-2">/</span>
            <span className="text-primary font-bold">预览模式</span>
          </div>
        </div>
        <div className="flex items-center gap-6 text-xs text-slate-500">
          <span>共 {data.totalPanels} 个分镜</span>
          <span className="text-green-400">{data.completedPanels} 已完成</span>
          <span className="text-yellow-400">{data.totalPanels - data.completedPanels} 待处理</span>
        </div>
      </div>

      {/* Main preview area */}
      <div className="flex-1 flex min-h-0">
        {/* Panel strip - left */}
        <div className="w-64 shrink-0 border-r border-slate-800 bg-slate-900/30 overflow-y-auto p-3 space-y-2">
          {data.panels.map((panel, idx) => (
            <button
              key={panel.id}
              onClick={() => setActivePanelIndex(idx)}
              className={`w-full text-left p-3 rounded-xl border transition-all ${
                idx === activePanelIndex
                  ? 'bg-primary/10 border-primary ring-1 ring-primary/20'
                  : 'bg-slate-900/50 border-transparent hover:bg-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center ${
                  panel.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'
                }`}>
                  {panel.panelNumber}
                </span>
                <span className={`text-xs font-bold truncate ${idx === activePanelIndex ? 'text-white' : 'text-slate-400'}`}>
                  分镜 #{panel.panelNumber}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 line-clamp-2">{panel.description || '无描述'}</p>
              <div className="flex gap-1 mt-1.5">
                {panel.imageUrl && <span className="text-[9px] bg-pink-500/20 text-pink-400 px-1.5 py-0.5 rounded">图</span>}
                {panel.videoUrl && <span className="text-[9px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">视频</span>}
              </div>
            </button>
          ))}
        </div>

        {/* Active panel display */}
        <div className="flex-1 flex flex-col min-w-0 bg-black/40">
          <div className="flex-1 flex items-center justify-center p-8 relative">
            {/* Navigation arrows */}
            {activePanelIndex > 0 && (
              <button onClick={goPrev} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-900/80 border border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 z-10">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
            )}
            {activePanelIndex < data.panels.length - 1 && (
              <button onClick={goNext} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-900/80 border border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 z-10">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            )}

            {activePanel ? (
              <div className="w-full max-w-5xl flex flex-col items-center gap-6">
                {/* Video (priority) */}
                {activePanel.videoUrl && (
                  <div className="w-full max-w-4xl aspect-video bg-black rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
                    <video src={activePanel.videoUrl} className="w-full h-full" controls playsInline />
                  </div>
                )}

                {/* Image */}
                {activePanel.imageUrl && !activePanel.videoUrl && (
                  <div className="w-full max-w-4xl aspect-video bg-black rounded-xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center">
                    <img src={activePanel.imageUrl} className="max-w-full max-h-full object-contain" alt={`Panel ${activePanel.panelNumber}`} />
                  </div>
                )}

                {/* Placeholder */}
                {!activePanel.imageUrl && !activePanel.videoUrl && (
                  <div className="w-full max-w-4xl aspect-video bg-slate-900 border border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center gap-4">
                    <svg className="w-16 h-16 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <span className="text-slate-600 text-sm">该分镜尚未生成素材</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded ${activePanel.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {activePanel.status === 'completed' ? '已完成' : activePanel.status === 'processing' ? '生成中' : '待处理'}
                    </span>
                  </div>
                )}

                {/* Panel info */}
                <div className="w-full max-w-4xl bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-xs font-bold text-white">
                      {activePanel.panelNumber}
                    </span>
                    <span className="text-white font-bold text-sm">分镜 #{activePanel.panelNumber}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      activePanel.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      activePanel.status === 'processing' ? 'bg-blue-500/20 text-blue-400' :
                      activePanel.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {activePanel.status === 'completed' ? '已完成' :
                       activePanel.status === 'processing' ? '生成中' :
                       activePanel.status === 'failed' ? '失败' : '待处理'}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed mb-2">{activePanel.description || '暂无描述'}</p>
                  {activePanel.dialogue && (
                    <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-3">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 block">对话</span>
                      <p className="text-slate-300 text-sm leading-relaxed">{activePanel.dialogue}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-slate-600 text-sm">暂无分镜数据</div>
            )}
          </div>

          {/* Bottom progress bar */}
          <div className="h-12 border-t border-slate-800 flex items-center px-6 bg-slate-900/50 shrink-0 gap-4">
            <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-300"
                style={{ width: `${data.totalPanels > 0 ? ((activePanelIndex + 1) / data.totalPanels) * 100 : 0}%` }}
              />
            </div>
            <span className="text-xs text-slate-500 font-mono whitespace-nowrap">
              {activePanelIndex + 1} / {data.totalPanels}
            </span>
          </div>
        </div>
      </div>

      {/* Keyboard nav hint */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-[10px] text-slate-600 pointer-events-none">
        使用 ← → 键或点击两侧按钮切换分镜
      </div>
    </div>
  );
};

export default EpisodePreview;
