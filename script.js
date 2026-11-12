/* -------------------------------------------------------
   Interactive experience map + responsive navigation
-------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  const year = document.getElementById("currentYear");
  if (year) year.textContent = new Date().getFullYear();

  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");
  if (menuButton && nav) {
    menuButton.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
      menuButton.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
      menuButton.textContent = isOpen ? "×" : "☰";
    });
    nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
      nav.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.textContent = "☰";
    }));
  }

  initExperienceMap();
});

function initExperienceMap() {
  const mapElement = document.getElementById("experienceMap");
  if (!mapElement || typeof L === "undefined") {
    if (mapElement) mapElement.innerHTML = '<p style="padding:24px">The interactive map could not be loaded. Please check your internet connection.</p>';
    return;
  }

  const map = L.map(mapElement, { scrollWheelZoom: false, zoomControl: false });
  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: "abcd",
    maxZoom: 19
  }).addTo(map);
  L.control.zoom({ position: "bottomright" }).addTo(map);

  // Locations use city/campus-level coordinates, not precise office addresses.
  // Madrid has two separate professional experiences in the same popup.
  const places = [
    {
      name: "Dakar", coords: [14.7167, -17.4677], type: "work",
      entries: [{
        org: "Action Against Hunger", role: "Technical & Data Analyst — Food Security and Livelihoods",
        date: "August 2026 – Present",
        desc: "Geospatial data analysis, climate-hazard analysis and food-security / vulnerability information to support early warning and anticipatory action.",
        tags: ["Geospatial analysis", "Climate hazards", "Food security"],
        photo: "assets/images/senegal-fieldwork-laptop.jpg"
      }]
    },
    {
      name: "Kigali", coords: [-1.9441, 30.0619], type: "work",
      entries: [{
        org: "AVSI Foundation", role: "Junior MEAL Officer",
        date: "May 2025 – August 2026",
        desc: "Monitoring, evaluation, accountability and learning, including indicator development, surveys, activity mapping and feedback mechanisms.",
        tags: ["MEAL", "Indicator development", "QGIS"],
        photo: "assets/images/rwanda-community-walk.jpg"
      }]
    },
    {
      name: "Madrid", coords: [40.4168, -3.7038], type: "work",
      entries: [
        {
          org: "Action Against Hunger", role: "HR and Administration Assistant",
          date: "July 2024 – February 2025",
          desc: "Supported international recruitment, staff deployment and HR database management.",
          tags: ["International recruitment", "HR", "Administration"],
          photo: "assets/images/madrid-acf-office.jpg"
        },
        {
          org: "Action Against Hunger", role: "Food Security & Livelihoods Assistant",
          date: "February 2025 – June 2025",
          desc: "Contributed to drought-risk and soil-moisture analysis, beneficiary targeting and inclusion / exclusion analysis.",
          tags: ["Drought risk", "Soil moisture", "QGIS"],
          photo: "assets/images/senegal-fieldwork-laptop.jpg"
        }
      ]
    },
    {
      name: "Paris", coords: [48.8566, 2.3522], type: "work",
      entries: [{
        org: "JEDI — Joint European Disruptive Initiative", role: "Green Policy Analyst",
        date: "November 2022 – May 2023",
        desc: "Worked on green-policy research and spatial perspectives on food systems, agroecology and soil health.",
        tags: ["Green policy", "Food systems", "Spatial analysis"]
      }]
    },
    {
      name: "Aarhus", coords: [56.1689, 10.2026], type: "study",
      entries: [{
        org: "Aarhus University", role: "MSc Human Security",
        date: "September 2023 – June 2025",
        desc: "Graduate studies in human security at Aarhus University's main campus.",
        tags: ["Human security", "Master's degree"],
        link: "https://www.au.dk/en/"
      }]
    },
    {
      name: "Rome", coords: [41.9025, 12.5147], type: "study",
      entries: [{
        org: "Sapienza University of Rome", role: "BA Political Sciences and International Relations",
        date: "September 2019 – December 2022",
        desc: "Bachelor's degree, graduated 110/110 cum laude.",
        tags: ["Political science", "International relations"],
        link: "https://www.uniroma1.it/en"
      }]
    },
    {
      name: "Strasbourg", coords: [48.5838, 7.7664], type: "study",
      entries: [{
        org: "Sciences Po Strasbourg", role: "Erasmus+ Exchange Programme",
        date: "September 2020 – June 2021",
        desc: "Exchange programme at the university's Strasbourg campus.",
        tags: ["Erasmus+", "Political science"],
        link: "https://www.sciencespo-strasbourg.fr/"
      }]
    }
  ];

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[char]);
  }

  const bounds = [];
  places.forEach(place => {
    bounds.push(place.coords);
    const markerIcon = L.divIcon({
      className: "",
      html: `<div class="custom-marker ${place.type}"></div>`,
      iconSize: [19, 19],
      iconAnchor: [9, 9]
    });
    const marker = L.marker(place.coords, { icon: markerIcon }).addTo(map);
    const entryHTML = place.entries.map(entry => {
      const tags = (entry.tags || []).map(tag => `<span class="popup-tag">${escapeHTML(tag)}</span>`).join("");
      const photo = entry.photo ? `<img class="popup-photo" src="${escapeHTML(entry.photo)}" alt="" loading="lazy">` : "";
      const org = entry.link
        ? `<a href="${escapeHTML(entry.link)}" target="_blank" rel="noopener" class="popup-org">${escapeHTML(entry.org)} ↗</a>`
        : `<div class="popup-org">${escapeHTML(entry.org)}</div>`;
      return `<div class="popup-entry">
        ${org}
        <div class="popup-title">${escapeHTML(entry.role)}</div>
        <div class="popup-date">${escapeHTML(entry.date)}</div>
        <div class="popup-desc">${escapeHTML(entry.desc)}</div>
        ${tags}${photo}
      </div>`;
    }).join('<hr style="border:0;border-top:1px solid #e5e0d6;margin:12px 0">');
    marker.bindPopup(`<div class="popup-kicker">${place.type === "study" ? "Education" : "Professional experience"}</div>
      <h3 class="popup-title">${escapeHTML(place.name)}</h3>${entryHTML}`, { maxWidth: 300 });
  });

  map.fitBounds(bounds, { padding: [35, 35], maxZoom: 5 });
  map.on("click", () => map.scrollWheelZoom.enable());
  map.on("mouseout", () => map.scrollWheelZoom.disable());
  setTimeout(() => map.invalidateSize(), 250);
  window.addEventListener("resize", () => map.invalidateSize());
}