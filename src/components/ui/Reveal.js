"use client";

import { motion } from "framer-motion";

const DIRECTIONS = {
  up: { y: 28, x: 0 },
  down: { y: -28, x: 0 },
  left: { x: 32, y: 0 },
  right: { x: -32, y: 0 },
  none: { x: 0, y: 0 },
};

/**
 * Fade + slide a block into view the first time it is scrolled to.
 */
export default function Reveal({
  children,
  delay = 0,
  direction = "up",
  className = "",
  once = true,
  amount = 0.3,
}) {
  const offset = DIRECTIONS[direction] || DIRECTIONS.up;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...offset, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, x: 0, y: 0, filter: "blur(0px)" }}
      viewport={{ once, amount }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Stagger children by wrapping each in a Reveal with an incremental delay.
 */
export function RevealGroup({ children, stagger = 0.08, ...props }) {
  return (
    <>
      {Array.isArray(children)
        ? children.map((child, i) => (
            <Reveal key={i} delay={i * stagger} {...props}>
              {child}
            </Reveal>
          ))
        : children}
    </>
  );
}
