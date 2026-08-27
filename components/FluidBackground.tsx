/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const StarField = () => {
  const stars = useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      size: Math.random() * 2.5 + 1,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 4 + 3,
      delay: Math.random() * 2,
      opacity: Math.random() * 0.6 + 0.2,
    }));
  }, []);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white will-change-[opacity,transform]"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            transform: 'translateZ(0)',
          }}
          initial={{ opacity: star.opacity, scale: 1 }}
          animate={{
            opacity: [star.opacity, 0.9, star.opacity],
            scale: [1, 1.4, 1],
          }}
          transition={{
            duration: star.duration * 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: star.delay,
          }}
        />
      ))}
    </div>
  );
};

const FluidBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#07080f]">
      {/* Dynamic Mesh Grid */}
      <div 
        className="absolute inset-0 opacity-[0.12] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />

      <StarField />

      {/* Blob 1: Neon Mint / Emerald */}
      <motion.div
        className="absolute top-[-15%] left-[-10%] w-[75vw] h-[75vw] max-w-[900px] max-h-[900px] rounded-full mix-blend-screen filter blur-[90px] opacity-25 will-change-transform pointer-events-none"
        style={{ background: 'radial-gradient(circle, #00ffc4 0%, #047857 60%, transparent 80%)' }}
        animate={{
          x: [0, 40, -30, 0],
          y: [0, -30, 30, 0],
          scale: [1, 1.08, 0.95, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Blob 2: Cyan / Electric Blue */}
      <motion.div
        className="absolute top-[35%] right-[-15%] w-[80vw] h-[80vw] max-w-[850px] max-h-[850px] rounded-full mix-blend-screen filter blur-[100px] opacity-20 will-change-transform pointer-events-none"
        style={{ background: 'radial-gradient(circle, #00d2ff 0%, #31326f 70%, transparent 85%)' }}
        animate={{
          x: [0, -40, 30, 0],
          y: [0, 40, -30, 0],
          scale: [0.95, 1.1, 1, 0.95],
        }}
        transition={{
          duration: 26,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Blob 3: Deep Violet / Indigo */}
      <motion.div
        className="absolute bottom-[-15%] left-[25%] w-[70vw] h-[70vw] max-w-[800px] max-h-[800px] rounded-full mix-blend-screen filter blur-[90px] opacity-20 will-change-transform pointer-events-none"
        style={{ background: 'radial-gradient(circle, #7928ca 0%, #1f2048 70%, transparent 85%)' }}
        animate={{
          x: [0, 50, -50, 0],
          y: [0, -40, 40, 0],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Vignette & Grain */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#07080f]/50 to-[#07080f] pointer-events-none" />
    </div>
  );
};

export default FluidBackground;
