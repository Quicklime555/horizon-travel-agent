import { Bell, Search, LogOut } from 'lucide-react';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  showSearch?: boolean;
}

export function Navbar({ showSearch = false }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { userRole, signOut, user } = useAuth();

  const tabs = [
    { id: 'planner', label: '规划专家', path: '/planner' },
    { id: 'destinations', label: '热门目的地', path: '/destinations' },
    { id: 'history', label: '历史行程', path: '/history' },
    ...(userRole === 'admin' ? [{ id: 'dashboard', label: '系统概览', path: '/admin' }] : []),
  ];

  const activeTab = tabs.find(tab => location.pathname === tab.path)?.id;

  return (
    <header className="fixed top-6 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-[1200px] z-50">
      <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-[32px] shadow-bento px-8 h-20 flex justify-between items-center">
        <div className="flex items-center gap-12">
          <Link 
            to="/"
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
              <div className="w-3 h-3 bg-white rotate-45"></div>
            </div>
            <span className="text-lg font-bold tracking-tight text-[#1D1D1F]">Horizon</span>
          </Link>

          {showSearch && (
            <div className="hidden md:flex items-center bg-gray-50 rounded-full px-5 py-2.5 border border-gray-200 focus-within:border-black transition-colors">
              <Search className="text-gray-400 mr-2" size={18} />
              <input 
                className="bg-transparent border-none outline-none text-sm text-[#1D1D1F] w-48 placeholder-gray-400 font-sans" 
                placeholder="搜索您的旅程..." 
                type="text"
              />
            </div>
          )}
        </div>

        <nav className="hidden md:flex items-center gap-10">
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              to={tab.path}
              className={cn(
                "relative text-sm transition-all py-1 font-medium tracking-tight",
                activeTab === tab.id 
                  ? "text-[#1D1D1F]" 
                  : "text-gray-400 hover:text-[#1D1D1F]"
              )}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute -bottom-1 left-0 w-full h-[2px] bg-black rounded-full" 
                />
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button className="hidden md:flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-50 transition-colors text-gray-400">
            <Bell size={20} />
          </button>
          
          {user ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-gray-200 overflow-hidden cursor-pointer active:scale-95 transition-transform group relative">
                <img 
                  src={user.user_metadata.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100"} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center" onClick={() => signOut()}>
                  <LogOut size={16} className="text-white" />
                </div>
              </div>
            </div>
          ) : (
            <Button 
              variant="primary" 
              className="rounded-full px-6 font-medium text-sm h-11 bg-black hover:bg-gray-800 border-none shadow-none"
              onClick={() => navigate('/login')}
            >
              登录
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
