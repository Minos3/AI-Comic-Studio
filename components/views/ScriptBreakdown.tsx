import React, { useState, useEffect, useRef } from 'react';
import { AppView, Project } from '../../types';
import { api } from '../../src/lib/api';

interface ScriptItem {
  id: number;
  content: string;
  originalFilename: string | null;
  createdAt: string;
}

interface ScriptBreakdownProps {
  onChangeView: (view: AppView) => void;
  project: Project | null;
}

const ScriptBreakdown: React.FC<ScriptBreakdownProps> = ({ onChangeView, project }) => {
  const [scripts, setScripts] = useState<ScriptItem[]>([]);
  const [scriptText, setScriptText] = useState('');
  const [selectedScriptId, setSelectedScriptId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<{
    panels: number;
    characters: number;
    scenes: number;
    lastTime: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadScripts = async () => {
    if (!project) return;
    try {
      // Get episodes first
      const epRes = await api.get(`/projects/${project.id}/episodes`);
      if (!epRes.data.success || epRes.data.data.length === 0) return;

      // Load scripts for the first episode (or iterate all)
      const allScripts: ScriptItem[] = [];
      for (const ep of epRes.data.data) {
        try {
          const res = await api.get(`/projects/${project.id}/episodes/${ep.id}/scripts`);
          if (res.data.success) {
            allScripts.push(...res.data.data);
          }
        } catch {}
      }
      setScripts(allScripts);
      if (allScripts.length > 0 && !selectedScriptId) {
        setSelectedScriptId(allScripts[0].id);
        setScriptText(allScripts[0].content || '');
      }
    } catch {}
  };

  useEffect(() => {
    if (project) loadScripts();
  }, [project?.id]);

  // When switching selected script
  useEffect(() => {
    if (selectedScriptId) {
      const s = scripts.find((s) => s.id === selectedScriptId);
      if (s) setScriptText(s.content || '');
    }
  }, [selectedScriptId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !project) return;
    setUploading(true);
    try {
      // Get or create episodes first
      const epRes = await api.get(`/projects/${project.id}/episodes`);
      let episodeId: number;
      if (epRes.data.success && epRes.data.data.length > 0) {
        episodeId = epRes.data.data[0].id;
      } else {
        const newEp = await api.post(`/projects/${project.id}/episodes`, { title: '第1集', sortOrder: 0 });
        episodeId = newEp.data.data.id;
      }

      const form = new FormData();
      form.append('file', file);
      const res = await api.post(`/projects/${project.id}/episodes/${episodeId}/scripts`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setScriptText(res.data.data.content || '');
        setSelectedScriptId(res.data.data.id);
        loadScripts();
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || '上传失败');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveContent = async () => {
    if (!selectedScriptId || !project) return;
    try {
      // Find episode for this script
      const epRes = await api.get(`/projects/${project.id}/episodes`);
      if (!epRes.data.success) return;
      for (const ep of epRes.data.data) {
        await api.patch(`/projects/${project.id}/episodes/${ep.id}/scripts/${selectedScriptId}`, { content: scriptText }).catch(() => {});
      }
    } catch {}
  };

  const handleAnalyze = async () => {
    if (!project) return;
    setIsAnalyzing(true);
    setProgress(0);

    // Animate
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 90 ? 90 : prev + Math.random() * 10));
    }, 300);

    let done = false;
    try {
      // Call breakdown on the first episode that has scripts
      const epRes = await api.get(`/projects/${project.id}/episodes`);
      if (epRes.data.success) {
        for (const ep of epRes.data.data) {
          try {
            const breakdownRes = await api.post(`/projects/${project.id}/episodes/${ep.id}/breakdown`);
            if (breakdownRes.data.success) {
              const data = breakdownRes.data.data;
              setAnalysisResult({
                panels: data.panels?.length || 0,
                characters: data.characters?.length || 0,
                scenes: data.scenes?.length || 0,
                lastTime: new Date().toLocaleString(),
              });
              done = true;
              break;
            }
          } catch {}
        }
      }
      if (!done) {
        alert('拆解失败。请确保：1) 已上传剧本 2) 已配置 Gemini API Key 3) API 额度充足');
      }
    } catch (err: any) {
      alert('拆解出错: ' + (err.message || '未知错误'));
    } finally {
      clearInterval(interval);
      setProgress(done ? 100 : 0);
      setIsAnalyzing(false);
    }
  };

  const StatCard = ({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) => (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center text-white shrink-0`}>{icon}</div>
      <div>
        <div className="text-xs text-slate-500 mb-0.5">{label}</div>
        <div className="text-2xl font-bold text-white leading-none">{value}</div>
      </div>
    </div>
  );

  if (!project) {
    return <div className="h-full flex items-center justify-center bg-[#0b0f1a] text-slate-500">请先选择一个项目</div>;
  }

  return (
    <div className="h-full flex flex-col bg-[#0b0f1a] text-slate-200 p-6 overflow-hidden">
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        {/* LEFT: Script editor */}
        <div className="flex flex-col gap-4 min-h-0">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col flex-1 overflow-hidden shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white">剧本编辑器</h3>
                <p className="text-xs text-slate-500">上传 TXT 文件或直接编辑文本</p>
              </div>
            </div>

            {/* Upload toolbar */}
            <div className="p-4 bg-slate-800/30 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <input ref={fileInputRef} type="file" accept=".txt,.doc,.docx" onChange={handleFileUpload} className="hidden" />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 text-xs font-bold text-white bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
                  {uploading ? (
                    <>上传中...</>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                      上传 TXT 剧本
                    </>
                  )}
                </button>

                {scripts.length > 0 && (
                  <select
                    value={selectedScriptId || ''}
                    onChange={(e) => setSelectedScriptId(Number(e.target.value))}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none cursor-pointer">
                    {scripts.map((s) => (
                      <option key={s.id} value={s.id}>{s.originalFilename || `剧本 #${s.id}`}</option>
                    ))}
                  </select>
                )}
                <span className="text-[10px] text-slate-500">{scripts.length} 个剧本</span>
              </div>
            </div>

            {/* Text area */}
            <div className="flex-1 relative">
              <textarea
                value={scriptText}
                onChange={(e) => setScriptText(e.target.value)}
                onBlur={handleSaveContent}
                className="w-full h-full bg-transparent p-6 text-slate-300 text-sm leading-relaxed outline-none resize-none font-sans"
                placeholder="在此粘贴或编辑剧本内容..."
              />
              <div className="absolute bottom-4 right-6 text-[10px] text-slate-600 font-mono">{scriptText.length} 字</div>
            </div>
          </div>

          {/* Analysis button */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <div className="text-xs text-slate-400 font-bold mb-3">AI 剧本分析</div>
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3 mb-4 text-[11px] text-slate-500">
              当前模板：<span className="text-slate-300 font-bold">{project.templateName || '通用风格'}</span>
              <span className="text-slate-600 ml-2">— 分析提示词将自动注入模板设定</span>
            </div>
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || scriptText.trim().length === 0}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {isAnalyzing ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  分析中 {Math.round(progress)}%...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                  AI 智能拆解剧本
                </>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT: Analysis results */}
        <div className="flex flex-col gap-6 min-h-0">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col flex-1 overflow-hidden shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">分析结果</h3>
            </div>

            {analysisResult ? (
              <div className="p-6 overflow-y-auto">
                <div className="text-xs text-slate-500 mb-4">分析时间：{analysisResult.lastTime}</div>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <StatCard label="角色" value={analysisResult.characters} color="bg-indigo-500"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>} />
                  <StatCard label="场景" value={analysisResult.scenes} color="bg-purple-500"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
                  <StatCard label="分镜" value={analysisResult.panels} color="bg-emerald-500"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>} />
                </div>

                {analysisResult.panels > 0 && (
                  <button onClick={() => onChangeView(AppView.CREATION_TASKS)}
                    className="w-full py-3 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500 hover:text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2">
                    查看分镜任务
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </button>
                )}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800/40 flex items-center justify-center">
                    <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                  </div>
                  <p className="text-slate-500 text-sm">左侧上传剧本后，点击"AI 智能拆解"</p>
                  <p className="text-slate-600 text-xs mt-1">系统将自动识别角色、场景和分镜</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScriptBreakdown;
