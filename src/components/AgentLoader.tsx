import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Brain, Map, Compass } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface AgentLoaderProps {
  onComplete: () => void;
}

export function AgentLoader({ onComplete }: AgentLoaderProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  const messages = [
    { text: "正在分析当地天气与季节特征...", icon: <Sparkles className="text-blue-400" size={32} /> },
    { text: "正在根据您的口味筛选高分餐厅...", icon: <Brain className="text-purple-400" size={32} /> },
    { text: "正在优化步行路径与交通时间...", icon: <Map className="text-emerald-400" size={32} /> },
    { text: "即将完成个性化行程定制...", icon: <Compass className="text-amber-400" size={32} /> },
  ];

  useEffect(() => {
    if (messageIndex >= messages.length) {
      const timeout = setTimeout(() => {
        onComplete();
      }, 500); // Small delay before completing
      return () => clearTimeout(timeout);
    }

    const timer = setTimeout(() => {
      setMessageIndex(prev => prev + 1);
    }, 2000); // Show each message for 2 seconds

    return () => clearTimeout(timer);
  }, [messageIndex, messages.length, onComplete]);

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
              {messageIndex < messages.length ? messages[messageIndex].icon : <Sparkles className="text-white" size={32} />}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="h-12 overflow-hidden flex items-center justify-center relative">
        <AnimatePresence mode="wait">
          {messageIndex < messages.length && (
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
          )}
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
    </div>
  );
}
