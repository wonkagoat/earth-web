const pageLoaderEl = document.getElementById("page-loader");
const loaderTextEl = document.getElementById("loader-text");
const journeyLinkEl = document.getElementById("journey-link");
const signupModalEl = document.getElementById("signup-modal");
const signupBurstEl = document.getElementById("signup-burst");
const closeSignupEl = document.getElementById("close-signup");
const signupFormEl = document.getElementById("signup-form");
const signupSuccessEl = document.getElementById("signup-success");
const signupCardEl = signupModalEl ? signupModalEl.querySelector(".modal-card") : null;
const reveals = document.querySelectorAll(".reveal");
const counters = document.querySelectorAll(".value");
const livePopulationEl = document.getElementById("live-population");
const livePopulationMetaEl = document.getElementById("live-pop-meta");
const liveDeathsEl = document.getElementById("live-deaths");
const liveDeathsMetaEl = document.getElementById("live-deaths-meta");
let firstScrollStarted = false;

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
      }
    });
  },
  { threshold: 0.18 }
);

reveals.forEach((el) => revealObserver.observe(el));

const animateValue = (el) => {
  const target = Number(el.dataset.target);
  const decimals = target % 1 !== 0 ? 1 : 0;
  const duration = 1400;
  let start = 0;
  const startTime = performance.now();

  const update = (now) => {
    const progress = Math.min((now - startTime) / duration, 1);
    start = target * (1 - Math.pow(1 - progress, 3));
    el.textContent = start.toFixed(decimals);
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  };

  requestAnimationFrame(update);
};

const counterObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateValue(entry.target);
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);

counters.forEach((counter) => counterObserver.observe(counter));

const formatNumber = (value) =>
  new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0
  }).format(value);

const updateLivePopulation = () => {
  if (!livePopulationEl) return;

  // Inputs from Worldometer 2026 table:
  // population = 8,300,678,395 on July 1, 2026
  // yearly change = 69,065,325
  const basePopulation = 8300678395;
  const baseDate = new Date("2026-07-01T00:00:00Z");
  const annualGrowth = 69065325;
  const perSecondGrowth = annualGrowth / (365.25 * 24 * 60 * 60);
  const secondsElapsed = (Date.now() - baseDate.getTime()) / 1000;
  const estimatedPopulation = basePopulation + secondsElapsed * perSecondGrowth;

  livePopulationEl.textContent = formatNumber(estimatedPopulation);

  if (livePopulationMetaEl) {
    const now = new Date();
    livePopulationMetaEl.textContent = `Estimated for ${now.toLocaleString()} (local time).`;
  }
};

const updateLiveDeaths = () => {
  if (!liveDeathsEl) return;

  // OWID (UN WPP) reports ~63 million deaths globally in 2025.
  // We pace a year-to-date estimate across the current calendar year.
  const annualDeaths = 63000000;
  const yearStart = new Date(new Date().getFullYear(), 0, 1);
  const nextYearStart = new Date(new Date().getFullYear() + 1, 0, 1);
  const yearDurationSeconds = (nextYearStart.getTime() - yearStart.getTime()) / 1000;
  const elapsedSeconds = Math.max(0, (Date.now() - yearStart.getTime()) / 1000);
  const estimatedDeaths = Math.min(annualDeaths, (elapsedSeconds / yearDurationSeconds) * annualDeaths);

  liveDeathsEl.textContent = formatNumber(estimatedDeaths);

  if (liveDeathsMetaEl) {
    liveDeathsMetaEl.textContent = `Year-to-date estimate for ${new Date().getFullYear()} using 2025 annual baseline.`;
  }
};

updateLivePopulation();
updateLiveDeaths();
setInterval(() => {
  updateLivePopulation();
  updateLiveDeaths();
}, 1000);

const hideLoader = () => {
  if (!pageLoaderEl) return;

  pageLoaderEl.classList.add("earth-focus");
  if (loaderTextEl) {
    loaderTextEl.textContent = "Focus locked: Earth.";
  }

  setTimeout(() => {
    pageLoaderEl.classList.add("is-hidden");
    setTimeout(() => {
      pageLoaderEl.remove();
    }, 650);
  }, 700);
};

window.addEventListener("load", () => {
  setTimeout(hideLoader, 300);
});

const triggerFirstScrollAnimation = () => {
  if (firstScrollStarted || window.scrollY < 18) return;
  firstScrollStarted = true;

  document.body.classList.add("first-scroll-animate");
  window.removeEventListener("scroll", triggerFirstScrollAnimation);

  setTimeout(() => {
    document.body.classList.remove("first-scroll-animate");
  }, 1200);
};

window.addEventListener("scroll", triggerFirstScrollAnimation, { passive: true });

const openSignupModal = () => {
  if (!signupModalEl) return;
  signupModalEl.classList.add("is-open");
  signupModalEl.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
};

const closeSignupModal = () => {
  if (!signupModalEl) return;
  signupModalEl.classList.remove("is-open");
  signupModalEl.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
};

if (journeyLinkEl) {
  journeyLinkEl.addEventListener("click", (event) => {
    event.preventDefault();
    openSignupModal();
  });
}

if (closeSignupEl) {
  closeSignupEl.addEventListener("click", (event) => {
    event.preventDefault();
    closeSignupModal();
  });
}

if (signupModalEl) {
  signupModalEl.addEventListener("click", (event) => {
    if (event.target === signupModalEl) {
      closeSignupModal();
    }
  });
}

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeSignupModal();
  }
});

if (signupFormEl && signupSuccessEl) {
  signupFormEl.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(signupFormEl);
    const name = String(formData.get("name") || "Explorer");
    const region = String(formData.get("region") || "Earth");

    signupSuccessEl.hidden = false;
    signupSuccessEl.classList.remove("is-live");
    void signupSuccessEl.offsetWidth;
    signupSuccessEl.classList.add("is-live");
    signupSuccessEl.textContent = `Welcome to Earth, ${name}. Your journey begins in ${region}.`;
    signupFormEl.reset();
    triggerJoinEffect();
  });
}

const triggerJoinEffect = () => {
  if (signupCardEl) {
    signupCardEl.classList.remove("joined");
    void signupCardEl.offsetWidth;
    signupCardEl.classList.add("joined");
  }

  if (!signupBurstEl) return;
  signupBurstEl.replaceChildren();

  for (let i = 0; i < 24; i += 1) {
    const bit = document.createElement("span");
    bit.className = "burst-bit";
    bit.style.setProperty("--hue", `${Math.floor(Math.random() * 360)}`);
    bit.style.setProperty("--dx", `${Math.round((Math.random() - 0.5) * 320)}px`);
    bit.style.setProperty("--dy", `${Math.round((Math.random() - 0.7) * 220)}px`);
    signupBurstEl.append(bit);
  }

  setTimeout(() => {
    signupBurstEl.replaceChildren();
  }, 1200);
};


