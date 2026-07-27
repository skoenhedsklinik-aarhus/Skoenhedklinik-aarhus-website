#!/usr/bin/env node
/**
 * Find klinikkens Google Place ID og verificér, at API-nøglen kan hente
 * anmeldelser — i én kommando.
 *
 * Googles egen "Place ID Finder" på developers.google.com virker ikke længere
 * (søgefeltet ligger skjult, og demo-kortet indlæser ikke), så det her er den
 * pålidelige vej.
 *
 * Brug:
 *   node scripts/find-place-id.mjs
 *   node scripts/find-place-id.mjs "Skønhedsklinik Aarhus, Tordenskjoldsgade 61"
 *   GOOGLE_PLACES_API_KEY=AIza... node scripts/find-place-id.mjs
 *
 * Nøglen findes i denne rækkefølge: --key <nøgle> → miljøvariabel
 * GOOGLE_PLACES_API_KEY → .env.local i projektroden.
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_QUERY = "Skønhedsklinik Aarhus, Tordenskjoldsgade 61, 8000 Aarhus C";

function readKeyFromEnvFile() {
  for (const file of [".env.local", ".env"]) {
    try {
      const content = readFileSync(resolve(ROOT, file), "utf8");
      const match = content.match(/^GOOGLE_PLACES_API_KEY\s*=\s*(.+)$/m);
      if (match) {
        const value = match[1].trim().replace(/^["']|["']$/g, "");
        if (value) return value;
      }
    } catch {
      // Filen findes ikke — prøv den næste.
    }
  }
  return null;
}

function fail(message) {
  console.error(`\n❌ ${message}\n`);
  process.exit(1);
}

const args = process.argv.slice(2);
const keyFlagIndex = args.indexOf("--key");
let apiKey = null;
if (keyFlagIndex !== -1) {
  apiKey = args[keyFlagIndex + 1];
  args.splice(keyFlagIndex, 2);
}
apiKey ||= process.env.GOOGLE_PLACES_API_KEY || readKeyFromEnvFile();

const query = args.join(" ").trim() || DEFAULT_QUERY;

if (!apiKey) {
  fail(
    "Ingen API-nøgle fundet.\n" +
      "   Kør: node scripts/find-place-id.mjs --key AIza...\n" +
      "   eller læg GOOGLE_PLACES_API_KEY i .env.local",
  );
}

// ---------------------------------------------------------------------------
// 1) Text Search → find Place ID
// ---------------------------------------------------------------------------
console.log(`\n🔎  Søger efter: ${query}\n`);

const searchResponse = await fetch(
  "https://places.googleapis.com/v1/places:searchText",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      // Kun id/navn/adresse → billigste SKU (Text Search Essentials IDs Only).
      "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress",
    },
    body: JSON.stringify({ textQuery: query, languageCode: "da", regionCode: "DK" }),
  },
);

if (!searchResponse.ok) {
  const body = await searchResponse.text();
  console.error(`\n❌ Google afviste søgningen (HTTP ${searchResponse.status}):\n`);
  console.error(body);
  console.error(
    "\nTypiske årsager:\n" +
      "  • 'Places API (New)' er ikke slået til på projektet\n" +
      "  • fakturering er ikke aktiveret på projektet\n" +
      "  • nøglen er begrænset til et forkert API eller til bestemte domæner\n",
  );
  process.exit(1);
}

const searchData = await searchResponse.json();
const places = searchData.places ?? [];

if (places.length === 0) {
  fail("Ingen resultater. Prøv en anden søgetekst, f.eks. bare klinikkens navn.");
}

console.log("Resultater:\n");
places.slice(0, 5).forEach((place, i) => {
  console.log(`  ${i + 1}. ${place.displayName?.text ?? "(uden navn)"}`);
  console.log(`     ${place.formattedAddress ?? ""}`);
  console.log(`     Place ID: ${place.id}`);
  console.log(
    `     Tjek på kortet: https://www.google.com/maps/place/?q=place_id:${place.id}\n`,
  );
});

const best = places[0];

// ---------------------------------------------------------------------------
// 2) Place Details → verificér at anmeldelser rent faktisk kan hentes
// ---------------------------------------------------------------------------
console.log("🔐  Tester om nøglen må hente anmeldelser (Enterprise + Atmosphere)…\n");

const detailsResponse = await fetch(
  `https://places.googleapis.com/v1/places/${encodeURIComponent(best.id)}` +
    `?fields=reviews,rating,userRatingCount&languageCode=da&regionCode=DK`,
  { headers: { "X-Goog-Api-Key": apiKey } },
);

if (!detailsResponse.ok) {
  const body = await detailsResponse.text();
  console.error(`❌ Kunne ikke hente anmeldelser (HTTP ${detailsResponse.status}):\n`);
  console.error(body);
  process.exit(1);
}

const details = await detailsResponse.json();
const reviewCount = (details.reviews ?? []).length;

console.log(`✅  Rating: ${details.rating ?? "—"}`);
console.log(`✅  Antal anmeldelser i alt: ${details.userRatingCount ?? "—"}`);
console.log(`✅  Anmeldelser returneret af API'et: ${reviewCount}`);

const fiveStar = (details.reviews ?? []).filter(
  (r) => r.rating === 5 && (r.text?.text ?? "").trim().length > 40,
);
console.log(`✅  Heraf 5-stjernede med tekst (dem sitet viser): ${fiveStar.length}\n`);

if (fiveStar.length === 0) {
  console.log(
    "⚠️  Ingen af anmeldelserne passerer sitets filter (5 stjerner + over 40 tegn).\n" +
      "   Siden vil vise generiske klientudtalelser i stedet.\n",
  );
}

console.log("─".repeat(70));
console.log("\nIndsæt disse to i Vercel → Settings → Environment Variables:\n");
console.log(`GOOGLE_PLACE_ID       = ${best.id}`);
console.log(`GOOGLE_PLACES_API_KEY = ${apiKey.slice(0, 8)}…  (den nøgle du brugte her)\n`);
