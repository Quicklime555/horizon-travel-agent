import { useState } from 'react';
import { Plane, MapPin, Calendar as CalendarIcon, Wallet, Sparkles, Utensils, Landmark, TreePine, Mountain, Palmtree, Palette, Infinity, Brain, Zap, ShoppingBag, Music, Camera, Users, Heart, Check, Loader2, LogIn, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../components/ui/Button';
import { DatePicker } from '../components/ui/DatePicker';
import { Select } from '../components/ui/Select';
import { cn } from '@/src/lib/utils';
import { useMutation } from '@tanstack/react-query';
import tripService, { TripPlanRequest } from '../services/tripService';

import { AgentLoader } from '../components/AgentLoader';

interface PlannerPageProps {
  onGenerate: (id: string) => void;
}

export function PlannerPage({ onGenerate }: PlannerPageProps) {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [departure, setDeparture] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [duration, setDuration] = useState(4);
  const [budgetLevel, setBudgetLevel] = useState<string>('');
  const [travelersCount, setTravelersCount] = useState(1);
  const [allocation, setAllocation] = useState({
    accommodation: 40,
    dining: 35,
    transport: 25
  });
  const [selectedPace, setSelectedPace] = useState<string>('standard');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [generatedTripId, setGeneratedTripId] = useState<string | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  
  const { user, isDemoMode } = useAuth();
  const navigate = useNavigate();

  const planMutation = useMutation({
    mutationFn: (data: TripPlanRequest) => tripService.planTrip(data),
    onSuccess: async (data) => {
      setGeneratedTripId(data.id);
      // The actual polling happens inside AgentLoader or we can do it here.
      // For now, we'll let AgentLoader handle the visual progress, 
      // and then it will call onComplete where we pass the ID.
    },
    onError: (error) => {
      console.error("Plan creation failed:", error);
      setIsGenerating(false);
      alert("创建计划失败，请稍后重试");
    }
  });

  const steps = [
    { id: 1, label: '基本信息' },
    { id: 2, label: '预算及节奏' },
    { id: 3, label: '个人偏好' },
    { id: 4, label: '确认预览' }
  ];

  const interests = [
    { id: 'food', label: '美食达人', icon: <Utensils size={16} /> },
    { id: 'history', label: '人文历史', icon: <Landmark size={16} /> },
    { id: 'nature', label: '自然风光', icon: <TreePine size={16} /> },
    { id: 'adventure', label: '户外冒险', icon: <Mountain size={16} /> },
    { id: 'relax', label: '休闲放松', icon: <Palmtree size={16} /> },
    { id: 'art', label: '艺术文化', icon: <Palette size={16} /> },
    { id: 'shopping', label: '购物血拼', icon: <ShoppingBag size={16} /> },
    { id: 'nightlife', label: '夜生活', icon: <Music size={16} /> },
    { id: 'photo', label: '摄影打卡', icon: <Camera size={16} /> },
    { id: 'culture', label: '地道民俗', icon: <Users size={16} /> },
    { id: 'health', label: '康养疗愈', icon: <Heart size={16} /> },
  ];

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const isStepValid = () => {
    if (step === 1) {
      return departure.trim() !== '' && destination.trim() !== '' && selectedDate !== '' && budgetLevel !== '';
    }
    if (step === 2) {
      return selectedPace !== '';
    }
    if (step === 3) {
      return selectedInterests.length > 0;
    }
    return true;
  };

  const handleStartGeneration = () => {
    if (!user) {
      if (isDemoMode) {
        alert('Demo 账号尚未就绪，请稍后刷新重试。');
        return;
      }
      setShowLoginPrompt(true);
      return;
    }

    setIsGenerating(true);
    
    // Construct the end date based on duration
    const startDateObj = new Date(selectedDate);
    const endDateObj = new Date(startDateObj);
    endDateObj.setDate(startDateObj.getDate() + duration);
    const endDate = endDateObj.toISOString().split('T')[0];

    // Budget numeric value (mocked or simplified)
    const budgetMap: Record<string, number> = { economy: 3000, standard: 8000, luxury: 20000 };

    planMutation.mutate({
      origin: departure,
      destination: destination,
      startDate: selectedDate,
      endDate: endDate,
      budget: (budgetMap[budgetLevel] || 5000) * travelersCount,
      preferences: selectedInterests,
      pace: selectedPace as any,
    });
  };

  const paces = [
    { id: 'relaxed', label: '悠闲', desc: '大量自由时间，每天 1-2 个主要活动。', icon: <Infinity size={24} /> },
    { id: 'standard', label: '均衡', desc: '游览与探索的平衡组合。', icon: <Brain size={24} /> },
    { id: 'intensive', label: '特种兵', desc: '从早到晚行程满满，打卡所有景点。', icon: <Zap size={24} /> },
  ];

  return (
    <div className="max-w-4xl mx-auto w-full py-8">
      {/* Header & Stepper */}
      {!isGenerating && (
        <div className="flex flex-col items-center text-center mb-16">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-on-surface mb-4 tracking-tight">设计您的旅程</h1>
          <p className="text-on-surface-variant max-w-2xl text-lg">
            告诉我们您的偏好，我们的 AI 将根据您独特的旅行风格为您精心定制行程。
          </p>

          {/* Stepper UI */}
          <div className="flex items-center justify-center w-full max-w-lg mt-12 relative">
            {steps.map((s, idx) => (
              <div key={s.id} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-3 relative">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500",
                    step >= s.id ? "bg-primary text-white shadow-lg" : "bg-surface-container-highest text-outline"
                  )}>
                    {s.id}
                  </div>
                  <span className={cn(
                    "absolute -bottom-8 whitespace-nowrap text-xs font-bold tracking-wider transition-all duration-500",
                    step === s.id ? "text-primary" : "text-outline"
                  )}>
                    {s.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className="flex-grow h-[2px] mx-4 bg-surface-container-highest overflow-hidden">
                    <motion.div 
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: step > s.id ? 1 : 0 }}
                      className="h-full bg-primary origin-left transition-transform duration-500"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {isGenerating ? (
          <motion.div
            key="generating"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-[32px] shadow-bento border border-gray-200 mt-10"
          >
            <AgentLoader 
              tripId={generatedTripId || undefined} 
              onComplete={() => generatedTripId && onGenerate(generatedTripId)} 
            />
          </motion.div>
        ) : (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-10"
          >
            {step === 1 && (
            <section className="bg-white rounded-[32px] shadow-bento border border-gray-200 p-10 md:p-16">
              <h2 className="text-2xl font-semibold text-[#1D1D1F] mb-10 tracking-tight">您想去哪里？</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                    出发地 <span className="text-red-400">*</span>
                  </label>
                  <div className="relative group">
                    <Plane className={cn("absolute left-5 top-1/2 -translate-y-1/2 transition-colors", departure ? "text-black" : "text-gray-300 group-focus-within:text-black")} size={20} />
                    <input 
                      value={departure}
                      onChange={(e) => setDeparture(e.target.value)}
                      className="w-full pl-14 pr-6 py-4.5 bg-gray-50 rounded-2xl border border-transparent text-[#1D1D1F] outline-none focus:ring-2 focus:ring-black/5 focus:bg-white focus:border-gray-300 transition-all font-medium" 
                      placeholder="例如：上海 (PVG)" 
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                    目的地 <span className="text-red-400">*</span>
                  </label>
                  <div className="relative group">
                    <MapPin className={cn("absolute left-5 top-1/2 -translate-y-1/2 transition-colors", destination ? "text-black" : "text-gray-300 group-focus-within:text-black")} size={20} />
                    <input 
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full pl-14 pr-6 py-4.5 bg-gray-50 rounded-2xl border border-transparent text-[#1D1D1F] outline-none focus:ring-2 focus:ring-black/5 focus:bg-white focus:border-gray-300 transition-all font-medium" 
                      placeholder="例如：成都" 
                    />
                  </div>
                  {(destination.includes('，') || destination.includes(',') || destination.includes('和')) && (
                    <div className="text-amber-500 text-xs flex items-center gap-1.5 font-medium animate-in fade-in slide-in-from-top-1">
                      <Sparkles size={14} /> AI 建议：每次规划单个城市效果最佳
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                    出发日期 <span className="text-red-400">*</span>
                  </label>
                  <DatePicker 
                    value={selectedDate} 
                    onChange={setSelectedDate} 
                    placeholder="选择出发日期" 
                  />
                </div>

                <div className="flex flex-col gap-3">
                   <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                    游玩天数 <span className="text-red-400">*</span>
                  </label>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-6 bg-gray-50 p-4 rounded-2xl border border-transparent hover:border-gray-200 transition-all">
                      <CalendarIcon className="text-gray-400 ml-2" size={20} />
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => setDuration(Math.max(1, duration - 1))}
                          className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center font-bold hover:bg-gray-100 transition-colors"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-bold text-lg">{duration}</span>
                        <button 
                          onClick={() => setDuration(duration + 1)}
                          className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center font-bold hover:bg-gray-100 transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-sm text-gray-400 font-medium ml-2">天</span>
                    </div>
                    {(duration < 3 || duration > 7) && (
                      <div className="text-amber-500 text-xs flex items-center gap-1.5 font-medium animate-in fade-in slide-in-from-top-1">
                        <Sparkles size={14} /> AI 建议：3-7 天的行程规划质量最高
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                    预算等级 <span className="text-red-400">*</span>
                  </label>
                  <Select 
                    icon={<Wallet size={20} />}
                    value={budgetLevel}
                    onChange={setBudgetLevel}
                    placeholder="选择您的预算"
                    options={[
                      { value: 'economy', label: '经济型', description: '适合精打细算的背包客' },
                      { value: 'standard', label: '舒适型', description: '高性价比的标准旅行体验' },
                      { value: 'luxury', label: '豪华型', description: '享受奢华贴心的优质之旅' },
                    ]}
                  />
                </div>

                <div className="flex flex-col gap-3">
                   <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                    旅行人数 <span className="text-red-400">*</span>
                  </label>
                  <div className="flex items-center gap-6 bg-gray-50 p-4 rounded-2xl border border-transparent hover:border-gray-200 transition-all">
                    <Users className="text-gray-400 ml-2" size={20} />
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setTravelersCount(Math.max(1, travelersCount - 1))}
                        className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center font-bold hover:bg-gray-100 transition-colors"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-bold text-lg">{travelersCount}</span>
                      <button 
                        onClick={() => setTravelersCount(travelersCount + 1)}
                        className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center font-bold hover:bg-gray-100 transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-sm text-gray-400 font-medium ml-2">人</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {step === 2 && (
            <section className="bg-white rounded-[32px] shadow-bento border border-gray-200 p-10 md:p-16">
              <div className="flex flex-col gap-16">
                <div>
                  <h2 className="text-2xl font-semibold text-[#1D1D1F] mb-2 tracking-tight">预算拆分与分配</h2>
                  <p className="text-gray-400 text-sm mb-10">AI 将根据您的分配比例优化每日的活动质量与消费建议。</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     {[
                       { key: 'accommodation', label: '住宿', icon: <Landmark size={20} />, color: 'bg-blue-600' },
                       { key: 'dining', label: '餐饮', icon: <Utensils size={20} />, color: 'bg-orange-500' },
                       { key: 'transport', label: '交通/門票', icon: <Plane size={20} />, color: 'bg-gray-400' },
                     ].map((item) => (
                       <div key={item.key} className="bg-gray-50 rounded-[24px] p-6 border border-transparent hover:border-gray-200 transition-all">
                         <div className="flex items-center gap-3 mb-6">
                           <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-gray-400">
                             {item.icon}
                           </div>
                           <span className="font-bold text-sm text-[#1D1D1F]">{item.label}</span>
                         </div>
                         <div className="flex items-end justify-between mb-4">
                           <span className="text-3xl font-black tracking-tighter text-[#1D1D1F]">
                             {allocation[item.key as keyof typeof allocation]}%
                           </span>
                           {travelersCount > 1 && (
                             <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded uppercase">
                               约 ¥{(allocation[item.key as keyof typeof allocation] * 20 / travelersCount).toFixed(0)}/人
                             </span>
                           )}
                         </div>
                         <input 
                           type="range" 
                           min="10" 
                           max="60" 
                           value={allocation[item.key as keyof typeof allocation]}
                           onChange={(e) => setAllocation(prev => ({ ...prev, [item.key]: parseInt(e.target.value) }))}
                           className="w-full accent-black cursor-pointer"
                         />
                       </div>
                     ))}
                  </div>
                  
                  <div className="mt-8 flex items-center justify-center p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                      分配总和：{allocation.accommodation + allocation.dining + allocation.transport}% 
                      {allocation.accommodation + allocation.dining + allocation.transport !== 100 && 
                        <span className="text-orange-400 ml-2">(AI 将自动进行归一化校準)</span>
                      }
                    </p>
                  </div>
                </div>

                <div className="h-[1px] bg-gray-100" />

                <div>
                   <h2 className="text-2xl font-semibold text-[#1D1D1F] mb-8 tracking-tight">行程节奏</h2>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     {paces.map((p) => (
                       <button
                         key={p.id}
                         onClick={() => setSelectedPace(p.id)}
                         className={cn(
                           "relative flex flex-col p-8 rounded-[32px] border transition-all text-left group",
                           p.id === selectedPace 
                            ? "bg-[#E1E1FF]/20 border-indigo-200 shadow-bento" 
                            : "bg-white border-gray-100 hover:border-gray-300 shadow-none"
                         )}
                       >
                         <div className="flex items-center justify-between mb-6">
                           <div className={cn(
                             "transition-colors",
                             p.id === selectedPace ? "text-indigo-600" : "text-gray-300 group-hover:text-black"
                           )}>
                             {p.icon}
                           </div>
                           <div className={cn(
                             "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                             p.id === selectedPace ? "border-indigo-600" : "border-gray-200 group-hover:border-gray-400"
                           )}>
                             {p.id === selectedPace && <div className="w-2 h-2 bg-indigo-600 rounded-full" />}
                           </div>
                         </div>
                         <h3 className="font-bold text-[#1D1D1F] mb-2">{p.label}</h3>
                         <p className="text-xs text-gray-400 leading-relaxed">{p.desc}</p>
                       </button>
                     ))}
                   </div>
                </div>
              </div>
            </section>
          )}

          {step === 3 && (
            <section className="bg-white rounded-[32px] shadow-bento border border-gray-200 p-10 md:p-16">
              <div className="flex flex-col gap-12">
                <div>
                  <h2 className="text-2xl font-semibold text-[#1D1D1F] mb-2 tracking-tight flex items-center gap-2">
                    感兴趣的因素
                    <span className="text-red-400 text-sm">*</span>
                  </h2>
                  <p className="text-gray-400 text-sm mb-8">选择您感兴趣的内容（支持多选），我们将据此定制行程。</p>
                  <div className="flex flex-wrap gap-4">
                    {interests.map((int) => {
                      const isSelected = selectedInterests.includes(int.id);
                      return (
                        <button 
                          key={int.id}
                          onClick={() => toggleInterest(int.id)}
                          className={cn(
                            "group flex items-center gap-3 px-6 py-3 rounded-full border transition-all text-sm font-semibold active:scale-95",
                            isSelected 
                              ? "bg-black border-black text-white shadow-lg" 
                              : "bg-gray-50 border-gray-100 text-gray-500 hover:border-black hover:bg-white hover:text-black"
                          )}
                        >
                           <span className={cn(
                             "transition-colors",
                             isSelected ? "text-white" : "text-gray-300 group-hover:text-black"
                           )}>
                             {int.icon}
                           </span>
                           {int.label}
                           {isSelected && <Check size={14} className="ml-1" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>
          )}

          {step === 4 && (
            <div className="flex flex-col items-center py-20 bg-white rounded-[32px] border border-gray-200 shadow-bento">
               <div className="bg-[#E1E1FF] p-8 rounded-[32px] mb-8 shadow-inner">
                 <Sparkles className="text-indigo-600" size={56} />
               </div>
               <h2 className="text-3xl font-semibold text-[#1D1D1F] mb-4 tracking-tight">准备就绪！</h2>
               <div className="flex flex-wrap justify-center gap-2 mb-8">
                  <div className="px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">天数</span>
                    <span className="text-sm font-bold text-black">{duration}天</span>
                  </div>
                  <div className="px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">预算</span>
                    <span className="text-sm font-bold text-black">{budgetLevel === 'economy' ? '经济' : budgetLevel === 'luxury' ? '豪华' : '舒适'}</span>
                  </div>
                  <div className="px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">人数</span>
                    <span className="text-sm font-bold text-black">{travelersCount}人</span>
                  </div>
                  <div className="px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">节奏</span>
                    <span className="text-sm font-bold text-black">{paces.find(p => p.id === selectedPace)?.label}</span>
                  </div>
               </div>
               <p className="text-gray-400 max-w-md text-center text-lg mb-12">
                 我们的 AI 已准备好根据您的预算分配和偏好创建个性化行程。
               </p>
            </div>
          )}

          <div className="flex justify-between items-center mt-8">
            <Button 
              variant="outline" 
              onClick={() => step > 1 ? setStep(step - 1) : null}
              className={cn("rounded-full px-8", step === 1 ? 'invisible' : '')}
            >
              上一步
            </Button>
            
            <div className="flex flex-col items-end gap-2">
               {step < 4 ? (
                 <Button 
                   onClick={() => isStepValid() ? setStep(step + 1) : null}
                   className={cn(
                     "rounded-full px-10 transition-all duration-300",
                     !isStepValid() ? "opacity-30 cursor-not-allowed bg-gray-200 text-gray-400" : "bg-black text-white hover:bg-gray-800"
                   )}
                   disabled={!isStepValid()}
                 >
                    下一步
                 </Button>
              ) : (
                 <Button 
                   onClick={handleStartGeneration} 
                   variant="secondary" 
                   size="lg" 
                   className={cn(
                     "rounded-full shadow-lg gap-2 transition-all duration-300",
                     !isStepValid() || planMutation.isPending ? "opacity-30 cursor-not-allowed" : ""
                   )}
                   disabled={!isStepValid() || planMutation.isPending}
                 >
                    {planMutation.isPending ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                    生成我的行程
                 </Button>
              )}
              {!isStepValid() && step < 3 && (
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest animate-pulse">
                  请填写所有必填信息
                </span>
              )}
            </div>
          </div>
        </motion.div>
        )}
      </AnimatePresence>

      {/* Login Prompt Modal */}
      <AnimatePresence>
        {showLoginPrompt && !isDemoMode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLoginPrompt(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[32px] p-10 shadow-2xl overflow-hidden"
            >
              <button 
                onClick={() => setShowLoginPrompt(false)}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-black transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
                  <LogIn size={32} />
                </div>
                <h3 className="text-2xl font-bold text-on-surface mb-3">登录后开启智能规划</h3>
                <p className="text-gray-500 mb-10 text-sm leading-relaxed">
                  为了保存您的行程并提供更精准的 AI 建议，请登录或注册您的账号。只需几秒钟即可完成。
                </p>
                
                <div className="flex flex-col w-full gap-3">
                  <Button 
                    variant="primary" 
                    size="lg" 
                    className="w-full rounded-2xl font-bold"
                    onClick={() => navigate('/login', { state: { from: { pathname: '/planner' } } })}
                  >
                    立即登录 / 注册
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="lg" 
                    className="w-full rounded-2xl font-semibold text-gray-400"
                    onClick={() => setShowLoginPrompt(false)}
                  >
                    稍后再说
                  </Button>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-[-10%] left-[-10%] w-[30%] h-[30%] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
