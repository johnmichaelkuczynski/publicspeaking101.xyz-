import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene1() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 100),
      setTimeout(() => setPhase(2), 800),
      setTimeout(() => setPhase(3), 1600),
      setTimeout(() => setPhase(4), 3800), // begin exit
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
      transition={{ duration: 0.8 }}
    >
      <div className="text-center relative z-10 px-12">
        <div className="overflow-hidden mb-6">
          <motion.h1 
            className="text-[8vw] font-bold text-[var(--color-primary)] leading-none tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
            initial={{ y: "100%" }}
            animate={phase >= 1 ? { y: 0 } : { y: "100%" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            QuantReason
          </motion.h1>
        </div>
        
        <motion.div
          className="h-[2px] bg-[var(--color-accent)] mx-auto"
          initial={{ width: 0 }}
          animate={phase >= 2 ? { width: '80%' } : { width: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />

        <motion.p 
          className="text-[2vw] text-[var(--color-secondary)] mt-8 uppercase tracking-widest font-medium"
          style={{ fontFamily: 'var(--font-body)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          Quantitative Reasoning, Taught Well
        </motion.p>
      </div>
    </motion.div>
  );
}