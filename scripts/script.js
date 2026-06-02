const menuButton = document.querySelector(".menu-toggle");
const mobileNav = document.querySelector(".mobile-nav");

const neonScrollSelectors = [
  ".program-finder h2",
  ".inquiry-copy h2",
  ".aid-band h2",
  ".power-section h2",
  ".program-code",
  ".program-hero h1",
  ".program-intro h2",
  ".innovators-copy h2",
  ".career-paths h2",
  ".stats-grid strong",
  ".lead-room-section h2",
  ".affordability-section h2",
  ".serve-section h2",
].join(",");

// Neon text flickers on once, as soon as it first enters the viewport.
const neonTargets = document.querySelectorAll(neonScrollSelectors);
let neonObserver;
const getNeonViewport = () => ({
  top: window.scrollY,
  bottom: window.scrollY + window.innerHeight,
});
let lastNeonViewport = getNeonViewport();

neonTargets.forEach((target) => {
  target.classList.add("neon-on-scroll");
});

const lightNeonTarget = (target) => {
  target.classList.add("neon-lit");

  if (neonObserver) {
    neonObserver.unobserve(target);
  }
};

// The scroll fallback catches fast scrolls that pass over short neon elements between observer checks.
const revealNeonTargetsInRange = (rangeTop, rangeBottom) => {
  const viewportBuffer = 12;

  neonTargets.forEach((target) => {
    if (target.classList.contains("neon-lit")) {
      return;
    }

    const rect = target.getBoundingClientRect();
    const targetTop = rect.top + window.scrollY;
    const targetBottom = targetTop + rect.height;

    if (targetBottom >= rangeTop - viewportBuffer && targetTop <= rangeBottom + viewportBuffer) {
      lightNeonTarget(target);
    }
  });
};

const checkNeonViewport = () => {
  const currentViewport = getNeonViewport();
  const rangeTop = Math.min(lastNeonViewport.top, currentViewport.top);
  const rangeBottom = Math.max(lastNeonViewport.bottom, currentViewport.bottom);

  revealNeonTargetsInRange(rangeTop, rangeBottom);
  lastNeonViewport = currentViewport;
};

let neonScrollFrame;
const scheduleNeonViewportCheck = () => {
  if (neonScrollFrame) {
    return;
  }

  neonScrollFrame = window.requestAnimationFrame(() => {
    neonScrollFrame = null;
    checkNeonViewport();
  });
};

if ("IntersectionObserver" in window) {
  neonObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          lightNeonTarget(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: "0px",
      threshold: 0,
    },
  );

  neonTargets.forEach((target) => neonObserver.observe(target));
} else {
  // Older browsers still get the finished glow, just without the scroll-triggered timing.
  neonTargets.forEach((target) => {
    lightNeonTarget(target);
  });
}

window.addEventListener("scroll", scheduleNeonViewportCheck, { passive: true });
window.addEventListener("resize", scheduleNeonViewportCheck);
window.addEventListener("orientationchange", scheduleNeonViewportCheck);
window.addEventListener("load", scheduleNeonViewportCheck);
window.addEventListener("pageshow", scheduleNeonViewportCheck);
window.requestAnimationFrame(checkNeonViewport);

// Font, image, and layout shifts can move neon items after the first paint, so recheck when those settle.
if ("fonts" in document) {
  document.fonts.ready.then(scheduleNeonViewportCheck);
}

document.querySelectorAll("img").forEach((image) => {
  if (!image.complete) {
    image.addEventListener("load", scheduleNeonViewportCheck, { once: true });
  }
});

if ("ResizeObserver" in window) {
  const neonLayoutObserver = new ResizeObserver(scheduleNeonViewportCheck);
  neonLayoutObserver.observe(document.body);
}

const powerSection = document.querySelector(".power-section");

if (powerSection) {
  const powerPointWrap = powerSection.querySelector(".power-points-wrap");
  const powerRamHead = powerSection.querySelector(".power-ram-head");
  const powerPoints = Array.from(powerSection.querySelectorAll(".power-points li"));
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let powerSequenceStarted = false;
  let activePowerPoint = powerPoints[0];

  const scrollWindowImmediately = (amount) => {
    const previousScrollBehavior = document.documentElement.style.scrollBehavior;

    document.documentElement.style.scrollBehavior = "auto";
    window.scrollBy({ top: amount, behavior: "auto" });
    document.documentElement.style.scrollBehavior = previousScrollBehavior;
  };

  // Position the ram head beside the point currently controlled by the user's scroll.
  const placePowerRam = (point, { keepInView = false } = {}) => {
    if (!powerPointWrap || !powerRamHead || !point) {
      return;
    }

    const wrapRect = powerPointWrap.getBoundingClientRect();
    const pointRect = point.getBoundingClientRect();
    const ramHeight = powerRamHead.offsetHeight || powerRamHead.getBoundingClientRect().height;
    const ramOffset = pointRect.top - wrapRect.top + (pointRect.height - ramHeight) / 2;
    const ramBottom = wrapRect.top + ramOffset + ramHeight;

    powerSection.style.setProperty("--power-ram-y", `${Math.max(0, ramOffset)}px`);

    
  };

  const getScrollActivePowerPoint = () => {
    const nextPointTrigger = window.innerHeight * 0.5;
    let nextActivePoint = powerPoints[0];

    powerPoints.forEach((point) => {
      if (point.getBoundingClientRect().top <= nextPointTrigger) {
        nextActivePoint = point;
      }
    });

    return nextActivePoint;
  };

  const setActivePowerPoint = (point, { keepInView = false } = {}) => {
    if (!point) {
      return;
    }

    if (activePowerPoint !== point || !point.classList.contains("is-active")) {
      powerPoints.forEach((item) => {
        item.classList.remove("is-active");
      });

      activePowerPoint = point;

      if (!prefersReducedMotion.matches) {
        point.classList.remove("is-active");
        void point.offsetWidth;
      }

      point.classList.add("is-active");
    }

    placePowerRam(point, { keepInView });
  };

  const updatePowerPointFromScroll = ({ keepInView = false } = {}) => {
    if (!powerSequenceStarted || !powerPoints.length) {
      return;
    }

    setActivePowerPoint(getScrollActivePowerPoint(), { keepInView });
  };

  const startPowerSequence = () => {
    if (powerSequenceStarted || !powerPoints.length) {
      return;
    }

    powerSequenceStarted = true;
    powerSection.classList.add("power-sequence-started");
    updatePowerPointFromScroll({ keepInView: true });
  };

  placePowerRam(activePowerPoint);
  window.addEventListener("resize", () => placePowerRam(activePowerPoint));
  window.addEventListener("load", () => placePowerRam(activePowerPoint));

  // Start when the Power section has moved about a quarter up from the bottom of the viewport.
  const checkPowerSequenceTrigger = () => {
    if (powerSequenceStarted) {
      return true;
    }

    const sectionRect = powerSection.getBoundingClientRect();

    if (sectionRect.top <= window.innerHeight * 0.75 && sectionRect.bottom > 0) {
      startPowerSequence();
      return true;
    }

    return false;
  };

  let powerTriggerFrame;
  const schedulePowerSequenceCheck = () => {
    if (powerTriggerFrame) {
      return;
    }

    powerTriggerFrame = window.requestAnimationFrame(() => {
      powerTriggerFrame = null;
      if (checkPowerSequenceTrigger()) {
        updatePowerPointFromScroll({ keepInView: true });
      }
    });
  };

  if ("IntersectionObserver" in window) {
    const powerSequenceObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const didStart = checkPowerSequenceTrigger();

            if (didStart) {
              observer.unobserve(entry.target);
            }
          }
        });
      },
      {
        rootMargin: "0px 0px -25% 0px",
        threshold: 0,
      },
    );

    powerSequenceObserver.observe(powerSection);
  }

  window.addEventListener("scroll", schedulePowerSequenceCheck, { passive: true });
  window.addEventListener("resize", schedulePowerSequenceCheck);
  window.addEventListener("load", schedulePowerSequenceCheck);
  window.addEventListener("pageshow", schedulePowerSequenceCheck);
  window.requestAnimationFrame(checkPowerSequenceTrigger);
}

// Only wire up the mobile menu if the current page includes both menu elements.
if (menuButton && mobileNav) {
  // Keep this breakpoint in sync with the CSS rule that hides the burger menu.
  const mobileBreakpoint = window.matchMedia("(max-width: 980px)");
  const menuAnimationDuration = 380;
  let menuCloseTimer;

  // This keeps the button label, expanded state, and animated menu state in sync.
  const setMenuButtonState = (isOpen) => {
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  };

  // Opening starts from the hidden state, then adds the class on the next frame so CSS can animate it.
  const openMobileMenu = () => {
    window.clearTimeout(menuCloseTimer);
    mobileNav.hidden = false;
    mobileNav.classList.remove("is-closing");
    setMenuButtonState(true);

    window.requestAnimationFrame(() => {
      mobileNav.classList.add("is-open");
    });
  };

  // Closing removes the open class first, then hides the menu after the CSS transition finishes.
  const closeMobileMenu = ({ immediate = false } = {}) => {
    window.clearTimeout(menuCloseTimer);
    setMenuButtonState(false);
    mobileNav.classList.remove("is-open");

    if (immediate || mobileNav.hidden) {
      mobileNav.classList.remove("is-closing");
      mobileNav.hidden = true;
      return;
    }

    mobileNav.classList.add("is-closing");
    menuCloseTimer = window.setTimeout(() => {
      mobileNav.classList.remove("is-closing");
      mobileNav.hidden = true;
    }, menuAnimationDuration);
  };

  // Start every page load from a closed menu, even if the browser restores old state.
  const resetMobileMenu = () => {
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open menu");
    mobileNav.classList.remove("is-open", "is-closing");
    mobileNav.hidden = true;
  };

  // Toggle the dropdown when the burger button is tapped.
  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";

    if (isOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  // Close the menu after choosing a link so the page content is visible again.
  mobileNav.addEventListener("click", (event) => {
    if (event.target.matches("a")) {
      closeMobileMenu();
    }
  });

  // Close the mobile menu when the user clicks back into the page outside the dropdown.
  document.addEventListener("click", (event) => {
    if (mobileNav.hidden) {
      return;
    }

    const clickedElement = event.target;

    if (mobileNav.contains(clickedElement) || menuButton.contains(clickedElement)) {
      return;
    }

    closeMobileMenu();
  });

  // If the viewport grows past mobile size, close the menu because the burger disappears.
  mobileBreakpoint.addEventListener("change", (event) => {
    if (!event.matches) {
      closeMobileMenu({ immediate: true });
    }
  });

  // Any window resize can move the dropdown out of alignment, so close it and let the user reopen cleanly.
  window.addEventListener("resize", () => {
    if (!mobileNav.hidden) {
      closeMobileMenu({ immediate: !mobileBreakpoint.matches });
    }
  });

  resetMobileMenu();
}

// Demo form behavior: prevent a page reload and show a simple confirmation message.
document.querySelectorAll(".lead-form").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    // Each form can provide its own success message through a data attribute.
    const status = form.querySelector(".form-status");
    const message = form.dataset.successMessage || "Thanks. We will be in touch soon.";

    if (status) {
      status.textContent = message;
    }

    // Clear the fields after a successful mock submission.
    form.reset();
  });
});
