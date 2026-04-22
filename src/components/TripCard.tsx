import React, { useState } from 'react';
import { Calendar, RefreshCw, Sparkles, Save, Check, Loader2 } from 'lucide-react';
import { Trip } from '@/src/types';
import { cn } from '@/src/lib/utils';
import { Button } from './ui/Button';
import { RegenerateModal } from './RegenerateModal';

export interface TripCardProps {
  trip: Trip;
  onView?: (id: string) => void;
}

export function TripCard({ trip, onView }: TripCardProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(trip.status === 'saved' || trip.status === 'exported');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsSaved(true);
    }, 1200);
  };

  const handleRegenerateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleRegenerateConfirm = (prompt: string) => {
    setIsModalOpen(false);
    setIsRegenerating(true);
    console.log("Regenerating with prompt:", prompt);
    setTimeout(() => {
      setIsRegenerating(false);
    }, 2000);
  };

  const statusConfig = {
    exported: { label: '已导出', color: 'bg-emerald-500' },
    saved: { label: '已保存', color: 'bg-orange-500' },
    draft: { label: '草稿', color: 'bg-gray-400' },
  };

  return (
    <>
      <div className="bg-white rounded-[32px] border border-gray-200 shadow-bento overflow-hidden flex flex-col group hover:-translate-y-1 transition-all duration-300 h-full relative">
      {isRegenerating && (
        <div className="absolute inset-0 z-20 bg-white/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white p-6 rounded-[32px] shadow-xl border border-gray-100 flex flex-col items-center">
             <RefreshCw className="text-indigo-600 animate-spin mb-2" size={24} />
             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">正在重构...</span>
          </div>
        </div>
      )}

      <div className="relative h-56 overflow-hidden">
        {trip.imageUrl ? (
          <img 
            src={trip.imageUrl} 
            alt={trip.title} 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="absolute inset-0 bg-[#E1E1FF] flex items-center justify-center">
             <Calendar className="text-indigo-400 opacity-40" size={48} />
          </div>
        )}
        <div className="absolute top-6 right-6 bg-white/90 backdrop-blur px-4 py-1.5 rounded-full flex items-center gap-2 shadow-sm border border-gray-100 z-10">
          <span className={cn("w-2 h-2 rounded-full", isSaved ? "bg-emerald-500" : statusConfig[trip.status].color)} />
          <span className="text-[10px] font-bold text-[#1D1D1F] uppercase tracking-widest">{isSaved ? "已保存" : statusConfig[trip.status].label}</span>
        </div>
      </div>

      <div className="p-8 flex-grow flex flex-col">
        <div className="mb-6">
          <h3 className="text-2xl font-semibold text-[#1D1D1F] mb-2 tracking-tight line-clamp-1">{trip.title}</h3>
          <div className="flex items-center gap-2 text-gray-400 text-sm font-medium">
            <Calendar size={16} />
            <span>{trip.startDate} {trip.endDate ? `- ${trip.endDate}` : ''}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {trip.tags.map(tag => (
             <span 
              key={tag} 
              className={cn(
                "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                tag === 'AI 规划' 
                  ? "bg-[#E1E1FF] text-indigo-700 flex items-center gap-1"
                  : "bg-gray-100 text-gray-500"
              )}
             >
               {tag === 'AI 规划' && <Sparkles size={12} />}
               {tag}
             </span>
          ))}
        </div>

        <div className="mt-auto flex flex-col gap-3">
          <Button 
            onClick={() => onView?.(trip.id)}
            className="w-full bg-black text-white rounded-full font-semibold text-sm h-12 shadow-none hover:bg-gray-800"
          >
            查看详情
          </Button>
          
          <div className="flex gap-3">
            <Button 
              onClick={handleRegenerateClick}
              disabled={isRegenerating}
              variant="outline"
              className="flex-1 rounded-full font-semibold text-sm h-12 border-gray-200 text-[#1D1D1F] hover:bg-[#E1E1FF]/50 hover:text-indigo-700 hover:border-indigo-200 flex items-center justify-center gap-2 transition-all"
            >
              <RefreshCw size={16} className={cn("transition-transform duration-500", isRegenerating && "animate-spin")} />
              {isRegenerating ? "重新生成中..." : "重新生成"}
            </Button>

            <button 
              onClick={handleSave}
              disabled={isSaving || isSaved}
              className={cn(
                "w-12 h-12 shrink-0 flex items-center justify-center rounded-full border transition-all active:scale-90",
                isSaved 
                  ? "bg-emerald-50 border-emerald-100 text-emerald-600" 
                  : "border-gray-200 text-[#1D1D1F] hover:bg-gray-50"
              )}
              title={isSaved ? "已保存" : "保存计划"}
            >
              {isSaving ? <Loader2 size={20} className="animate-spin text-black" /> : isSaved ? <Check size={20} /> : <Save size={20} />}
            </button>
          </div>
        </div>
      </div>
    </div>
    <RegenerateModal 
      isOpen={isModalOpen} 
      onClose={() => setIsModalOpen(false)} 
      onConfirm={handleRegenerateConfirm} 
    />
    </>
  );
}
