"use client";

import {
  motion,
  useSpring,
  useTransform,
  AnimatePresence,
  type Variants,
  type Transition,
} from "framer-motion";
import { useEffect, type ReactNode, type ComponentProps } from "react";

export const springSoft: Transition = {
  type: "spring", stiffness: 55, damping: 16, mass: 0.7,
};
export const springQuick: Transition = {
  type: "spring", stiffness: 120, damping: 18, mass: 0.6,
};
export const easeSmooth: Transition = {
  duration: 0.4, ease: [0.25, 0.1, 0.25, 1],
};
export const stagger = (index: number, base = 0.08) => ({
  delay: base * index, ...easeSmooth,
});

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: easeSmooth },
};
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.35 } },
};
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: springSoft },
};
export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: easeSmooth },
};
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.06 } },
};
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: easeSmooth },
};

export const MotionDiv    = motion.div;
export const MotionSpan   = motion.span;
export const MotionButton = motion.button;
export const MotionSection= motion.section;

interface ConsensusCircleProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}
export function ConsensusCircle({ score, size = 180, strokeWidth = 12 }: ConsensusCircleProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const springScore = useSpring(0, springSoft);
  const strokeDashoffset = useTransform(
    springScore, (v) => circumference - (v / 100) * circumference
  );
  useEffect(() => {
    springScore.set(Math.min(100, Math.max(0, score)));
  }, [score, springScore]);

  const color = score >= 80 ? "#10B981" : score >= 60 ? "#F59E0B" : "#EF4444";

  return (
    <div style={{ position:"relative", width:size, height:size }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }} aria-hidden>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#E2E8F0" strokeWidth={strokeWidth}/>
        <motion.circle
          cx={size/2} cy={size/2} r={radius} fill="none"
          stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round" strokeDasharray={circumference}
          style={{ strokeDashoffset }}
        />
      </svg>
      <div style={{
        position:"absolute", inset:0,
        display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
      }}>
        <motion.span
          style={{ fontSize:36, fontWeight:800, color:"#111827", fontVariantNumeric:"tabular-nums" }}
          initial={{ opacity:0, scale:0.88 }}
          animate={{ opacity:1, scale:1 }}
          transition={{ delay:0.12, duration:0.4, ease:"easeOut" }}
        >
          {Math.round(score)}%
        </motion.span>
        <span style={{ fontSize:11, fontWeight:600, letterSpacing:"0.14em", color:"#6B7280", marginTop:2 }}>
          CONSENSUS
        </span>
      </div>
    </div>
  );
}

interface FadePresenceProps { children: ReactNode; show: boolean; style?: React.CSSProperties; }
export function FadePresence({ children, show, style }: FadePresenceProps) {
  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          key="fade-presence"
          initial={{ opacity:0, y:8 }}
          animate={{ opacity:1, y:0 }}
          exit={{ opacity:0, y:4 }}
          transition={easeSmooth}
          style={style}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface PageEnterProps extends ComponentProps<typeof motion.div> { children: ReactNode; }
export function PageEnter({ children, ...rest }: PageEnterProps) {
  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} {...rest}>
      {children}
    </motion.div>
  );
}

export function getSafeTransition(preferReducedMotion = false): Transition {
  return preferReducedMotion ? { duration: 0 } : springSoft;
}

export { motion, AnimatePresence, useSpring, useTransform };
