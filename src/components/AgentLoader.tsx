import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Brain, Map, Compass, AlertCircle, RefreshCcw } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useQuery } from '@tanstack/react-query';
import tripService from '../services/tripService';

interface AgentLoaderProps {
  onComplete: () => void;
  tripId?: string;
}

export function AgentLoader({ onComplete, tripId }: AgentLoaderProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  const messages = [
    { text: "正在分析当地天气与季节特征...", icon: <Sparkles className="text-blue-400" size={32} /> },
    { text: "正在根据您的口味筛选高分餐厅...", icon: <Brain className="text-purple-400" size={32} /> },
    { text: "正在优化步行路径与交通时间...", icon: <Map className="text-emerald-400" size={32} /> },
    { text: "即将完成个性化行程定制...", icon: <Compass className="text-amber-400" size={32} /> },
  ];

  // React Query Polling Logic
  const { 
    data: trip, 
    isError, 
    error, 
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['pollTrip', tripId],
    queryFn: () => tripService.pollTripUntilComplete(tripId!),
    enabled: !!tripId,
    retry: 1, // Auto-retry once on failure as requested
    staleTime: 0,
    gcTime: 0,
  });

  // Handle completion
  useEffect(() => {
    if (trip) {
      const timer = setTimeout(() => {
        onComplete();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [trip, onComplete]);

  // Message cycling logic
  useEffect(() => {
    const timer = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % messages.length);
    }, 2500);

    return () => clearInterval(timer);
  }, [messages.length]);

  if (isError) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-32 w-full min-h-[400px] text-center px-6"
      >
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-8 shadow-inner">
          <AlertCircle size={40} />
        </div>
        <h3 className="text-2xl font-bold text-[#1D1D1F] mb-3 tracking-tight">行程生成遇到了一点挑战</h3>
        <p className="text-gray-500 mb-10 max-w-sm leading-relaxed">
          {error instanceof Error ? error.message : '我们无法完成您的行程规划，请检查连接或尝试重新生成。'}
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={() => refetch()}
            disabled={isFetching}
            className="px-10 py-4 bg-black text-white rounded-2xl font-bold shadow-xl shadow-black/10 hover:bg-gray-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isFetching ? <RefreshCcw size={20} className="animate-spin" /> : <RefreshCcw size={20} />}
            手动重试
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="px-10 py-4 bg-white text-gray-500 border border-gray-200 rounded-2xl font-bold hover:bg-gray-50 transition-all"
          >
            返回修改偏好
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-32 w-full min-h-[400px]">
      <div className="relative mb-12 flex items-center justify-center">
        {/* Animated rings */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 w-32 h-32 rounded-full border-[3px] border-dashed border-gray-200"
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 w-40 h-40 rounded-full border-[2px] border-dotted border-gray-300"
        />
        
        {/* Core pulsing circle */}
        <motion.div 
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-24 h-24 bg-[#1D1D1F] rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(0,0,0,0.1)] relative z-10"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={messageIndex}
              initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: 45 }}
              transition={{ duration: 0.3 }}
            >
              {messages[messageIndex].icon}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="h-12 overflow-hidden flex items-center justify-center relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={messageIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="text-lg md:text-xl font-medium text-gray-700 tracking-tight text-center"
          >
            {messages[messageIndex].text}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress bar */}
      <div className="w-64 h-1.5 bg-gray-100 rounded-full mt-10 overflow-hidden">
        <motion.div 
          className="h-full bg-[#1D1D1F] rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: `${Math.min(100, ((messageIndex + 1) / messages.length) * 100)}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      
      {!tripId && (
        <p className="mt-4 text-[10px] font-bold text-gray-300 uppercase tracking-widest">
          正在初始化生成任务...
        </p>
      )}
    </div>
  );
}
