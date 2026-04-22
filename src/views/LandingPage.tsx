import { motion } from 'motion/react';
import { ArrowRight, PlayCircle, Compass, Sparkles, Target, Users, Layout as LayoutIcon } from 'lucide-react';
import { Button } from '../components/ui/Button';

interface LandingPageProps {
  onStart: () => void;
}

export function LandingPage({ onStart }: LandingPageProps) {
  const features = [
    {
      title: '动态生成的行程单',
      description: '核心引擎分析时间逻辑、地理聚类和个人偏好，在数秒内为您构建优化计划。',
      tag: '智能引擎',
      image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=800&auto=format&fit=crop',
    },
    {
      title: '预测性预算管理',
      description: '根据目的地历史消费数据，实时精准跟踪机票、住宿和每日开销成本估算。',
      tag: '成本控制',
      image: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?q=80&w=800&auto=format&fit=crop',
    },
    {
      title: '实时同步协作',
      description: '邀请旅伴共同查看并编辑行程，让团队意见达成变得更加高效与系统化。',
      tag: '团队协作',
      image: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=800&auto=format&fit=crop',
    },
    {
      title: '深层情境叠加',
      description: '精准匹配天气、交通状况和预订余位，为您揭开目的地隐藏的物流细节。',
      tag: '深度洞察',
      image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800&auto=format&fit=crop',
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden bg-white px-8">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?q=80&w=2000&auto=format&fit=crop" 
            alt="Hero Background" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-10"
          />
        </div>

        <div className="relative z-10 w-full max-w-[1200px] mx-auto flex flex-col items-center text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-black text-white mb-8"
          >
            <Sparkles size={14} className="text-secondary-container" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Horizon Travel Intelligence</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl leading-[0.95] text-[#1D1D1F] max-w-5xl mb-8 font-semibold tracking-tighter"
          >
            探索 <span className="text-gray-300">未知 </span> <br/> 以前所未有的 <span className="p-2 inline-block -rotate-1 bg-indigo-50 leading-none">精度</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-gray-400 max-w-2xl mb-14 font-medium"
          >
            体验强大算力与人类探索欲望的完美契合。我们的 AI 旅行助手为您策划、优化并构建动态行程。
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 items-center"
          >
            <Button 
              size="lg" 
              className="rounded-full px-12 h-16 text-lg bg-black hover:bg-gray-800 transition-all font-semibold"
              onClick={onStart}
            >
              开启您的旅程
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="rounded-full px-12 h-16 text-lg border-gray-200 hover:bg-gray-50 transition-all font-semibold"
            >
              了解更多
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-surface px-8">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="max-w-2xl">
              <h2 className="font-display text-4xl md:text-5xl text-on-surface mb-6 font-bold leading-tight">
                发现为探索而生的系统
              </h2>
              <p className="text-lg text-on-surface-variant">
                通过先进的预测建模和情境感知技术，打造无缝的出行规划体验。
              </p>
            </div>
            <button className="flex items-center gap-2 text-primary font-bold hover:underline decoration-2 group transition-all">
              查看全部特性
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative aspect-[3/4] rounded-[40px] overflow-hidden shadow-bento hover:shadow-2xl transition-all duration-500 cursor-pointer border border-gray-200"
              >
                <img 
                  src={feature.image} 
                  alt={feature.title} 
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-10 w-full transform transition-transform duration-500">
                  <div className="mb-4">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-full text-[10px] font-bold uppercase tracking-widest">
                      {feature.tag}
                    </span>
                  </div>
                  <h3 className="text-white text-2xl font-bold mb-3 tracking-tight">{feature.title}</h3>
                  <p className="text-white/70 text-sm leading-relaxed opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo UI Preview Section */}
      <section className="py-32 bg-surface-container-low px-8 border-t border-outline-variant">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div>
            <div className="inline-block px-3 py-1 bg-primary/10 text-primary font-bold text-[10px] uppercase tracking-widest rounded-md mb-6">
              输出架构
            </div>
            <h2 className="font-display text-4xl font-bold text-on-surface mb-8 leading-tight">为高效执行而设计</h2>
            <p className="text-lg text-on-surface-variant mb-12">
              界面优先考虑时间的清晰度。天数逻辑分离，交通时间明确计算，AI 建议会被清晰标记供您审核。
            </p>
            
            <div className="space-y-6">
              {[
                { icon: <Target className="text-secondary" />, text: '空间聚类最大程度减少通勤时间。' },
                { icon: <Users className="text-secondary" />, text: '根据您的个人习惯调整行程节奏。' },
                { icon: <LayoutIcon className="text-secondary" />, text: '动态备选方案一键即得。' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="p-2 bg-white rounded-full shadow-sm">{item.icon}</div>
                  <span className="font-medium text-on-surface">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-xl p-8 transform rotate-2 hover:rotate-0 transition-transform duration-500">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-outline-variant">
              <div>
                <h3 className="font-display font-bold text-lg text-on-surface">第 2 天：历史核心区</h3>
                <p className="text-xs text-on-surface-variant mt-1">10 月 12 日，星期四 • 意大利，罗马</p>
              </div>
            </div>

            <div className="relative pl-8 border-l-2 border-outline-variant/50 space-y-8">
              <div className="relative">
                <div className="absolute -left-[41px] top-4 w-4 h-4 rounded-full bg-surface-dim border-4 border-white shadow-sm" />
                <div className="bg-surface-container rounded-xl p-4 border border-outline-variant/30">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-outline uppercase tracking-wider">09:00 AM</span>
                    <span className="text-[8px] bg-slate-200 px-1.5 py-0.5 rounded uppercase font-bold text-slate-500">已预订</span>
                  </div>
                  <h4 className="font-bold text-sm text-on-surface">斗兽场导览游</h4>
                  <p className="text-[11px] text-on-surface-variant mt-1">专业导游带领，参观地下室和竞技场底层。</p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-[41px] top-4 w-4 h-4 rounded-full bg-primary border-4 border-white shadow-sm" />
                <div className="bg-white rounded-xl p-4 border border-outline-variant/30 shadow-sm border-t-4 border-t-primary">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">11:45 AM</span>
                    <Sparkles size={14} className="text-secondary" />
                  </div>
                  <h4 className="font-bold text-sm text-on-surface">午餐：Taverna dei Fori</h4>
                  <p className="text-[11px] text-on-surface-variant mt-1">根据您的偏好，AI 建议在这家远离喧嚣、高评分的当地小店用餐。</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-16 bg-on-surface text-white border-t border-white/5">
        <div className="max-w-[1280px] mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex flex-col items-center md:items-start gap-4">
            <span className="font-display font-black text-2xl tracking-tighter text-white">Horizon Travel</span>
            <p className="text-sm text-surface-dim max-w-xs text-center md:text-left">
              重新定义 AI 时代的旅行发现与规划。
            </p>
          </div>
          <div className="flex gap-12">
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2">公司</span>
              <a href="#" className="text-sm hover:text-primary-container transition-colors">关于我们</a>
              <a href="#" className="text-sm hover:text-primary-container transition-colors">核心技术</a>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2">支持</span>
              <a href="#" className="text-sm hover:text-primary-container transition-colors">隐私政策</a>
              <a href="#" className="text-sm hover:text-primary-container transition-colors">服务条款</a>
            </div>
          </div>
          <div className="text-xs text-white/20">
            © 2024 Horizon Travel AI. 版权所有。
          </div>
        </div>
      </footer>
    </div>
  );
}
