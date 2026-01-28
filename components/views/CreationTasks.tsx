import React, { useState, useEffect } from 'react';

interface AssetReference {
  id: string;
  type: 'character' | 'scene' | 'prop';
  name: string;
  url?: string;
  status?: 'linked' | 'missing';
}

interface Shot {
  id: string;
  name: string;
  duration: number;
  description: string;

  // Script Breakdown Fields
  scene: string;
  imagePrompt: string;
  videoPrompt: string;
  dialogue: string;
  camera: string;

  // Assets for image generation
  assets: AssetReference[];

  status: 'pending' | 'generating' | 'completed';
  thumbnail?: string;
  videoUrl?: string;
  keyframes: {
    id: string;
    label: string;
    imageUrl?: string;
    type: 'ref' | 'key' | 'start' | 'end';
  }[];
}

interface Task {
  id: string;
  name: string;
  type: 'video' | 'image';
  status: 'queued' | 'generating' | 'success' | 'failed' | 'cancelled';
  createTime: string;
  user: string;
  cost: string;
  group?: string;
  errorMessage?: string;
}

const MOCK_TASKS: Task[] = [
  {
    id: 't1',
    name: '*Shot 1** * **Duration**: 3.0',
    type: 'video',
    status: 'cancelled',
    createTime: '2026/1/22 20:27:06',
    user: '鲸空',
    cost: '15s',
    group: '第八组第1组'
  },
  {
    id: 't2',
    name: '*Shot 1** * **Duration**: 3.0',
    type: 'video',
    status: 'failed',
    createTime: '2026/1/22 19:40:52',
    user: '鲸空',
    cost: '15s',
    group: '第八组第1组',
    errorMessage: '错误: 此内容可能违反关于裸露、性内容或色情内容的相关规定。'
  },
  {
    id: 't5',
    name: '*Shot 1** * **Duration**: 3.0',
    type: 'video',
    status: 'generating',
    createTime: '2026/1/22 20:30:15',
    user: '鲸空',
    cost: '15s',
    group: '第九组第1组',
  }
];

// Mock Asset Library Data (Simulating data from AssetManager)
const MOCK_ASSET_LIBRARY = [
  { id: 'lib_1', name: '麻雀', type: 'character' as const, url: 'https://picsum.photos/seed/sparrow/400/300' },
  { id: 'lib_2', name: '橘猫', type: 'character' as const, url: 'https://picsum.photos/seed/cat/400/300' },
  { id: 'lib_3', name: '沈忘川 (全身)', type: 'character' as const, url: 'https://picsum.photos/seed/shen1/400/300' },
  { id: 'lib_4', name: '凌绝崖 Q版', type: 'character' as const, url: 'https://picsum.photos/seed/ling/400/300' },
  { id: 'lib_5', name: '洛无霜 Q版', type: 'character' as const, url: 'https://picsum.photos/seed/luo/400/300' },
  { id: 'lib_6', name: '天玄宗秘境', type: 'scene' as const, url: 'https://picsum.photos/seed/scene1/400/300' },
  { id: 'lib_7', name: '秘境院子', type: 'scene' as const, url: 'https://picsum.photos/seed/yard/400/300' },
  { id: 'lib_8', name: '高科技轮椅', type: 'prop' as const, url: 'https://picsum.photos/seed/wheelchair/400/300' },
  { id: 'lib_9', name: '古剑', type: 'prop' as const, url: 'https://picsum.photos/seed/sword/400/300' },
];

// Episode Data Mock
const EPISODES = ['第一集：初入秘境', '第二集：师徒相遇', '第三集：风波起'];

const MOCK_SHOTS_EP1: Shot[] = [
  {
    id: '1',
    name: '镜头2 佛像细节与磨刀声铺垫',
    duration: 1.5,
    description: '无人物，镜头聚焦在佛像残存的半张脸上...',
    scene: '环境空镜，树上的麻雀叽叽喳喳叫，树下的橘猫盯着树上。',
    imagePrompt: '近景，一只麻雀在树枝上叽叽喳喳。背景是秘境院子，模糊的蓝天和摇曳的树影，日漫赛璐珞上色风格。',
    videoPrompt: '近景，一只麻雀在树枝上叽叽喳喳。背景是秘境院子，模糊的蓝天和摇曳的树影，日漫赛璐珞上色风格。',
    dialogue: '(环境音：鸟叫声，风吹树叶声)',
    camera: 'Medium Shot (中景，变焦)',
    assets: [
      { id: 'a1', type: 'character', name: '麻雀', url: 'https://picsum.photos/seed/sparrow/200/200' },
      { id: 'a2', type: 'scene', name: '秘境院子', url: 'https://picsum.photos/seed/yard/200/200' }
    ],
    status: 'completed',
    thumbnail: 'https://picsum.photos/seed/shot2/200/120',
    videoUrl: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
    keyframes: [
      { id: 'k1', label: '上镜尾帧', type: 'ref', imageUrl: 'https://picsum.photos/seed/prev_end/150/150' },
      { id: 'k2', label: '关键帧 #1', type: 'key', imageUrl: 'https://picsum.photos/seed/shot2_key1/150/150' },
      { id: 'k3', label: '关键帧 #2', type: 'key', imageUrl: 'https://picsum.photos/seed/shot2_key2/150/150' },
    ]
  },
  {
    id: '2',
    name: '镜头3 陆隐磨剑特写镜头',
    duration: 10,
    description: '陆隐紧握磨刀石，双臂肌肉紧绷...',
    scene: '陆隐在院子角落磨剑，神情专注。',
    imagePrompt: 'Lu Yin holding a whetstone, muscles tense, grinding a broken sword, sparks flying, intense eyes, macro shot, anime style.',
    videoPrompt: 'Lu Yin holding a whetstone, muscles tense, grinding a broken sword, sparks flying, intense eyes, macro shot, anime style.',
    dialogue: '陆隐: (内心独白) 只有这把剑能斩断因果...',
    camera: 'Close-up (特写), Handheld shake (手持晃动)',
    assets: [],
    status: 'pending',
    thumbnail: 'https://picsum.photos/seed/shot3/200/120',
    keyframes: [
      { id: 'k1', label: '上镜尾帧', type: 'ref' },
      { id: 'k2', label: '首帧', type: 'start' },
      { id: 'k3', label: '尾帧', type: 'end' },
    ]
  },
  {
    id: '3',
    name: '镜头4 林幼薇反应镜头',
    duration: 6,
    description: '林幼薇身体微微颤抖...',
    scene: '林幼薇看到陆隐磨剑，感到恐惧。',
    imagePrompt: 'Lin Youwei trembling, fearful expression, dark background, cinematic anime style.',
    videoPrompt: 'Lin Youwei trembling, fearful expression, dark background, cinematic anime style.',
    dialogue: '林幼薇: 他...他是认真的吗？',
    camera: 'Reaction Shot (反应镜头), Dolly Zoom (滑动变焦)',
    assets: [],
    status: 'pending',
    keyframes: [
      { id: 'k1', label: '关键帧 #1', type: 'key' },
    ]
  },
  {
    id: '4',
    name: '镜头5 三鬼降临揭示镜头',
    duration: 9,
    description: '大鬼手持巨斧伫立在中央...',
    scene: '三鬼突然出现在院子中央，气氛压抑。',
    imagePrompt: 'Three demons appearing, giant axe, chain scythe, sparks on stone floor, ominous atmosphere, anime style.',
    videoPrompt: 'Three demons appearing, giant axe, chain scythe, sparks on stone floor, ominous atmosphere, anime style.',
    dialogue: '大鬼: 终于找到你了...',
    camera: 'Low Angle (低角度), Reveal (揭示镜头)',
    assets: [],
    status: 'pending',
    keyframes: []
  },
  {
    id: '5',
    name: '镜头6 大鬼攻击动作镜头',
    duration: 7,
    description: '大鬼怒吼着双斧泰山压顶劈下...',
    scene: '大鬼发起攻击，陆隐躲避。',
    imagePrompt: 'Giant demon attacking with dual axes, dynamic action shot, motion blur, Lu Yin dodging.',
    videoPrompt: 'Giant demon attacking with dual axes, dynamic action shot, motion blur, Lu Yin dodging.',
    dialogue: '(巨大的撞击声)',
    camera: 'Tracking Shot (跟随镜头), Fast Cut (快剪)',
    assets: [],
    status: 'pending',
    keyframes: []
  }
];

const MOCK_SHOTS_EP2: Shot[] = [
  {
    id: '201',
    name: '镜头1 师徒初见',
    duration: 4,
    description: '师尊站在山顶，背对镜头...',
    scene: '高山之巅，云雾缭绕，师尊背影高深莫测。',
    imagePrompt: 'Master standing on mountain peak, back view, clouds, mysterious atmosphere.',
    videoPrompt: 'Master standing on mountain peak, back view, clouds, mysterious atmosphere.',
    dialogue: '师尊: 你来了。',
    camera: 'Wide Shot (全景)',
    assets: [],
    status: 'pending',
    keyframes: []
  }
];

const CreationTasks: React.FC = () => {
  // Episode & Shot State
  const [currentEpisode, setCurrentEpisode] = useState(() => localStorage.getItem('creation_active_episode') || EPISODES[0]);
  const [shots, setShots] = useState<Shot[]>(() => {
    const saved = localStorage.getItem(`shots_${localStorage.getItem('creation_active_episode') || EPISODES[0]}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedShotId, setSelectedShotId] = useState<string>('');

  // Center Column Tabs
  const [controlTab, setControlTab] = useState<'script' | 'image' | 'video'>('script');

  // Right Column Preview Mode
  const [previewMode, setPreviewMode] = useState<'preview' | 'edit'>('preview');

  // Configuration States
  const [videoModel, setVideoModel] = useState('DoubaoSeedance Pro1.5');
  const [imageModel, setImageModel] = useState('Nanobanana');
  const [isGenerating, setIsGenerating] = useState(false);

  // Task List State
  const [showTaskPanel, setShowTaskPanel] = useState(false);
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);

  // Asset Preview / Select State
  const [previewAsset, setPreviewAsset] = useState<AssetReference | null>(null);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [assetModalType, setAssetModalType] = useState<'character' | 'scene' | 'prop'>('character');
  const [assetSearch, setAssetSearch] = useState('');
  const [selectedAssetFromLib, setSelectedAssetFromLib] = useState<string | null>(null);

  // Script Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisPrompt, setAnalysisPrompt] = useState('请拆分第一集，提取所有镜头的提示词、人物、场景和道具。日漫风格，2D，所有提示词都要是中文。');

  const selectedShot = shots.find(s => s.id === selectedShotId) || (shots.length > 0 ? shots[0] : undefined);

  // Handle Episode Change
  const handleEpisodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const ep = e.target.value;
    setCurrentEpisode(ep);
    localStorage.setItem('creation_active_episode', ep);
    // LOAD from local storage if exists, otherwise empty
    const saved = localStorage.getItem(`shots_${ep}`);
    if (saved) {
      setShots(JSON.parse(saved));
      setSelectedShotId(''); // Reset selection or restore? Reset is safer for now
    } else {
      setShots([]);
      setSelectedShotId('');
    }
  };

  // Persist shots on change
  useEffect(() => {
    if (currentEpisode && shots.length > 0) {
      localStorage.setItem(`shots_${currentEpisode}`, JSON.stringify(shots));
    }
  }, [shots, currentEpisode]);

  // Handle Script Analysis - Smart Analysis with Asset Matching
  const handleAnalyzeScript = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      // Helper to find matching asset logic
      const findAsset = (name: string, type: 'character' | 'scene' | 'prop'): AssetReference => {
        const found = MOCK_ASSET_LIBRARY.find(a => a.name.includes(name) && a.type === type);
        if (found) {
          return { id: found.id, type, name: found.name, url: found.url, status: 'linked' };
        }
        return { id: `new_${Date.now()}_${Math.random()}`, type, name, status: 'missing' };
      };

      // Mock re-analyzed shots with enhanced data
      const analyzedShots: Shot[] = [
        {
          id: 'analyzed_1', name: 'Shot 1 · 环境空镜', duration: 1.5,
          description: '环境空镜，一只肥硕的橘猫趴在草丛中。',
          scene: '秘境院子 - 大树下的青石板',
          imagePrompt: '全景，背景是秘境院子，一棵大树和青石板，大树下一只肥硕的橘猫趴在草丛中，瞳孔竖立，死死盯着树枝上。背景是模糊的蓝天和摇曳的树影，日漫赛璐珞上色风格。',
          videoPrompt: '全景，背景是秘境院子，一棵大树和青石板，大树下一只肥硕的橘猫趴在草丛中，瞳孔竖立，死死盯着树枝上。背景是模糊的蓝天和摇曳的树影，日漫赛璐珞上色风格。',
          dialogue: '(环境音：鸟叫声)', camera: 'Wide Shot, High angle (高角度俯拍)',
          assets: [
            findAsset('橘猫', 'character'),
            findAsset('天玄宗秘境', 'scene'),
            findAsset('青石板', 'prop'), // Likely missing
          ],
          status: 'pending', keyframes: []
        },
        {
          id: 'analyzed_2', name: 'Shot 2 · 麻雀特写', duration: 1.5,
          description: '环境空镜，树上的麻雀叽叽喳喳叫。',
          scene: '秘境院子 - 树枝上',
          imagePrompt: '近景，一只麻雀在树枝上叽叽喳喳。背景是秘境院子，模糊的蓝天和摇曳的树影，日漫赛璐珞上色风格。',
          videoPrompt: '近景，一只麻雀在树枝上叽叽喳喳。背景是秘境院子，模糊的蓝天和摇曳的树影，日漫赛璐珞上色风格。',
          dialogue: '(麻雀叫声)', camera: 'Medium Shot (中景，变焦)',
          assets: [findAsset('麻雀', 'character')],
          status: 'pending', keyframes: []
        },
        {
          id: 'analyzed_3', name: 'Shot 3 · 沈忘川吃西瓜', duration: 2.0,
          description: '沈忘川躺在吊床上吃西瓜。', scene: '秘境院子 - 吊床',
          imagePrompt: '中景镜头。沈忘川一身花哨沙滩装，戴着墨镜躺在吊床上悠闲摇晃，手里拿着一片西瓜咬了一口。',
          videoPrompt: '中景镜头。沈忘川一身花哨沙滩装，戴着墨镜躺在吊床上悠闲摇晃，手里拿着一片西瓜咬了一口。',
          dialogue: '(咀嚼声)', camera: 'Dolly Right (向右平移)',
          assets: [
            findAsset('沈忘川', 'character'),
            findAsset('秘境院子', 'scene'),
            findAsset('西瓜', 'prop'),
            findAsset('墨镜', 'prop'), // Likely missing
          ],
          status: 'pending', keyframes: []
        },
      ];
      setShots(analyzedShots);
      setSelectedShotId(analyzedShots[0].id);
      setIsAnalyzing(false);
    }, 2500);
  };

  // Handle Script Field Updates
  const handleScriptUpdate = (field: keyof Shot, value: string) => {
    setShots(prev => prev.map(s => s.id === selectedShotId ? { ...s, [field]: value } : s));
  };

  // Open Modal to Add Asset
  const handleOpenAssetModal = (type: 'character' | 'scene' | 'prop') => {
    setAssetModalType(type);
    setAssetSearch('');
    setSelectedAssetFromLib(null);
    setShowAssetModal(true);
  };

  // Import Selected Asset from Library
  const confirmImportAsset = () => {
    if (!selectedAssetFromLib) return;
    const assetData = MOCK_ASSET_LIBRARY.find(a => a.id === selectedAssetFromLib);
    if (!assetData) return;

    const newAsset: AssetReference = {
      id: Date.now().toString(), // unique instance id
      type: assetData.type,
      name: assetData.name,
      url: assetData.url
    };

    setShots(prev => prev.map(s => {
      if (s.id === selectedShotId) {
        // Simple check to avoid duplicates if desired, though shots might need multiple instances
        return { ...s, assets: [...s.assets, newAsset] };
      }
      return s;
    }));
    setShowAssetModal(false);
  };

  const handleRemoveAsset = (e: React.MouseEvent, assetId: string) => {
    e.stopPropagation();
    setShots(prev => prev.map(s =>
      s.id === selectedShotId
        ? { ...s, assets: s.assets.filter(a => a.id !== assetId) }
        : s
    ));
  };

  const handleGenerate = () => {
    if (!selectedShot) return;
    setIsGenerating(true);
    const newTask: Task = {
      id: Date.now().toString(),
      name: `*${selectedShot.name.substring(0, 10)}...** * **Duration**: ${selectedShot.duration}`,
      type: controlTab === 'video' ? 'video' : 'image',
      status: 'generating',
      createTime: new Date().toLocaleString(),
      user: '鲸空',
      cost: controlTab === 'video' ? '15s' : '2pts',
      group: '新建任务组'
    };
    setTasks([newTask, ...tasks]);

    setTimeout(() => {
      setIsGenerating(false);
      setTasks(prev => prev.map(t => t.id === newTask.id ? { ...t, status: 'success' } : t));
    }, 3000);
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'cancelled': return 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10';
      case 'failed': return 'text-red-500 border-red-500/30 bg-red-500/10';
      case 'success': return 'text-green-500 border-green-500/30 bg-green-500/10';
      case 'generating': return 'text-blue-500 border-blue-500/30 bg-blue-500/10';
      case 'queued': return 'text-slate-400 border-slate-500/30 bg-slate-500/10';
      default: return 'text-slate-500';
    }
  };

  const getStatusLabel = (status: Task['status']) => {
    switch (status) {
      case 'cancelled': return '已取消';
      case 'failed': return '失败';
      case 'success': return '完成';
      case 'generating': return '生成中';
      case 'queued': return '排队中';
      default: return status;
    }
  };

  const generatingCount = tasks.filter(t => t.status === 'generating').length;

  // Helper to render an asset section
  const renderAssetSection = (title: string, type: 'character' | 'scene' | 'prop') => {
    if (!selectedShot) return null;
    const assets = selectedShot.assets?.filter(a => a.type === type) || [];

    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</label>
          <button
            onClick={() => handleOpenAssetModal(type)}
            className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 hover:bg-blue-500/10 px-1.5 py-0.5 rounded transition-colors"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            添加
          </button>
        </div>
        <div className="flex flex-wrap gap-2 min-h-[44px] bg-slate-800/20 rounded p-2 border border-slate-800/50">
          {assets.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-xs text-slate-600 italic">暂无{title.split(' ')[0]}</span>
            </div>
          ) : (
            assets.map(asset => (
              <div
                key={asset.id}
                onClick={() => setPreviewAsset(asset)}
                className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-full pl-1 pr-2 py-1 cursor-pointer hover:border-pink-500/50 hover:bg-slate-700 group transition-all"
              >
                <img src={asset.url} alt={asset.name} className="w-6 h-6 rounded-full object-cover" />
                <span className="text-xs text-slate-300 max-w-[80px] truncate">{asset.name}</span>
                <button
                  onClick={(e) => handleRemoveAsset(e, asset.id)}
                  className="w-4 h-4 rounded-full flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-white/10 ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex bg-[#0f172a] text-slate-200 overflow-hidden relative">

      {/* --- Column 1: Storyboard List (Left) --- */}
      {/* --- Column 1: Storyboard List (Left) --- */}
      <div className="w-96 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 z-20">
        <div className="p-3 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-white flex items-center gap-2 text-sm">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            分镜列表
          </h3>
          <div className="relative">
            <select
              value={currentEpisode}
              onChange={handleEpisodeChange}
              className="w-32 bg-slate-800 border border-slate-700 text-xs text-white rounded px-2 py-1 pr-6 outline-none focus:border-primary appearance-none truncate"
              title={currentEpisode}
            >
              {EPISODES.map(ep => <option key={ep} value={ep}>{ep}</option>)}
            </select>
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {shots.length === 0 ? (
            /* Empty State: Show analysis controls when no shots */
            <div className="h-full flex flex-col items-center justify-center p-4 text-center">
              <div className="w-full max-w-xs space-y-5">
                {/* Empty Icon */}
                <div className="mx-auto w-16 h-16 rounded-full bg-slate-800/50 border border-slate-700 flex items-center justify-center">
                  <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">暂无分镜数据</h4>
                  <p className="text-xs text-slate-500">请分析剧本自动提取分镜</p>
                </div>

                {/* Analysis Prompt */}
                <div className="text-left space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">分析提示词</label>
                  <textarea
                    value={analysisPrompt}
                    onChange={(e) => setAnalysisPrompt(e.target.value)}
                    placeholder="输入分析指令..."
                    className="w-full h-20 bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                {/* Analyze Button */}
                <button
                  onClick={handleAnalyzeScript}
                  disabled={isAnalyzing}
                  className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-slate-600 disabled:to-slate-600 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30 transition-all disabled:opacity-70"
                >
                  {isAnalyzing ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      分析中...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      分析剧本
                    </>
                  )}
                </button>

                <p className="text-[10px] text-slate-600">
                  自动提取：镜头 · 提示词 · 人物 · 场景 · 道具
                </p>
              </div>
            </div>
          ) : (
            shots.map(shot => (
              <div
                key={shot.id}
                onClick={() => setSelectedShotId(shot.id)}
                className={`p-5 rounded-lg cursor-pointer border transition-all ${selectedShotId === shot.id
                  ? 'bg-primary/10 border-primary text-white shadow-lg shadow-primary/10'
                  : 'bg-slate-800/50 border-transparent hover:bg-slate-800 hover:border-slate-700 text-slate-400'
                  }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-slate-900 text-slate-400 text-xs px-1.5 rounded font-mono">#{shot.id.split('_')[1] || shot.id}</span>
                    <span className="font-medium text-lg line-clamp-1 text-slate-200" title={shot.name}>{shot.name.split('·')[1] || shot.name}</span>
                  </div>
                  <span className="text-sm bg-slate-950 px-1.5 py-0.5 rounded text-slate-500">{shot.duration}s</span>
                </div>

                <p className="text-base opacity-60 line-clamp-2 mb-2 leading-relaxed">{shot.description}</p>

                {/* Asset Chips */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {shot.assets.map(asset => (
                    <div
                      key={asset.id}
                      onClick={(e) => {
                        if (asset.status === 'missing') {
                          e.stopPropagation();
                          setAssetSearch(asset.name); // Pre-fill search
                          handleOpenAssetModal(asset.type);
                        }
                      }}
                      className={`text-xs px-1.5 py-0.5 rounded border flex items-center gap-1 transition-colors ${asset.status === 'missing'
                        ? 'bg-red-500/10 border-red-500/50 text-red-400 border-dashed hover:bg-red-500/20 cursor-copy'
                        : 'bg-slate-700/50 border-slate-600 text-slate-300'
                        }`}
                      title={asset.status === 'missing' ? '点击创建缺失素材' : asset.name}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${asset.type === 'character' ? 'bg-pink-500' : asset.type === 'scene' ? 'bg-green-500' : 'bg-blue-500'
                        }`}></span>
                      {asset.name}
                      {asset.status === 'missing' && <span className="text-[9px] opacity-70 ml-0.5">(缺)</span>}
                    </div>
                  ))}
                  {(!shot.assets || shot.assets.length === 0) && (
                    <span className="text-[10px] text-slate-600 italic">No assets detected</span>
                  )}
                </div>

                {shot.status === 'completed' && (
                  <div className="flex items-center gap-1 text-[10px] text-green-400 mt-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Generated
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Task List Floating Button */}
        <div className="p-3 border-t border-slate-800 bg-slate-900">
          <button
            onClick={() => setShowTaskPanel(!showTaskPanel)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all ${showTaskPanel ? 'bg-slate-800 border-slate-600' : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800'}`}
          >
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${generatingCount > 0 ? 'bg-blue-500 animate-pulse' : 'bg-slate-500'}`}></div>
              <span className="text-sm font-medium text-slate-300">任务列表</span>
            </div>
            {generatingCount > 0 && (
              <span className="text-xs bg-blue-500 text-white px-1.5 rounded-full">{generatingCount}</span>
            )}
            <svg className={`w-4 h-4 text-slate-500 transition-transform ${showTaskPanel ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
          </button>
        </div>
      </div>

      {/* --- Column 2: Creation Controls (Center) --- */}
      {/* --- Column 2: Creation Controls (Center) --- */}
      <div className="w-[400px] bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 z-10">

        {/* Control Tabs */}
        <div className="flex border-b border-slate-800">
          <button
            onClick={() => setControlTab('script')}
            className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${controlTab === 'script' ? 'text-green-400 border-green-400 bg-green-500/5' : 'text-slate-400 border-transparent hover:text-white'}`}
          >
            镜头文案
          </button>
          <button
            onClick={() => setControlTab('image')}
            className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${controlTab === 'image' ? 'text-pink-400 border-pink-400 bg-pink-500/5' : 'text-slate-400 border-transparent hover:text-white'}`}
          >
            镜头图片
          </button>
          <button
            onClick={() => setControlTab('video')}
            className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${controlTab === 'video' ? 'text-blue-400 border-blue-400 bg-blue-500/5' : 'text-slate-400 border-transparent hover:text-white'}`}
          >
            视频生成
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">

          {/* === Tab: Shot Script === */}
          {controlTab === 'script' && (
            !selectedShot ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 p-6 text-center">
                <svg className="w-12 h-12 mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm">请先分析剧本生成分镜</p>
              </div>
            ) : (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <h4 className="text-white font-bold text-sm mb-1">{selectedShot.name}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">Duration: {selectedShot.duration}s</span>
                    <span className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">Shot {selectedShot.id}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-green-400 uppercase tracking-wider">Scene (简述)</label>
                    <textarea
                      value={selectedShot.scene}
                      onChange={(e) => handleScriptUpdate('scene', e.target.value)}
                      className="w-full text-sm text-slate-300 bg-slate-800/30 p-3 rounded border border-slate-700/50 leading-relaxed focus:border-green-500/50 focus:bg-slate-800 outline-none resize-none min-h-[80px]"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-blue-400 uppercase tracking-wider">Image Prompt (画面)</label>
                      <button className="text-[10px] text-blue-400 hover:underline">复制到视频</button>
                    </div>
                    <textarea
                      value={selectedShot.imagePrompt}
                      onChange={(e) => handleScriptUpdate('imagePrompt', e.target.value)}
                      className="w-full text-sm text-slate-300 bg-slate-800/30 p-3 rounded border border-slate-700/50 leading-relaxed focus:border-blue-500/50 focus:bg-slate-800 outline-none resize-none min-h-[100px]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Video Prompt (视频)</label>
                    <textarea
                      value={selectedShot.videoPrompt}
                      onChange={(e) => handleScriptUpdate('videoPrompt', e.target.value)}
                      className="w-full text-sm text-slate-300 bg-slate-800/30 p-3 rounded border border-slate-700/50 leading-relaxed focus:border-cyan-500/50 focus:bg-slate-800 outline-none resize-none min-h-[100px]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-yellow-400 uppercase tracking-wider">Dialogue</label>
                    <textarea
                      value={selectedShot.dialogue}
                      onChange={(e) => handleScriptUpdate('dialogue', e.target.value)}
                      className="w-full text-sm text-slate-300 bg-slate-800/30 p-3 rounded border border-slate-700/50 leading-relaxed italic focus:border-yellow-500/50 focus:bg-slate-800 outline-none resize-none min-h-[60px]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-purple-400 uppercase tracking-wider">Camera</label>
                    <input
                      type="text"
                      value={selectedShot.camera}
                      onChange={(e) => handleScriptUpdate('camera', e.target.value)}
                      className="w-full text-sm text-slate-300 bg-slate-800/30 px-3 py-2 rounded border border-slate-700/50 focus:border-purple-500/50 focus:bg-slate-800 outline-none"
                    />
                  </div>
                </div>
              </div>
            )
          )}

          {/* === Tab: Shot Image === */}
          {controlTab === 'image' && (
            !selectedShot ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 p-6 text-center">
                <svg className="w-12 h-12 mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm">请先分析剧本生成分镜</p>
              </div>
            ) : (
              <div className="space-y-6 animate-fadeIn">
                {/* Model Select */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">图片模型选择</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div
                      onClick={() => setImageModel('Nanobanana')}
                      className={`p-2.5 rounded border cursor-pointer flex flex-col items-center gap-1.5 ${imageModel === 'Nanobanana' ? 'bg-slate-800 border-pink-500 ring-1 ring-pink-500/50' : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'}`}
                    >
                      <span className="text-sm font-medium text-white">Nanobanana</span>
                    </div>
                    <div
                      onClick={() => setImageModel('Kling')}
                      className={`p-2.5 rounded border cursor-pointer flex flex-col items-center gap-1.5 ${imageModel === 'Kling' ? 'bg-slate-800 border-pink-500 ring-1 ring-pink-500/50' : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'}`}
                    >
                      <span className="text-sm font-medium text-white">Kling (可灵)</span>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-slate-800"></div>

                {/* Asset Import Sections */}
                {renderAssetSection('人物 (Characters)', 'character')}
                <div className="h-px bg-slate-800/50"></div>
                {renderAssetSection('场景 (Scenes)', 'scene')}
                <div className="h-px bg-slate-800/50"></div>
                {renderAssetSection('道具 (Props)', 'prop')}

                <div className="h-px bg-slate-800"></div>

                {/* Prompt */}
                <div className="space-y-2 flex-1 flex flex-col">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">图片提示词</label>
                    <button className="text-[10px] text-pink-400 hover:underline">AI 润色</button>
                  </div>
                  <textarea
                    value={selectedShot.imagePrompt}
                    onChange={(e) => handleScriptUpdate('imagePrompt', e.target.value)}
                    className="w-full min-h-[160px] bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-slate-300 focus:outline-none focus:border-pink-500 resize-none leading-relaxed custom-scrollbar"
                  />
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full py-3 bg-pink-600 hover:bg-pink-500 text-white rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-pink-900/50 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      图片生成中...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      生成图片 <span className="text-xs bg-white/20 px-1.5 rounded ml-1">💎 2</span>
                    </>
                  )}
                </button>
              </div>
            )
          )}

          {/* === Tab: Video Generation === */}
          {controlTab === 'video' && (
            !selectedShot ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 p-6 text-center">
                <svg className="w-12 h-12 mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p className="text-sm">请先分析剧本生成分镜</p>
              </div>
            ) : (
              <div className="space-y-6 animate-fadeIn">
                {/* Model Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">视频模型选择</label>
                  <div className="space-y-2">
                    <div
                      onClick={() => setVideoModel('Sora2')}
                      className={`p-3 rounded border cursor-pointer flex items-center justify-between ${videoModel === 'Sora2' ? 'bg-slate-800 border-blue-500 ring-1 ring-blue-500/50' : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'}`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-black flex items-center justify-center text-white text-[10px] font-bold">S</div>
                        <span className="text-sm text-white">Sora2</span>
                      </div>
                      {videoModel === 'Sora2' && <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                    </div>

                    <div
                      onClick={() => setVideoModel('DoubaoSeedance Pro1.5')}
                      className={`p-3 rounded border cursor-pointer flex items-center justify-between ${videoModel === 'DoubaoSeedance Pro1.5' ? 'bg-slate-800 border-blue-500 ring-1 ring-blue-500/50' : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'}`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-[10px] font-bold">D</div>
                        <span className="text-sm text-white">DoubaoSeedance Pro1.5</span>
                      </div>
                      {videoModel === 'DoubaoSeedance Pro1.5' && <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                  </div>
                </div>

                <div className="h-px bg-slate-800"></div>

                {/* Parameters */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">参考方式</span>
                    <div className="flex bg-slate-800 rounded p-0.5">
                      <button className="px-2 py-1 text-xs bg-slate-700 text-white rounded shadow-sm">文生图</button>
                      <button className="px-2 py-1 text-xs text-slate-400 hover:text-white">单图</button>
                      <button className="px-2 py-1 text-xs text-slate-400 hover:text-white">首尾帧</button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">分辨率</span>
                    <div className="flex bg-slate-800 rounded p-0.5">
                      <button className="px-2 py-1 text-xs text-slate-400 hover:text-white">480p</button>
                      <button className="px-2 py-1 text-xs bg-slate-700 text-white rounded shadow-sm">720p</button>
                      <button className="px-2 py-1 text-xs text-slate-400 hover:text-white">1080p</button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">时长</span>
                      <span className="text-white">{selectedShot.duration}s</span>
                    </div>
                    <input type="range" min="1" max="15" defaultValue={selectedShot.duration} className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                  </div>
                </div>

                <div className="h-px bg-slate-800"></div>

                {/* Prompt */}
                <div className="space-y-2 flex-1 flex flex-col">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">视频提示词</label>
                    <button className="text-[10px] text-blue-400 hover:underline">自动优化</button>
                  </div>
                  <textarea
                    value={selectedShot.videoPrompt}
                    onChange={(e) => handleScriptUpdate('videoPrompt', e.target.value)}
                    className="w-full min-h-[120px] bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-slate-300 focus:outline-none focus:border-blue-500 resize-none leading-relaxed custom-scrollbar"
                  />
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-900/50 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      生成中...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                      重绘视频 <span className="text-xs bg-white/20 px-1.5 rounded ml-1">💎 25</span>
                    </>
                  )}
                </button>
              </div>
            )
          )}
        </div>
      </div >

      {/* --- Column 3: Media Preview & Edit (Right) --- */}
      < div className="flex-1 flex flex-col min-w-0 bg-[#0b1120] relative" >

        {/* Top: Header / Mode Switch */}
        < div className="h-14 border-b border-slate-800 flex items-center px-6 gap-6 bg-slate-900 justify-end" >
          <button
            onClick={() => setPreviewMode('preview')}
            className={`text-sm font-medium h-full px-2 border-b-2 transition-colors ${previewMode === 'preview' ? 'text-white border-primary' : 'text-slate-500 border-transparent hover:text-white'}`}
          >
            媒体预览
          </button>
        </div >

        {/* Content Area */}
        < div className="flex-1 overflow-y-auto p-6" >
          <div className="max-w-5xl mx-auto space-y-6 h-full flex flex-col">

            {!selectedShot ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                <svg className="w-16 h-16 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm">请先分析剧本生成分镜</p>
              </div>
            ) : (
              <>

                {/* Main Player Area */}
                <div className="flex-1 bg-black rounded-xl border border-slate-700 overflow-hidden relative group min-h-[300px] shadow-2xl">
                  {selectedShot.videoUrl ? (
                    <video
                      src={selectedShot.videoUrl}
                      className="w-full h-full object-contain"
                      controls
                      poster={selectedShot.thumbnail}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-600">
                      <svg className="w-20 h-20 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <p>暂无视频预览</p>
                    </div>
                  )}

                  {/* Overlay Info */}
                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 animate-pulse"></div>
                    <span className="text-xs font-medium text-white shadow-black drop-shadow-md">{videoModel}</span>
                  </div>
                </div>

                {/* Asset Slots (Timeline/Flow) */}
                <div className="shrink-0 bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
                  <h4 className="text-sm font-bold text-slate-400 mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-secondary rounded-full"></span>
                    参考与关键帧 (Assets)
                  </h4>
                  <div className="grid grid-cols-4 gap-4">
                    {/* Previous Shot End Frame (Reference) */}
                    <div className="aspect-[16/9] bg-slate-800 rounded-lg border border-slate-700 flex flex-col overflow-hidden relative group hover:border-slate-500 transition-colors">
                      <div className="absolute top-2 left-2 z-10 bg-purple-500/80 text-[10px] text-white px-1.5 py-0.5 rounded">上镜尾帧</div>
                      {selectedShot.keyframes.find(k => k.label === '上镜尾帧')?.imageUrl ? (
                        <img src={selectedShot.keyframes.find(k => k.label === '上镜尾帧')?.imageUrl} className="w-full h-full object-cover" alt="ref" />
                      ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-600">
                          <span className="text-xs">无参考图</span>
                        </div>
                      )}
                    </div>

                    {/* Keyframes / Start / End */}
                    {['关键帧 #1', '关键帧 #2', '尾帧'].map((label, idx) => {
                      const kf = selectedShot.keyframes.find(k => k.label === label);
                      return (
                        <div key={idx} className="aspect-[16/9] bg-slate-800 rounded-lg border border-slate-700 border-dashed flex flex-col overflow-hidden relative group hover:bg-slate-800/80 transition-colors cursor-pointer">
                          <div className="absolute top-2 left-2 z-10 bg-slate-700/80 text-[10px] text-slate-300 px-1.5 py-0.5 rounded border border-white/10">{label}</div>
                          {kf?.imageUrl ? (
                            <img src={kf.imageUrl} className="w-full h-full object-cover" alt={label} />
                          ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-2">
                              <svg className="w-6 h-6 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                              <span className="text-[10px]">添加图片</span>
                            </div>
                          )}
                          {/* Hover Actions */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); setControlTab('image'); }}
                              className="p-1.5 bg-white/10 rounded hover:bg-white/20 text-white"
                              title="去生成"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            </button>
                            <button className="p-1.5 bg-white/10 rounded hover:bg-white/20 text-white" title="上传"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg></button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Generated Info Block */}
                <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-800 flex justify-between items-center text-xs text-slate-400 shrink-0">
                  <div className="space-x-4">
                    <span>类型: 视频</span>
                    <span>模型: {videoModel}</span>
                    <span>时长: {selectedShot.duration}s</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Ready</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* --- History Task Panel Popup --- */}
        {
          showTaskPanel && (
            <div className="absolute bottom-0 left-0 w-[500px] h-[600px] bg-[#1e1e1e] border border-slate-700 shadow-2xl z-50 flex flex-col animate-slideUp origin-bottom-left rounded-tr-lg">

              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <h3 className="text-white font-bold text-sm">历史任务</h3>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-[#2a2a2a] text-xs text-slate-300 px-2 py-1 rounded flex items-center gap-1 cursor-pointer hover:bg-[#333]">
                    全部 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                  <button onClick={() => setShowTaskPanel(false)} className="text-slate-400 hover:text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>

              {/* Filter Stats Bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 overflow-x-auto scrollbar-hide">
                <button className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs rounded hover:bg-blue-500/20">
                  <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>
                  排队中 ({tasks.filter(t => t.status === 'queued').length})
                </button>
                <button className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs rounded hover:bg-blue-500/20">
                  <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  生成中 ({tasks.filter(t => t.status === 'generating').length})
                </button>
                <button className="flex items-center gap-1 px-2 py-1 bg-green-500/10 border border-green-500/30 text-green-400 text-xs rounded hover:bg-green-500/20">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  完成 ({tasks.filter(t => t.status === 'success').length})
                </button>
                <button className="flex items-center gap-1 px-2 py-1 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded hover:bg-red-500/20">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  失败 ({tasks.filter(t => t.status === 'failed').length})
                  <span className="bg-red-500 text-white text-[10px] px-1 rounded-full">{tasks.filter(t => t.status === 'failed').length}</span>
                </button>
              </div>

              {/* Actions Bar */}
              <div className="flex items-center justify-end gap-3 px-4 py-2 border-b border-white/10">
                <button className="px-3 py-1 text-xs text-red-400 border border-red-500/30 rounded hover:bg-red-500/10 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                  全部取消
                </button>
                <button className="px-3 py-1 text-xs text-slate-400 border border-slate-600 rounded hover:bg-slate-700 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  清空列表
                </button>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {tasks.map((task) => (
                  <div key={task.id} className="bg-[#252525] p-3 rounded-lg flex gap-3 relative group">
                    {/* Thumbnail / Status Icon */}
                    <div className="w-16 h-16 bg-white shrink-0 rounded flex items-center justify-center overflow-hidden">
                      {task.status === 'cancelled' || task.status === 'failed' ? (
                        <div className="w-full h-full flex items-center justify-center bg-white text-slate-900">
                          <svg className="w-8 h-8 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" /></svg>
                        </div>
                      ) : (
                        <div className="w-full h-full bg-slate-700 animate-pulse"></div> // Placeholder for gen
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getStatusColor(task.status)}`}>
                          <span className="flex items-center gap-1">
                            {task.status === 'cancelled' && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                            {task.status === 'failed' && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                            {getStatusLabel(task.status)}
                          </span>
                        </span>
                        {task.group && <span className="text-[10px] text-purple-400 bg-purple-500/10 px-1 rounded border border-purple-500/20">{task.group}</span>}
                      </div>

                      <h4 className="text-sm font-bold text-white truncate">{task.name}</h4>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                        <span>{task.user} | {task.cost} {task.createTime}</span>
                        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="flex items-center gap-1 text-red-500 hover:text-red-400">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            删除
                          </button>
                          <button className="flex items-center gap-1 text-blue-500 hover:text-blue-400">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                            复用
                          </button>
                        </div>
                      </div>

                      {task.errorMessage && (
                        <div className="text-[10px] text-red-400 mt-1 leading-tight bg-red-500/5 p-1 rounded border border-red-500/10">
                          {task.errorMessage}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        }

      </div >

      {/* --- Asset Preview / Selection Modal --- */}
      {
        previewAsset && !showAssetModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setPreviewAsset(null)}
          >
            <div className="relative max-w-2xl max-h-[80vh] p-4" onClick={e => e.stopPropagation()}>
              <img src={previewAsset.url} alt={previewAsset.name} className="max-w-full max-h-full rounded-lg shadow-2xl border border-white/10" />
              <div className="absolute top-6 left-6 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-bold backdrop-blur-md">
                {previewAsset.name}
              </div>
              <button
                className="absolute top-[-10px] right-[-10px] w-8 h-8 bg-white text-black rounded-full flex items-center justify-center font-bold shadow-lg hover:bg-slate-200"
                onClick={() => setPreviewAsset(null)}
              >
                ✕
              </button>
            </div>
          </div>
        )
      }

      {/* --- Asset Library Selection Modal --- */}
      {
        showAssetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 w-full max-w-3xl rounded-xl border border-slate-700 shadow-2xl flex flex-col h-[600px] overflow-hidden animate-scaleIn">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-800">
                <h3 className="text-lg font-bold text-white">
                  选择{assetModalType === 'character' ? '人物' : assetModalType === 'scene' ? '场景' : '道具'}素材
                </h3>
                <button onClick={() => setShowAssetModal(false)} className="text-slate-400 hover:text-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Search Bar */}
              <div className="p-4 border-b border-slate-800 bg-slate-800/50">
                <div className="relative">
                  <input
                    type="text"
                    value={assetSearch}
                    onChange={(e) => setAssetSearch(e.target.value)}
                    placeholder={`搜索${assetModalType === 'character' ? '人物' : assetModalType === 'scene' ? '场景' : '道具'}...`}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-primary"
                  />
                  <svg className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
              </div>

              {/* Asset Grid */}
              <div className="flex-1 overflow-y-auto p-4 bg-slate-900/50">
                <div className="grid grid-cols-4 gap-4">
                  {MOCK_ASSET_LIBRARY
                    .filter(a => a.type === assetModalType && a.name.toLowerCase().includes(assetSearch.toLowerCase()))
                    .map(asset => (
                      <div
                        key={asset.id}
                        onClick={() => setSelectedAssetFromLib(asset.id)}
                        className={`relative cursor-pointer group rounded-lg overflow-hidden border-2 transition-all ${selectedAssetFromLib === asset.id ? 'border-primary ring-2 ring-primary/30' : 'border-slate-700 hover:border-slate-500'}`}
                      >
                        <div className="aspect-[4/3] relative">
                          <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-2">
                            <span className="text-sm font-medium text-white truncate">{asset.name}</span>
                          </div>

                          {/* Selection Indicator */}
                          {selectedAssetFromLib === asset.id && (
                            <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>

                {/* Empty State */}
                {MOCK_ASSET_LIBRARY.filter(a => a.type === assetModalType && a.name.toLowerCase().includes(assetSearch.toLowerCase())).length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60">
                    <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <p>没有找到相关素材</p>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end gap-3">
                <button
                  onClick={() => setShowAssetModal(false)}
                  className="px-5 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={confirmImportAsset}
                  disabled={!selectedAssetFromLib}
                  className="px-6 py-2 bg-primary hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded font-medium shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                >
                  确认导入
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default CreationTasks;