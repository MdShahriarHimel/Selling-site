/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'framer-motion';

interface GradientTextProps {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  className?: string;
  highlightWords?: string[];
}

export const GradientText: React.FC<GradientTextProps> = ({
  text,
  as: Component = 'span',
  className = '',
}) => {
  return (
    <Component className={`relative inline-block font-black tracking-tight ${className}`}>
      <motion.span
        className="block bg-gradient-to-r from-white via-[#00ffc4] via-[#00d2ff] to-[#a8fbd3] bg-[length:200%_auto] bg-clip-text text-transparent will-change-[background-position]"
        animate={{
          backgroundPosition: ['0% center', '200% center'],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        {text}
      </motion.span>
      {/* Subtle Glow */}
      <span
        className="absolute inset-0 -z-10 block bg-gradient-to-r from-[#00ffc4] via-[#00d2ff] to-[#a8fbd3] bg-clip-text text-transparent blur-xl opacity-30 select-none pointer-events-none"
        aria-hidden="true"
      >
        {text}
      </span>
    </Component>
  );
};

export default GradientText;
