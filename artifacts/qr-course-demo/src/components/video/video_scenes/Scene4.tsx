import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import topicPracticeImg from '@assets/qr-screens/topic-practice.jpg';

export function Scene4() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 1000),
      setTimeout(() => setPhase(3), 1800),
      setTimeout(() => setPhase(4), 5700), // exit
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-between px-[8vw]"
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="w-[45%] relative h-[70vh] perspective-1000 z-10 order-2">
        <motion.div 
          className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl border border-[var(--color-bg-muted)] transform-style-3d bg-white"
          initial={{ opacity: 0, rotateY: -15, scale: 0.9, x: -50 }}
          animate={phase >= 1 ? { opacity: 1, rotateY: 5, scale: 1, x: 0 } : { opacity: 0, rotateY: -15, scale: 0.9, x: -50 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <img 
            src={topicPracticeImg} 
            alt="Topic Practice" 
            className="w-full h-full object-cover object-top"
          />
        </motion.div>
        
        {/* Floating element for math keyboard emphasis */}
        <motion.div 
          className="absolute -bottom-8 -left-8 w-64 rounded-xl overflow-hidden shadow-xl border border-[var(--color-bg-muted)]"
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={phase >= 3 ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.8 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
        >
            {/* We don't have an isolated keyboard img, but we can simulate a floating accent */}
            <div className="bg-white p-4 font-mono text-[var(--color-primary)] text-center text-xl shadow-inner border-t-4 border-[var(--color-accent)]">
              x² + y² = z²
            </div>
        </motion.div>
      </div>

      <div className="w-[45%] z-20 order-1 pl-[2vw]">
        <motion.h2 
          className="text-[4.5vw] leading-[1.1] font-bold text-[var(--color-primary)] mb-6 tracking-tight"
          style={{ fontFamily: 'var(--font-display)' }}
          initial={{ opacity: 0, y: 30 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          AI Tutor &<br/>Adaptive Practice.
        </motion.h2>
        <motion.p 
          className="text-[1.5vw] text-[var(--color-secondary)] leading-relaxed"
          style={{ fontFamily: 'var(--font-body)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          Ask questions inline. Solve generated problems with a custom math keyboard.
        </motion.p>
      </div>
    </motion.div>
  );
}