import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Send, MessageSquare } from 'lucide-react';
import { Button } from './ui/Button';
import { cn } from '@/src/lib/utils';

export interface RegenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (prompt: string) => void;
  title?: string;
}

export function RegenerateModal({ isOpen, onClose, onConfirm, title = "微调您的行程" }: RegenerateModalProps) {
  const [prompt, setPrompt] = useState('');

  const quickOptions = [
    "节奏放慢一点",
    "换一些高性价比餐厅",
    "增加亲子互动项目",
    "加入更多自然风光",
    "不要安排太早起床",
    "想去一些小众景点"
  ];

  const handleQuickOption = (option: string) => {
    setPrompt(prev => {
      const newPrompt = prev.trim();
      return newPrompt ? `${newPrompt}，${option}` : option;
    });
  };

  const handleSubmit = () => {
    onConfirm(prompt);
    setTimeout(() => {
      setPrompt(''); // Clear after sending
    }, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#E1E1FF] text-indigo-600 flex items-center justify-center">
                  <Sparkles size={20} />
                </div>
                <h3 className="text-xl font-bold text-[#1D1D1F]">{title}</h3>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 md:w-8 md:h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-8 flex flex-col gap-6">
              {/* Quick Options */}
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <MessageSquare size={14} /> 快捷指令
                </p>
                <div className="flex flex-wrap gap-2">
                  {quickOptions.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuickOption(opt)}
                      className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 rounded-full hover:bg-[#E1E1FF]/30 hover:text-indigo-700 hover:border-indigo-200 transition-colors active:scale-95"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Textarea */}
              <div className="relative flex-1">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="例如：把第二天上午的行程改成去大英博物馆，并且晚上帮我预订一家高分法餐..."
                  className="w-full h-32 p-4 bg-gray-50 rounded-2xl border border-transparent text-sm text-[#1D1D1F] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white focus:border-gray-300 transition-all resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-5 bg-gray-50/80 border-t border-gray-100 flex justify-end gap-3">
              <Button 
                onClick={onClose} 
                variant="outline" 
                className="rounded-xl px-6 h-11 border-gray-200 text-gray-600 hover:bg-gray-100"
              >
                取消
              </Button>
              <Button 
                onClick={handleSubmit} 
                className="rounded-xl px-6 h-11 bg-black text-white hover:bg-gray-800 shadow-lg shadow-black/10 gap-2"
                disabled={!prompt.trim()}
              >
                <Send size={16} />
                让 AI 重新规划
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
