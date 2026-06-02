
const motionPath = document.querySelector("#js-motion-path");
const ramHead = document.querySelector("#js-path-ram");
const pathBullets = Array.from(document.querySelectorAll(".path-proof-bullet"));
const duration = 8000;
let animationStart = null;
let animationStarted = false;
let startCheckFrame = null;

const updateBulletLights = (progress) => {
  pathBullets.forEach((bullet) => {
    const lightProgress = Number(bullet.dataset.progress);

    bullet.classList.toggle("is-lit", progress >= lightProgress);
  });
};

const placeRamOnPath = (progress) => {
  const pathLength = motionPath.getTotalLength();
  const point = motionPath.getPointAtLength(pathLength * progress);

  ramHead.setAttribute("transform", `translate(${point.x} ${point.y})`);
  updateBulletLights(progress);
};

const animateRam = (timestamp) => {
  if (animationStart === null) {
    animationStart = timestamp;
  }

  const progress = Math.min((timestamp - animationStart) / duration, 1);

  placeRamOnPath(progress);

  if (progress < 1) {
    window.requestAnimationFrame(animateRam);
  }
};

const startRamAnimation = () => {
  if (animationStarted) {
    return;
  }

  animationStarted = true;
  animationStart = null;
  window.requestAnimationFrame(animateRam);
};

const checkRamAnimationStart = () => {
  if (animationStarted) {
    return;
  }

  const section = document.querySelector(".path-proof-section");

  if (!section) {
    return;
  }

  const sectionRect = section.getBoundingClientRect();
  const triggerPoint = window.innerHeight * 0.5;

  if (sectionRect.top <= triggerPoint && sectionRect.bottom >= triggerPoint) {
    startRamAnimation();
  }
};

const scheduleRamAnimationStartCheck = () => {
  if (startCheckFrame) {
    return;
  }

  startCheckFrame = window.requestAnimationFrame(() => {
    startCheckFrame = null;
    checkRamAnimationStart();
  });
};

if (motionPath && ramHead) {
  placeRamOnPath(0);
  window.addEventListener("scroll", scheduleRamAnimationStartCheck, { passive: true });
  window.addEventListener("resize", scheduleRamAnimationStartCheck);
  window.addEventListener("load", scheduleRamAnimationStartCheck);
  window.addEventListener("pageshow", scheduleRamAnimationStartCheck);
  window.requestAnimationFrame(checkRamAnimationStart);
}

