import { AnimatePresence, motion } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video';
import { Scene1 } from './video_scenes/Scene1';
import { Scene2 } from './video_scenes/Scene2';
import { Scene3 } from './video_scenes/Scene3';
import { Scene4 } from './video_scenes/Scene4';
import { Scene5 } from './video_scenes/Scene5';

const SCENE_DURATIONS = {
  intro: 4000,
  mic: 4500,
  metrics: 5000,
  curriculum: 4000,
  outro: 4500,
};

export default function VideoTemplate() {
  const { currentScene } = useVideoPlayer({ durations: SCENE_DURATIONS });

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[var(--color-bg-dark)] font-body text-white">
      {/* Persistent Background Layer */}
      <div className="absolute inset-0">
        <video 
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-screen"
          src={`${import.meta.env.BASE_URL}videos/bg-waves.mp4`}
          autoPlay muted loop playsInline
        />
        
        {/* Animated Gradient Overlay */}
        <motion.div 
          className="absolute inset-0 opacity-50"
          style={{ background: 'radial-gradient(circle at center, var(--color-bg-light) 0%, transparent 70%)' }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        
        {/* Dynamic accent color blob */}
        <motion.div 
          className="absolute w-[80vw] h-[80vw] rounded-full blur-[100px] pointer-events-none mix-blend-screen"
          style={{ backgroundColor: 'var(--color-secondary)', opacity: 0.15 }}
          animate={{
            x: ['-20%', '20%', '-10%', '0%'][currentScene % 4],
            y: ['-20%', '10%', '30%', '0%'][currentScene % 4],
            scale: [1, 1.5, 0.8, 1.2][currentScene % 4],
            backgroundColor: [
              'var(--color-secondary)', 
              'var(--color-accent)', 
              'var(--color-secondary)', 
              'var(--color-accent)'
            ][currentScene % 4]
          }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
      </div>

      <AnimatePresence mode="popLayout">
        {currentScene === 0 && <Scene1 key="intro" />}
        {currentScene === 1 && <Scene2 key="mic" />}
        {currentScene === 2 && <Scene3 key="metrics" />}
        {currentScene === 3 && <Scene4 key="curriculum" />}
        {currentScene === 4 && <Scene5 key="outro" />}
      </AnimatePresence>
    </div>
  );
}
