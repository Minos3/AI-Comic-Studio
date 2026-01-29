import React, { useState, useEffect } from 'react';
import { AppView, Project } from '../../types';

interface ScriptBreakdownProps {
  onChangeView: (view: AppView) => void;
  project: Project | null;
}

const ScriptBreakdown: React.FC<ScriptBreakdownProps> = ({ onChangeView, project }) => {
  // State for script content
  const [scriptText, setScriptText] = useState(`标题：《我的仙人夫君有了白月光》

作者：城里

题材：都市修仙+高手下山+甜宠

设定卖点：
男主表面只是天玄老祖，实际上是掌控天下命脉的隐世共主。
男主作为长生者，下山后的行为逻辑和世界观冲突。
主角深藏不露，看似被围攻，实则一切尽在掌握。
身份反差萌：无敌老祖在妻子面前秒变“温和夫君”，形成强烈反差。
女主是男主道侣转世，即使男主现任也是男主前任。

设定亮点：
1、高密度反转打脸，节奏爽快. 每集必有爆点：从李家覆灭 -> 许家破产 -> 神皇被揭穿 -> 九幽魔覆灭，层层升级。`);

  const [selectedScriptFileName, setSelectedScriptFileName] = useState(project?.scripts?.[0] || '');

  // State for analysis simulation
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysisData, setAnalysisData] = useState({
    characters: 0,
    scenes: 0,
    items: 0,
    creatures: 0,
    episodes: 0,
    lastTime: '2026/1/29 12:34:59'
  });

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setProgress(0);
    
    // Simulate progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsAnalyzing(false);
          setAnalysisData({
            characters: 6,
            scenes: 3,
            items: 8,
            creatures: 4,
            episodes: 1,
            lastTime: new Date().toLocaleString()
          });
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  const StatCard = ({ label, value, subtitle, icon, color }: { label: string, value: number, subtitle: string, icon: React.ReactNode, color: string }) => (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 flex items-center gap-4 hover:border-slate-500 transition-colors group">
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center text-white shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div>
        <div className="text-xs text-slate-500 mb-0.5">{label}</div>
        <div className="text-2xl font-bold text-white leading-none mb-1">{value}</div>
        <div className="text-[10px] text-slate-600 truncate">{subtitle}</div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-[#0b0f1a] text-slate-200 p-6 overflow-hidden">
      
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        
        {/* --- Left Column: Script Recognition --- */}
        <div className="flex flex-col gap-4 min-h-0">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col flex-1 overflow-hidden shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white">剧本识别</h3>
                <p className="text-xs text-slate-500">上传 TXT/DOC/DOCX 或直接粘贴文本，系统会自动解析角色、场景与物品。</p>
              </div>
              <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                刷新剧本
              </button>
            </div>

            {/* Script Selection Dropdown & Upload Area */}
            <div className="p-4 bg-slate-800/30 border-b border-slate-800 space-y-3">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500">选择当前处理的剧本文档:</label>
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <select 
                      value={selectedScriptFileName}
                      onChange={(e) => setSelectedScriptFileName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-3 pr-8 py-2 text-xs text-slate-200 focus:outline-none focus:border-primary appearance-none cursor-pointer"
                    >
                      {project?.scripts && project.scripts.length > 0 ? (
                        project.scripts.map((script, idx) => (
                          <option key={idx} value={script}>{script}</option>
                        ))
                      ) : (
                        <option value="">未上传剧本</option>
                      )}
                    </select>
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                  <button className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/5 px-3 py-2 rounded-lg border border-blue-500/20 whitespace-nowrap">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    上传新剧本
                  </button>
                  <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded">失效</span>
                </div>
              </div>
            </div>

            {/* Script Textarea */}
            <div className="flex-1 relative">
              <textarea 
                value={scriptText}
                onChange={(e) => setScriptText(e.target.value)}
                className="w-full h-full bg-transparent p-6 text-slate-300 text-sm leading-relaxed outline-none resize-none font-sans custom-scrollbar"
                placeholder="请输入剧本内容..."
              />
              <div className="absolute bottom-4 right-6 text-[10px] text-slate-600 font-mono">
                {scriptText.length} / 200000
              </div>
            </div>
          </div>

          {/* Left Bottom Actions */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
             <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-xs font-bold text-slate-400">模板选择 (可选)</label>
                  <button className="text-[10px] text-slate-500 hover:text-white">更多</button>
                </div>
                <div className="relative group">
                  <div className="flex items-center justify-between w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-300 cursor-pointer hover:border-slate-500 transition-colors">
                    <span className="flex items-center gap-2">
                      通用资产提取
                      <span className="text-[10px] text-slate-500">包含预制模版与已收藏模版</span>
                    </span>
                    <svg className="w-4 h-4 text-slate-500 group-hover:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
             </div>
             
             <div className="bg-slate-800/20 border border-slate-700/50 rounded-xl p-3">
                <div className="text-[11px] text-slate-500 mb-1">该提示词无需变量，可直接生成。</div>
                <div className="text-[10px] text-slate-600">说明：该提示词为「剧本识别」专用模版，系统会自动校验结构并把剧本文本添加到提示词末尾。</div>
             </div>

             <button 
               onClick={handleAnalyze}
               disabled={isAnalyzing}
               className="w-full py-4 bg-gradient-to-r from-[#a855f7] to-[#6366f1] hover:from-[#b366ff] hover:to-[#7477ff] text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:grayscale"
             >
                {isAnalyzing ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    正在智能分析剧本...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                    分析剧本
                  </>
                )}
             </button>
          </div>
        </div>

        {/* --- Right Column: Analysis Results --- */}
        <div className="flex flex-col gap-6 min-h-0">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col flex-1 overflow-hidden shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">分析结果预览</h3>
              <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                刷新统计
              </button>
            </div>

            {/* Analysis Summary Bar */}
            <div className="p-6 bg-slate-800/20 border-b border-slate-800 flex items-center justify-between">
               <div className="flex-1">
                 <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">最近分析时间</div>
                 <div className="text-xl font-mono font-bold text-white mb-1">{analysisData.lastTime}</div>
                 <div className="text-[11px] text-slate-600">系统会结合剧本自动识别角色、场景、物品等实体。</div>
               </div>
               
               {/* Resized and centered Progress Bar - Smaller as requested */}
               <div className="relative w-16 h-16 shrink-0 ml-4">
                 <svg className="w-full h-full -rotate-90 block">
                   <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="5" fill="transparent" className="text-slate-800" />
                   <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="5" fill="transparent" strokeDasharray={175.9} strokeDashoffset={175.9 - (175.9 * progress) / 100} className="text-primary transition-all duration-300" strokeLinecap="round" />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-black text-white leading-none">{progress}%</span>
                    <span className="text-[7px] text-slate-500 mt-0.5 whitespace-nowrap">已完成 {analysisData.episodes}/0</span>
                 </div>
               </div>
            </div>

            {/* Stats Grid */}
            <div className="p-6 overflow-y-auto">
               <div className="grid grid-cols-2 gap-4 mb-8">
                  <StatCard 
                    label="角色" 
                    value={analysisData.characters} 
                    subtitle="来源于角色自动识别" 
                    color="bg-indigo-500"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                  />
                  <StatCard 
                    label="场景" 
                    value={analysisData.scenes} 
                    subtitle="覆盖的场景数量" 
                    color="bg-purple-500"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                  />
                  <StatCard 
                    label="物品" 
                    value={analysisData.items} 
                    subtitle="关键道具数量" 
                    color="bg-blue-500"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
                  />
                  <StatCard 
                    label="生物" 
                    value={analysisData.creatures} 
                    subtitle="涉及的动物/生物" 
                    color="bg-cyan-500"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                  />
               </div>

               {/* Episode Overview */}
               <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    分集概览
                    <span className="text-[10px] text-slate-500 font-normal">确认脚本内容是否已经覆盖所有分集。</span>
                  </h4>
                  <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50 flex items-center gap-6">
                    <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-primary shadow-inner">
                       <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-0.5">分集数量</div>
                      <div className="text-3xl font-black text-white leading-none">{analysisData.episodes}</div>
                      <div className="text-[11px] text-slate-600 mt-1">脚本中可识别的章节/分集总量</div>
                    </div>
                  </div>
               </div>

               {/* Success Indicator */}
               {analysisData.episodes > 0 && !isAnalyzing && (
                 <div className="mt-8 animate-fadeIn">
                   <button 
                     onClick={() => onChangeView(AppView.CREATION_TASKS)}
                     className="w-full py-3 bg-white/5 border border-primary/30 text-primary hover:bg-primary hover:text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 group"
                   >
                     查看分镜任务
                     <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                   </button>
                 </div>
               )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ScriptBreakdown;