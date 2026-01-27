import React, { useState } from 'react';
import { generateComicScript } from '../../services/geminiService';

const ScriptCreate: React.FC = () => {
  const [idea, setIdea] = useState('');
  const [genre, setGenre] = useState('Sci-Fi');
  const [script, setScript] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!idea) return;
    setIsLoading(true);
    const result = await generateComicScript(idea, genre);
    setScript(result);
    setIsLoading(false);
  };

  return (
    <div className="h-full flex flex-col gap-6 p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">剧本创作 (Script Writer)</h2>
          <p className="text-slate-400">Use AI to generate professional comic scripts from your ideas.</p>
        </div>
        <button className="px-4 py-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 text-sm">
          Save Draft
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
        {/* Input Column */}
        <div className="lg:col-span-1 bg-slate-800/50 rounded-xl p-6 border border-slate-700 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Comic Genre</label>
            <select 
              value={genre} 
              onChange={(e) => setGenre(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="Sci-Fi">Sci-Fi</option>
              <option value="Fantasy">Fantasy</option>
              <option value="Slice of Life">Slice of Life</option>
              <option value="Horror">Horror</option>
              <option value="Superhero">Superhero</option>
            </select>
          </div>

          <div className="flex-1 flex flex-col">
            <label className="block text-sm font-medium text-slate-300 mb-2">Story Concept / Idea</label>
            <textarea 
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="e.g. A robot detective in 2088 solving the mystery of disappearing electric sheep..."
              className="w-full flex-1 bg-slate-900 border border-slate-700 rounded-lg p-4 text-white focus:ring-2 focus:ring-primary focus:outline-none resize-none"
            />
          </div>

          <button 
            onClick={handleGenerate}
            disabled={isLoading || !idea}
            className={`w-full py-3 rounded-lg font-bold text-white flex items-center justify-center gap-2 transition-all
              ${isLoading ? 'bg-slate-600 cursor-not-allowed' : 'bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98]'}
            `}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Generate Script
              </>
            )}
          </button>
        </div>

        {/* Output Column */}
        <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-700 flex flex-col overflow-hidden relative">
           <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex justify-between items-center">
             <span className="text-xs font-mono text-slate-400">SCRIPT_EDITOR_V1.0</span>
             <div className="flex gap-2">
               <span className="w-3 h-3 rounded-full bg-red-500"></span>
               <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
               <span className="w-3 h-3 rounded-full bg-green-500"></span>
             </div>
           </div>
           <textarea
             value={script}
             onChange={(e) => setScript(e.target.value)}
             className="flex-1 w-full bg-slate-900 p-8 text-slate-300 font-mono focus:outline-none resize-none leading-relaxed"
             placeholder="Your generated script will appear here..."
           />
           {!script && !isLoading && (
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               <div className="text-center text-slate-600">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  <p>Ready to write masterpiece...</p>
               </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default ScriptCreate;