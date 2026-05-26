import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import dashboardImg from '@assets/qr-screens/dashboard.jpg';

export function Scene2() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 600),
      setTimeout(() => setPhase(3), 1200),
      setTimeout(() => setPhase(4), 5200), // begin exit
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-between px-[10vw]"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100, filter: 'blur(10px)' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="w-[35%] z-20">
        <motion.div 
          className="w-16 h-1 bg-[var(--color-accent)] mb-8"
          initial={{ scaleX: 0, originX: 0 }}
          animate={phase >= 1 ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 0.6 }}
        />
        <motion.h2 
          className="text-[4.5vw] leading-[1.1] font-bold text-[var(--color-primary)] mb-6 tracking-tight"
          style={{ fontFamily: 'var(--font-display)' }}
          initial={{ opacity: 0, y: 30 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          Structured<br/>Progress.
        </motion.h2>
        <motion.p 
          className="text-[1.5vw] text-[var(--color-secondary)] leading-relaxed"
          style={{ fontFamily: 'var(--font-body)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          A clean 4-week dashboard to track foundations, functions, statistics, and probability.
        </motion.p>
      </div>

      <div className="w-[55%] relative h-[80vh] perspective-1000">
        <motion.div 
          className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl border border-[var(--color-bg-muted)] transform-style-3d bg-white"
          initial={{ opacity: 0, rotateY: 15, scale: 0.9, x: 50 }}
          animate={phase >= 1 ? { opacity: 1, rotateY: -5, scale: 1, x: 0 } : { opacity: 0, rotateY: 15, scale: 0.9, x: 50 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.img 
            src={dashboardImg} 
            alt="Dashboard" 
            className="w-full object-cover origin-top"
            initial={{ y: 0 }}
            animate={{ y: '-20%' }}
            transition={{ duration: 8, ease: "linear" }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}