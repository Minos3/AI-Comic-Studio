import React, { useState } from 'react';
import { Asset } from '../types';
import { MOCK_CHARACTERS, MOCK_ITEMS, MOCK_SCENES, MOCK_CREATURES } from '../data/mockData';

interface AssetSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (assets: Asset[]) => void;
  selectedAssets: Asset[];
}

const AssetSelectorModal: React.FC<AssetSelectorModalProps> = ({ isOpen, onClose, onSelect, selectedAssets }) => {
  const [activeTab, setActiveTab] = useState<'character' | 'item' | 'scene' | 'creature'>('character');
  const [tempSelectedAssets, setTempSelectedAssets] = useState<Asset[]>(selectedAssets);

  if (!isOpen) return null;

  const handleAssetToggle = (asset: Asset) => {
    setTempSelectedAssets(prev => {
      const exists = prev.find(a => a.id === asset.id);
      if (exists) {
        return prev.filter(a => a.id !== asset.id);
      } else {
        return [...prev, asset];
      }
    });
  };

  const handleConfirm = () => {
    onSelect(tempSelectedAssets);
    onClose();
  };

  const renderAssets = () => {
    let assets: Asset[] = [];
    switch (activeTab) {
      case 'character':
        // Convert Character to Asset for display
        assets = MOCK_CHARACTERS.map(c => ({
          id: c.id,
          name: c.name,
          url: c.portraitUrl,
          type: 'image',
          category: 'Character'
        }));
        break;
      case 'item':
        assets = MOCK_ITEMS;
        break;
      case 'scene':
        assets = MOCK_SCENES;
        break;
      case 'creature':
        assets = MOCK_CREATURES;
        break;
    }

    return (
      <div className="grid grid-cols-3 gap-4">
        {assets.map(asset => {
          const isSelected = tempSelectedAssets.some(a => a.id === asset.id);
          return (
            <div 
              key={asset.id} 
              className={`relative group rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${isSelected ? 'border-primary ring-2 ring-primary/50' : 'border-slate-800 hover:border-slate-600'}`}
              onClick={() => handleAssetToggle(asset)}
            >
              <div className="aspect-square bg-slate-900 relative">
                <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                <div className={`absolute inset-0 bg-black/40 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                
                {/* Checkbox */}
                <div className={`absolute top-2 left-2 w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-primary border-primary text-white' : 'bg-black/50 border-white/50 text-transparent'}`}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 to-transparent">
                  <div className="text-xs font-bold text-white truncate">{asset.name}</div>
                </div>
              </div>
            </div>
          );
        })}
        {assets.length === 0 && (
          <div className="col-span-3 py-12 text-center text-slate-500 text-sm">
            没有更多数据了
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-[900px] h-[600px] bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-800 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div>
            <h3 className="text-lg font-bold text-white">从资产库选择</h3>
            <p className="text-xs text-slate-500 mt-0.5">支持角色、道具、场景、生物等资产批量关联</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs text-slate-400 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
              已选择 <span className="text-primary font-bold">{tempSelectedAssets.length}</span> / 7
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 border-b border-slate-800 bg-slate-900/30">
          <div className="flex gap-6">
            {(['character', 'item', 'scene', 'creature'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 text-sm font-bold border-b-2 transition-colors ${
                  activeTab === tab 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab === 'character' ? '角色' : tab === 'item' ? '道具' : tab === 'scene' ? '场景' : '生物'}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex min-h-0">
          {/* Main Grid */}
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-[#0b0f1a]">
            {renderAssets()}
          </div>

          {/* Right Sidebar - Selected List (Optional based on prototype, but good for UX) */}
          <div className="w-64 border-l border-slate-800 bg-slate-900/30 flex flex-col">
             <div className="p-4 border-b border-slate-800/50">
               <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">已选列表</h4>
             </div>
             <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
               {tempSelectedAssets.map(asset => (
                 <div key={asset.id} className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 group hover:border-slate-600">
                   <img src={asset.url} className="w-8 h-8 rounded object-cover bg-slate-900" />
                   <div className="flex-1 min-w-0">
                     <div className="text-xs font-bold text-slate-300 truncate">{asset.name}</div>
                     <div className="text-[10px] text-slate-500 truncate">{asset.category || '未分类'}</div>
                   </div>
                   <button 
                     onClick={() => handleAssetToggle(asset)}
                     className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                   >
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                   </button>
                 </div>
               ))}
               {tempSelectedAssets.length === 0 && (
                 <div className="text-center py-8 text-xs text-slate-600">
                   暂无已选资产
                 </div>
               )}
             </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
          >
            取消
          </button>
          <button 
            onClick={handleConfirm}
            className="px-6 py-2 text-sm font-bold text-white bg-primary hover:bg-indigo-600 rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            确认选择 ({tempSelectedAssets.length})
          </button>
        </div>

      </div>
    </div>
  );
};

export default AssetSelectorModal;
