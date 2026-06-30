import React, { useEffect, useRef } from 'react';
import { useInView, animate } from 'motion/react';

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  duration?: number;
  decimals?: number;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  suffix = '',
  duration = 1.5,
  decimals = 0,
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.1 });

  useEffect(() => {
    if (isInView && ref.current) {
      const node = ref.current;
      const controls = animate(0, value, {
        duration: duration,
        ease: 'easeOut',
        onUpdate(latest) {
          node.textContent = latest.toFixed(decimals) + suffix;
        },
      });
      return () => controls.stop();
    } else if (!isInView && ref.current) {
      ref.current.textContent = (0).toFixed(decimals) + suffix;
    }
  }, [isInView, value, duration, decimals, suffix]);

  return <span ref={ref}>{(0).toFixed(decimals)}{suffix}</span>;
};
