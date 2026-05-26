import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene6() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 2000),
      setTimeout(() => setPhase(4), 4500), // end
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--color-primary)]"
      initial={{ opacity: 0, clipPath: 'circle(0% at 50% 50%)' }}
      animate={{ opacity: 1, clipPath: 'circle(150% at 50% 50%)' }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="text-center relative z-10 px-12">
        <div className="overflow-hidden mb-8">
          <motion.h1 
            className="text-[8vw] font-bold text-[var(--color-bg-light)] leading-none tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
            initial={{ y: "100%", opacity: 0 }}
            animate={phase >= 1 ? { y: 0, opacity: 1 } : { y: "100%", opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            QuantReason
          </motion.h1>
        </div>
        
        <motion.div
          className="h-[2px] bg-[var(--color-accent)] mx-auto mb-8"
          initial={{ width: 0 }}
          animate={phase >= 2 ? { width: '60%' } : { width: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        />

        <motion.p 
          className="text-[2.5vw] text-[var(--color-bg-muted)] font-medium"
          style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          Quantitative reasoning, taught well.
        </motion.p>
      </div>
    </motion.div>
  );
}