/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Layout as LayoutIcon, Settings } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './views/LandingPage';
import { PlannerPage } from './views/PlannerPage';
import { HistoryPage } from './views/HistoryPage';
import { ItineraryPage } from './views/ItineraryPage';
import { DashboardPage } from './views/DashboardPage';
import { mockTrips } from './mockData';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

type View = 'landing' | 'planner' | 'history' | 'destinations' | 'itinerary' | 'dashboard';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('landing');
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'user' | 'admin'>('user');

  const navigateTo = (view: View) => {
    // Basic View Guard
    if (view === 'dashboard' && userRole !== 'admin') {
      alert('权限不足：仅管理员可访问后台');
      return;
    }

    setCurrentView(view);
    if (view !== 'itinerary') setSelectedTripId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const viewTrip = (id: string) => {
    setSelectedTripId(id);
    setCurrentView('itinerary');
  };

  const activeTrip = mockTrips.find(t => t.id === selectedTripId) || mockTrips[0];

  return (
    <div className="min-h-screen bg-surface">
      {currentView !== 'landing' && (
        <Navbar 
          activeTab={currentView as any} 
          onNavigate={navigateTo} 
          showSearch={currentView === 'history' || currentView === 'dashboard'} 
          userRole={userRole}
        />
      )}

      <main className={currentView === 'landing' ? '' : 'pt-36 pb-20 px-8 flex flex-col items-center'}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView + (selectedTripId || '')}
            className={currentView === 'landing' ? "w-full" : "w-full max-w-[1240px] mx-auto"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {currentView === 'landing' && (
              <LandingPage onStart={() => navigateTo('planner')} />
            )}
            {currentView === 'planner' && (
              <PlannerPage onGenerate={() => viewTrip('trip-1')} />
            )}
            {currentView === 'history' && (
              <HistoryPage onViewTrip={viewTrip} />
            )}
            {currentView === 'itinerary' && (
              <ItineraryPage trip={activeTrip} />
            )}
            {currentView === 'dashboard' || currentView === 'destinations' ? (
              <DashboardPage />
            ) : null}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Role & Dashboard Toggle for demo purposes */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        <button 
          onClick={() => setUserRole(userRole === 'admin' ? 'user' : 'admin')}
          className={cn(
            "p-3 rounded-full shadow-2xl transition-all active:scale-90 flex items-center gap-2 px-4 text-xs font-bold uppercase tracking-wider",
            userRole === 'admin' ? "bg-indigo-600 text-white" : "bg-white text-gray-500 border border-gray-200"
          )}
        >
          <Settings size={16} />
          {userRole === 'admin' ? '管理员模式' : '切换为管理员'}
        </button>
        
        {userRole === 'admin' && (
          <button 
            onClick={() => navigateTo(currentView === 'dashboard' ? 'landing' : 'dashboard')}
            className="bg-on-surface text-white p-3 rounded-full shadow-2xl hover:bg-primary transition-all active:scale-90"
            title="Toggle Admin View"
          >
            <LayoutIcon size={20} />
          </button>
        )}
      </div>
    </div>
  );
}



