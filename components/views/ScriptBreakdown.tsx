import React, { useState } from 'react';
import { AppView } from '../../types';

interface ScriptBreakdownProps {
  onChangeView: (view: AppView) => void;
}

// Mock Data for the breakdown result based on user request (Storyboard)
const MOCK_STORYBOARD_RESULT = `这是一个基于Sora 2模型特性设计的，精确到帧的动画分镜头脚本。

**整体风格设定**：
*   **画风**：2D日漫风格（Japanese Anime Style），色彩明亮清透，线条细腻。
*   **场景**：天玄宗秘境（高饱和度的蓝天、翠绿的古树、青石板地）。

---

### 第一组：奇葩的修炼日常（00:00 - 00:15）
**关键帧描述词**：阳光透过茂密的树叶洒在青石板上，画面色彩清新明亮。画面左侧，凌绝崖仰躺在地，双脚顶着木板，洛无霜踩高跷立于木板上；画面右侧，沈忘川戴着墨镜躺在吊床上吃西瓜，江有川坐在电动轮椅上打瞌睡。典型的日漫轻松日常氛围。

*   **Shot 1**
    *   **Duration**: 1.5s
    *   **Scene (简述)**: 环境空镜，一只肥硕的橘猫趴在草丛中，瞳孔竖立，死死盯着树枝上。
    *   **Sora Prompt (详细)**: 全景，背景是秘境院子，一棵大树和青石板，大树下一只肥硕的橘猫趴在草丛中，瞳孔竖立，死死盯着树枝上。背景是模糊的蓝天和摇曳的树影，日漫赛璐珞上色风格。
    *   **Camera**:  Wide Shot, High angle looking down (高角度俯拍).
*   **Shot 2**
    *   **Duration**: 1.5s
    *   **Scene (简述)**: 环境空镜，树上的麻雀叽叽喳喳叫。
    *   **Sora Prompt (详细)**: 近景，一只麻雀在树枝上叽叽喳喳。背景是秘境院子，模糊的蓝天和摇曳的树影，日漫赛璐珞上色风格。
    *   **Camera**: Medium Shot (中景，变焦).
*   **Shot 3**
    *   **Duration**: 2.0s
    *   **Scene (简述)**: 沈忘川躺在吊床上吃西瓜。
    *   **Sora Prompt (详细)**: 中景镜头。沈忘川一身花哨沙滩装，戴着墨镜躺在吊床上悠闲摇晃，手里拿着一片西瓜咬了一口。
    *   **Camera**: Dolly Right (向右平移).`;

// Mock Data for Asset Extraction
const MOCK_ASSET_RESULT = `**人物**：
1. **沈忘川**
   - 设定文案：沈忘川，国漫风格，2D，生成人物是全身三视图（全身正面图，全身背面图，面部特写）。英俊少年，外表约20岁，黑色短发，眼神深邃带有一丝玩世不恭。身穿花哨的夏威夷沙滩衬衫和沙滩裤，戴着黑色墨镜，脚踩人字拖。表情自信、慵懒，嘴角上扬，散发着一种隐藏的强者气息。

2. **凌绝崖**
   - 设定文案：凌绝崖，国漫风格，2D，全身三视图。青年道士，发型凌乱，身穿青色道袍，表情夸张逗比，肢体语言丰富。

3. **洛无霜**
   - 设定文案：洛无霜，国漫风格，2D，全身三视图。可爱少女，双丸子头，身穿粉白相间的改良道袍，下身是灯笼裤，脚踩高跷。

**场景**：
1. **天玄宗秘境**
   - 设定文案：天玄宗秘境，国漫风格，2D，场景原画。高饱和度的蓝天白云，阳光明媚。画面中央是一棵巨大的古树，树冠遮天蔽日，树下是青石板铺成的广场，周围有古老的石灯笼。

**道具**：
1. **高科技电动轮椅**
   - 设定文案：高科技电动轮椅，国漫风格，2D，道具设计图。带有未来感的金属光泽，结构复杂，带有显示屏和操作杆，与修仙背景形成强烈反差。`;

const MODES = {
  CLAUDE: {
    id: 'CLAUDE',
    label: 'CLAUDE拆剧本',
    defaultPrompt: '请拆分第一集，第一集的时长应该在4分钟以上，所以最少18组镜头，每组不少于4-6个镜头，日漫风格，2D，所有提示词都要是中文。'
  },
  GEMINI: {
    id: 'GEMINI',
    label: 'GEMINI拆剧本',
    defaultPrompt: '请拆分第一集，第一集的时长应该在4分钟以上，所以最少18组镜头，每组不少于4-6个镜头，日漫风格，2D，所有提示词都要是中文。'
  },
  ASSET: {
    id: 'ASSET',
    label: '资产提取拆分',
    defaultPrompt: '请提取剧本中所有的人物、场景和道具，为每个元素生成详细的中文AI绘图提示词，必须是中文。日漫风格，2D。'
  }
};

const ScriptBreakdown: React.FC<ScriptBreakdownProps> = ({ onChangeView }) => {
  // State
  const [selectedScript, setSelectedScript] = useState('仙人夫君 (分集剧情).docx');
  const [episodes, setEpisodes] = useState<string[]>([]);
  const [selectedEpisode, setSelectedEpisode] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [isBreakingDown, setIsBreakingDown] = useState(false);
  const [result, setResult] = useState('');
  const [showScriptModal, setShowScriptModal] = useState(false);

  // Mode State
  const [selectedMode, setSelectedMode] = useState<keyof typeof MODES>('CLAUDE');
  const [prompt, setPrompt] = useState(MODES.CLAUDE.defaultPrompt);

  // Handlers
  const handleDetectEpisodes = () => {
    setIsDetecting(true);
    // Simulate API delay
    setTimeout(() => {
      setEpisodes(['第一集：初入秘境', '第二集：师徒相遇', '第三集：风波起']);
      setSelectedEpisode('第一集：初入秘境');
      setIsDetecting(false);
    }, 1200);
  };

  const handleBreakdown = () => {
    if (!selectedScript) return;
    setIsBreakingDown(true);
    // Simulate Processing delay
    setTimeout(() => {
      // Return different mock results based on mode
      if (selectedMode === 'ASSET') {
        setResult(MOCK_ASSET_RESULT);
      } else {
        setResult(MOCK_STORYBOARD_RESULT);
      }
      setIsBreakingDown(false);
    }, 2000);
  };

  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMode = e.target.value as keyof typeof MODES;
    setSelectedMode(newMode);
    setPrompt(MODES[newMode].defaultPrompt);
    // Clear previous result when mode changes to avoid confusion
    setResult('');
  };

  const handleUseResult = () => {
    if (selectedMode === 'ASSET') {
      // Simulate importing assets to Image Assets view
      console.log('Importing assets:', result);
      onChangeView(AppView.ASSETS_IMAGES);
    } else {
      // Simulate importing storyboard to Creation Tasks view
      console.log('Importing storyboard tasks:', result);
      onChangeView(AppView.CREATION_TASKS);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0f172a] text-slate-200 p-6 overflow-hidden">
      
      {/* --- Top Control Bar --- */}
      <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-3 flex flex-wrap items-center gap-4 mb-4 shadow-sm shrink-0">
        
        {/* Script Selector */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-400 font-medium">选择剧本:</label>
          <div className="relative">
            <select 
              value={selectedScript}
              onChange={(e) => setSelectedScript(e.target.value)}
              className="bg-slate-800 border border-slate-600 text-white text-sm rounded-md px-3 py-1.5 pr-8 focus:ring-2 focus:ring-primary focus:border-transparent outline-none min-w-[240px] appearance-none"
            >
              <option>仙人夫君 (分集剧情).docx</option>
              <option>赛博侦探实录.txt</option>
              <option>魔法学院日常.pdf</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>

        {/* View Script Button */}
        <button 
          onClick={() => setShowScriptModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 border border-slate-600 hover:bg-slate-700 rounded-md text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          查看
        </button>

        {/* Detect Episodes Button */}
        <button 
          onClick={handleDetectEpisodes}
          disabled={isDetecting}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 border border-slate-600 hover:bg-slate-700 rounded-md text-sm transition-colors disabled:opacity-50"
        >
          {isDetecting ? (
             <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          ) : (
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          )}
          检测集数
        </button>

        {/* Episodes Dropdown (Conditional) */}
        {episodes.length > 0 && (
          <div className="relative animate-fadeIn">
            <select 
              value={selectedEpisode}
              onChange={(e) => setSelectedEpisode(e.target.value)}
              className="bg-slate-800 border border-slate-600 text-white text-sm rounded-md px-3 py-1.5 pr-8 focus:ring-2 focus:ring-primary outline-none appearance-none"
            >
              {episodes.map(ep => <option key={ep} value={ep}>{ep}</option>)}
            </select>
             <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        )}

        <div className="h-6 w-px bg-slate-700 mx-2"></div>

        {/* Mode Selector */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-400">模式:</label>
          <div className="relative">
             <select 
               value={selectedMode}
               onChange={handleModeChange}
               className="bg-slate-800 border border-slate-600 text-white text-sm rounded-md px-3 py-1.5 pr-8 focus:ring-2 focus:ring-primary outline-none appearance-none"
             >
              {Object.values(MODES).map(mode => (
                <option key={mode.id} value={mode.id}>{mode.label}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="ml-auto flex items-center gap-3">
          <button className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm px-2">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             历史
          </button>
          <button 
            onClick={handleBreakdown}
            disabled={isBreakingDown || !selectedScript}
            className={`flex items-center gap-2 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-shadow
              ${isBreakingDown || !selectedScript 
                ? 'bg-slate-600 cursor-not-allowed' 
                : 'bg-primary hover:bg-indigo-600 hover:shadow-lg hover:shadow-primary/30'}
            `}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" /></svg>
            拆分剧本
          </button>
        </div>
      </div>

      {/* --- Main Grid Content --- */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
        
        {/* Left Column: Configuration & Info */}
        <div className="flex flex-col gap-4">
          
          {/* Prompt Configuration */}
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-1 flex flex-col flex-1">
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800">
               <div className="flex items-center gap-2">
                 <span className="text-sm font-bold text-slate-200">提示词配置</span>
                 <span className="text-xs bg-primary/20 text-primary border border-primary/30 px-1.5 rounded">{MODES[selectedMode].label}</span>
               </div>
            </div>
            
            <div className="p-4 flex flex-col flex-1 gap-4">
              <div className="flex justify-between items-center">
                 <label className="text-sm font-medium text-slate-300">预制提示词</label>
                 <button className="text-xs flex items-center gap-1 text-slate-400 hover:text-white bg-slate-800 px-2 py-1 rounded border border-slate-700">
                   <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                   保存为我的
                 </button>
              </div>
              
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="flex-1 w-full bg-slate-950/50 border border-slate-700 rounded-lg p-4 text-sm text-slate-300 focus:outline-none focus:border-primary resize-none leading-relaxed"
                placeholder="在此输入或修改提示词..."
              />
            </div>
          </div>

          {/* Script Info */}
          <div className="bg-slate-900 border border-slate-700 rounded-lg h-48 flex flex-col shrink-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
              <span className="text-sm font-bold text-slate-200">剧本信息:</span>
              <button onClick={() => setShowScriptModal(true)} className="text-xs text-primary hover:underline flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                查看内容
              </button>
            </div>
            <div className="p-4 space-y-2.5">
              <div className="flex gap-2 text-sm">
                <span className="text-slate-500 w-16">文件名:</span>
                <span className="text-slate-200">{selectedScript}</span>
              </div>
              <div className="flex gap-2 text-sm">
                <span className="text-slate-500 w-16">所属项目:</span>
                <span className="text-slate-200">我的仙人夫君</span>
              </div>
              <div className="flex gap-2 text-sm">
                <span className="text-slate-500 w-16">上传者:</span>
                <span className="text-slate-200">王箭</span>
              </div>
              <div className="text-xs text-slate-600 mt-2 flex items-center gap-1 cursor-pointer hover:text-slate-400">
                 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                 双击查看剧本内容
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Results */}
        <div className="bg-slate-900 border border-slate-700 rounded-lg flex flex-col overflow-hidden relative">
           <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900 z-10">
              <span className="text-sm font-bold text-slate-200">拆分结果</span>
              {result && !isBreakingDown && (
                <button 
                  onClick={handleUseResult}
                  className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold rounded shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  使用拆分结果
                </button>
              )}
           </div>

           <div className="flex-1 relative bg-black/20">
             {isBreakingDown ? (
               <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 z-20">
                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                 <p className="animate-pulse">正在智能拆分剧本镜头...</p>
                 <p className="text-xs text-slate-600 mt-2">Connecting to AI Model...</p>
               </div>
             ) : !result ? (
               <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                 <svg className="w-20 h-20 mb-4 opacity-20" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"></path></svg>
                 <p>请选择剧本并点击"拆分剧本"按钮</p>
               </div>
             ) : (
               <textarea 
                value={result}
                onChange={(e) => setResult(e.target.value)}
                className="w-full h-full bg-transparent p-6 text-slate-300 text-sm leading-relaxed font-mono resize-none focus:outline-none focus:bg-slate-900/30 transition-colors"
                spellCheck={false}
               />
             )}
           </div>
        </div>

      </div>

      {/* Script View Modal */}
      {showScriptModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-8">
           <div className="bg-slate-900 w-full max-w-4xl h-[80vh] rounded-xl border border-slate-700 shadow-2xl flex flex-col">
              <div className="flex justify-between items-center p-4 border-b border-slate-800">
                <h3 className="text-lg font-bold text-white">{selectedScript} - 预览</h3>
                <button onClick={() => setShowScriptModal(false)} className="text-slate-400 hover:text-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 bg-slate-950">
                <p className="text-slate-300 whitespace-pre-wrap leading-loose font-serif">
{`SCENE 1 - INT. HALL - DAY

沈忘川 (18岁, 银发墨镜, 花哨沙滩装) 躺在宗门大殿的房梁上，手里拿着最新的《修仙周刊》。
凌绝崖 (20岁, 青袍) 冲进大殿，脸上的表情扭曲。

凌绝崖
(大喊)
师兄！大事不好了！师傅把后山的灵猪全卖了！

沈忘川翻了个身，墨镜滑下来一点。

沈忘川
(懒洋洋)
卖就卖了呗，反正你也抓不住。

洛无霜 (18岁, 双丸子头, 踩着高跷) 摇摇晃晃地走进来。

洛无霜
师兄，可是那只灵猪肚子里...有师傅的私房钱啊！

沈忘川瞬间坐起，墨镜反光。

沈忘川
备剑。我要去"清理门户"。
...`}
                </p>
              </div>
              <div className="p-4 border-t border-slate-800 flex justify-end">
                <button onClick={() => setShowScriptModal(false)} className="px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700">关闭</button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default ScriptBreakdown;