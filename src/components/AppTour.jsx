import { useEffect, useCallback } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";

// Steps that require a specific page to be loaded first
// index = step index in the flat TOUR_STEPS array
const STEP_ROUTES = {
  2: "/preps-and-practices", // #tour-mark-complete lives on /preps-and-practices
  4: "/my-estuary", // #tour-add-person lives on /my-estuary
  5: "/my-estuary", // #tour-journal lives on /my-estuary
  6: "/home",       // #tour-hamburger — back to home for the final step
};

const TOUR_STEPS = [
  {
    element: "#tour-bottom-nav",
    popover: {
      title: "📚 Access Your GO! Modules",
      description: "Use the bottom navigation to jump between Home, Pray, Videos, and your personal Estuary at any time.",
      side: "top",
      align: "center",
    },
  },
  {
    element: "#tour-jump-in",
    popover: {
      title: "🏠 Jump Back In",
      description: "From the Home screen, tap either card to dive into the Pray. Impact. Invite. rhythm or the Preps + Practices videos.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: "#tour-mark-complete",
    popover: {
      title: "✅ Mark Modules Completed",
      description: "After watching a video, tap 'Mark Completed' on the video card to track your progress. Your progress bar on the Home screen will update automatically.",
      side: "top",
      align: "center",
    },
  },
  {
    element: "#tour-estuary-nav",
    popover: {
      title: "🌊 My Estuary — Your Field Guide",
      description: "Tap 'My Estuary' in the bottom nav to open your Digital Field Guide — where you track the people Jesus is sending you to.",
      side: "top",
      align: "center",
    },
  },
  {
    element: "#tour-add-person",
    popover: {
      title: "➕ Add People to Your Estuary",
      description: "Type a name and tap 'Add' to add someone to your Field Guide. Tap their card to expand it, and use the pencil icon to edit their details.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: "#tour-journal",
    popover: {
      title: "📓 Add Journal Entries",
      description: "Inside each person's card, you can add journal entries to track the steps you're taking in their life. Tap a person's card to expand it and start writing.",
      side: "top",
      align: "center",
    },
  },
  {
    element: "#tour-hamburger",
    popover: {
      title: "🔄 Retake This Tour Anytime",
      description: "You can always retake this tour by tapping the menu icon here and selecting 'Take A Tour'.",
      side: "bottom",
      align: "end",
    },
  },
];

let _driverInstance = null;

function navigateAndAdvance(navigate, route, driverObj, advance) {
  navigate(route);
  // Wait for the new page to render, then advance/highlight
  setTimeout(() => {
    advance();
  }, 500);
}

export function startTour(navigate, onComplete) {
  let driverObj;

  const steps = TOUR_STEPS.map((step, index) => {
    const targetRoute = STEP_ROUTES[index];
    if (!targetRoute) return step;

    return {
      ...step,
      onHighlightStarted: () => {
        // If the element isn't found yet (wrong page), navigate first
        const el = document.querySelector(step.element);
        if (!el && navigate) {
          navigate(targetRoute);
        }
      },
    };
  });

  // Wrap each step with a navigation guard on "Next"
  const stepsWithNav = steps.map((step, index) => {
    const targetRoute = STEP_ROUTES[index];
    if (!targetRoute) return step;

    return {
      ...step,
      // Called just before this step is shown — navigate if needed
      onHighlightStarted: () => {
        const el = document.querySelector(step.element);
        if (!el && navigate) {
          navigate(targetRoute);
        }
      },
    };
  });

  driverObj = driver({
    showProgress: true,
    animate: true,
    overlayColor: "rgba(0,0,0,0.6)",
    progressText: "Step {{current}} of {{total}}",
    nextBtnText: "Next →",
    prevBtnText: "← Back",
    doneBtnText: "Done!",
    steps: stepsWithNav,
    onNextClick: (el, step, opts) => {
      const nextIndex = driverObj.getActiveIndex() + 1;
      const targetRoute = STEP_ROUTES[nextIndex];

      if (targetRoute && navigate) {
        const nextEl = TOUR_STEPS[nextIndex]?.element;
        const alreadyThere = nextEl && !!document.querySelector(nextEl);
        if (!alreadyThere) {
          navigate(targetRoute);
          setTimeout(() => driverObj.moveNext(), 500);
          return;
        }
      }
      driverObj.moveNext();
    },
    onPrevClick: (el, step, opts) => {
      const prevIndex = driverObj.getActiveIndex() - 1;
      const targetRoute = STEP_ROUTES[prevIndex];

      if (targetRoute && navigate) {
        const prevEl = TOUR_STEPS[prevIndex]?.element;
        const alreadyThere = prevEl && !!document.querySelector(prevEl);
        if (!alreadyThere) {
          navigate(targetRoute);
          setTimeout(() => driverObj.movePrevious(), 500);
          return;
        }
      }
      driverObj.movePrevious();
    },
    onDestroyed: () => {
      if (onComplete) onComplete();
      _driverInstance = null;
    },
  });

  _driverInstance = driverObj;
  driverObj.drive();
}

export default function AppTour({ autoStart = false, onDone }) {
  const navigate = useNavigate();

  const handleDone = useCallback(async () => {
    await base44.auth.updateMe({ has_completed_tour: true });
    if (onDone) onDone();
  }, [onDone]);

  useEffect(() => {
    if (!autoStart) return;
    // Mark as completed immediately so X-ing out won't re-trigger the tour
    base44.auth.updateMe({ has_completed_tour: true });
    const timer = setTimeout(() => startTour(navigate, handleDone), 800);
    return () => clearTimeout(timer);
  }, [autoStart, handleDone, navigate]);

  return null;
}