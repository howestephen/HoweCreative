import { motion } from 'motion/react';
import { TrendingUp, Clock, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';

export function StatusBar() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [skillsLoaded, setSkillsLoaded] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Simulate loading animation
    const interval = setInterval(() => {
      setSkillsLoaded(prev => prev < 100 ? prev + 2 : 100);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  const portfolioMetrics = [
    { label: 'Projects', value: '50+', color: '#ff003c' },
    { label: 'Technologies', value: '25+', color: '#ff6b88' },
    { label: 'Experience', value: '5yr', color: '#8b0020' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5, duration: 0.8 }}
      className="fixed top-20 right-6 z-50 w-80 hidden xl:block space-y-4"
    >
      {/* Live Portfolio Metrics */}
      <div className="bg-black/80 border border-[#ff003c]/30 backdrop-blur-sm p-4 relative">
        <div className="absolute -top-2 left-8 w-12 h-4 bg-zinc-800/60 -rotate-2" />
        
        <div className="flex justify-between items-center mb-3">
          <span className="text-[10px] font-mono font-bold text-[#ff003c] uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-3 h-3" />
            PORTFOLIO_METRICS
          </span>
        </div>

        <div className="space-y-3">
          {portfolioMetrics.map((metric, index) => (
            <motion.div 
              key={metric.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="flex justify-between items-center"
            >
              <span className="text-[10px] font-mono text-zinc-400 uppercase">{metric.label}</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full rounded-full"
                    style={{ backgroundColor: metric.color }}
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ delay: 0.8 + index * 0.1, duration: 0.6 }}
                  />
                </div>
                <span className="text-[11px] font-mono font-bold text-white min-w-[2rem] text-right">
                  {metric.value}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Current Location & Time */}
      <div className="bg-black/80 border border-[#ff003c]/20 backdrop-blur-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-3 h-3 text-[#ff003c]" />
          <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
            SYSTEM_TIME
          </span>
        </div>
        
        <div className="font-mono text-[14px] text-[#ff003c] mb-2">
          {currentTime.toLocaleTimeString('en-US', { hour12: false })}
        </div>
        
        <div className="flex items-center gap-2 text-[9px] font-mono text-zinc-600">
          <MapPin className="w-3 h-3" />
          <span>San Francisco, CA</span>
        </div>
      </div>

      {/* Skill Proficiency Loader */}
      <div className="bg-black/80 border border-[#ff003c]/20 backdrop-blur-sm p-4">
        <div className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider mb-3">
          SKILL_SYNC_STATUS
        </div>
        
        <div className="space-y-2 font-mono text-[10px]">
          <div className="flex justify-between text-zinc-400">
            <span>&gt; Design Systems</span>
            <span className="text-[#ff003c]">{skillsLoaded}%</span>
          </div>
          <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-[#8b0020] via-[#ff003c] to-[#ff6b88] rounded-full"
              style={{ width: `${skillsLoaded}%` }}
            />
          </div>
          
          <div className="flex justify-between text-zinc-600 mt-2 pt-2 border-t border-zinc-800">
            <span>&gt; Status</span>
            <span className="text-[#ff003c]">
              {skillsLoaded === 100 ? 'READY' : 'LOADING'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Contact CTA */}
      <motion.button
        whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(255, 0, 60, 0.3)' }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          const contactSection = document.getElementById('contact');
          contactSection?.scrollIntoView({ behavior: 'smooth' });
        }}
        className="w-full bg-[#ff003c] text-black font-mono text-xs uppercase tracking-wider py-3 font-bold transition-all hover:bg-[#ff4466] border-2 border-[#ff003c] hover:border-white"
      >
        &gt;&gt; INITIATE_CONTACT
      </motion.button>
    </motion.div>
  );
}