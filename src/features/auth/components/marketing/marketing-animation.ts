import type { Variants } from 'motion/react';

const ease = [0.22, 1, 0.36, 1] as const;

export const marketingTiming = {
  heading: { delay: 0, duration: 0.5 },
  description: { delay: 0.25, duration: 0.4 },
  revenue: { delay: 0.7, duration: 0.4 },
  conversion: { delay: 0.85, duration: 0.4 },
  order: { delay: 1, duration: 0.4 },
  message: { delay: 1.15, duration: 0.4 },
  channel: { delay: 1.3, duration: 0.4 },
  bars: { delay: 1.35, duration: 0.7, stagger: 0.045 },
  gauge: { delay: 1.7, duration: 0.85 },
  donut: { delay: 1.95, duration: 0.85, stagger: 0.065 },
  incoming: { delay: 2.65, duration: 0.3 },
  firstReply: { delay: 3, duration: 0.35 },
  lastReply: { delay: 3.15, duration: 0.35 },
} as const;

type Timing = { delay: number; duration: number };

function reveal({ delay, duration }: Timing, distance = 20): Variants {
  return {
    hidden: { opacity: 0, y: distance },
    enter: { opacity: 1, y: 0, transition: { delay, duration, ease } },
    complete: { opacity: 1, y: 0 },
  };
}

export const marketingVariants = {
  heading: {
    hidden: { opacity: 0, y: 8, filter: 'blur(8px)' },
    enter: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { ...marketingTiming.heading, ease },
      transitionEnd: { filter: 'none' },
    },
    complete: { opacity: 1, y: 0, filter: 'none' },
  } satisfies Variants,
  description: reveal(marketingTiming.description, 8),
  revenue: reveal(marketingTiming.revenue),
  conversion: reveal(marketingTiming.conversion),
  order: reveal(marketingTiming.order),
  message: reveal(marketingTiming.message),
  channel: reveal(marketingTiming.channel),
  incoming: reveal(marketingTiming.incoming, 8),
  firstReply: reveal(marketingTiming.firstReply, 8),
  lastReply: reveal(marketingTiming.lastReply, 8),
};

export function revenueBarVariants(index: number): Variants {
  return {
    hidden: { scaleY: 0 },
    enter: {
      scaleY: 1,
      transition: {
        delay:
          marketingTiming.bars.delay + index * marketingTiming.bars.stagger,
        duration: marketingTiming.bars.duration,
        ease,
      },
    },
    complete: { scaleY: 1 },
  };
}

function draw({ delay, duration }: Timing): Variants {
  return {
    hidden: { pathLength: 0, opacity: 0 },
    enter: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { delay, duration, ease },
        opacity: { delay, duration: 0.15 },
      },
    },
    complete: { pathLength: 1, opacity: 1 },
  };
}

export const conversionGaugeVariants = draw(marketingTiming.gauge);

export function channelSegmentVariants(index: number): Variants {
  return draw({
    delay: marketingTiming.donut.delay + index * marketingTiming.donut.stagger,
    duration: marketingTiming.donut.duration,
  });
}
