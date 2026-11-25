// Copyright (c) 2026 ReLU Technologies Private Limited. All rights reserved.
import { useRef } from 'react';
import { flushSync } from 'react-dom';
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

/** The cord hangs from the very top of the viewport; the nav slot sits 14px below it. */
const TOP_OFFSET = 14;
/** Distance from the top of the 44px slot to the centre of the bead at rest. */
const BEAD_CENTER = 40;
const PULL_THRESHOLD = 26;
const MAX_PULL = 64;

/**
 * Theme switch styled as a lamp pull-cord. Drag the bead down and release to switch
 * themes. A plain click, tap or Enter/Space also works, so it never depends on dragging.
 */
export function LampCord() {
  const { theme, toggleTheme } = useTheme();
  const reduceMotion = useReducedMotion();
  const y = useMotionValue(0);
  const cordHeight = useTransform(y, (v) => TOP_OFFSET + BEAD_CENTER + v);
  const beadRef = useRef<HTMLButtonElement>(null);
  // True from the moment a drag starts until just after its trailing click has been swallowed.
  const dragged = useRef(false);
  const nextTheme = theme === 'dark' ? 'light' : 'dark';

  const switchTheme = () => {
    const rect = beadRef.current?.getBoundingClientRect();
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth - 40;
    const cy = rect ? rect.top + rect.height / 2 : 54;

    if (reduceMotion || typeof document.startViewTransition !== 'function') {
      toggleTheme();
      return;
    }

    // The new theme grows as a circle from the bead, as if the lamp lit the page.
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(cy, window.innerHeight - cy),
    );
    const transition = document.startViewTransition(() => {
      flushSync(toggleTheme);
    });
    transition.ready
      .then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${cy}px)`, `circle(${radius}px at ${x}px ${cy}px)`] },
          {
            duration: 650,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            pseudoElement: '::view-transition-new(root)',
          },
        );
      })
      .catch(() => {});
  };

  return (
    <div className="relative w-11 h-11 flex-shrink-0">
      {/* Pendulum sway pivots at the top edge of the screen */}
      <motion.div
        className="absolute left-0 w-11"
        style={{ top: -TOP_OFFSET, height: 140, transformOrigin: '50% 0%' }}
        animate={reduceMotion ? undefined : { rotate: [-1.4, 1.4, -1.4] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Ceiling anchor */}
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-0 w-2.5 h-1.5 -translate-x-1/2 rounded-b-full bg-[var(--text-muted)]"
        />
        {/* The string */}
        <motion.span
          aria-hidden="true"
          className="absolute left-1/2 -ml-px top-0 w-[2px] bg-[var(--text-muted)]"
          style={{ height: cordHeight }}
        />
        {/* The bead */}
        <motion.button
          ref={beadRef}
          type="button"
          drag="y"
          dragConstraints={{ top: 0, bottom: MAX_PULL }}
          dragElastic={0.2}
          dragMomentum={false}
          dragSnapToOrigin
          style={{ y, top: TOP_OFFSET + BEAD_CENTER - 22 }}
          onDragStart={() => {
            dragged.current = true;
          }}
          onDragEnd={(_, info) => {
            // The release click can land before or after this callback, so clear lazily.
            window.setTimeout(() => {
              dragged.current = false;
            }, 80);
            if (info.offset.y >= PULL_THRESHOLD) switchTheme();
          }}
          onClick={() => {
            // A drag also fires a click on release; that click must not toggle the theme.
            if (dragged.current) {
              dragged.current = false;
              return;
            }
            if (!reduceMotion) animate(y, [0, 22, 0], { duration: 0.4 });
            switchTheme();
          }}
          className="absolute left-0 w-11 h-11 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
          aria-label={`Pull the lamp cord to switch to the ${nextTheme} theme`}
          title="Pull the cord"
        >
          <span
            aria-hidden="true"
            className="block w-[18px] h-[18px] rounded-full border-2 border-[var(--bg-color)]"
            style={{
              background: 'var(--lamp)',
              boxShadow:
                theme === 'dark'
                  ? '0 0 16px 5px color-mix(in srgb, var(--lamp) 55%, transparent)'
                  : '0 2px 5px var(--shadow-ink)',
            }}
          />
        </motion.button>
      </motion.div>
    </div>
  );
}
