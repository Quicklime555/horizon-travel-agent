import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Download, Copy, Loader2, X, Check, Share2 } from 'lucide-react';
import { Trip } from '../types';
import { Button } from './ui/Button';
import { cn } from '@/src/lib/utils';

interface ExportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
}

export function ExportPreviewModal({ isOpen, onClose, trip }: ExportPreviewModalProps) {
  const [isGenerating, setIsGenerating] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Reset states when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsGenerating(true);
      setIsCopied(false);
      setIsDownloading(false);
      
      // Simulate generating preview
      const timer = setTimeout(() => {
        setIsGenerating(false);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const generateOutline = () => {
    let outline = `# ${trip.title}\n`;
    outline += `日期：${trip.startDate} 至 ${trip.endDate}\n`;
    outline += `人数：${trip.travelers} 位\n\n`;

    trip.days.forEach(day => {
      outline += `### 第${day.dayNumber}天：${day.title}\n`;
      day.activities.forEach(activity => {
        outline += `- [${activity.time}] ${activity.title}\n`;
      });
      outline += '\n';
    });

    return outline;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateOutline());
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const handleDownloadPDF = () => {
    setIsDownloading(true);
    // Simulate PDF generation and download
    setTimeout(() => {
      setIsDownloading(false);
      onClose();
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl bg-white rounded-[32px] shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 md:p-8 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
                  <Share2 size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#1D1D1F]">导出行程</h2>
                  <p className="text-sm text-gray-500">预览、复制或下载 PDF 格式的行程</p>
                </div>
              </div>
                <button 
                  onClick={onClose}
                  className="w-10 h-10 md:w-8 md:h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
            </div>

            {/* Content Area */}
            <div className="p-6 md:p-8 flex-1 overflow-y-auto bg-gray-50/50">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-4" />
                  <h3 className="text-lg font-bold text-[#1D1D1F] mb-2">生成预览中...</h3>
                  <p className="text-sm text-gray-500">正在整理您的行程大纲</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                    {generateOutline()}
                  </pre>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-6 md:p-8 border-t border-gray-100 bg-white flex flex-col sm:flex-row gap-4 justify-end items-center">
              <Button
                variant="outline"
                onClick={handleCopy}
                disabled={isGenerating || isCopied}
                className="w-full sm:w-auto gap-2 font-bold h-12 px-8 rounded-xl"
              >
                {isCopied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                {isCopied ? '已复制文本' : '复制纯文本'}
              </Button>
              <Button
                variant="primary"
                onClick={handleDownloadPDF}
                disabled={isGenerating || isDownloading}
                className="w-full sm:w-auto gap-2 font-bold h-12 px-8 rounded-xl bg-orange-600 hover:bg-orange-700 text-white border-none shadow-lg shadow-orange-600/20"
              >
                {isDownloading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Download size={18} />
                )}
                {isDownloading ? '生成 PDF 中...' : '下载精美 PDF'}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
