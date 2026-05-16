import { useState } from 'react';
import { ChevronDown, Sparkles, Filter, ListFilter, Loader2 } from 'lucide-react';
import { TripCard } from '../components/TripCard';
import { Select } from '../components/ui/Select';
import { useQuery } from '@tanstack/react-query';
import tripService from '../services/tripService';

interface HistoryPageProps {
  onViewTrip: (id: string) => void;
}

export function HistoryPage({ onViewTrip }: HistoryPageProps) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const { data: trips, isLoading, isError, error } = useQuery({
    queryKey: ['trips-history'],
    queryFn: tripService.getHistory,
  });

  // Filtering and Sorting Logic
  const filteredTrips = (trips || [])
    .filter(trip => {
      if (statusFilter === 'all') return true;
      return trip.status === statusFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        const dateA = a.startDate.includes('待定') ? '0' : a.startDate;
        const dateB = b.startDate.includes('待定') ? '0' : b.startDate;
        return dateB.localeCompare(dateA);
      }
      if (sortBy === 'oldest') {
        const dateA = a.startDate.includes('待定') ? '9999' : a.startDate;
        const dateB = b.startDate.includes('待定') ? '9999' : b.startDate;
        return dateA.localeCompare(dateB);
      }
      if (sortBy === 'name') {
        return a.title.localeCompare(b.title, 'zh-CN');
      }
      return 0;
    });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-gray-500">正在获取您的行程历史...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-red-50 rounded-3xl border border-red-100">
        <p className="text-red-600 font-medium mb-4">加载行程历史失败</p>
        <p className="text-red-400 text-sm mb-6">{(error as any)?.message || '请稍后重试'}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-white text-red-600 rounded-full text-sm font-bold shadow-sm border border-red-100 hover:bg-red-50 transition-colors"
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <h1 className="font-display text-4xl font-bold text-[#1D1D1F] mb-3 tracking-tight">行程历史</h1>
          <p className="text-gray-400 text-lg">查看、完善并重温您过去的行程计划。</p>
        </div>

        <div className="flex flex-wrap gap-4 min-w-[400px]">
          <div className="flex-1">
            <Select 
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="所有状态"
              options={[
                { value: 'all', label: '所有状态' },
                { value: 'saved', label: '已保存' },
                { value: 'exported', label: '已导出' },
                { value: 'draft', label: '草稿箱' },
                { value: 'archived', label: '已归档' },
              ]}
            />
          </div>

          <div className="flex-1">
            <Select 
              value={sortBy}
              onChange={setSortBy}
              placeholder="排序：最新"
              options={[
                { value: 'newest', label: '排序：最新' },
                { value: 'oldest', label: '排序：最早' },
                { value: 'name', label: '排序：目的地' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredTrips.length > 0 ? (
          filteredTrips.map((trip) => (
            <div key={trip.id}>
              <TripCard trip={trip} onView={onViewTrip} />
            </div>
          ))
        ) : (
          <div className="col-span-full py-32 flex flex-col items-center justify-center bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
            <div className="text-gray-300 mb-4">
              <Filter size={48} />
            </div>
            <p className="text-gray-400 font-medium">没有找到符合条件的行程</p>
            <button 
              onClick={() => setStatusFilter('all')}
              className="mt-4 text-sm text-black font-semibold hover:underline"
            >
              清除所有筛选
            </button>
          </div>
        )}
      </div>

      {/* Stats nudge - extra polish */}
      <div className="mt-20 p-8 bg-primary-container/[0.03] rounded-3xl border border-primary/10 flex flex-col items-center text-center">
        <Sparkles className="text-secondary mb-4" size={32} />
        <h3 className="font-display font-bold text-xl text-on-surface mb-2">再创一段回忆？</h3>
        <p className="text-on-surface-variant max-w-md mb-8">我们的 AI 已经准备好为您规划下一个完美的目的地。</p>
        <button className="text-primary font-bold hover:underline">立即开启新行程 &rarr;</button>
      </div>
    </div>
  );
}
