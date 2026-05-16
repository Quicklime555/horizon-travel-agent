import { Trip } from '../types';
import { Calendar, Users, MapPin, Sparkles } from 'lucide-react';

interface SharePosterProps {
  trip: Trip;
}

export function SharePoster({ trip }: SharePosterProps) {
  return (
    <div 
      id="share-poster"
      className="w-[600px] bg-white text-[#1D1D1F] p-12 flex flex-col gap-10 font-sans"
      style={{ minHeight: '1000px' }}
    >
      {/* Header section with brand and date */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <Sparkles size={24} className="fill-blue-600" />
            <span className="font-display font-bold text-xl tracking-tight">Horizon Travel AI</span>
          </div>
          <p className="text-gray-400 text-sm font-medium">您的专属定制旅行方案</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em]">Generated On</p>
          <p className="text-sm font-bold text-gray-900">{new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Main Title & Hero */}
      <div className="relative rounded-[40px] overflow-hidden aspect-[16/9] shadow-2xl">
        <img 
          src={trip.imageUrl || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200"} 
          alt="Destination"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-8 left-10">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">{trip.title}</h1>
          <div className="flex items-center gap-4 text-white/80 text-sm font-medium">
            <span className="flex items-center gap-1.5"><Calendar size={14} /> {trip.startDate} - {trip.endDate}</span>
            <span className="flex items-center gap-1.5"><Users size={14} /> {trip.travelers} 位旅行者</span>
          </div>
        </div>
      </div>

      {/* Itinerary Summary */}
      <div className="flex flex-col gap-8">
        <h2 className="text-xl font-bold border-b border-gray-100 pb-4">精选行程预览</h2>
        <div className="space-y-10">
          {trip.days.map((day) => (
            <div key={day.dayNumber} className="relative pl-8">
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-100" />
              <div className="absolute left-[-4px] top-2 w-2.5 h-2.5 rounded-full bg-blue-600" />
              
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-3">
                第 {day.dayNumber} 天
                <span className="text-gray-400 font-medium">/</span>
                <span className="text-gray-600">{day.title.split('：')[1] || day.title}</span>
              </h3>
              
              <div className="flex flex-col gap-4">
                {day.activities.slice(0, 3).map((activity, idx) => (
                  <div key={idx} className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-400 shrink-0">
                      {activity.time}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-gray-800">{activity.title}</span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <MapPin size={10} /> {day.location}
                      </span>
                    </div>
                  </div>
                ))}
                {day.activities.length > 3 && (
                  <p className="text-xs text-blue-500 font-bold ml-16">以及更多 {day.activities.length - 3} 个精彩体验...</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer / QR Code Placeholder */}
      <div className="mt-auto pt-10 border-t border-gray-100 flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">扫码查看完整行程</p>
          <p className="text-[10px] text-gray-300">Powered by Horizon AI Travel Engine</p>
        </div>
        <div className="w-20 h-20 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center p-2">
          {/* Mock QR Code */}
          <div className="grid grid-cols-4 grid-rows-4 gap-1 w-full h-full">
            {[...Array(16)].map((_, i) => (
              <div key={i} className={`rounded-[2px] ${Math.random() > 0.4 ? 'bg-black' : 'bg-transparent'}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
