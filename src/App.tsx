import { useState } from 'react';
import { Layout as LayoutIcon, LogOut, ShieldCheck } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './views/LandingPage';
import { PlannerPage } from './views/PlannerPage';
import { HistoryPage } from './views/HistoryPage';
import { ItineraryPage } from './views/ItineraryPage';
import { DashboardPage } from './views/DashboardPage';
import LoginPage from './views/LoginPage';
import { mockTrips } from './mockData';
import { motion, AnimatePresence } from 'motion/react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { RequireAuth } from './components/RequireAuth';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userRole, loading, signOut, isDemoMode } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-surface">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const isLanding = location.pathname === '/';
  const isLogin = location.pathname === '/login';

  return (
    <div className="min-h-screen bg-surface">
      {!isLanding && !isLogin && (
        <Navbar showSearch={location.pathname === '/history' || location.pathname === '/admin'} />
      )}

      <main className={isLanding || isLogin ? '' : 'pt-36 pb-20 px-8 flex flex-col items-center'}>
        <div className={isLanding || isLogin ? "w-full" : "w-full max-w-[1240px] mx-auto"}>
          <Routes>
            <Route path="/" element={<LandingPage onStart={() => navigate('/planner')} />} />
            <Route path="/login" element={isDemoMode ? <Navigate to="/planner" replace /> : <LoginPage />} />
            
            <Route path="/planner" element={
              <PlannerPage onGenerate={(id) => navigate(`/trips/${id}`)} />
            } />
            
            <Route path="/history" element={isDemoMode ? <Navigate to="/planner" replace /> : (
              <RequireAuth>
                <HistoryPage onViewTrip={(id) => navigate(`/trips/${id}`)} />
              </RequireAuth>
            )} />
            
            <Route path="/trips/:id" element={
              <RequireAuth>
                <ItineraryPage />
              </RequireAuth>
            } />
            
            <Route path="/destinations" element={isDemoMode ? <Navigate to="/planner" replace /> : <DashboardPage />} />
            
            <Route path="/admin" element={isDemoMode ? <Navigate to="/planner" replace /> : (
              <RequireAuth adminOnly>
                <DashboardPage />
              </RequireAuth>
            )} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>

      {/* Floating Role & Status - for development/demo only */}
      {user && !isDemoMode && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
          <div className="bg-white/90 backdrop-blur-md border border-gray-100 rounded-2xl p-4 shadow-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              {userRole === 'admin' ? <ShieldCheck size={20} /> : <LayoutIcon size={20} />}
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">当前角色</p>
              <p className="text-sm font-bold text-on-surface">{userRole === 'admin' ? '系统管理员' : '普通用户'}</p>
            </div>
            <button 
              onClick={() => signOut()}
              className="ml-4 p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
              title="退出登录"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

