import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Users, RefreshCw, Share2, Save, Check, Loader2, FileText, Download, Banknote, Sparkles } from 'lucide-react';
import { ActivityCard } from '../components/ActivityCard';
import { BudgetBreakdown, MapPreview } from '../components/TripDetails';
import { FeedbackForm } from '../components/FeedbackForm';
import { RegenerateModal } from '../components/RegenerateModal';
import { ExportPreviewModal } from '../components/ExportPreviewModal';
import { Trip } from '../types';
import { Button } from '../components/ui/Button';
import { cn } from '@/src/lib/utils';

interface ItineraryPageProps {
  trip: Trip;
}

export function ItineraryPage({ trip }: ItineraryPageProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(trip.status === 'saved');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsSaved(true);
    }, 1500);
  };

  const handleRegenerateClick = () => {
    setIsModalOpen(true);
  };

  const handleRegenerateConfirm = (prompt: string) => {
    setIsModalOpen(false);
    setIsRegenerating(true);
    console.log("Regenerating itinerary with prompt:", prompt);
    setTimeout(() => {
      setIsRegenerating(false);
    }, 2500);
  };

  return (
    <div className="flex flex-col gap-8 max-w-[1280px] mx-auto w-full px-4 md:px-8 pb-20">
      {/* Header Card */}
      <div className="bg-white rounded-[32px] p-6 md:p-12 border border-gray-100 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="font-display text-4xl md:text-5xl font-bold text-[#1D1D1F] tracking-tight">{trip.title}</h1>
              </div>
              <div className="flex flex-wrap items-center gap-6 text-gray-400 font-medium text-sm">
                <span className="flex items-center gap-2">
                  <Calendar size={16} /> {trip.startDate} - {trip.endDate}
                </span>
                <span className="flex items-center gap-2">
                  <Users size={16} /> {trip.travelers} 位旅行者
                </span>
                {isSaved && (
                   <span className="flex items-center gap-1 font-bold text-emerald-500 text-[10px] uppercase tracking-widest">
                     • 已保存
                   </span>
                )}
              </div>
            </div>

            <div className="flex gap-3 relative">
              <Button 
                variant="outline" 
                onClick={handleRegenerateClick}
                disabled={isRegenerating}
                className="gap-2 font-bold tracking-wider uppercase text-[10px] md:text-[10px] rounded-xl border-blue-600 text-blue-600 hover:bg-blue-50 h-10 md:h-8 px-4 md:px-3"
              >
                {isRegenerating ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                重新生成
              </Button>
              
              <div className="relative">
                <Button 
                   variant="primary" 
                   onClick={() => setIsExportModalOpen(true)}
                   className="gap-2 font-bold tracking-wider uppercase text-[10px] md:text-[10px] rounded-xl bg-orange-600 text-white hover:bg-orange-700 border-none shadow-none h-10 md:h-8 px-4 md:px-3"
                >
                  <Share2 size={14} /> 导出
                </Button>
              </div>
            </div>
          </div>
        </div>

      <div className="flex flex-col-reverse lg:flex-row gap-8">
        {/* Left Column: Itinerary */}
        <div className="flex-1 min-w-0">
          {/* Timeline Content */}
          <div className="relative space-y-16">

          {trip.days.map((day, dIdx) => {
            const dailyBudget = day.activities.reduce((acc, act) => acc + (act.estimatedExpense || 0), 0) * trip.travelers;
            return (
            <div key={day.dayNumber} className="relative">
              <h2 className="font-display text-3xl font-bold text-[#1D1D1F] mb-12 flex items-center gap-4">
                第{day.dayNumber === 1 ? '一' : day.dayNumber === 2 ? '二' : day.dayNumber === 3 ? '三' : day.dayNumber === 4 ? '四' : day.dayNumber}天：{day.title.split('：')[1] || day.title}
                {dailyBudget > 0 && (
                  <span className="text-sm font-bold bg-green-50 text-green-600 px-3 py-1 rounded-full border border-green-100 flex items-center gap-1.5 ml-auto">
                    <Banknote size={16} /> 日预算: ¥{dailyBudget}
                  </span>
                )}
              </h2>

              <div className="relative pl-12">
                {/* Vertical Line */}
                <div className="absolute left-4 top-4 bottom-0 w-[2px] bg-gray-100" />

                <div className="space-y-8">
                  {day.activities.map((activity) => (
                    <div key={activity.id} className="relative">
                      {/* Circle Indicator */}
                      <div className="absolute -left-[45px] top-8 w-6 h-6 rounded-full bg-white border-[3px] border-blue-600 shadow-sm z-10" />
                      <ActivityCard activity={activity} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )})}

          <div className="pt-8">
            <FeedbackForm tripId={trip.id} />
          </div>
        </div>
      </div>

      {/* Right Column: Sidebar */}
      <div className="lg:w-[400px] flex flex-col gap-8 shrink-0">
        <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-[#E1E1FF] text-indigo-600 rounded-full flex items-center justify-center mb-4">
             <Sparkles size={24} />
          </div>
          <h3 className="text-xl font-bold text-[#1D1D1F] mb-2">想要微调偏好？</h3>
          <p className="text-sm text-gray-500 mb-6">不满意当前行程？告诉 AI 您的想法，随时为您调整行程节奏和兴趣点。</p>
          <Button 
            onClick={handleRegenerateClick}
            className="w-full rounded-2xl bg-[#1D1D1F] hover:bg-black text-white h-12 shadow-lg shadow-black/10"
          >
            微调并重生成
          </Button>
        </div>

        <div className="h-full">
          <MapPreview />
        </div>
        <BudgetBreakdown trip={trip} />
      </div>
    </div>

      <RegenerateModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onConfirm={handleRegenerateConfirm} 
      />

      <ExportPreviewModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        trip={trip}
      />

      <AnimatePresence>
        {isRegenerating && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white/60 backdrop-blur-md flex flex-col items-center justify-center p-8"
          >
            <div className="bg-white p-12 rounded-[48px] shadow-2xl flex flex-col items-center text-center max-w-sm border border-gray-100">
              <RefreshCw className="text-blue-600 animate-spin mb-6" size={48} />
              <h3 className="text-2xl font-bold text-[#1D1D1F] mb-3">AI 重新规划中</h3>
              <p className="text-gray-400 text-sm">正在根据最新偏好调优行程方案...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
