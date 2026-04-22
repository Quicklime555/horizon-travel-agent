import { Hotel, Utensils, Car } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Trip } from '@/src/types';

interface BudgetBreakdownProps {
  trip: Trip;
}

export function BudgetBreakdown({ trip }: BudgetBreakdownProps) {
  const { budget } = trip;
  
  let dynamicDining = 0;
  let dynamicAttraction = 0;
  let dynamicTransport = 0;

  trip.days?.forEach(day => {
    day.activities?.forEach(act => {
      if (act.estimatedExpense) {
        const cost = act.estimatedExpense * trip.travelers;
        if (act.type === 'dining') dynamicDining += cost;
        else if (act.type === 'transit') dynamicTransport += cost;
        else dynamicAttraction += cost;
      }
    });
  });

  const finalAccommodation = budget.accommodation || 0;
  const finalDining = dynamicDining > 0 ? dynamicDining : budget.dining;
  const finalTransport = dynamicTransport > 0 ? dynamicTransport : budget.transport;
  const finalAttraction = dynamicAttraction > 0 ? dynamicAttraction : (budget.total - budget.accommodation - budget.dining - budget.transport);

  const finalTotal = finalAccommodation + finalDining + finalTransport + finalAttraction;

  // Calculate daily average
  const daysCount = trip.days?.length || 1;
  const dailyAverage = Math.round(finalTotal / daysCount);

  const categories = [
    { name: '住宿', value: finalAccommodation, icon: <Hotel size={16} />, color: '#2563eb' },
    { name: '餐饮', value: finalDining, icon: <Utensils size={16} />, color: '#f97316' },
    { name: '交通', value: finalTransport, icon: <Car size={16} />, color: '#9ca3af' },
  ];
  
  if (finalAttraction > 0) {
    categories.push({ name: '活动', value: finalAttraction, icon: <span className="font-bold">🎟️</span>, color: '#8b5cf6' }); // purple-500
  }

  return (
    <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm shrink-0">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-[#1D1D1F] text-lg tracking-tight">预算明细</h3>
        <span className="font-bold text-blue-600 text-xs bg-blue-50 px-2.5 py-1.5 rounded-lg">总计 ¥{finalTotal}</span>
      </div>

      {/* Donut Chart */}
      <div className="h-56 w-full mb-8 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categories}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={90}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
              cornerRadius={6}
            >
              {categories.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => `¥${value}`}
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)', padding: '12px 16px' }}
              itemStyle={{ color: '#1D1D1F', fontWeight: 'bold', fontSize: '14px' }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">日均开销</span>
          <span className="text-2xl font-black text-[#1D1D1F]">¥{dailyAverage}</span>
        </div>
      </div>

      <div className="space-y-4">
        {categories.map((cat) => (
          <div key={cat.name} className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 p-2 -mx-2 rounded-2xl transition-colors">
            <div className="flex items-center gap-4">
              <div 
                className="w-10 h-10 rounded-[14px] flex items-center justify-center text-white transition-transform duration-300 group-hover:scale-110 shadow-sm"
                style={{ backgroundColor: cat.color }}
              >
                {cat.icon}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#1D1D1F]">{cat.name}</span>
                <span className="text-xs text-gray-400 font-medium">占比 {Math.round((cat.value / finalTotal) * 100) || 0}%</span>
              </div>
            </div>
            <span className="text-sm font-bold text-[#1D1D1F]">¥{cat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MapPreview() {
  return (
    <div className="flex-1 rounded-[32px] bg-white overflow-hidden border border-gray-100 shadow-sm relative group cursor-grab active:cursor-grabbing min-h-[500px]">
      <img 
        src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1200&auto=format&fit=crop" 
        alt="Map"
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-black/5" />
      
      {/* Mock Map Markers - Apple Style */}
      <div className="absolute top-1/4 left-1/3 animate-bounce">
        <div className="bg-black p-2.5 rounded-full shadow-lg border-2 border-white">
          <div className="w-2.5 h-2.5 bg-white rounded-full" />
        </div>
      </div>
      <div className="absolute top-1/2 left-1/2 animate-bounce [animation-delay:0.2s]">
        <div className="bg-indigo-500 p-2.5 rounded-full shadow-lg border-2 border-white">
          <div className="w-2.5 h-2.5 bg-white rounded-full" />
        </div>
      </div>

      <div className="absolute bottom-6 right-6 flex flex-col gap-3">
        <button className="bg-white w-12 h-12 rounded-2xl shadow-lg border border-gray-100 text-black hover:bg-gray-50 flex items-center justify-center font-bold active:scale-90 transition-all">
          +
        </button>
        <button className="bg-white w-12 h-12 rounded-2xl shadow-lg border border-gray-100 text-black hover:bg-gray-50 flex items-center justify-center font-bold active:scale-90 transition-all">
          −
        </button>
      </div>
    </div>
  );
}
