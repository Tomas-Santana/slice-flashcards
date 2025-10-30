/**
 * Card Animation Utilities using Motion One library
 * Provides smooth, performant animations for practice session card transitions
 */

import { animate, spring, stagger } from "motion";

export interface CardAnimationOptions {
  duration?: number;
  delay?: number;
}

/**
 * Animates a card entering from the right
 */
export async function animateCardEntrance(
  element: HTMLElement,
  options: CardAnimationOptions = {}
): Promise<void> {
  const { duration = 0.5 } = options;

  await animate(
    element,
    {
      opacity: [0, 1],
      x: [100, 0],
    },
    {
      duration,
      type: "spring",
      stiffness: 300,
      damping: 30,
    }
  ).finished;
}

/**
 * Animates a card exiting to the left
 */
export async function animateCardExit(
  element: HTMLElement,
  options: CardAnimationOptions = {}
): Promise<void> {
  const { duration = 0.4 } = options;

  await animate(
    element,
    {
      opacity: [1, 0],
      x: [0, -100],
    },
    {
      duration,
      type: "spring",
      stiffness: 300,
      damping: 30,
    }
  ).finished;
}

/**
 * Animates result panel appearing (correct/incorrect feedback)
 */
export async function animateResultReveal(
  element: HTMLElement,
  isCorrect: boolean
): Promise<void> {
  await animate(
    element,
    {
      opacity: [0, 1],
      y: [20, 0],
      scale: [0.95, 1],
    },
    {
      duration: 0.4,
      type: "spring",
      stiffness: isCorrect ? 400 : 300,
      damping: isCorrect ? 25 : 30,
    }
  ).finished;
}

/**
 * Animates progress bar update
 */
export async function animateProgressBar(
  element: HTMLElement,
  toPercent: number
): Promise<void> {
  await animate(
    element,
    {
      width: [`${element.offsetWidth}px`, `${toPercent}%`],
    },
    {
      duration: 0.6,
      ease: "easeOut",
    }
  ).finished;
}

/**
 * Shake animation for incorrect answer
 */
export async function animateShake(element: HTMLElement): Promise<void> {
  await animate(
    element,
    {
      x: [0, -10, 10, -10, 10, 0],
    },
    {
      duration: 0.5,
    }
  ).finished;
}

/**
 * Success pulse animation for correct answer
 */
export async function animatePulse(element: HTMLElement): Promise<void> {
  await animate(
    element,
    {
      scale: [1, 1.05, 1],
    },
    {
      duration: 0.4,
      type: "spring",
      stiffness: 400,
      damping: 20,
    }
  ).finished;
}

/**
 * Fade in animation for UI elements
 */
export async function animateFadeIn(
  element: HTMLElement,
  options: CardAnimationOptions = {}
): Promise<void> {
  const { duration = 0.3, delay = 0 } = options;

  await animate(
    element,
    {
      opacity: [0, 1],
    },
    {
      duration,
      delay,
      ease: "easeIn",
    }
  ).finished;
}

/**
 * Fade out animation for UI elements
 */
export async function animateFadeOut(
  element: HTMLElement,
  options: CardAnimationOptions = {}
): Promise<void> {
  const { duration = 0.3 } = options;

  await animate(
    element,
    {
      opacity: [1, 0],
    },
    {
      duration,
      ease: "easeIn",
    }
  ).finished;
}

/**
 * Stagger animation for multiple elements (e.g., session summary stats)
 */
export async function animateStagger(
  elements: HTMLElement[],
  options: CardAnimationOptions = {}
): Promise<void> {
  const { duration = 0.3 } = options;

  await animate(
    elements,
    {
      opacity: [0, 1],
      y: [10, 0],
    },
    {
      duration,
      delay: stagger(0.1),
      ease: "easeOut",
    }
  ).finished;
}

/**
 * Flip card animation (enhance existing flip)
 */
export async function animateCardFlip(
  element: HTMLElement,
  showBack: boolean
): Promise<void> {
  const rotation = showBack ? 180 : 0;

  await animate(
    element,
    {
      rotateY: [rotation - 180, rotation],
    },
    {
      duration: 0.6,
      type: "spring",
      stiffness: 200,
      damping: 25,
    }
  ).finished;
}

/**
 * Complete card transition sequence (exit old, enter new)
 */
export async function transitionCards(
  oldCard: HTMLElement,
  newCard: HTMLElement
): Promise<void> {
  // Run exit animation
  await animateCardExit(oldCard);

  // Hide old card
  oldCard.style.display = "none";

  // Show and animate new card
  newCard.style.display = "block";
  await animateCardEntrance(newCard);
}

/**
 * Animate timer countdown (pulse effect when low)
 */
export async function animateTimerWarning(element: HTMLElement): Promise<void> {
  await animate(
    element,
    {
      scale: [1, 1.1, 1],
      color: ["currentColor", "#ef4444", "currentColor"], // red warning
    },
    {
      duration: 0.5,
    }
  ).finished;
}

/**
 * Slide up animation (for modals, panels)
 */
export async function animateSlideUp(
  element: HTMLElement,
  options: CardAnimationOptions = {}
): Promise<void> {
  const { duration = 0.4 } = options;

  await animate(
    element,
    {
      opacity: [0, 1],
      y: [50, 0],
    },
    {
      duration,
      type: "spring",
      stiffness: 300,
      damping: 30,
    }
  ).finished;
}

/**
 * Slide down animation (for closing modals, panels)
 */
export async function animateSlideDown(
  element: HTMLElement,
  options: CardAnimationOptions = {}
): Promise<void> {
  const { duration = 0.3 } = options;

  await animate(
    element,
    {
      opacity: [1, 0],
      y: [0, 30],
    },
    {
      duration,
      ease: "easeIn",
    }
  ).finished;
}

/**
 * Bounce animation for notifications or feedback
 */
export async function animateBounce(element: HTMLElement): Promise<void> {
  await animate(
    element,
    {
      y: [0, -20, 0, -10, 0],
    },
    {
      duration: 0.6,
      ease: "easeOut",
    }
  ).finished;
}

/**
 * Rotate animation (for loading spinners, icons)
 */
export async function animateRotate(
  element: HTMLElement,
  degrees: number = 360
): Promise<void> {
  await animate(
    element,
    {
      rotate: [0, degrees],
    },
    {
      duration: 0.5,
      ease: "easeInOut",
    }
  ).finished;
}
