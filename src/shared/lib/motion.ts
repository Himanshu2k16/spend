import type { Easing, Transition, Variants } from "framer-motion";

export const EASE_OUT_EXPO: Easing = [0.16, 1, 0.3, 1];
export const EASE_IN_OUT_EXPO: Easing = [0.87, 0, 0.13, 1];

export const springSoft: Transition = { type: "spring", stiffness: 240, damping: 28, mass: 0.9 };
export const springSnappy: Transition = { type: "spring", stiffness: 420, damping: 34 };

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: EASE_OUT_EXPO },
  },
};

export const staggerChildren: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
};
