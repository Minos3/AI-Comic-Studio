import React, { useState } from 'react';
import { AppView } from '../../types';

interface AssetManagerProps {
  type: AppView;
}

interface AssetData {
  id: string;
  name: string;
  description: string;
  type: 'character' | 'scene' | 'prop';
  images: string[]; // Up to 4 images
  status: 'generated' | 'pending';
  breakdownPrompt: string;
  alias: string;
  source: 'auto' | 'manual';
  tags?: string[];
}

interface GeneratedImageGroup {
  id: string;
  shotName: string;
  count: number;
  prompt: string;
  createTime: string;
  images: string[];
  tags?: string[];
}

const MOCK_IMAGE_GROUPS: GeneratedImageGroup[] = [
  {
    id: 'g1',
    shotName: '第一组: 奇遇的晨练-5',
    count: 4,
    prompt: '固定镜头，侧面中景。江有川坐在电动轮椅上，眼神平静地望着远方。背景是清晨的公园，阳光透过树叶洒在地面上。',
    createTime: '2026/1/21 12:06:00',
    images: ['https://picsum.photos/seed/g1_1/400/225'],
    tags: ['16:9', '2K']
  },
  {
    id: 'g2',
    shotName: '第一组: 奇遇的晨练-4',
    count: 2,
    prompt: '平视跟随摇晃镜头。中景，沈忘川（白发少年）躺在吊床上吃西瓜，表情享受。',
    createTime: '2026/1/21 12:06:00',
    images: ['https://picsum.photos/seed/g2_1/400/225'],
    tags: ['16:9', '2K']
  },
  {
    id: 'g3',
    shotName: '第一组: 奇遇的晨练-2',
    count: 4,
    prompt: '特写镜头。沈忘川仰面躺在青石板上，双眼微闭，嘴角挂着一丝笑意。',
    createTime: '2026/1/21 12:06:00',
    images: ['https://picsum.photos/seed/g3_1/400/225'],
    tags: ['16:9', '2K']
  },
  {
    id: 'g4',
    shotName: '第一组: 奇遇的晨练-1',
    count: 1,
    prompt: '日漫风格，低角度特写镜头。一只胖乎乎的橘猫趴在树枝上，俯视着下方。',
    createTime: '2026/1/21 12:06:00',
    images: ['https://picsum.photos/seed/g4_1/400/225'],
    tags: ['16:9', '2K']
  },
  {
    id: 'g5',
    shotName: '第四组-6',
    count: 2,
    prompt: '沈忘川在吊床上，姿态慵懒但气场强大。背景是模糊的森林景象。',
    createTime: '2026/1/20 18:01:52',
    images: ['https://picsum.photos/seed/g5_1/400/225'],
    tags: ['16:9', '2K']
  },
  {
    id: 'g6',
    shotName: '第十三组-5',
    count: 3,
    prompt: '沈忘川在地面上一掌击向天空，巨大的金色手印浮现。特效炸裂。',
    createTime: '2026/1/20 18:01:52',
    images: ['https://picsum.photos/seed/g6_1/400/225'],
    tags: ['16:9', '2K']
  },
];

const MOCK_ASSETS: AssetData[] = [
  {
    id: '1',
    name: '麻雀',
    description: '无描述',
    type: 'character',
    images: ['https://picsum.photos/seed/sparrow/400/300'],
    status: 'generated',
    breakdownPrompt: '一只普通的麻雀，褐色羽毛，体型小巧，眼神灵动。',
    alias: 'Sparrow',
    source: 'auto'
  },
  {
    id: '2',
    name: '橘猫',
    description: '无描述',
    type: 'character',
    images: ['https://picsum.photos/seed/cat/400/300'],
    status: 'generated',
    breakdownPrompt: '肥硕的橘猫，毛色鲜亮，瞳孔竖立，慵懒。',
    alias: 'Orange Cat',
    source: 'auto'
  },
  {
    id: '3',
    name: '沈忘川1',
    description: '生成人物是全身三视图（全身正面图，全身背面图，面部特写），日漫风格，2D。一位外...',
    type: 'character',
    images: ['https://picsum.photos/seed/shen1/400/300', 'https://picsum.photos/seed/shen2/400/300'],
    status: 'generated',
    breakdownPrompt: '沈忘川，18岁少年，银发，戴墨镜，花哨沙滩衬衫。',
    alias: 'Shen Wangchuan',
    source: 'manual'
  },
  {
    id: '4',
    name: '凌绝崖Q版',
    description: '无描述',
    type: 'character',
    images: ['https://picsum.photos/seed/ling/400/300'],
    status: 'generated',
    breakdownPrompt: '凌绝崖，Q版形象，表情夸张，青色道袍。',
    alias: 'Ling Jueya Chibi',
    source: 'auto'
  },
  {
    id: '5',
    name: '洛无霜Q版形象',
    description: '无描述',
    type: 'character',
    images: ['https://picsum.photos/seed/luo/400/300'],
    status: 'generated',
    breakdownPrompt: '洛无霜，Q版，双丸子头，可爱。',
    alias: 'Luo Wushuang Chibi',
    source: 'auto'
  },
  {
    id: '6',
    name: '天玄宗秘境',
    description: '高饱和度的蓝天、翠绿的古树、青石板地。',
    type: 'scene',
    images: ['https://picsum.photos/seed/scene1/400/300'],
    status: 'generated',
    breakdownPrompt: '日漫风格，仙侠秘境，巨大的古树。',
    alias: 'Secret Realm',
    source: 'auto'
  },
  {
    id: '7',
    name: '高科技轮椅',
    description: '带有未来感的金属光泽。',
    type: 'prop',
    images: [],
    status: 'pending',
    breakdownPrompt: '电动轮椅，赛博朋克风格，金属质感。',
    alias: 'Wheelchair',
    source: 'auto'
  }
];

const ImageAssetsView: React.FC = () => {
  const [groups, setGroups] = useState<GeneratedImageGroup[]>(MOCK_IMAGE_GROUPS);
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
  const [editGroup, setEditGroup] = useState<GeneratedImageGroup | null>(null);

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedGroups);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedGroups(newSet);
  };

  const selectAll = () => {
    if (selectedGroups.size === groups.length) setSelectedGroups(new Set());
    else setSelectedGroups(new Set(groups.map(g => g.id)));
  };

  const handleDelete = (id: string) => {
    if (confirm('确认删除此组图片吗？')) {
      setGroups(groups.filter(g => g.id !== id));
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0f172a] text-slate-200">
      {/* Header */}
      <div className="p-6 pb-0 shrink-0">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-1">图片素材</h2>
          <p className="text-slate-400 text-sm">查看分镜匹配模式生成的历史图片</p>
        </div>

        {/* Filter & Action Bar */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-900/50 p-2 rounded-lg border border-slate-800">
          {/* Filters */}
          <select className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded px-2 py-1.5 outline-none w-32">
            <option>灵豆 4.0</option>
            <option>Sora 2.0</option>
          </select>
          <select className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded px-2 py-1.5 outline-none w-28">
            <option>2K (1积分)</option>
            <option>4K (2积分)</option>
          </select>
          <select className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded px-2 py-1.5 outline-none w-28">
            <option>16:9 (横屏)</option>
            <option>9:16 (竖屏)</option>
          </select>

          <div className="w-px h-5 bg-slate-700 mx-1"></div>

          {/* Actions */}
          <button className="flex items-center gap-1.5 text-slate-300 hover:text-white px-3 py-1.5 border border-slate-700 rounded text-xs hover:bg-slate-800 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            刷新
          </button>
          <button
            onClick={selectAll}
            className={`flex items-center gap-1.5 px-3 py-1.5 border rounded text-xs transition-colors ${selectedGroups.size === groups.length && groups.length > 0 ? 'bg-primary/20 border-primary text-primary' : 'border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'}`}
          >
            <div className={`w-3 h-3 border rounded-sm flex items-center justify-center ${selectedGroups.size === groups.length && groups.length > 0 ? 'bg-primary border-primary' : 'border-slate-500'}`}>
              {selectedGroups.size === groups.length && groups.length > 0 && <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
            </div>
            全选
          </button>
          <button className="flex items-center gap-1.5 text-slate-300 hover:text-white px-3 py-1.5 border border-slate-700 rounded text-xs hover:bg-slate-800 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
            加入季分镜 ({selectedGroups.size})
          </button>
          <button className="flex items-center gap-1.5 text-slate-300 hover:text-white px-3 py-1.5 border border-slate-700 rounded text-xs hover:bg-slate-800 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            批量改名 ({selectedGroups.size})
          </button>
          <button className="flex items-center gap-1.5 text-slate-300 hover:text-white px-3 py-1.5 border border-slate-700 rounded text-xs hover:bg-slate-800 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            批量下载 ({selectedGroups.size})
          </button>
          <button className="flex items-center gap-1.5 text-red-400 hover:text-red-300 px-3 py-1.5 border border-slate-700 rounded text-xs hover:bg-red-500/10 transition-colors ml-auto">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            批量删除 ({selectedGroups.size})
          </button>
        </div>
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {groups.map(group => (
            <div key={group.id} className="group bg-[#151e2e] border border-slate-800 rounded-lg overflow-hidden hover:border-slate-600 hover:shadow-lg transition-all flex flex-col h-[280px] relative">

              {/* Thumbnail Area */}
              <div className="relative h-40 bg-slate-950">
                <img src={group.images[0]} alt={group.shotName} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />

                {/* Checkbox */}
                <div
                  onClick={() => toggleSelect(group.id)}
                  className="absolute top-2 left-2 z-10 cursor-pointer"
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedGroups.has(group.id) ? 'bg-blue-500 border-blue-500' : 'bg-black/50 border-white/50 hover:bg-black/70'}`}>
                    {selectedGroups.has(group.id) && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                </div>

                {/* Tag */}
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded flex items-center gap-1">
                  <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" /></svg>
                  {group.shotName.split(':')[0]}
                </div>

                {/* Count Badge */}
                <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-white text-[10px] px-1.5 py-0.5 rounded">
                  共{group.count}张
                </div>
              </div>

              {/* Info Area */}
              <div className="p-3 flex-1 flex flex-col relative">
                <h3 className="text-xs font-bold text-slate-200 mb-1 truncate" title={group.shotName}>{group.shotName}</h3>
                <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed h-8 mb-2" title={group.prompt}>{group.prompt}</p>

                <div className="mt-auto flex items-center gap-1 text-[10px] text-slate-600">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {group.createTime}
                </div>

                {/* Hover Actions */}
                <div className="absolute inset-x-0 bottom-0 p-2 bg-[#151e2e] border-t border-slate-800 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditGroup(group)} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors" title="编辑">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                  <button className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors" title="下载">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  </button>
                  <button className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors" title="重新生成">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  </button>
                  <button onClick={() => handleDelete(group.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded transition-colors" title="删除">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal (Prototype) */}
      {editGroup && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-[#0f172a] border border-slate-700 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">编辑图片组</h3>
              <button onClick={() => setEditGroup(null)} className="text-slate-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-slate-400">生成的图片 ({editGroup.count})</label>
                  <div className="grid grid-cols-2 gap-2">
                    {editGroup.images.map((img, i) => (
                      <img key={i} src={img} className="w-full aspect-video object-cover rounded border border-slate-700" />
                    ))}
                    {/* Mock more images if count > 1 */}
                    {editGroup.count > editGroup.images.length && (
                      <div className="w-full aspect-video bg-slate-800 rounded border border-slate-700 flex items-center justify-center text-slate-500 text-xs">
                        + {editGroup.count - editGroup.images.length} 更多图片...
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">分镜名称</label>
                    <input type="text" defaultValue={editGroup.shotName} className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:border-primary outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">包含标签</label>
                    <div className="flex gap-2">
                      {editGroup.tags?.map(t => <span key={t} className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded border border-slate-700">{t}</span>)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">提示词</label>
                    <textarea defaultValue={editGroup.prompt} className="w-full h-32 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:border-primary outline-none resize-none" />
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-800 flex justify-end gap-3">
              <button onClick={() => setEditGroup(null)} className="px-4 py-2 border border-slate-600 text-slate-300 rounded hover:bg-slate-800 text-sm">取消</button>
              <button onClick={() => setEditGroup(null)} className="px-4 py-2 bg-primary text-white rounded hover:bg-indigo-600 text-sm">保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AssetManager: React.FC<AssetManagerProps> = ({ type }) => {
  const [activeTab, setActiveTab] = useState<'character' | 'scene' | 'prop'>('character');
  const [assets, setAssets] = useState<AssetData[]>(MOCK_ASSETS);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewAsset, setViewAsset] = useState<AssetData | null>(null);

  // Track generating state for each asset: assetId -> 'generate' | 'fission'
  const [generatingState, setGeneratingState] = useState<Record<string, string>>({});

  // Filter assets based on active tab
  const filteredAssets = assets.filter(a => a.type === activeTab);

  const handleDelete = () => {
    if (deleteId) {
      setAssets(assets.filter(a => a.id !== deleteId));
      setDeleteId(null);
    }
  };

  const handleAiGenerate = (e: React.MouseEvent, asset: AssetData, action: 'generate' | 'fission') => {
    e.stopPropagation();
    if (generatingState[asset.id]) return;

    setGeneratingState(prev => ({ ...prev, [asset.id]: action }));

    console.log(`[AI] Action: ${action} | Type: ${asset.type} | Prompt: ${asset.breakdownPrompt}`);

    setTimeout(() => {
      setAssets(prevAssets => prevAssets.map(a => {
        if (a.id === asset.id) {
          const newImgs = [...a.images];
          const timestamp = Date.now();

          if (action === 'fission') {
            // Add 3 images for scene fission
            newImgs.unshift(
              `https://picsum.photos/seed/${timestamp}_1/400/300`,
              `https://picsum.photos/seed/${timestamp}_2/400/300`,
              `https://picsum.photos/seed/${timestamp}_3/400/300`
            );
          } else {
            // Add 1 image (Character 3-view, Scene, or Prop)
            newImgs.unshift(`https://picsum.photos/seed/${timestamp}/400/300`);
          }
          return { ...a, images: newImgs, status: 'generated' };
        }
        return a;
      }));
      setGeneratingState(prev => {
        const next = { ...prev };
        delete next[asset.id];
        return next;
      });
    }, 2500);
  };

  const getTitle = () => {
    switch (type) {
      case AppView.ASSETS_IMAGES: return '图片素材库 (Image Lib)';
      case AppView.ASSETS_VIDEO: return '视频素材库 (Video Lib)';
      case AppView.ASSETS_GENERAL: return '通用素材库 (General Asset Lib)';
      case AppView.ASSETS_OFFICIAL: return '官方素材库 (Official Lib)';
      default: return '素材库';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'character': return '人物';
      case 'scene': return '场景';
      case 'prop': return '道具';
      default: return '未知';
    }
  };



  if (type === AppView.ASSETS_IMAGES) {
    return <ImageAssetsView />;
  }

  return (
    <div className="h-full flex flex-col bg-[#0f172a] text-slate-200 overflow-hidden">

      {/* Top Header Area */}
      <div className="p-6 pb-0 shrink-0">
        <div className="flex flex-col gap-6">
          {/* Title & Description */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">{getTitle()}</h2>
            <p className="text-slate-400 text-sm">管理您的通用素材，支持批量操作和AI出图</p>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-wrap items-center gap-3 bg-slate-900/50 p-2 rounded-lg border border-slate-800">
            {/* Tabs */}
            <div className="flex gap-1 mr-4 border-r border-slate-700 pr-4">
              <button
                onClick={() => setActiveTab('character')}
                className={`px-4 py-1.5 text-sm font-medium rounded transition-colors ${activeTab === 'character' ? 'text-primary bg-primary/10' : 'text-slate-400 hover:text-white'}`}
              >
                人物库
              </button>
              <button
                onClick={() => setActiveTab('scene')}
                className={`px-4 py-1.5 text-sm font-medium rounded transition-colors ${activeTab === 'scene' ? 'text-primary bg-primary/10' : 'text-slate-400 hover:text-white'}`}
              >
                场景库
              </button>
              <button
                onClick={() => setActiveTab('prop')}
                className={`px-4 py-1.5 text-sm font-medium rounded transition-colors ${activeTab === 'prop' ? 'text-primary bg-primary/10' : 'text-slate-400 hover:text-white'}`}
              >
                道具库
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="搜索素材..."
                className="bg-slate-800 border border-slate-700 text-sm rounded-md pl-8 pr-3 py-1.5 focus:ring-1 focus:ring-primary outline-none w-48"
              />
              <svg className="w-4 h-4 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>

            {/* Filters (Mock) */}
            <select className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded px-2 py-1.5 outline-none">
              <option>灵豆 4.0</option>
              <option>Sora 2.0</option>
            </select>
            <select className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded px-2 py-1.5 outline-none">
              <option>2K (1积分)</option>
              <option>4K (2积分)</option>
            </select>
            <select className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded px-2 py-1.5 outline-none">
              <option>无风格</option>
              <option>日漫</option>
              <option>写实</option>
            </select>
            <select className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded px-2 py-1.5 outline-none">
              <option>16:9 (横屏)</option>
              <option>9:16 (竖屏)</option>
            </select>

            {/* Actions */}
            <div className="ml-auto flex items-center gap-2">
              <button className="bg-primary hover:bg-indigo-600 text-white text-sm px-3 py-1.5 rounded flex items-center gap-1 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                新建素材
              </button>
              <button className="border border-slate-600 hover:border-slate-500 text-slate-300 text-sm px-3 py-1.5 rounded flex items-center gap-1 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                批量选择
              </button>
              <button className="border border-slate-600 hover:border-slate-500 text-slate-300 text-sm px-3 py-1.5 rounded flex items-center gap-1 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                刷新
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {filteredAssets.map((asset) => (
            <div key={asset.id} className="group bg-slate-900 border border-slate-800 rounded-lg overflow-hidden hover:border-slate-600 transition-all hover:shadow-lg flex flex-col h-[280px]">
              {/* Image Area */}
              <div className="relative h-40 bg-slate-950 flex items-center justify-center overflow-hidden">
                {asset.images.length > 0 ? (
                  <img
                    src={asset.images[0]}
                    alt={asset.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-600">
                    <svg className="w-8 h-8 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <span className="text-xs">待生成</span>
                  </div>
                )}

                <div className="absolute top-2 right-2 bg-pink-500/90 text-white text-[10px] px-2 py-0.5 rounded font-medium shadow-sm z-10">
                  {getTypeLabel(asset.type)}
                </div>

                {asset.images.length > 1 && (
                  <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 z-10">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    {asset.images.length}张图片
                  </div>
                )}

                {/* --- AI Generation Buttons (Bottom Right) --- */}
                <div className="absolute bottom-2 right-2 flex flex-col gap-1.5 items-end z-20 transition-opacity duration-200 opacity-0 group-hover:opacity-100">

                  {/* Fission Button for Scenes */}
                  {asset.type === 'scene' && (
                    <button
                      onClick={(e) => handleAiGenerate(e, asset, 'fission')}
                      disabled={!!generatingState[asset.id]}
                      className="flex items-center gap-1 bg-slate-800/90 hover:bg-slate-700 text-white text-[10px] px-2 py-1 rounded-md shadow-lg backdrop-blur-sm border border-slate-600/50 disabled:opacity-50"
                      title="生成三张场景多角度视图"
                    >
                      {generatingState[asset.id] === 'fission' ? (
                        <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      ) : (
                        <svg className="w-3 h-3 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                      )}
                      裂变
                    </button>
                  )}

                  {/* AI Generate Button (All types) */}
                  <button
                    onClick={(e) => handleAiGenerate(e, asset, 'generate')}
                    disabled={!!generatingState[asset.id]}
                    className="flex items-center gap-1 bg-gradient-to-r from-indigo-600/90 to-purple-600/90 hover:from-indigo-500 hover:to-purple-500 text-white text-[10px] px-2 py-1 rounded-md shadow-lg backdrop-blur-sm border border-white/10 disabled:opacity-50"
                    title={asset.type === 'character' ? "生成人物三视图" : "AI生成图片"}
                  >
                    {generatingState[asset.id] === 'generate' ? (
                      <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    )}
                    AI生成
                  </button>
                </div>
              </div>

              {/* Info Area */}
              <div className="p-3 flex-1 flex flex-col min-h-0">
                <h3 className="text-sm font-bold text-slate-200 truncate mb-1">{asset.name}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {asset.description || '暂无描述'}
                </p>
              </div>

              {/* Action Bar */}
              <div className="border-t border-slate-800 p-2 flex items-center justify-between bg-slate-900/50">
                <button
                  onClick={() => setViewAsset(asset)}
                  className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded transition-colors" title="查看详情"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                </button>
                <div className="w-px h-3 bg-slate-800"></div>
                <button
                  onClick={() => setViewAsset(asset)}
                  className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded transition-colors" title="编辑"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
                <div className="w-px h-3 bg-slate-800"></div>
                <button
                  onClick={() => setDeleteId(asset.id)}
                  className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors" title="删除"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">确认删除</h3>
            <p className="text-slate-400 text-sm mb-6">您确定要删除此素材吗？此操作无法撤销。</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail / Edit Modal */}
      {viewAsset && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-5xl h-[85vh] shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800 bg-slate-900">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                素材详情
                <span className="text-xs font-normal text-slate-500 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  ID: {viewAsset.id}
                </span>
              </h3>
              <button onClick={() => setViewAsset(null)} className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Left Side: Images */}
              <div className="w-1/2 p-6 bg-black/20 overflow-y-auto border-r border-slate-800">
                <div className="grid grid-cols-2 gap-4">
                  {viewAsset.images.map((img, idx) => (
                    <div key={idx} className="relative group aspect-square bg-slate-950 rounded-lg border border-slate-800 overflow-hidden">
                      <img src={img} alt={`Asset ${idx}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                        </button>
                        <button className="p-2 bg-red-500/80 rounded-full hover:bg-red-600 text-white">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                  {Array.from({ length: 4 - viewAsset.images.length }).map((_, idx) => (
                    <div key={`placeholder-${idx}`} className="aspect-square bg-slate-800/30 rounded-lg border border-slate-700 border-dashed flex flex-col items-center justify-center text-slate-600 gap-2 hover:bg-slate-800/50 hover:text-slate-500 transition-colors cursor-pointer">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                      <span className="text-xs">添加图片</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex gap-3">
                  <button className="flex-1 py-2.5 bg-slate-800 border border-slate-600 text-white rounded hover:bg-slate-700 text-sm flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    本地上传
                  </button>
                  <button className="flex-1 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded hover:shadow-lg hover:shadow-primary/25 text-sm flex items-center justify-center gap-2 font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    AI 生成图片
                  </button>
                </div>
              </div>

              {/* Right Side: Form */}
              <div className="w-1/2 p-6 overflow-y-auto">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-400">素材名称</label>
                      <input
                        type="text"
                        defaultValue={viewAsset.name}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:border-primary outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-400">素材别名 (Alias)</label>
                      <input
                        type="text"
                        defaultValue={viewAsset.alias}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:border-primary outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-400">素材类型</label>
                      <select
                        defaultValue={viewAsset.type}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:border-primary outline-none"
                      >
                        <option value="character">人物 (Character)</option>
                        <option value="scene">场景 (Scene)</option>
                        <option value="prop">道具 (Prop)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-400">来源</label>
                      <div className="flex items-center h-[42px] gap-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${viewAsset.source === 'auto' ? 'bg-purple-500' : 'bg-slate-600'}`}></div>
                          <span className="text-sm text-slate-300">{viewAsset.source === 'auto' ? '自动生成' : '手动创建'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">拆解提示词 (Breakdown Prompt)</label>
                    <textarea
                      defaultValue={viewAsset.breakdownPrompt}
                      className="w-full h-32 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:border-primary outline-none resize-none leading-relaxed"
                      placeholder="描述该素材的详细特征..."
                    ></textarea>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">备注描述</label>
                    <textarea
                      defaultValue={viewAsset.description}
                      className="w-full h-24 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:border-primary outline-none resize-none leading-relaxed"
                      placeholder="添加备注..."
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end gap-3">
              <button onClick={() => setViewAsset(null)} className="px-6 py-2 border border-slate-600 text-slate-300 rounded hover:bg-slate-800 transition-colors">
                取消
              </button>
              <button onClick={() => setViewAsset(null)} className="px-6 py-2 bg-primary text-white rounded hover:bg-indigo-600 transition-colors">
                保存修改
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetManager;