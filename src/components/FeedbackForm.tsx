import { useState } from 'react';
import { motion } from 'motion/react';
import { Star, MessageSquare, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';
import tripService from '../services/tripService';

interface FeedbackFormProps {
  tripId: string;
  onSubmit?: (feedback: { rating: number; comment: string }) => void;
}

export function FeedbackForm({ tripId, onSubmit }: FeedbackFormProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleSubmit = async () => {
    if (rating === 0) return;
    
    setStatus('submitting');
    try {
      await tripService.submitFeedback(tripId, rating, comment);
      setStatus('success');
      if (onSubmit) {
        onSubmit({ rating, comment });
      }
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      setStatus('idle');
      alert("提交反馈失败，请稍后重试");
    }
  };

  if (status === 'success') {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[32px] p-8 flex flex-col items-center justify-center text-center border border-gray-100 shadow-sm"
      >
        <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={32} />
        </div>
        <h3 className="text-xl font-bold text-[#1D1D1F] mb-2">感谢您的反馈！</h3>
        <p className="text-gray-400 max-w-sm text-sm font-medium">
          您的意见将帮助 Horizon AI 引擎不断学习，为您提供更精准的旅行建议。
        </p>
      </motion.div>
    );
  }

  return (
    <div className="bg-white rounded-[32px] p-8 md:p-10 border border-gray-100 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-0 opacity-50"></div>
      
      <div className="relative z-10">
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-[#1D1D1F] mb-2 flex items-center gap-2 tracking-tight">
            <MessageSquare size={24} className="text-blue-500" />
            评价这份行程
          </h3>
          <p className="text-sm text-gray-400 font-medium">
            Horizon Intelligence 根据您的偏好生成了此行程。您的打分将用于优化模型。
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="focus:outline-none transition-transform hover:scale-110 active:scale-95 p-1.5 md:p-0"
              >
                <Star 
                  size={36} 
                  className={cn(
                    "transition-colors duration-200",
                    (hoverRating || rating) >= star 
                      ? "fill-amber-400 text-amber-400" 
                      : "fill-transparent text-gray-200"
                  )} 
                />
              </button>
            ))}
            <span className="ml-4 text-sm font-bold text-gray-400">
              {rating > 0 ? `${rating} 星` : '点击打分'}
            </span>
          </div>

          <div className="relative">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="分享您的想法（例如：想去更多人文历史景点，或是对餐厅的安排很满意）..."
              className="w-full bg-gray-50 border border-transparent rounded-2xl p-5 min-h-[140px] text-sm text-[#1D1D1F] outline-none focus:ring-2 focus:ring-black/5 focus:bg-white focus:border-gray-200 transition-all resize-none font-medium placeholder-gray-400"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button 
              onClick={handleSubmit} 
              disabled={rating === 0 || status === 'submitting'}
              className="px-8 rounded-full bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed h-12 flex items-center gap-2 font-bold"
            >
              {status === 'submitting' ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  提交中...
                </>
              ) : (
                '提交反馈'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
