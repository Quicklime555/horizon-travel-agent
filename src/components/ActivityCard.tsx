import { MoreHorizontal, Sparkles, Utensils, MapPin, Clock, Banknote } from 'lucide-react';
import { Activity } from '@/src/types';
import { cn } from '@/src/lib/utils';

interface ActivityCardProps {
  activity: Activity;
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const isSpecial = activity.isAiSuggested;

  return (
    <div className={cn(
      "relative bg-white rounded-[24px] p-6 shadow-sm border transition-all duration-300",
      isSpecial 
        ? "border-blue-400 bg-white shadow-md ring-1 ring-blue-100" 
        : "border-gray-100 hover:border-gray-200"
    )}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-3 items-center flex-wrap">
          <span className="font-bold text-[10px] text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md tracking-wider uppercase">
            {activity.time}
          </span>
          <h3 className="font-bold text-[#1D1D1F] text-lg tracking-tight">
            {activity.title}
            {isSpecial && <Sparkles className="inline-block ml-2 text-orange-500" size={16} />}
          </h3>
        </div>
        <button className="text-gray-300 hover:text-gray-500 transition-colors p-2 -mr-2 -mt-2 rounded-full">
          <MoreHorizontal size={18} />
        </button>
      </div>

      <p className="text-[13px] text-gray-500 mb-4 leading-relaxed line-clamp-3">
        {activity.description}
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className="inline-flex items-center gap-1.5 font-bold text-[9px] uppercase text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
          {activity.type === 'dining' ? <Utensils size={10} /> : <MapPin size={10} />}
          {activity.type === 'dining' ? '餐饮' : '景点'}
        </span>
        {activity.duration && (
          <span className="inline-flex items-center gap-1.5 font-bold text-[9px] uppercase text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
            <Clock size={10} /> {activity.duration}
          </span>
        )}
        {(activity.priceLevel || activity.estimatedExpense !== undefined) && (
           <span className="inline-flex items-center gap-1.5 font-bold text-[9px] uppercase text-orange-600 bg-orange-50 px-2 py-1 rounded-md border border-orange-100">
            <Banknote size={10} /> 
            {activity.priceLevel && <span>{activity.priceLevel}</span>}
            {activity.priceLevel && activity.estimatedExpense !== undefined && <span className="mx-0.5">-</span>}
            {activity.estimatedExpense !== undefined && <span>¥{activity.estimatedExpense} / 人</span>}
          </span>
        )}
      </div>

      {activity.imageUrl && (
        <div 
          className="w-full h-40 rounded-xl bg-gray-100 overflow-hidden"
        >
          <img 
            src={activity.imageUrl} 
            alt={activity.title} 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </div>
  );
}
