/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

const CustomCursor: React.FC = () => {
  const [hoverText, setHoverText] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const springConfig = { damping: 24, stiffness: 350, mass: 0.1 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setIsVisible(true);
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      const target = e.target as HTMLElement | null;
      if (!target) return;

      const cursorTarget = target.closest('[data-cursor-text]') as HTMLElement | null;
      const clickable = target.closest('button') || target.closest('a') || target.closest('[data-hover="true"]');

      if (cursorTarget && cursorTarget.getAttribute('data-cursor-text')) {
        setHoverText(cursorTarget.getAttribute('data-cursor-text'));
      } else if (clickable) {
        setHoverText('CLICK');
      } else {
        setHoverText(null);
      }
    };

    const handleMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', updateMousePosition, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [mouseX, mouseY]);

  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 z-[9999] pointer-events-none mix-blend-difference hidden md:flex items-center justify-center will-change-transform"
      style={{ x, y, translateX: '-50%', translateY: '-50%' }}
    >
      <motion.div
        className="relative rounded-full bg-[#00ffc4] flex items-center justify-center shadow-[0_0_20px_rgba(0,255,196,0.6)]"
        animate={{
          width: hoverText ? 56 : 14,
          height: hoverText ? 56 : 14,
          scale: hoverText ? 1.15 : 1,
        }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      >
        {hoverText && (
          <motion.span
            className="text-[9px] font-black tracking-widest text-black uppercase select-none px-1 text-center font-mono"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {hoverText}
          </motion.span>
        )}
      </motion.div>
    </motion.div>
  );
};

export default CustomCursor;
