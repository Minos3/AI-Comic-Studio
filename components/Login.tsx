import React, { useState } from 'react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      onLogin();
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#050b14] relative overflow-hidden font-sans text-slate-200">

      {/* --- Animated Background Effects --- */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '4s' }}></div>
      <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-900/10 rounded-full blur-[100px]"></div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)] pointer-events-none"></div>

      <div className="w-full max-w-md p-6 relative z-10 perspective-1000">
        <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/50 ring-1 ring-white/5 transform transition-all duration-500 hover:scale-[1.01]">

          {/* Logo Section */}
          <div className="text-center mb-10">
            <div className="relative w-16 h-16 mx-auto mb-6 group">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative w-full h-full bg-slate-900 border border-slate-700 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-inner overflow-hidden">
                <span className="bg-clip-text text-transparent bg-gradient-to-br from-indigo-400 to-purple-400 z-10">AI</span>
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Comic Studio</h1>
            <p className="text-slate-400 mt-2 text-sm">Enter the future of storytelling</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Phone Input */}
            <div className="group">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 group-focus-within:text-indigo-400 transition-colors">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-3.5 text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all shadow-inner"
                  placeholder="138 0000 0000"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="group">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider group-focus-within:text-indigo-400 transition-colors">
                  Password
                </label>
                <a href="#" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Forgot?</a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-3.5 text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all shadow-inner"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_auto] hover:bg-right text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-900/30 hover:shadow-indigo-600/40 transition-all duration-300 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 group"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Authenticating...
                </>
              ) : (
                <>
                  Login
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <p className="text-sm text-slate-500">
              Don't have an account? <a href="#" className="text-white hover:text-indigo-400 font-medium transition-colors ml-1">Register Now</a>
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center mt-6 text-xs text-slate-600">
          © 2026 AI Comic Studio. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Login;