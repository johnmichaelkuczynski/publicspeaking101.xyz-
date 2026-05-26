import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import analyticsImg from '@assets/qr-screens/analytics.jpg';
import assignmentsImg from '@assets/qr-screens/assignments.jpg';

export function Scene5() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 800),
      setTimeout(() => setPhase(3), 1400),
      setTimeout(() => setPhase(4), 2000),
      setTimeout(() => setPhase(5), 5700), // exit
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center px-[5vw]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
      transition={{ duration: 0.8 }}
    >
      <div className="absolute top-[12vh] text-center z-30 w-full px-[10vw]">
        <motion.h2 
          className="text-[4vw] leading-[1.1] font-bold text-[var(--color-primary)] mb-4 tracking-tight"
          style={{ fontFamily: 'var(--font-display)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          Deep Analytics & Auto-grading.
        </motion.h2>
        <motion.p 
          className="text-[1.5vw] text-[var(--color-secondary)] leading-relaxed max-w-3xl mx-auto"
          style={{ fontFamily: 'var(--font-body)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          Track topic mastery in real-time. Detect AI-pasted answers automatically.
        </motion.p>
      </div>

      <div className="w-[90vw] h-[55vh] absolute bottom-[10vh] flex justify-center gap-[4vw] perspective-1000 z-10">
        <motion.div 
          className="w-[45%] h-full rounded-2xl overflow-hidden shadow-2xl border border-[var(--color-bg-muted)] transform-style-3d bg-white"
          initial={{ opacity: 0, y: 100, rotateY: 15 }}
          animate={phase >= 3 ? { opacity: 1, y: 0, rotateY: 5 } : { opacity: 0, y: 100, rotateY: 15 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <img 
            src={assignmentsImg} 
            alt="Assignments" 
            className="w-full h-full object-cover object-top"
          />
        </motion.div>

        <motion.div 
          className="w-[45%] h-full rounded-2xl overflow-hidden shadow-2xl border border-[var(--color-bg-muted)] transform-style-3d bg-white"
          initial={{ opacity: 0, y: 100, rotateY: -15 }}
          animate={phase >= 4 ? { opacity: 1, y: 0, rotateY: -5 } : { opacity: 0, y: 100, rotateY: -15 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <img 
            src={analyticsImg} 
            alt="Analytics" 
            className="w-full h-full object-cover object-top"
          />
        </motion.div>
      </div>
    </motion.div>
  );
}