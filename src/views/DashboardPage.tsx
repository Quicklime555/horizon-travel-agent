import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Route, CheckCircle, AlertCircle, Clock, MessageSquare, X, Star, FileText } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export function DashboardPage() {
  const [selectedError, setSelectedError] = useState<any>(null);

  const stats = [
    { label: '今日生成计划', value: '1,245', change: '+12%', icon: <Route />, trend: 'up' },
    { label: 'AI 成功率', value: '98.5%', change: '+0.2%', icon: <CheckCircle />, trend: 'up' },
    { label: '故障率 (超时)', value: '1.5%', change: '-0.1%', icon: <AlertCircle />, trend: 'down', isError: true },
  ];

  const data = [
    { name: '东京', value: 1200 },
    { name: '巴黎', value: 850 },
    { name: '纽约', value: 600 },
    { name: '伦敦', value: 450 },
  ];

  const errors = [
    { id: '#4921', type: 'API 请求超时', time: '10分钟前', prompt: '规划一个去巴黎的5天行程，一家三口，需要包含迪士尼乐园，预算适中...', stack: 'Error: Request timed out after 30000ms\n    at Timeout._onTimeout (node:http:123:45)\n    at listOnTimeout (node:internal/timers:569:17)\n    at processTimers (node:internal/timers:512:7)' },
    { id: '#4920', type: '上下文超限', time: '14分钟前', prompt: '请帮我规划一个环游世界的行程，需要去100个国家...', stack: 'TokenLimitExceededError: Context length exceeded 128k tokens.\n    at validateTokenCount (model.ts:89)\n    at generatePlan (planner.ts:201)' },
    { id: '#4918', type: 'POI 数据无效', time: '1小时前', prompt: '寻找火星上最好的餐厅', stack: 'InvalidDataError: No POI found for location "火星"\n    at fetchPOIs (maps-api.ts:55)' },
    { id: '#4915', type: 'API 请求超时', time: '2小时前', prompt: '规划去东京的行程，重点是吃海鲜...', stack: 'Error: Upstream service unavailable\n    at fetchWithRetry (utils.ts:112)' },
  ];

  const feedbacks = [
    { id: 'F-102', user: '旅行达人', rating: 5, comment: '行程规划得很完美，特别是对小众景点的推荐非常有品味！', date: '刚刚' },
    { id: 'F-101', user: '周末游玩家', rating: 4, comment: '整体很棒，如果能自动附带景点门票的预订链接就更好了。', date: '2小时前' },
    { id: 'F-100', user: '匿名用户', rating: 2, comment: '生成的行程太紧凑了，一天跑四个地方根本来不及。', date: '5小时前' },
  ];

  return (
    <div className="max-w-[1280px] mx-auto w-full px-4 md:px-8 py-8 flex flex-col gap-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="font-display text-4xl font-bold text-on-surface">系统概览</h1>
          <p className="text-on-surface-variant mt-2 font-medium">实时性能指标与活跃告警信息。</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-outline uppercase tracking-widest">最后更新时间</p>
          <p className="text-sm font-bold text-on-surface">刚刚</p>
        </div>
      </header>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat, i) => (
          <div key={i} className={cn(
            "rounded-[32px] p-8 border shadow-bento flex flex-col gap-6",
            stat.isError ? "bg-[#FFE1E1]/20 border-red-100" : "bg-white border-gray-200"
          )}>
            <div className="flex justify-between items-center text-gray-400">
              <span className="text-[10px] font-bold uppercase tracking-widest">{stat.label}</span>
              <div className={cn("p-2 rounded-xl", stat.isError ? "bg-red-50 text-red-500" : "bg-gray-50 text-black")}>
                {stat.icon}
              </div>
            </div>
            <div className="flex items-baseline gap-3">
              <span className={cn("text-5xl font-light tabular-nums tracking-tight", stat.isError ? "text-red-600" : "text-[#1D1D1F]")}>
                {stat.value}
              </span>
              <div className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-bold",
                stat.trend === 'up' ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"
              )}>
                {stat.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-[32px] p-10 shadow-bento flex flex-col gap-10 min-h-[450px] order-2 lg:order-1">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-[#1D1D1F] tracking-tight">热门目的地趋势</h2>
            <div className="flex gap-2">
              <div className="w-3 h-3 bg-black rounded-full"></div>
              <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
            </div>
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 600 }}
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: '#F8FAFC' }}
                  contentStyle={{ borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.05)' }}
                />
                <Bar dataKey="value" radius={[12, 12, 12, 12]} barSize={50}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#1D1D1F' : '#E2E8F0'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Errors table */}
        <div className="bg-[#1D1D1F] rounded-[32px] p-10 shadow-bento flex flex-col gap-8 text-white order-1 lg:order-2">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold tracking-tight">系统动态</h2>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
          </div>
          <div className="flex flex-col gap-4">
            {errors.map((error, i) => (
              <div 
                key={i} 
                className="flex items-center justify-between py-4 border-b border-white/5 last:border-0 group cursor-pointer hover:bg-white/5 px-2 rounded-2xl -mx-2 transition-colors"
                onClick={() => setSelectedError(error)}
              >
                <div className="flex flex-col">
                  <span className="font-bold text-sm text-white/90">{error.id}</span>
                  <span className="text-xs text-white/40 font-medium">{error.type}</span>
                </div>
                <div className="flex items-center gap-2 text-white/20 group-hover:text-white/40 transition-colors">
                   <Clock size={12} />
                   <span className="text-[10px] font-bold uppercase tracking-widest">{error.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feedbacks Section */}
      <div className="bg-white border border-gray-200 rounded-[32px] p-10 shadow-bento flex flex-col gap-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <MessageSquare size={20} />
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-[#1D1D1F]">最新用户反馈</h2>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {feedbacks.map((fb, i) => (
            <div key={i} className="p-6 rounded-3xl border border-gray-100 bg-gray-50/50 flex flex-col gap-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-gray-900">{fb.user}</div>
                  <div className="text-xs text-gray-500 mt-1">{fb.date}</div>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} size={14} className={idx < fb.rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-600 line-clamp-3 flex-1">{fb.comment}</p>
              <div className="pt-4 flex justify-between items-center border-t border-gray-200/60">
                 <span className="text-xs font-bold text-gray-400">{fb.id}</span>
                 <button className="text-xs font-semibold text-primary hover:text-indigo-700 transition-colors">查看行程</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Error Detail Modal */}
      <AnimatePresence>
        {selectedError && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setSelectedError(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-8 pb-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
                    <AlertCircle size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedError.type}</h3>
                    <p className="text-sm text-gray-500 font-medium">任务 ID: {selectedError.id} · {selectedError.time}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedError(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-8 overflow-y-auto flex flex-col gap-8">
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText size={16} className="text-gray-400" />
                    原始 Prompt
                  </h4>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-sm text-gray-700 leading-relaxed shadow-sm">
                    {selectedError.prompt}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <AlertCircle size={16} className="text-red-400" />
                    错误堆栈
                  </h4>
                  <div className="p-4 bg-[#1D1D1F] rounded-2xl text-xs text-red-300 font-mono overflow-x-auto whitespace-pre leading-relaxed shadow-inner">
                    {selectedError.stack}
                  </div>
                </div>
              </div>
              
              <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                <button 
                  onClick={() => setSelectedError(null)}
                  className="px-6 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  关闭
                </button>
                <button className="px-6 py-2.5 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20">
                  重试任务
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
