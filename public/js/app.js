/* ============================================================
   PEEKR · profildatabas — rendering och navigation
   ============================================================ */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/* ============================================================
   Språk / i18n
   ============================================================ */

// Startspråk: ett språkval besökaren redan gjort manuellt vinner
// alltid. Annars, om servern kunde slå upp landet via IP (se
// window.__GEO_COUNTRY__, satt i server.js) och det inte är Sverige,
// startar sajten på engelska. Går geo-uppslaget inte (lokal
// utveckling, misslyckat anrop) faller den tillbaka på svenska.
function detectInitialLang() {
  const stored = localStorage.getItem("scs_lang");
  if (stored === "en" || stored === "sv") return stored;
  const country = window.__GEO_COUNTRY__;
  if (country && country !== "SE") return "en";
  return "sv";
}

let currentLang = detectInitialLang();

const STRINGS = {
  sv: {
    title: "Peekr — Profiler över svenska spelare",
    meta_description: "Profildatabas över svenska CS2-spelare. Fakta, karriärer och statistik.",
    tagline: "Spelarprofiler",
    nav_home: "Start", nav_players: "Spelare", nav_news: "Nyheter", nav_about: "Om oss",
    home_rank_label: "Sverigerankningen",
    home_rank_h2: "Sveriges bästa spelare just nu",
    home_rank_p: "Svenska spelare rankade av redaktionen — från den internationella toppen till den inhemska scenen. Klicka på en spelare för hela profilen.",
    home_rank_link: "Alla spelare →",
    home_news_label: "Nyheter",
    home_news_h2: "Senaste om spelarna",
    home_news_link: "Alla nyheter →",
    tab_all: "Alla", tag_transfers: "Lagbyten", tag_talents: "Talanger", tag_swedishcs: "Svensk CS",
    news_empty: "Inga nyheter i den kategorin ännu.",
    players_h1: "Spelare",
    players_p: "Sveriges 504 rankade CS2-spelare. Klicka på en spelare för hela profilen.",
    players_search_ph: "Sök på spelare, riktigt namn eller klubb...",
    th_rank: "#", th_player: "Spelare", th_team: "Lag", th_age: "Ålder", th_kd: "K/D",
    players_footnote: "Statistik saknas för vissa spelare.",
    players_focus_label: "Just nu",
    players_focus_h2: "I fokus",
    players_empty: "Inga spelare matchar sökningen.",
    news_h1: "Nyheter",
    news_p: "Verifierade händelser kring spelarna i svensk CS2.",
    about_h1: "Om oss",
    about_p: "Peekr är en profildatabas som samlar svenska Counter-Strike-spelare på ett ställe.",
    about_players_h3: "Spelarna i centrum",
    about_players_p: "Varje spelare har en egen profil med fakta, karriär och statistik. Vi följer svenskarna oavsett var de spelar — från Brollan i MOUZ och REZ i GamerLegion till namnen längre ner på rankningen.",
    about_sources_h3: "Källor",
    about_sources_p: "Rankningen, statistiken, sociala länkar och spelarnas setup är hämtade från flera publika källor och stäms löpande av. Fält som saknas visas som \"Uppgift saknas\" — inget är påhittat.",
    about_contact_h3: "Kontakt",
    about_contact_p: "Har du en rättelse eller ett tips om en spelare vi saknar? Hör av dig.<br>E-post: red@peekr.se<br>Sajten är inte ansluten till Valve Corporation eller någon av de omnämnda klubbarna.",
    footer_brand_p: "Profildatabas över spelarna i svensk Counter-Strike 2 — karriärer och statistik.",
    footer_players_h3: "Spelare", footer_all_players: "Alla spelare",
    footer_about_h3: "Om",
    footer_legal_h3: "Juridiskt", footer_terms: "Användarvillkor", footer_privacy: "Integritetspolicy", footer_cookies: "Cookies",
    footer_copyright: "© 2026 Peekr. Alla rättigheter förbehållna.",
    footer_disclaimer: "Sajten är inte ansluten till Valve Corporation. Counter-Strike är ett varumärke som tillhör Valve.",
    fact_fullname: "Fullständigt namn", fact_age: "Ålder", fact_nationality: "Nationalitet", country_sweden: "Sverige",
    fact_role: "Roll", fact_team: "Lag", fact_ranking: "Ranking",
    in_sweden_ranking: (n) => `#${n} i Sverigerankningen`,
    unknown: "Uppgift saknas",
    free_agent: "Fri agent",
    age_suffix: " år",
    fakta_h2: "Fakta",
    stats_h2: "Statistik",
    stats_empty: "Ingen statistik publicerad för den här spelaren ännu.",
    setup_h2: "Setup & inställningar",
    career_h2: "Karriär",
    highlight_h2: "Senaste höjdpunkt",
    crosshair_label: "Crosshairkod",
    gear_mouse: "Mus", gear_keyboard: "Tangentbord", gear_headset: "Headset", gear_monitor: "Skärm",
    stat_ranking: "Ranking", stat_kd: "K/D", stat_adr: "ADR", stat_hs: "HS",
    stat_dpi: "DPI", stat_sens: "Sensitivity", stat_edpi: "eDPI", stat_res: "Upplösning",
    in_sweden_badge: "i Sverige",
    back: "← Tillbaka",
    steam_login_pre: "Logga in via",
    steam_logged_in_via: "Inloggad via Steam",
    steam_your_profile: "Din Steam-profil",
    steam_logout: "Logga ut",
    steam_err_avbruten: "Inloggningen med Steam avbröts.",
    steam_err_misslyckades: "Steam kunde inte verifiera inloggningen. Försök igen.",
    steam_err_fel: "Något gick fel vid inloggningen med Steam. Försök igen.",
    close: "Stäng",
    steam_profile_label: "Steam-profil"
  },
  en: {
    title: "Peekr — Profiles of Swedish players",
    meta_description: "Profile database for Swedish CS2 players. Facts, careers and stats.",
    tagline: "Player Profiles",
    nav_home: "Home", nav_players: "Players", nav_news: "News", nav_about: "About",
    home_rank_label: "Swedish Ranking",
    home_rank_h2: "Sweden's best players right now",
    home_rank_p: "Swedish players ranked by the editorial team — from the international top tier to the domestic scene. Click a player for the full profile.",
    home_rank_link: "All players →",
    home_news_label: "News",
    home_news_h2: "Latest on the players",
    home_news_link: "All news →",
    tab_all: "All", tag_transfers: "Transfers", tag_talents: "Talents", tag_swedishcs: "Swedish CS",
    news_empty: "No news in that category yet.",
    players_h1: "Players",
    players_p: "Sweden's 504 ranked CS2 players. Click a player for the full profile.",
    players_search_ph: "Search by player, real name or club...",
    th_rank: "#", th_player: "Player", th_team: "Team", th_age: "Age", th_kd: "K/D",
    players_footnote: "Stats are missing for some players.",
    players_focus_label: "Right now",
    players_focus_h2: "In focus",
    players_empty: "No players match your search.",
    news_h1: "News",
    news_p: "Verified events around the players in Swedish CS2.",
    about_h1: "About us",
    about_p: "Peekr is a profile database bringing together Swedish Counter-Strike players in one place.",
    about_players_h3: "Players first",
    about_players_p: "Every player has their own profile with facts, career and stats. We follow Swedes wherever they play — from Brollan at MOUZ and REZ at GamerLegion to the names further down the ranking.",
    about_sources_h3: "Sources",
    about_sources_p: "The ranking, stats, social links and player setups are pulled from several public sources and checked on an ongoing basis. Missing fields show as \"Not available\" — nothing is made up.",
    about_contact_h3: "Contact",
    about_contact_p: "Spotted an error, or a player we're missing? Get in touch.<br>Email: red@peekr.se<br>This site is not affiliated with Valve Corporation or any of the clubs mentioned.",
    footer_brand_p: "Profile database for the players of Swedish Counter-Strike 2 — careers and stats.",
    footer_players_h3: "Players", footer_all_players: "All players",
    footer_about_h3: "About",
    footer_legal_h3: "Legal", footer_terms: "Terms of use", footer_privacy: "Privacy policy", footer_cookies: "Cookies",
    footer_copyright: "© 2026 Peekr. All rights reserved.",
    footer_disclaimer: "This site is not affiliated with Valve Corporation. Counter-Strike is a trademark of Valve.",
    fact_fullname: "Full name", fact_age: "Age", fact_nationality: "Nationality", country_sweden: "Sweden",
    fact_role: "Role", fact_team: "Team", fact_ranking: "Ranking",
    in_sweden_ranking: (n) => `#${n} in the Swedish Ranking`,
    unknown: "Not available",
    free_agent: "Free agent",
    age_suffix: " yrs",
    fakta_h2: "Facts",
    stats_h2: "Statistics",
    stats_empty: "No stats published for this player yet.",
    setup_h2: "Setup & settings",
    career_h2: "Career",
    highlight_h2: "Recent highlight",
    crosshair_label: "Crosshair code",
    gear_mouse: "Mouse", gear_keyboard: "Keyboard", gear_headset: "Headset", gear_monitor: "Monitor",
    stat_ranking: "Ranking", stat_kd: "K/D", stat_adr: "ADR", stat_hs: "HS",
    stat_dpi: "DPI", stat_sens: "Sensitivity", stat_edpi: "eDPI", stat_res: "Resolution",
    in_sweden_badge: "in Sweden",
    back: "← Back",
    steam_login_pre: "Sign in via",
    steam_logged_in_via: "Signed in via Steam",
    steam_your_profile: "Your Steam profile",
    steam_logout: "Log out",
    steam_err_avbruten: "Steam sign-in was cancelled.",
    steam_err_misslyckades: "Steam couldn't verify the sign-in. Please try again.",
    steam_err_fel: "Something went wrong signing in with Steam. Please try again.",
    close: "Close",
    steam_profile_label: "Steam profile"
  }
};

function t(key, ...args) {
  const entry = STRINGS[currentLang][key];
  return typeof entry === "function" ? entry(...args) : entry;
}

// Väljer engelsk variant av ett datafält (t.ex. "bio" → "bio_en") om
// den finns och engelska är valt, annars faller den tillbaka på
// originalfältet (svenska).
function tr(obj, field) {
  if (!obj) return null;
  if (currentLang === "en" && obj[field + "_en"]) return obj[field + "_en"];
  return obj[field];
}

function applyStaticText() {
  document.documentElement.lang = currentLang;
  $$("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n); });
  $$("[data-i18n-html]").forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
  $$("[data-i18n-placeholder]").forEach(el => { el.placeholder = t(el.dataset.i18nPlaceholder); });
  const metaDesc = $('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute("content", t("meta_description"));
  $$("#lang-switch button").forEach(b => b.classList.toggle("is-active", b.dataset.lang === currentLang));
}

/* ---------- Hjälpare ---------- */

function byNick(nick) { return PLAYERS.find(p => p.nick === nick); }

function teamLabel(p) { return p.team || t("free_agent"); }
function nameLabel(p) { return p.name || t("unknown"); }
function ageLabel(p) { return p.age !== null ? p.age + t("age_suffix") : t("unknown"); }
function statLabel(v, suffix = "") { return v !== null && v !== undefined ? sv(v, suffix ? 0 : 2) + suffix : "–"; }

// Spelaravatar: foto om det finns, annars initialer.
function ava(p, size = 34) {
  const initials = p.nick.replace(/[^a-zA-Z0-9åäöÅÄÖ]/g, "").slice(0, 2).toUpperCase();
  const img = p.photo
    ? `<img src="${p.photo}" alt="${p.nick}" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">`
    : "";
  return `<span class="p-ava" style="width:${size}px;height:${size}px"><i>${initials}</i>${img}</span>`;
}

function sv(num, decimals = 2) {
  return currentLang === "sv" ? num.toFixed(decimals).replace(".", ",") : num.toFixed(decimals);
}

// Upplösningssträngar innehåller ibland ordet "sträckt" (t.ex. "1280x960
// (4:3, sträckt)") — byts ut mot "stretched" på engelska.
function resLabel(res) {
  return currentLang === "en" ? res.replace("sträckt", "stretched") : res;
}

// Officiella ikonglyfer, källa: Simple Icons / Font Awesome (samma
// exakta form som respektive varumärkes egen logotyp).
const SOCIAL_ICONS = {
  twitter: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z"/></svg>`,
  twitch: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/></svg>`,
  instagram: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077"/></svg>`,
  youtube: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
  steam: `<svg viewBox="0 0 448 512" fill="currentColor" aria-hidden="true"><path d="M395.5 177.5c0 33.8-27.5 61-61 61-33.8 0-61-27.3-61-61s27.3-61 61-61c33.5 0 61 27.2 61 61zm52.5.2c0 63-51 113.8-113.7 113.8L225 371.3c-4 43-40.5 76.8-84.5 76.8-40.5 0-74.7-28.8-83-67L0 358V250.7L97.2 290c15.1-9.2 32.2-13.3 52-11.5l71-101.7c.5-62.3 51.5-112.8 114-112.8C397 64 448 115 448 177.7zM203 363c0-34.7-27.8-62.5-62.5-62.5-4.5 0-9 .5-13.5 1.5l26 10.5c25.5 10.2 38 39 27.7 64.5-10.2 25.5-39.2 38-64.7 27.5-10.2-4-20.5-8.3-30.7-12.2 10.5 19.7 31.2 33.2 55.2 33.2 34.7 0 62.5-27.8 62.5-62.5zm207.5-185.3c0-42-34.3-76.2-76.2-76.2-42.3 0-76.5 34.2-76.5 76.2 0 42.2 34.3 76.2 76.5 76.2 41.9.1 76.2-33.9 76.2-76.2z"/></svg>`,
  tiktok: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>`
};
function socialLabels() {
  return { twitter: "X / Twitter", twitch: "Twitch", instagram: "Instagram", youtube: "YouTube", tiktok: "TikTok", steam: t("steam_profile_label") };
}

function socialLinks(p) {
  if (!p.socials) return "";
  const labels = socialLabels();
  const items = Object.keys(labels)
    .filter(key => p.socials[key])
    .map(key => `
      <a class="social-link" href="${p.socials[key]}" target="_blank" rel="noopener" title="${labels[key]}" aria-label="${labels[key]}">
        ${SOCIAL_ICONS[key]}
      </a>`).join("");
  return items ? `<div class="social-links">${items}</div>` : "";
}

/* ---------- Sverigerankningen (start) ---------- */

function renderHomePlayers() {
  $("#home-players").innerHTML = PLAYERS.slice(0, 5).map(p => `
    <li>
      <a class="rankrow" href="#" data-profile="${p.nick}">
        <span class="rankrow__pos">${p.rank}</span>
        ${ava(p, 44)}
        <span>
          <div class="rankrow__nick">${p.nick}</div>
          <div class="rankrow__sub">${nameLabel(p)} · ${teamLabel(p)}</div>
        </span>
        <span class="rankrow__rating">${statLabel(p.kd)}<span>K/D</span></span>
      </a>
    </li>`).join("");
}

/* ---------- Nyheter ---------- */

let newsTag = "alla";

function newsTagLabel(tag) {
  const map = { "Lagbyten": "tag_transfers", "Talanger": "tag_talents", "Svensk CS": "tag_swedishcs" };
  return map[tag] ? t(map[tag]) : tag;
}

function renderHomeNews() {
  const list = newsTag === "alla" ? NEWS : NEWS.filter(n => n.tag === newsTag);
  $("#home-news").innerHTML = list.slice(0, 6).map(n => `
    <a class="newscard" href="#" data-nav="nyheter">
      <span class="label newscard__tag">${newsTagLabel(n.tag)}</span>
      <h3 class="newscard__title">${tr(n, "title")}</h3>
      <p class="newscard__excerpt">${tr(n, "excerpt")}</p>
      <div class="newscard__meta">${n.date}</div>
    </a>`).join("") || `<div class="empty-note">${t("news_empty")}</div>`;
}

function renderNewsFull() {
  $("#news-full").innerHTML = NEWS.map(n => `
    <a class="newsitem" href="#">
      <span class="label newsitem__tag">${newsTagLabel(n.tag)}</span>
      <h2 class="newsitem__title">${tr(n, "title")}</h2>
      <p class="newsitem__excerpt">${tr(n, "excerpt")}</p>
      <div class="newsitem__meta">${n.date}</div>
    </a>`).join("");
}

/* ---------- Spelare: lista (sök, hela 100-listan) ---------- */

let playerQuery = "";

function renderPlayersFull() {
  let list = PLAYERS;
  if (playerQuery) {
    const q = playerQuery.toLowerCase();
    list = list.filter(p =>
      p.nick.toLowerCase().includes(q) ||
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.team && p.team.toLowerCase().includes(q)));
  }

  $("#players-full").innerHTML = list.length ? list.map(p => `
    <tr data-profile="${p.nick}" style="cursor:pointer">
      <td class="dim">${p.rank}</td>
      <td class="ta-l">
        <span class="player">${ava(p, 40)}
          <span>${p.nick}<small>${nameLabel(p)}</small></span>
        </span>
      </td>
      <td class="ta-l">${teamLabel(p)}</td>
      <td class="hide-mobile">${ageLabel(p)}</td>
      <td class="score">${statLabel(p.kd)}</td>
    </tr>`).join("")
    : `<tr><td colspan="5" class="empty-note">${t("players_empty")}</td></tr>`;
}

/* ---------- I fokus ---------- */

function renderFocus() {
  $("#in-focus").innerHTML = FIVE_FOCUS.map(f => {
    const p = byNick(f.nick);
    return `
      <a class="focusitem" href="#" data-profile="${p.nick}">
        ${ava(p, 44)}
        <div>
          <div class="focusitem__nick">${f.nick} <span>· #${p.rank} · ${teamLabel(p)}</span></div>
          <div class="focusitem__fact">${tr(f, "fact")}</div>
        </div>
      </a>`;
  }).join("");
}

/* ---------- Profil ---------- */

let profileReturn = "spelare";
let currentProfileNick = null;

function renderProfile(nick) {
  const p = byNick(nick);
  if (!p) return;

  const facts = [
    [t("fact_fullname"), nameLabel(p)],
    [t("fact_age"), ageLabel(p)],
    [t("fact_nationality"), t("country_sweden")],
    [t("fact_role"), p.role || t("unknown")],
    [t("fact_team"), teamLabel(p)],
    [t("fact_ranking"), t("in_sweden_ranking", p.rank)]
  ];

  const hasStats = p.hs !== null || p.adr !== null || p.kd !== null;
  const statBlock = hasStats ? `
    <div class="section-head" style="margin-top:44px">
      <div><h2>${t("stats_h2")}</h2></div>
    </div>
    <div class="statgrid">
      <div class="stat"><strong>#${p.rank}</strong><span>${t("stat_ranking")}</span></div>
      <div class="stat"><strong>${statLabel(p.kd)}</strong><span>${t("stat_kd")}</span></div>
      <div class="stat"><strong>${p.adr !== null ? sv(p.adr, 1) : "–"}</strong><span>${t("stat_adr")}</span></div>
      <div class="stat"><strong>${p.hs !== null ? p.hs + " %" : "–"}</strong><span>${t("stat_hs")}</span></div>
    </div>` : `
    <div class="section-head" style="margin-top:44px">
      <div><h2>${t("stats_h2")}</h2></div>
    </div>
    <p class="footnote">${t("stats_empty")}</p>`;

  const careerBlock = p.career ? `
    <div class="section-head" style="margin-top:44px">
      <div><h2>${t("career_h2")}</h2></div>
    </div>
    <div style="max-width:720px">
      ${p.career.map(c => `
        <div class="dateline">
          <span class="dateline__date">${tr(c, "date")}</span>
          <span>${tr(c, "event")}</span>
        </div>`).join("")}
    </div>` : "";

  const highlightBlock = p.highlight ? `
    <div class="section-head" style="margin-top:44px">
      <div><h2>${t("highlight_h2")}</h2></div>
    </div>
    <video class="video-embed" style="aspect-ratio:${p.highlight.aspectRatio || "16 / 9"}"
      src="${p.highlight.video}" controls playsinline preload="metadata"
      title="${p.highlight.title || ""}"></video>` : "";

  const setupBlock = p.setup ? `
    <div class="section-head" style="margin-top:44px">
      <div><h2>${t("setup_h2")}</h2></div>
    </div>
    <div class="statgrid">
      ${p.setup.dpi !== undefined ? `<div class="stat"><strong>${p.setup.dpi}</strong><span>${t("stat_dpi")}</span></div>` : ""}
      ${p.setup.sens !== undefined ? `<div class="stat"><strong>${sv(p.setup.sens)}</strong><span>${t("stat_sens")}</span></div>` : ""}
      ${p.setup.edpi !== undefined ? `<div class="stat"><strong>${p.setup.edpi}</strong><span>${t("stat_edpi")}</span></div>` : ""}
      ${p.setup.res ? `<div class="stat"><strong style="font-size:16px">${resLabel(p.setup.res)}</strong><span>${t("stat_res")}</span></div>` : ""}
    </div>
    ${p.setup.crosshair ? `
      <div class="crosshair-code">
        <span class="crosshair-code__label">${t("crosshair_label")}</span>
        <code>${p.setup.crosshair}</code>
      </div>` : ""}
    <div class="gearlist">
      ${p.setup.mouse ? `<div class="gearlist__item"><span class="fact__label">${t("gear_mouse")}</span><span>${p.setup.mouse}</span></div>` : ""}
      ${p.setup.keyboard ? `<div class="gearlist__item"><span class="fact__label">${t("gear_keyboard")}</span><span>${p.setup.keyboard}</span></div>` : ""}
      ${p.setup.headset ? `<div class="gearlist__item"><span class="fact__label">${t("gear_headset")}</span><span>${p.setup.headset}</span></div>` : ""}
      ${p.setup.monitor ? `<div class="gearlist__item"><span class="fact__label">${t("gear_monitor")}</span><span>${p.setup.monitor}</span></div>` : ""}
    </div>` : "";

  $("#profile-view").innerHTML = `
    <div class="profile-back">
      <a href="#" class="more" data-nav="${profileReturn}">${t("back")}</a>
    </div>
    <div class="profile-head">
      ${ava(p, 132)}
      <div>
        <h1 class="profile-head__nick">${p.nick}</h1>
        <p class="profile-head__sub">${nameLabel(p)}</p>
        ${socialLinks(p)}
      </div>
      <div class="profile-head__rank"><strong>#${p.rank}</strong><span>${t("in_sweden_badge")}</span></div>
    </div>

    ${p.bio ? `<p class="profile-bio">${tr(p, "bio")}</p>` : ""}

    ${highlightBlock}

    <div class="section-head" style="margin-top:${p.bio ? "40" : "26"}px">
      <div><h2>${t("fakta_h2")}</h2></div>
    </div>
    <div class="facts">
      ${facts.map(f => `
        <div class="fact">
          <span class="fact__label">${f[0]}</span>
          <span class="fact__value ${f[1] === t("unknown") ? "is-missing" : ""}">${f[1]}</span>
        </div>`).join("")}
    </div>

    ${statBlock}
    ${setupBlock}
    ${careerBlock}`;
}

function showProfile(nick) {
  const current = $(".view.is-visible");
  if (current && current.dataset.view !== "profil") {
    profileReturn = current.dataset.view;
  }
  currentProfileNick = nick;
  renderProfile(nick);
  activateView("profil");
  const path = "/" + encodeURIComponent(nick);
  if (location.pathname !== path) history.pushState({ profile: nick }, "", path);
}

/* ---------- Steam-inloggning ---------- */

// Officiell Steam-symbol (rör/skiftnyckel-glyfen), källa: Font Awesome
// steam-symbol, viewBox 448x512 — samma form som den riktiga ikonen.
const STEAM_ICON = `<svg width="21" height="24" viewBox="0 0 448 512" fill="#dfdcda" aria-hidden="true">
  <path d="M395.5 177.5c0 33.8-27.5 61-61 61-33.8 0-61-27.3-61-61s27.3-61 61-61c33.5 0 61 27.2 61 61zm52.5.2c0 63-51 113.8-113.7 113.8L225 371.3c-4 43-40.5 76.8-84.5 76.8-40.5 0-74.7-28.8-83-67L0 358V250.7L97.2 290c15.1-9.2 32.2-13.3 52-11.5l71-101.7c.5-62.3 51.5-112.8 114-112.8C397 64 448 115 448 177.7zM203 363c0-34.7-27.8-62.5-62.5-62.5-4.5 0-9 .5-13.5 1.5l26 10.5c25.5 10.2 38 39 27.7 64.5-10.2 25.5-39.2 38-64.7 27.5-10.2-4-20.5-8.3-30.7-12.2 10.5 19.7 31.2 33.2 55.2 33.2 34.7 0 62.5-27.8 62.5-62.5zm207.5-185.3c0-42-34.3-76.2-76.2-76.2-42.3 0-76.5 34.2-76.5 76.2 0 42.2 34.3 76.2 76.5 76.2 41.9.1 76.2-33.9 76.2-76.2z"/>
</svg>`;

let currentUser = null;

function renderAuthArea(user) {
  currentUser = user && user.loggedIn ? user : null;
  const el = $("#auth-area");
  if (!el) return;

  if (!currentUser) {
    el.innerHTML = `
      <a class="steam-btn" href="/auth/steam">
        ${STEAM_ICON}
        <span class="steam-btn__text">
          <span class="steam-btn__pre">${t("steam_login_pre")}</span>
          <span class="steam-btn__brand">STEAM</span>
        </span>
      </a>`;
    return;
  }

  const avatar = currentUser.avatar
    ? `<img class="user-badge__avatar" src="${currentUser.avatar}" alt="${currentUser.personaname}" referrerpolicy="no-referrer">`
    : `<span class="user-badge__avatar"></span>`;

  el.innerHTML = `
    <div class="user-badge" id="user-badge">
      <button class="user-badge__trigger" type="button" aria-haspopup="true" aria-expanded="false">
        ${avatar}
        <span class="user-badge__name">${currentUser.personaname}</span>
      </button>
      <div class="user-badge__menu">
        <div class="user-badge__menu-head">${t("steam_logged_in_via")}</div>
        <a href="${currentUser.profileurl}" target="_blank" rel="noopener">${t("steam_your_profile")}</a>
        <a href="/auth/logout">${t("steam_logout")}</a>
      </div>
    </div>`;
}

async function loadAuthStatus() {
  try {
    const res = await fetch("/api/me");
    const user = await res.json();
    renderAuthArea(user);
  } catch {
    // Servern har ingen /api/me (t.ex. statisk fillyssning) — visa inloggningsknappen ändå.
    renderAuthArea(null);
  }
}

let pendingSteamStatus = null;

function showSteamLoginNotice() {
  const params = new URLSearchParams(location.search);
  const status = params.get("steamlogin");
  if (!status) return;
  pendingSteamStatus = status;
  renderSteamNotice();

  params.delete("steamlogin");
  const rest = params.toString();
  history.replaceState({}, "", location.pathname + (rest ? "?" + rest : ""));
}

function renderSteamNotice() {
  if (!pendingSteamStatus) return;
  const existing = $(".steamlogin-notice");
  if (existing) existing.remove();

  const key = "steam_err_" + pendingSteamStatus;
  const text = STRINGS[currentLang][key] || t("steam_err_fel");

  const bar = document.createElement("div");
  bar.className = "steamlogin-notice";
  bar.innerHTML = `<div class="container"><span>${text}</span><button type="button">${t("close")}</button></div>`;
  document.body.insertBefore(bar, document.body.firstChild);
  bar.querySelector("button").addEventListener("click", () => { pendingSteamStatus = null; bar.remove(); });
}

/* ---------- Navigation & interaktion ---------- */

// DOM-bytet i sig — ingen historik/URL-hantering. Används både av
// vanlig klick-navigering och av popstate (bakåt/framåt-knappen),
// som inte ska trigga en ny pushState.
function activateView(name) {
  $$(".view").forEach(v => v.classList.toggle("is-visible", v.dataset.view === name));
  $$(".nav__link").forEach(l => l.classList.toggle("is-active", l.dataset.nav === name));
  window.scrollTo({ top: 0 });
}

// Varje flik har en egen länkbar adress. Sökvägarna är reserverade —
// en spelare vars smeknamn krockar med dem nås via /spelare-listan.
const VIEW_ROUTES = { hem: "/", spelare: "/spelare", nyheter: "/nyheter", omligan: "/om" };

function showView(name) {
  activateView(name);
  const path = VIEW_ROUTES[name] || "/";
  if (location.pathname !== path) history.pushState({ view: name }, "", path);
}

// Varje spelare har en egen länkbar sida: /<smeknamn>. Matchning är
// skiftlägesokänslig så en URL skriven för hand (t.ex. /rez) ändå
// hittar rätt spelare (REZ).
function playerFromPath(pathname) {
  const raw = pathname.replace(/^\/+/, "");
  if (!raw) return null;
  let slug;
  try { slug = decodeURIComponent(raw); } catch { slug = raw; }
  return PLAYERS.find(p => p.nick.toLowerCase() === slug.toLowerCase()) || null;
}

function routeFromLocation() {
  const path = location.pathname.replace(/\/+$/, "") || "/";
  const viewEntry = Object.entries(VIEW_ROUTES).find(([, route]) => route === path);
  if (viewEntry) {
    activateView(viewEntry[0]);
    return;
  }
  const p = playerFromPath(path);
  if (p) {
    currentProfileNick = p.nick;
    renderProfile(p.nick);
    activateView("profil");
  } else {
    activateView("hem");
  }
}

window.addEventListener("popstate", routeFromLocation);

function setLanguage(lang) {
  if (lang !== "sv" && lang !== "en") return;
  currentLang = lang;
  localStorage.setItem("scs_lang", lang);
  applyStaticText();
  renderHomePlayers();
  renderHomeNews();
  renderNewsFull();
  renderPlayersFull();
  renderFocus();
  renderAuthArea(currentUser);
  renderSteamNotice();
  if (currentProfileNick && $('.view[data-view="profil"]').classList.contains("is-visible")) {
    renderProfile(currentProfileNick);
  }
}

document.addEventListener("click", (e) => {
  const langBtn = e.target.closest("#lang-switch button");
  if (langBtn) {
    setLanguage(langBtn.dataset.lang);
    return;
  }

  const badgeTrigger = e.target.closest(".user-badge__trigger");
  if (badgeTrigger) {
    const badge = badgeTrigger.closest(".user-badge");
    const wasOpen = badge.classList.contains("is-open");
    $$(".user-badge.is-open").forEach(b => b.classList.remove("is-open"));
    if (!wasOpen) {
      badge.classList.add("is-open");
      badgeTrigger.setAttribute("aria-expanded", "true");
    }
    return;
  }
  if (!e.target.closest(".user-badge__menu")) {
    $$(".user-badge.is-open").forEach(b => {
      b.classList.remove("is-open");
      b.querySelector(".user-badge__trigger").setAttribute("aria-expanded", "false");
    });
  }

  const profileLink = e.target.closest("[data-profile]");
  if (profileLink) {
    e.preventDefault();
    showProfile(profileLink.dataset.profile);
    return;
  }

  const link = e.target.closest("[data-nav]");
  if (link) {
    if (link.tagName === "A") e.preventDefault();
    showView(link.dataset.nav);
    return;
  }

  const newsTab = e.target.closest("#news-filter button");
  if (newsTab) {
    $$("#news-filter button").forEach(b => b.classList.toggle("is-active", b === newsTab));
    newsTag = newsTab.dataset.tag;
    renderHomeNews();
  }
});

document.addEventListener("input", (e) => {
  if (e.target.id === "player-search") {
    playerQuery = e.target.value.trim();
    renderPlayersFull();
  }
});

/* ---------- Init ---------- */

applyStaticText();
renderHomePlayers();
renderHomeNews();
renderNewsFull();
renderPlayersFull();
renderFocus();
renderAuthArea(null);
loadAuthStatus();
showSteamLoginNotice();
routeFromLocation();
