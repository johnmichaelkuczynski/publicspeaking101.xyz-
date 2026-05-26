import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import lectureImg from '@assets/qr-screens/lecture.jpg';

export function Scene3() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 600),
      setTimeout(() => setPhase(3), 1200),
      setTimeout(() => setPhase(4), 5700), // exit
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center px-[5vw]"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: -50, filter: 'blur(10px)' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="text-center z-20 mb-[5vh]">
        <motion.h2 
          className="text-[4vw] leading-tight font-bold text-[var(--color-primary)] tracking-tight"
          style={{ fontFamily: 'var(--font-display)' }}
          initial={{ opacity: 0, y: 30 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          Interactive Lectures.
        </motion.h2>
        <motion.p 
          className="text-[1.5vw] text-[var(--color-secondary)] mt-4"
          style={{ fontFamily: 'var(--font-body)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          Short, Medium, or Long. You choose the depth.
        </motion.p>
      </div>

      <div className="w-[85vw] h-[65vh] relative perspective-1000 z-10">
        <motion.div 
          className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl border border-[var(--color-bg-muted)] transform-style-3d bg-white"
          initial={{ opacity: 0, y: 100, rotateX: 20 }}
          animate={phase >= 3 ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 100, rotateX: 20 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <img 
            src={lectureImg} 
            alt="Lecture View" 
            className="w-full h-full object-cover object-top"
          />
          {/* Highlight overlay for split pane */}
          <motion.div 
            className="absolute top-0 right-0 w-[30%] h-full bg-[var(--color-accent)] mix-blend-multiply"
            initial={{ opacity: 0 }}
            animate={phase >= 3 ? { opacity: 0.1 } : { opacity: 0 }}
            transition={{ delay: 1, duration: 1 }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}