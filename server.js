/* ============================================================
   Peekr — server med Steam-inloggning (OpenID 2.0)
   ============================================================
   Steams inloggning använder OpenID 2.0, inte OAuth — det finns
   ingen "registrerad app"/domänbegränsning, vilket gör att detta
   fungerar direkt mot localhost. Flödet:

   1. GET /auth/steam            → skickar användaren till Steam
   2. Steam skickar tillbaka användaren till /auth/steam/return
   3. Servern verifierar svaret genom att posta tillbaka det till
      Steam (check_authentication) — det här steget MÅSTE ske
      server-side, annars kan vem som helst förfalska ett svar.
   4. Om STEAM_API_KEY är satt hämtas profilnamn + avatar via
      Steams Web API. Utan nyckel loggas användaren ändå in, men
      bara med sitt SteamID64 som namn.

   Skaffa en gratis nyckel: https://steamcommunity.com/dev/apikey
   Lägg den i en .env-fil (STEAM_API_KEY=din-nyckel) i projektroten,
   eller sätt den som miljövariabel. .env läses in automatiskt nedan
   och ligger i .gitignore — nyckeln checkas alltså aldrig in.
   ============================================================ */

const express = require("express");
const session = require("express-session");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

// Minimal .env-inläsning (ingen extra dependency behövs för detta).
const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = (match[2] || "").trim();
    }
  }
}

const PORT = process.env.PORT || 8741;
const STEAM_API_KEY = process.env.STEAM_API_KEY || "";
const STEAM_OPENID_ENDPOINT = "https://steamcommunity.com/openid/login";

const app = express();
app.set("trust proxy", 1);

// Om SESSION_SECRET inte är satt genereras en slumpad hemlighet vid
// varje serverstart (inga inloggade sessioner checkas någonsin in i
// källkod). Det enda priset: alla loggas ut om servern startas om.
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex");

app.use(
  session({
    name: "svcs.sid",
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: "lax", maxAge: 1000 * 60 * 60 * 24 * 14 }
  })
);

function baseUrl(req) {
  return `${req.protocol}://${req.get("host")}`;
}

/* ---------- Steg 1: skicka användaren till Steam ---------- */

app.get("/auth/steam", (req, res) => {
  const realm = baseUrl(req) + "/";
  const returnTo = baseUrl(req) + "/auth/steam/return";

  const params = new URLSearchParams({
    "openid.ns": "http://specs.openid.net/auth/2.0",
    "openid.mode": "checkid_setup",
    "openid.return_to": returnTo,
    "openid.realm": realm,
    "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select"
  });

  res.redirect(`${STEAM_OPENID_ENDPOINT}?${params.toString()}`);
});

/* ---------- Steg 2–3: Steam skickar tillbaka, vi verifierar ---------- */

app.get("/auth/steam/return", async (req, res) => {
  try {
    const query = { ...req.query };

    if (query["openid.mode"] !== "id_res") {
      return res.redirect("/?steamlogin=avbruten");
    }

    // Bygg om exakt samma parametrar, men be Steam bekräfta äktheten.
    const verifyParams = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      verifyParams.set(key, value);
    }
    verifyParams.set("openid.mode", "check_authentication");

    const verifyRes = await fetch(STEAM_OPENID_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: verifyParams.toString()
    });
    const verifyText = await verifyRes.text();

    if (!/is_valid\s*:\s*true/.test(verifyText)) {
      return res.redirect("/?steamlogin=misslyckades");
    }

    // openid.claimed_id ser ut som https://steamcommunity.com/openid/id/7656119xxxxxxxxxx
    const claimedId = query["openid.claimed_id"] || "";
    const match = claimedId.match(/(\d{17})$/);
    if (!match) {
      return res.redirect("/?steamlogin=misslyckades");
    }
    const steamid = match[1];

    let profile = { steamid, personaname: steamid, avatar: null, profileurl: claimedId };

    if (STEAM_API_KEY) {
      try {
        const apiUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${steamid}`;
        const apiRes = await fetch(apiUrl);
        const apiData = await apiRes.json();
        const player = apiData && apiData.response && apiData.response.players && apiData.response.players[0];
        if (player) {
          profile = {
            steamid,
            personaname: player.personaname || steamid,
            avatar: player.avatarfull || player.avatarmedium || player.avatar || null,
            profileurl: player.profileurl || claimedId
          };
        }
      } catch (err) {
        console.error("Kunde inte hämta Steam-profil:", err.message);
      }
    }

    req.session.user = profile;
    res.redirect("/");
  } catch (err) {
    console.error("Steam-inloggning misslyckades:", err);
    res.redirect("/?steamlogin=fel");
  }
});

/* ---------- Utloggning ---------- */

app.get("/auth/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

/* ---------- Sessionsstatus åt frontend ---------- */

app.get("/api/me", (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true, ...req.session.user });
  } else {
    res.json({ loggedIn: false });
  }
});

/* ---------- Statiska filer ----------
   Endast public/ serveras — servern själv (server.js, package.json,
   .env, node_modules) ligger utanför och kan aldrig hämtas via HTTP. */

app.use(express.static(path.join(__dirname, "public"), { extensions: ["html"] }));

/* ---------- SPA-fallback ----------
   Varje flik (/spelare, /nyheter, /om) och varje spelare (/dvve,
   /REZ osv.) har en egen länkbar adress, men det finns ingen egen
   HTML-fil per sida — routingen sker i frontend (app.js). Den här
   fallbacken gör att en direkt inladdning eller omladdning av en
   sådan URL ändå returnerar sidan (som sedan avgör vad som ska
   visas utifrån URL:en), istället för ett 404-fel. */

app.get(/^\/(?!api\/|auth\/).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Peekr körs på http://localhost:${PORT}`);
  if (!STEAM_API_KEY) {
    console.log("OBS: STEAM_API_KEY är inte satt — inloggning fungerar men visar bara SteamID64, inget profilnamn/avatar.");
    console.log("Skaffa en gratis nyckel: https://steamcommunity.com/dev/apikey och kör: STEAM_API_KEY=din-nyckel npm start");
  }
});
