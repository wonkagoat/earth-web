const missionCards = document.querySelectorAll(".reveal");
const statusEl = document.getElementById("status");
const buttons = document.querySelectorAll(".mission-btn");
const guidePanelEl = document.getElementById("guide-panel");
const guideTitleEl = document.getElementById("guide-title");
const guideDescEl = document.getElementById("guide-desc");
const guideStepsEl = document.getElementById("guide-steps");
const locateBtnEl = document.getElementById("locate-btn");
const locateStatusEl = document.getElementById("locate-status");
const localReportEl = document.getElementById("local-report");
const reportTitleEl = document.getElementById("report-title");
const reportSummaryEl = document.getElementById("report-summary");
const reportPointsEl = document.getElementById("report-points");
const oceanLocalEl = document.getElementById("ocean-local");
const forestLocalEl = document.getElementById("forest-local");
const airLocalEl = document.getElementById("air-local");
const guideCards = document.querySelectorAll(".guide-card");

const guideCardMap = {
  ocean: "guide-ocean",
  forest: "guide-forest",
  air: "guide-air"
};

const missionGuides = {
  ocean: {
    title: "Ocean Guardian Guide",
    description: "A simple starter plan for protecting marine ecosystems in your area.",
    steps: [
      "Check your nearest beach or river cleanup event and book one date this month.",
      "Reduce single-use plastic for 7 days and track what items were easiest to replace.",
      "Follow one coral/ocean science account and save one weekly update."
    ]
  },
  forest: {
    title: "Forest Watch Guide",
    description: "Focus on measurable action to support tree cover and habitats.",
    steps: [
      "Map one green area near you and note signs of stress (trash, dry soil, dead branches).",
      "Join or support one local tree-planting or habitat restoration group.",
      "Switch one regular purchase to a certified sustainable wood/paper option."
    ]
  },
  air: {
    title: "City Air Lab Guide",
    description: "Use local air quality data to plan healthier and lower-emission routines.",
    steps: [
      "Check AQI morning and evening for one week and identify high-pollution hours.",
      "Move one weekly trip from car to transit, bike, or walking.",
      "Pick a low-emission action for home: filter maintenance, energy-saving schedule, or no-idle rule."
    ]
  }
};

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
      }
    });
  },
  { threshold: 0.2 }
);

missionCards.forEach((card) => revealObserver.observe(card));

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const missionKey = button.dataset.mission || "";
    const missionTitle = button.parentElement?.querySelector("h2")?.textContent || "Mission";
    statusEl.textContent = `${missionTitle} is now active. Good luck, Earth Agent.`;

    const guide = missionGuides[missionKey];
    if (!guide || !guideTitleEl || !guideDescEl || !guideStepsEl) return;

    guideTitleEl.textContent = guide.title;
    guideDescEl.textContent = guide.description;
    guideStepsEl.replaceChildren();
    guide.steps.forEach((step) => {
      const li = document.createElement("li");
      li.textContent = step;
      guideStepsEl.append(li);
    });

    guidePanelEl?.scrollIntoView({ behavior: "smooth", block: "start" });

    const targetId = guideCardMap[missionKey];
    const targetCard = targetId ? document.getElementById(targetId) : null;
    guideCards.forEach((card) => card.classList.remove("is-focus"));
    if (targetCard) {
      targetCard.classList.add("is-focus");
      targetCard.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });
});

const weatherCodeLabel = (code) => {
  const map = {
    0: "clear sky",
    1: "mostly clear",
    2: "partly cloudy",
    3: "overcast",
    45: "fog",
    48: "rime fog",
    51: "light drizzle",
    53: "drizzle",
    55: "dense drizzle",
    61: "light rain",
    63: "rain",
    65: "heavy rain",
    71: "light snow",
    73: "snow",
    75: "heavy snow",
    80: "rain showers",
    95: "thunderstorm"
  };
  return map[code] || "mixed conditions";
};

const setLocateStatus = (text) => {
  if (locateStatusEl) locateStatusEl.textContent = text;
};

const aqiBand = (aqi) => {
  if (aqi == null) return "unknown";
  if (aqi <= 50) return "good";
  if (aqi <= 100) return "moderate";
  if (aqi <= 150) return "unhealthy for sensitive groups";
  if (aqi <= 200) return "unhealthy";
  return "very unhealthy";
};

const updateGuideReports = (placeName, weather, air) => {
  const current = weather.current || {};
  const temp = current.temperature_2m;
  const wind = current.wind_speed_10m;
  const weatherText = weatherCodeLabel(current.weather_code);
  const aqi = air.current?.us_aqi;
  const pm25 = air.current?.pm2_5;
  const sunrise = weather.daily?.sunrise?.[0];
  const sunset = weather.daily?.sunset?.[0];

  if (oceanLocalEl) {
    const seaAction =
      wind != null && wind > 25
        ? "Higher wind today: prioritize shoreline trash sorting over water-edge activity."
        : "Calmer wind today: suitable for a beach or river-edge cleanup window.";
    oceanLocalEl.textContent = `${placeName}: ${weatherText}, ${temp}°C, wind ${wind} km/h. ${seaAction}`;
  }

  if (forestLocalEl) {
    forestLocalEl.textContent = `${placeName}: sunrise ${sunrise ? new Date(sunrise).toLocaleTimeString() : "n/a"}, sunset ${sunset ? new Date(sunset).toLocaleTimeString() : "n/a"}. Plan habitat walk during cooler daylight periods.`;
  }

  if (airLocalEl) {
    airLocalEl.textContent = `${placeName}: AQI ${aqi ?? "n/a"} (${aqiBand(aqi)}), PM2.5 ${pm25 ?? "n/a"} ug/m3. Use low-emission travel on higher AQI periods.`;
  }
};

const getPosition = () =>
  new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 120000
    });
  });

const buildReport = (placeName, lat, lon, weather, air) => {
  if (!reportSummaryEl || !reportPointsEl || !localReportEl || !reportTitleEl) return;

  const current = weather.current || {};
  const currentAir = air.current || {};
  const temp = current.temperature_2m;
  const feels = current.apparent_temperature;
  const wind = current.wind_speed_10m;
  const weatherText = weatherCodeLabel(current.weather_code);
  const pm25 = currentAir.pm2_5;
  const aqi = currentAir.us_aqi;
  const sunrise = weather.daily?.sunrise?.[0];
  const sunset = weather.daily?.sunset?.[0];

  reportTitleEl.textContent = `Local Earth Report: ${placeName}`;
  reportSummaryEl.textContent = `Coordinates ${lat.toFixed(3)}, ${lon.toFixed(3)}. Right now it is ${temp}°C (${weatherText}), feels like ${feels}°C.`;

  const points = [
    `Wind speed: ${wind} km/h.`,
    `Air quality estimate: PM2.5 ${pm25 ?? "n/a"} ug/m3, US AQI ${aqi ?? "n/a"}.`,
    `Sunrise: ${sunrise ? new Date(sunrise).toLocaleTimeString() : "n/a"}, Sunset: ${sunset ? new Date(sunset).toLocaleTimeString() : "n/a"}.`,
    "Guide action: choose the mission above that matches your local condition today."
  ];

  reportPointsEl.replaceChildren();
  points.forEach((point) => {
    const li = document.createElement("li");
    li.textContent = point;
    reportPointsEl.append(li);
  });

  localReportEl.hidden = false;
};

const fetchLocalReport = async () => {
  if (!locateBtnEl) return;
  if (!("geolocation" in navigator)) {
    setLocateStatus("Geolocation is not available in this browser.");
    return;
  }

  locateBtnEl.disabled = true;
  setLocateStatus("Requesting location permission...");

  try {
    const position = await getPosition();
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    setLocateStatus("Location found. Building your local report...");

    const placePromise = fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`
    ).then((res) => res.json());

    const weatherPromise = fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation&daily=sunrise,sunset&timezone=auto`
    ).then((res) => res.json());

    const airPromise = fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm2_5,us_aqi&timezone=auto`
    ).then((res) => res.json());

    const [placeData, weatherData, airData] = await Promise.all([placePromise, weatherPromise, airPromise]);
    const placeName = placeData?.address?.city || placeData?.address?.town || placeData?.address?.state || "your area";

    buildReport(placeName, lat, lon, weatherData, airData);
    updateGuideReports(placeName, weatherData, airData);
    setLocateStatus("Report ready. Data is based on your current location.");
  } catch (error) {
    setLocateStatus("Could not create report. Please allow location access and try again.");
  } finally {
    locateBtnEl.disabled = false;
  }
};

if (locateBtnEl) {
  locateBtnEl.addEventListener("click", fetchLocalReport);
}
