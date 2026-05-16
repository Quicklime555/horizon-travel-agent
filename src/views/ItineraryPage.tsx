import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Users, RefreshCw, Share2, Save, Check, Loader2, FileText, Download, Banknote, Sparkles, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import html2canvas from 'html2canvas';
import { ActivityCard } from '../components/ActivityCard';
import { BudgetBreakdown, MapPreview } from '../components/TripDetails';
import { FeedbackForm } from '../components/FeedbackForm';
import { RegenerateModal } from '../components/RegenerateModal';
import { ExportPreviewModal } from '../components/ExportPreviewModal';
import { SharePoster } from '../components/SharePoster';
import { AgentLoader } from '../components/AgentLoader';
import { Trip } from '../types';
import { Button } from '../components/ui/Button';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import tripService from '../services/tripService';

export function ItineraryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExportingImage, setIsExportingImage] = useState(false);
  
  const posterRef = useRef<HTMLDivElement>(null);

  const { 
    data: trip, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['trip', id],
    queryFn: () => tripService.getTripDetails(id!),
    enabled: !!id,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return (status === 'completed' || status === 'saved' || status === 'exported' || status === 'failed') ? false : 3000;
    },
    retry: 1,
  });

  const regenerateMutation = useMutation({
    mutationFn: () => tripService.regenerateTrip(id!),
    onSuccess: (data) => {
      if (data.id !== id) {
        navigate(`/trips/${data.id}`);
      }
      setIsRegenerating(true);
      // Let the useQuery refetchInterval handle the polling after mutation
    },
    onError: (err) => {
      console.error("Regeneration failed:", err);
      setIsRegenerating(false);
      alert("重新生成失败，请稍后重试");
    }
  });

  // Effect to handle the end of regeneration
  useEffect(() => {
    if (isRegenerating && trip?.status === 'completed') {
      setIsRegenerating(false);
    }
  }, [trip?.status, isRegenerating]);

  const handleRegenerateClick = () => {
    setIsModalOpen(true);
  };

  const handleRegenerateConfirm = (prompt: string) => {
    setIsModalOpen(false);
    console.log("Regenerating itinerary with prompt:", prompt);
    regenerateMutation.mutate();
  };

  const handleExportImage = async () => {
    if (!posterRef.current || !trip) return;
    
    setIsExportingImage(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const canvas = await html2canvas(posterRef.current, {
        useCORS: true,
        scale: 2,
        backgroundColor: '#ffffff',
      });
      
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `Horizon-Travel-${trip.title?.replace(/\s+/g, '-') || 'Trip'}.png`;
      link.click();
    } catch (error) {
      console.error("Failed to export image:", error);
    } finally {
      setIsExportingImage(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 w-full animate-pulse">
        <Loader2 className="w-12 h-12 animate-spin text-gray-300 mb-6" />
        <h2 className="text-2xl font-bold text-gray-300">正在与 AI 同步行程...</h2>
      </div>
    );
  }

  // If the trip is still generating (e.g. accessed via URL directly)
  if (trip && (trip.status === 'generating' || trip.status === 'pending' || trip.status === 'processing')) {
    return (
      <div className="max-w-4xl mx-auto w-full py-8">
        <div className="bg-white rounded-[32px] shadow-bento border border-gray-200 mt-10">
          <AgentLoader 
            tripId={id} 
            onComplete={() => queryClient.invalidateQueries({ queryKey: ['trip', id] })} 
          />
        </div>
      </div>
    );
  }

  if (isError || !trip) {
    return (
      <div className="flex flex-col items-center justify-center py-40 w-full max-w-lg mx-auto text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-8 shadow-sm">
          <AlertTriangle size={40} />
        </div>
        <h2 className="text-3xl font-bold text-[#1D1D1F] mb-4 tracking-tight">无法加载行程</h2>
        <p className="text-gray-500 mb-10 leading-relaxed">
          {error instanceof Error ? error.message : '我们无法从服务器获取此行程的详细信息。请检查您的网络连接。'}
        </p>
        <div className="flex gap-4">
          <Button onClick={() => refetch()} variant="primary" className="rounded-full px-8 shadow-lg shadow-black/10 flex gap-2">
            <RefreshCw size={18} /> 重试
          </Button>
          <Button onClick={() => navigate('/planner')} variant="outline" className="rounded-full px-8">
            返回规划页
          </Button>
        </div>
      </div>
    );
  }

  const isSaved = trip.status === 'saved' || trip.status === 'exported' || trip.status === 'completed';

  return (
    <div className="flex flex-col gap-8 max-w-[1280px] mx-auto w-full px-4 md:px-8 pb-20">
      {/* Hidden Poster for capture */}
      <div className="fixed left-[-9999px] top-0 pointer-events-none" ref={posterRef}>
        <SharePoster trip={trip} />
      </div>

      {/* Header Card */}
      <div className="bg-white rounded-[32px] p-6 md:p-12 border border-gray-100 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="font-display text-4xl md:text-5xl font-bold text-[#1D1D1F] tracking-tight">{trip.title || `${trip.destination}之旅`}</h1>
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
                     • 已完成
                   </span>
                )}
              </div>
            </div>

            <div className="flex gap-3 relative">
              <Button 
                variant="outline" 
                onClick={handleRegenerateClick}
                disabled={isRegenerating || regenerateMutation.isPending}
                className="gap-2 font-bold tracking-wider uppercase text-[10px] md:text-[10px] rounded-xl border-blue-600 text-blue-600 hover:bg-blue-50 h-10 md:h-8 px-4 md:px-3"
              >
                {isRegenerating || regenerateMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                重新生成
              </Button>
              
              <div className="flex gap-2">
                <Button 
                   variant="outline" 
                   onClick={handleExportImage}
                   disabled={isExportingImage}
                   className="gap-2 font-bold tracking-wider uppercase text-[10px] md:text-[10px] rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50 h-10 md:h-8 px-4 md:px-3"
                >
                  {isExportingImage ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={14} />}
                  分享图
                </Button>
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
          <div className="relative space-y-16">

          {trip.days?.map((day) => {
            const dailyBudget = day.activities?.reduce((acc, act) => acc + (act.estimatedExpense || 0), 0) * trip.travelers;
            return (
            <div key={day.dayNumber} className="relative">
              <h2 className="font-display text-3xl font-bold text-[#1D1D1F] mb-12 flex items-center gap-4">
                第{day.dayNumber}天：{day.title?.split('：')[1] || day.title}
                {dailyBudget > 0 && (
                  <span className="text-sm font-bold bg-green-50 text-green-600 px-3 py-1 rounded-full border border-green-100 flex items-center gap-1.5 ml-auto">
                    <Banknote size={16} /> 日预算: ¥{dailyBudget}
                  </span>
                )}
              </h2>

              <div className="relative pl-12">
                <div className="absolute left-4 top-4 bottom-0 w-[2px] bg-gray-100" />

                <div className="space-y-8">
                  {day.activities?.map((activity) => (
                    <div key={activity.id} className="relative">
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
