import React, { useState } from 'react';
import { useAuthStore } from './useAuthStore';
import { api } from '../../lib/api';

const LoginPage: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { username: phone, password });
      if (res.data.success) {
        setAuth(res.data.data.token, res.data.data.user);
      }
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || '登录失败，请重试';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegLoading(true);
    setRegError('');
    setRegSuccess('');
    try {
      const res = await api.post('/auth/register', { username: regPhone, password: regPassword });
      if (res.data.success) {
        setRegSuccess('注册成功！请使用新账号登录');
        setRegPhone('');
        setRegPassword('');
        setTimeout(() => setShowRegister(false), 1500);
      }
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || '注册失败，请重试';
      setRegError(msg);
    } finally {
      setRegLoading(false);
    }
  };

  if (showRegister) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#020617] relative overflow-hidden font-sans text-slate-200">
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[900px] h-[900px] bg-purple-600/10 rounded-full blur-[140px] animate-pulse" style={{animationDuration: '6s'}}></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_100%)] pointer-events-none"></div>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent absolute animate-[scan_4s_linear_infinite]" style={{ top: '0%' }}></div>
        </div>
        <style>{`
          @keyframes scan {
            from { top: 0%; opacity: 0; }
            50% { opacity: 1; }
            to { top: 100%; opacity: 0; }
          }
        `}</style>

        <div className="w-full max-w-md p-6 relative z-10">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-indigo-500/20 rounded-[2.5rem] blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-slate-900/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 shadow-3xl shadow-black/80 ring-1 ring-white/5 overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-20 select-none font-mono text-[8px] text-indigo-400">
                0x7F2A_SECURE_AUTH
              </div>

              <div className="text-center mb-10">
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="absolute inset-0 bg-indigo-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                  <div className="relative w-full h-full bg-slate-900 border border-slate-700/50 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-2xl overflow-hidden ring-2 ring-indigo-500/30">
                    <span className="bg-clip-text text-transparent bg-gradient-to-br from-indigo-300 via-white to-purple-300">AI</span>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15)_0%,transparent_100%)]"></div>
                  </div>
                </div>
                <h1 className="text-3xl font-black text-white tracking-wider mb-2 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
                  梦境AI短剧平台
                </h1>
                <p className="text-slate-500 text-xs font-medium tracking-[0.2em] uppercase opacity-80">
                  创建新的系统账号
                </p>
              </div>

              <form onSubmit={handleRegister} className="space-y-7">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_5px_#6366f1]"></span>
                    手机号码
                  </label>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-600 group-focus-within/input:text-indigo-400 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                    </div>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full bg-slate-950/40 border border-slate-800 rounded-2xl pl-11 pr-4 py-4 text-white placeholder-slate-700 focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all shadow-inner font-mono tracking-wider"
                      placeholder="请输入手机号"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full shadow-[0_0_5px_#a855f7]"></span>
                    访问密码
                  </label>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-600 group-focus-within/input:text-purple-400 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    </div>
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full bg-slate-950/40 border border-slate-800 rounded-2xl pl-11 pr-4 py-4 text-white placeholder-slate-700 focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/50 outline-none transition-all shadow-inner"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                {regError && <p className="text-red-400 text-sm text-center">{regError}</p>}
                {regSuccess && <p className="text-green-400 text-sm text-center">{regSuccess}</p>}

                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full relative group/btn overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 group-hover:scale-110 transition-transform duration-500"></div>
                  <div className="relative bg-transparent flex items-center justify-center gap-3 py-4 text-white font-black text-sm tracking-[0.3em] transition-all">
                    {regLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8a8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        正在注册...
                      </>
                    ) : (
                      <>
                        提交注册申请
                        <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                      </>
                    )}
                  </div>
                </button>
              </form>

              <div className="mt-10 pt-8 border-t border-slate-800/50 text-center">
                <p className="text-[11px] text-slate-500 font-bold tracking-wider">
                  已有系统账号？
                  <button onClick={() => { setShowRegister(false); setRegError(''); setRegSuccess(''); }} className="text-indigo-400 hover:text-indigo-300 transition-colors ml-2 underline decoration-indigo-500/30 underline-offset-4">返回登录</button>
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-8 text-[10px] text-slate-600 font-mono tracking-widest uppercase">
            © 2024 DREAM AI SHORT DRAMA PLATFORM. ALL RIGHTS RESERVED.
            <br/>
            <span className="opacity-40">System Version 2.0.48 / Secure Connection Enabled</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#020617] relative overflow-hidden font-sans text-slate-200">

      {/* --- 科技感背景特效 --- */}
      {/* 动态脉冲光团 */}
      <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[900px] h-[900px] bg-purple-600/10 rounded-full blur-[140px] animate-pulse" style={{animationDuration: '6s'}}></div>

      {/* 背景数字网格 */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_100%)] pointer-events-none"></div>

      {/* 动态扫描线 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent absolute animate-[scan_4s_linear_infinite]" style={{ top: '0%' }}></div>
      </div>

      <style>{`
        @keyframes scan {
          from { top: 0%; opacity: 0; }
          50% { opacity: 1; }
          to { top: 100%; opacity: 0; }
        }
      `}</style>

      <div className="w-full max-w-md p-6 relative z-10">
        {/* 登录框容器 */}
        <div className="relative group">
          {/* 登录框边缘流光 */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-indigo-500/20 rounded-[2.5rem] blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>

          <div className="relative bg-slate-900/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 shadow-3xl shadow-black/80 ring-1 ring-white/5 overflow-hidden">

            {/* 科技装饰角 */}
            <div className="absolute top-0 right-0 p-4 opacity-20 select-none font-mono text-[8px] text-indigo-400">
              0x7F2A_SECURE_AUTH
            </div>

            {/* Logo 区域 */}
            <div className="text-center mb-10">
              <div className="relative w-20 h-20 mx-auto mb-6">
                {/* 环形光效 */}
                <div className="absolute inset-0 bg-indigo-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                <div className="relative w-full h-full bg-slate-900 border border-slate-700/50 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-2xl overflow-hidden ring-2 ring-indigo-500/30">
                  <span className="bg-clip-text text-transparent bg-gradient-to-br from-indigo-300 via-white to-purple-300">AI</span>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15)_0%,transparent_100%)]"></div>
                </div>
              </div>
              <h1 className="text-3xl font-black text-white tracking-wider mb-2 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
                梦境AI短剧平台
              </h1>
              <p className="text-slate-500 text-xs font-medium tracking-[0.2em] uppercase opacity-80">
                开启短剧创作的新纪元
              </p>
            </div>

            {error && (
              <div className="mb-4 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-7">

              {/* 手机号输入 */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_5px_#6366f1]"></span>
                  手机号码
                </label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-600 group-focus-within/input:text-indigo-400 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950/40 border border-slate-800 rounded-2xl pl-11 pr-4 py-4 text-white placeholder-slate-700 focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all shadow-inner font-mono tracking-wider"
                    placeholder="请输入手机号"
                    required
                  />
                </div>
              </div>

              {/* 密码输入 */}
              <div className="space-y-2">
                <div className="flex justify-between items-center pl-1">
                  <label className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full shadow-[0_0_5px_#a855f7]"></span>
                    访问密码
                  </label>
                  <a href="#" className="text-[10px] text-indigo-400/80 hover:text-indigo-300 transition-colors font-bold tracking-tighter">忘记密码？</a>
                </div>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-600 group-focus-within/input:text-purple-400 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950/40 border border-slate-800 rounded-2xl pl-11 pr-4 py-4 text-white placeholder-slate-700 focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/50 outline-none transition-all shadow-inner"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {/* 提交按钮 */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full relative group/btn overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 group-hover:scale-110 transition-transform duration-500"></div>
                <div className="relative bg-transparent flex items-center justify-center gap-3 py-4 text-white font-black text-sm tracking-[0.3em] transition-all">
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      正在身份验证...
                    </>
                  ) : (
                    <>
                      进入梦境系统
                      <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </>
                  )}
                </div>
              </button>
            </form>

            <div className="mt-10 pt-8 border-t border-slate-800/50 text-center">
              <p className="text-[11px] text-slate-500 font-bold tracking-wider">
                还没有系统账号？
                <button onClick={() => { setShowRegister(true); setError(''); }} className="text-indigo-400 hover:text-indigo-300 transition-colors ml-2 underline decoration-indigo-500/30 underline-offset-4">立即注册申请</button>
              </p>
            </div>
          </div>
        </div>

        {/* 页脚 版权信息 */}
        <div className="text-center mt-8 text-[10px] text-slate-600 font-mono tracking-widest uppercase">
          © 2024 DREAM AI SHORT DRAMA PLATFORM. ALL RIGHTS RESERVED.
          <br/>
          <span className="opacity-40">System Version 2.0.48 / Secure Connection Enabled</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
