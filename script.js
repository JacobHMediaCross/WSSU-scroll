const menuButton = document.querySelector(".menu-toggle");
const mobileNav = document.querySelector(".mobile-nav");

const neonScrollSelectors = [
  ".desktop-nav a:not(.nav-contact)",
  ".mobile-nav a",
  ".program-finder h2",
  ".inquiry-copy h2",
  ".aid-band h2",
  ".power-section h2",
  ".power-points li",
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

// Neon text waits until it is meaningfully in view before doing its one-time flicker-on animation.
const neonTargets = document.querySelectorAll(neonScrollSelectors);

neonTargets.forEach((target) => {
  target.classList.add("neon-on-scroll");
});

if ("IntersectionObserver" in window) {
  const neonObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("neon-lit");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: "0px 0px -22% 0px",
      threshold: 0.25,
    },
  );

  neonTargets.forEach((target) => neonObserver.observe(target));
} else {
  // Older browsers still get the finished glow, just without the scroll-triggered timing.
  neonTargets.forEach((target) => {
    target.classList.add("neon-lit");
  });
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

  // If the viewport grows past mobile size, close the menu because the burger disappears.
  mobileBreakpoint.addEventListener("change", (event) => {
    if (!event.matches) {
      closeMobileMenu({ immediate: true });
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
