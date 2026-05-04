import React, { useState, useEffect } from 'react';
import { AppView } from '../../types.ts';
import { api } from '../../src/lib/api';

interface Appearance {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  status: 'pending' | 'generated';
}

interface Character {
  id: string;
  name: string;
  gender: '男' | '女' | '其他';
  age: string;
  description: string;
  portraitUrl: string;
  shortBio: string;
  appearances: Appearance[];
}

const MOCK_CHARACTERS: Character[] = [
  {
    id: 'c1',
    name: '赵书禾',
    gender: '女',
    age: '18',
    shortBio: '眉眼凌厉，身姿优雅，自带太后威...',
    description: '眉眼凌厉，身姿优雅，自带太后威仪。肤色白皙但透着冷峻，长发乌黑，眼神深邃且富有穿透力，举手投足间尽显端庄与冷静的气质。',
    portraitUrl: 'https://picsum.photos/seed/zsh_main/400/500',
    appearances: [
      { id: 'a1', name: '太后临终造型', description: '太后妆造，端庄，40岁女性，眼神充满不甘，身着改良汉服或现代装皆有气场...', imageUrl: 'https://picsum.photos/seed/zsh_1/400/400', status: 'generated' },
      { id: 'a2', name: '沈家真千金日常', description: '身着改良汉服或简约现代高定服装，材质多为真丝或精纺羊绒，色调沉稳。手腕处有明显的陈...', status: 'pending' },
      { id: 'a3', name: '医院病号造型', description: '身着蓝白条纹病号服，左腿打着厚厚的白色石膏并被支架吊起，神情悠闲，手中常翻阅时尚杂...', status: 'pending' },
      { id: 'a4', name: '铃芽学院校服', description: '身着英伦风学院制服，深蓝色西装外套搭配百褶裙，领带系得严丝合缝，领口别着微型记录仪...', status: 'pending' },
    ]
  },
  {
    id: 'c2',
    name: '沈慕瑶',
    gender: '女',
    age: '20',
    shortBio: '长相娇俏，肤白貌美，红棕色直发垂肩。...',
    description: '沈家养女，性格活泼好动，内心戏极多. 长相娇俏，肤白貌美，喜欢穿着粉色或浅色系的精致洋装。',
    portraitUrl: 'https://picsum.photos/seed/smy/400/500',
    appearances: []
  },
  {
    id: 'c3',
    name: '沈廷渊',
    gender: '男',
    age: '45',
    shortBio: '气质沉稳，眼神睿智且略带威严。身材保...',
    description: '沈氏集团掌舵人，赵书禾的父亲。气质沉稳，眼神睿智且略带威严。身材保持得很好，常年穿着定制西装。',
    portraitUrl: 'https://picsum.photos/seed/sty/400/500',
    appearances: []
  }
];

const AssetManager: React.FC<{ type: AppView; projectId?: number }> = ({ type, projectId }) => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAppearance, setEditingAppearance] = useState<Appearance | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGender, setNewGender] = useState<'男' | '女' | '其他'>('其他');
  const [newAge, setNewAge] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const handleCreateCharacter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !projectId) return;
    try {
      await api.post(`/projects/${projectId}/characters`, { name: newName, gender: newGender, age: newAge, appearanceDescription: newDesc });
      setShowCreate(false); setNewName(''); setNewGender('其他'); setNewAge(''); setNewDesc('');
      loadCharacters();
    } catch { alert('创建失败'); }
  };

  const loadCharacters = async () => {
    if (!projectId) { setLoading(false); return; }
    try {
      const res = await api.get(`/projects/${projectId}/characters`);
      if (res.data.success && res.data.data.length > 0) {
        const mapped: Character[] = res.data.data.map((c: any) => ({
          id: String(c.id),
          name: c.name,
          gender: c.gender || '其他',
          age: c.age || '',
          description: c.appearanceDescription || '',
          portraitUrl: c.portraitUrl || `https://picsum.photos/seed/${c.id}/400/500`,
          shortBio: c.appearanceDescription?.substring(0, 30) || '',
          appearances: [],
        }));
        setCharacters(mapped as any);
        setSelectedId((prev) => mapped.find((c: any) => c.id === prev) ? prev : mapped[0].id);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadCharacters(); }, [projectId]);

  const activeChar = characters.find(c => c.id === selectedId) || characters[0];

  const updateActiveChar = (updates: Partial<Character>) => {
    setCharacters(prev => prev.map(c => c.id === selectedId ? { ...c, ...updates } : c));
  };

  const handleGenerateAppearance = (appId: string) => {
    setIsGenerating(true);
    setTimeout(() => {
      setCharacters(prev => prev.map(c => {
        if (c.id === selectedId) {
          return {
            ...c,
            appearances: c.appearances.map(a => a.id === appId ? { ...a, status: 'generated', imageUrl: `https://picsum.photos/seed/${appId}_gen/400/400` } : a)
          };
        }
        return c;
      }));
      setIsGenerating(false);
    }, 2000);
  };

  const handleDeleteAppearance = (appId: string) => {
    if (confirm('确定要删除这个造型吗？')) {
      setCharacters(prev => prev.map(c => {
        if (c.id === selectedId) {
          return {
            ...c,
            appearances: c.appearances.filter(a => a.id !== appId)
          };
        }
        return c;
      }));
    }
  };

  const handleSaveAppearanceEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAppearance) return;

    setCharacters(prev => prev.map(c => {
      if (c.id === selectedId) {
        return {
          ...c,
          appearances: c.appearances.map(a => a.id === editingAppearance.id ? editingAppearance : a)
        };
      }
      return c;
    }));
    setEditingAppearance(null);
  };

  const handleDeleteCharacter = () => {
    if (confirm('确定要删除当前角色吗？')) {
      const remaining = characters.filter(c => c.id !== selectedId);
      if (remaining.length > 0) {
        setCharacters(remaining);
        setSelectedId(remaining[0].id);
      }
    }
  };

  // Gender Segmented Control Component
  const GenderSelector = ({ value, onChange }: { value: string, onChange: (v: '男' | '女' | '其他') => void }) => (
    <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1 w-full shadow-inner">
      {(['男', '女', '其他'] as const).map((g) => (
        <button
          key={g}
          onClick={() => onChange(g)}
          className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all duration-200 ${
            value === g 
              ? 'bg-primary text-white shadow-lg shadow-primary/20' 
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          {g}
        </button>
      ))}
    </div>
  );

  if (loading) {
    return <div className="h-full flex items-center justify-center bg-[#05080f] text-slate-500">加载中...</div>;
  }

  const renderCreateCharModal = () => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-[#0b0f1a] border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex justify-between"><h3 className="font-bold text-white">新建角色</h3><button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-white"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button></div>
        <form onSubmit={handleCreateCharacter} className="p-6 space-y-4">
          <div><label className="text-xs font-bold text-slate-400 uppercase block mb-2">名称</label><input value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-primary" placeholder="例如：赵书禾" required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase block mb-2">性别</label>
              <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1">
                {(['男', '女', '其他'] as const).map((g) => (
                  <button key={g} type="button" onClick={() => setNewGender(g)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${newGender === g ? 'bg-primary text-white' : 'text-slate-500 hover:text-slate-300'}`}>{g}</button>
                ))}
              </div>
            </div>
            <div><label className="text-xs font-bold text-slate-400 uppercase block mb-2">年龄</label><input value={newAge} onChange={(e) => setNewAge(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:border-primary text-sm" placeholder="18" /></div>
          </div>
          <div><label className="text-xs font-bold text-slate-400 uppercase block mb-2">外观描述</label><textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-primary h-24 resize-none" placeholder="角色外貌、神态、妆造..." /></div>
          <button type="submit" className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-indigo-600 transition-colors">创建角色</button>
        </form>
      </div>
    </div>
  );

  if (!activeChar) {
    return (
      <>
      <div className="h-full flex items-center justify-center bg-[#05080f]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800/40 flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </div>
          <p className="text-slate-500 text-sm mb-4">暂无角色数据</p>
          <button
            onClick={() => { setNewName(''); setNewGender('其他'); setNewAge(''); setNewDesc(''); setShowCreate(true); }}
            className="px-5 py-2.5 bg-primary hover:bg-indigo-600 text-white text-sm font-bold rounded-xl transition-colors">
            + 新建角色
          </button>
        </div>
      </div>
      {showCreate && renderCreateCharModal()}
      </>
    );
  }

  return (
    <div className="h-full flex bg-[#05080f] text-slate-300 font-sans overflow-hidden">
      <div className="w-[300px] shrink-0 border-r border-slate-800/50 flex flex-col bg-[#0b0f1a] z-20">
        <div className="p-4 border-b border-slate-800/50 bg-slate-900/40">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-white text-base tracking-tight">角色资产</h3>
            <button onClick={() => { setNewName(''); setNewGender('其他'); setNewAge(''); setNewDesc(''); setShowCreate(true); }}
              className="text-[10px] bg-primary text-white px-2.5 py-1 rounded shadow-lg shadow-primary/20 hover:bg-indigo-600 transition-all flex items-center gap-1 font-bold">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
              新建
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          {characters.map(char => (
            <div 
              key={char.id}
              onClick={() => setSelectedId(char.id)}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-4 group ${
                selectedId === char.id 
                  ? 'bg-primary/10 border-primary shadow-lg shadow-primary/5' 
                  : 'bg-slate-900/40 border-transparent hover:bg-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="w-12 h-12 shrink-0 rounded-full overflow-hidden border-2 border-slate-800 bg-slate-950 shadow-inner">
                <img src={char.portraitUrl} alt={char.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className={`text-sm font-bold truncate ${selectedId === char.id ? 'text-white' : 'text-slate-300'}`}>
                    {char.name}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 line-clamp-1 leading-relaxed italic">
                  {char.gender} · {char.age}岁
                </p>
              </div>
            </div>
          ))}
          <div className="text-center py-6 text-slate-700 text-[10px] tracking-widest uppercase">没有更多数据了</div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0 bg-[#05080f]">
        <div className="flex-1 flex min-h-0">
          <div className="w-[360px] shrink-0 border-r border-slate-800/50 flex flex-col bg-[#0b0f1a] overflow-y-auto custom-scrollbar p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">基础信息</h4>
                <button onClick={() => setShowEditModal(true)} className="text-slate-500 hover:text-white transition-colors" title="编辑全貌">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">角色名字</label>
                <input 
                  type="text" 
                  value={activeChar.name}
                  onChange={(e) => updateActiveChar({ name: e.target.value })}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-lg px-3 py-2 text-xl font-black text-white outline-none focus:border-primary transition-all shadow-inner" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">性别</label>
                  <GenderSelector value={activeChar.gender} onChange={(v) => updateActiveChar({ gender: v })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">年龄</label>
                  <input 
                    type="text" 
                    value={activeChar.age}
                    onChange={(e) => updateActiveChar({ age: e.target.value })}
                    className="w-full h-9 bg-slate-900/50 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 outline-none focus:border-primary transition-all shadow-inner" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">长相表述</label>
                <textarea 
                  value={activeChar.description}
                  onChange={(e) => updateActiveChar({ description: e.target.value })}
                  className="w-full h-32 bg-slate-900/50 border border-slate-800 rounded-lg p-3 text-sm text-slate-400 leading-relaxed outline-none focus:border-primary resize-none transition-all shadow-inner"
                  placeholder="请输入对该角色外貌、神态、妆造的详细描述..."
                />
              </div>
              <div className="space-y-4 pt-4">
                <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl group relative">
                  <img src={activeChar.portraitUrl} alt={activeChar.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                    <div className="flex gap-2">
                       <button className="flex-1 py-2 bg-white/10 backdrop-blur-md rounded-lg text-[10px] font-bold hover:bg-white/20 transition-all border border-white/5">手动上传</button>
                    </div>
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
                     onClick={handleDeleteCharacter}
                     className="w-full text-[11px] text-red-400 border border-red-900/30 bg-red-900/10 px-3 py-2.5 rounded-xl hover:bg-red-900/20 transition-all flex items-center justify-center gap-2"
                   >
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                     删除角色
                   </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col min-w-0 bg-[#05080f]">
            <div className="p-4 border-b border-slate-800/50 flex items-center justify-between bg-slate-900/20">
              <div className="flex gap-4">
                <button className="text-primary text-xs font-bold border-b-2 border-primary pb-1">全部造型 ({activeChar.appearances.length})</button>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-1.5 text-[11px] font-bold text-white bg-primary px-4 py-1.5 rounded-lg shadow-lg shadow-primary/20 hover:brightness-110 transition-all">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  一键生成
                </button>
                <button className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 bg-slate-900 border border-slate-800 px-4 py-1.5 rounded-lg hover:text-white transition-all">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                  排序
                </button>
                <button className="flex items-center gap-1.5 text-[11px] font-bold text-white bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 px-4 py-1.5 rounded-lg hover:bg-indigo-500/30 transition-all">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                  新建造型
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {activeChar.appearances.map(app => (
                  <div key={app.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col group relative">
                    <div className="relative aspect-square bg-slate-950 flex items-center justify-center overflow-hidden">
                      {app.status === 'generated' ? (
                        <img src={app.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-3 opacity-20">
                           <svg className="w-12 h-12 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        {app.status === 'pending' && <span className="text-[9px] bg-yellow-500/90 text-black font-bold px-2 py-0.5 rounded-full shadow-lg">待生成</span>}
                      </div>
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                         <button className="px-6 py-2 bg-white/10 backdrop-blur-md rounded-xl text-xs font-bold hover:bg-white/20 transition-all border border-white/10">更换图片</button>
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <h5 className="text-sm font-bold text-white truncate">{app.name}</h5>
                        <button onClick={() => setEditingAppearance({...app})} className="p-1 text-slate-500 hover:text-white transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed h-[30px]">{app.description}</p>
                      <div className="pt-3 flex flex-col gap-2 mt-auto border-t border-slate-800/50">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleGenerateAppearance(app.id)}
                            disabled={isGenerating}
                            className="flex-1 text-[10px] text-white bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-500 font-bold transition-all disabled:opacity-50"
                          >
                            {isGenerating && app.status === 'pending' ? '生成中...' : '手动生成'}
                          </button>
                          <button className="flex-1 text-[10px] text-slate-400 border border-slate-800 bg-slate-950 px-3 py-1.5 rounded-lg hover:text-white hover:border-slate-700 transition-all font-bold">上传图片</button>
                        </div>
                        <button 
                          onClick={() => handleDeleteAppearance(app.id)}
                          className="w-full text-[10px] text-red-500/70 py-1 hover:text-red-400 transition-colors flex items-center justify-center gap-1"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          删除造型
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

      {editingAppearance && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] flex items-center justify-center p-6 animate-fadeIn">
          <div className="bg-[#0b0f1a] border border-slate-700 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white">编辑造型信息</h3>
              <button onClick={() => setEditingAppearance(null)} className="text-slate-500 hover:text-white"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <form onSubmit={handleSaveAppearanceEdit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">造型名称</label>
                <input type="text" value={editingAppearance.name} onChange={e => setEditingAppearance({...editingAppearance, name: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-primary transition-all shadow-inner" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">造型描述</label>
                <textarea value={editingAppearance.description} onChange={e => setEditingAppearance({...editingAppearance, description: e.target.value})} className="w-full h-32 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-primary resize-none leading-relaxed transition-all shadow-inner" />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setEditingAppearance(null)} className="px-6 py-2.5 text-slate-400 hover:text-white transition-colors text-sm font-medium">取消</button>
                <button type="submit" className="px-8 py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-indigo-600 transition-all text-sm">确认保存</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-fadeIn">
          <div className="bg-[#0b0f1a] border border-slate-700 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white">编辑角色全貌</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-500 hover:text-white"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh] custom-scrollbar">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">名字</label>
                <input type="text" defaultValue={activeChar.name} onBlur={(e) => updateActiveChar({ name: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-primary shadow-inner" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">性别</label>
                    <GenderSelector value={activeChar.gender} onChange={(v) => updateActiveChar({ gender: v })} />
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">年龄</label>
                    <input type="text" defaultValue={activeChar.age} onBlur={(e) => updateActiveChar({ age: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-primary shadow-inner" />
                 </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">长相描述</label>
                <textarea defaultValue={activeChar.description} onBlur={(e) => updateActiveChar({ description: e.target.value })} className="w-full h-32 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-primary resize-none leading-relaxed shadow-inner" />
              </div>
            </div>
            <div className="p-4 border-t border-slate-800 flex justify-end gap-3">
              <button onClick={() => setShowEditModal(false)} className="px-8 py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-indigo-600 transition-all text-sm">完成</button>
            </div>
          </div>
        </div>
      )}

      {showCreate && renderCreateCharModal()}
    </div>
  );
};

export default AssetManager;