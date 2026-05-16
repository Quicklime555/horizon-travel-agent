import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, ArrowRight, Github, Chrome, Loader2, Globe, MessageSquare } from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/planner";

  const translateAuthError = (err: any): string => {
    const msg = err?.message || '';
    if (msg.includes('Invalid login credentials')) return '邮箱或密码错误';
    if (msg.includes('Email not confirmed')) return '请先验证您的邮箱';
    if (msg.includes('User already registered')) return '该邮箱已被注册';
    if (msg.includes('Password should be at least')) return '密码长度不能少于6位';
    if (msg.includes('Rate limit')) return '请求过于频繁，请稍后再试';
    return '登录失败，请稍后重试';
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('注册成功！请查收邮件确认。');
      }
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(translateAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleWeChatLogin = async () => {
    try {
      const state = crypto.randomUUID();
      sessionStorage.setItem('wechat_auth_state', state); // For CSRF verification after redirect
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/wechat/url?state=${state}`);
      const { url } = await response.json();
      window.location.href = url;
    } catch (err) {
      console.error('Failed to get WeChat URL:', err);
      setError('无法连接到微信登录服务');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-surface relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[440px] px-6 z-10"
      >
        <div className="bg-white/70 backdrop-blur-2xl border border-white/40 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] rounded-[32px] p-10 overflow-hidden relative">
          
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-14 h-14 bg-on-surface rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-on-surface/20">
              <Globe className="text-white" size={28} />
            </div>
            <h1 className="text-3xl font-bold text-on-surface tracking-tight">Horizon Travel</h1>
            <p className="text-gray-500 mt-2 text-sm font-medium">
              {isLogin ? '欢迎回来，开始规划您的下一次旅行' : '加入我们，开启智能规划之旅'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">电子邮箱</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                <input 
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium placeholder:text-gray-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">密码</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                <input 
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium placeholder:text-gray-300"
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded-xl font-medium"
              >
                {error}
              </motion.div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-on-surface text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 shadow-lg shadow-on-surface/10"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  {isLogin ? '立即登录' : '创建账号'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 flex flex-col items-center gap-6">
            <div className="flex items-center gap-4 w-full">
              <div className="h-[1px] bg-gray-100 flex-1" />
              <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">第三方登录</span>
              <div className="h-[1px] bg-gray-100 flex-1" />
            </div>

            <div className="grid grid-cols-3 gap-3 w-full">
              <button className="flex items-center justify-center gap-2 py-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-xs text-gray-600">
                <Chrome size={16} className="text-red-500" /> Google
              </button>
              <button className="flex items-center justify-center gap-2 py-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-xs text-gray-600">
                <Github size={16} /> GitHub
              </button>
              <button 
                onClick={handleWeChatLogin}
                className="flex items-center justify-center gap-2 py-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-xs text-gray-600"
              >
                <MessageSquare size={16} className="text-green-500" /> 微信
              </button>
            </div>

            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm font-semibold text-gray-500 hover:text-primary transition-colors"
            >
              {isLogin ? '还没有账号？ 立即注册' : '已有账号？ 返回登录'}
            </button>
          </div>
        </div>
        
        <p className="text-center mt-8 text-gray-400 text-xs font-medium">
          点击继续即表示您同意我们的 <span className="text-gray-500 underline">服务条款</span> 和 <span className="text-gray-500 underline">隐私政策</span>
        </p>
      </motion.div>
    </div>
  );
}
