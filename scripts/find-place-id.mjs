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
 *   npm run find-place-id -- --key AIza...
 *   npm run find-place-id -- --key AIza... "Skønhedsklinik Aarhus"
 *   npm run find-place-id -- --key AIza... --verify ChIJ...   (test et ID du bruger)
 *
 * Nøglen findes i denne rækkefølge: --key <nøgle> → miljøvariabel
 * GOOGLE_PLACES_API_KEY → .env.local i projektroden.
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_QUERY = "Skønhedsklinik Aarhus, Tordenskjoldsgade 61, 8000 Aarhus C";

/**
 * Virksomheders Place ID starter med "ChIJ". Starter det med "Ej"/"Ei", er det
 * en geokodet ADRESSE. Adresser har ingen anmeldelser, så siden falder tilbage
 * til klientudtalelser uden at fejle. Det er den nemmeste fejl at lave, fordi
 * begge dele ser ud som et helt gyldigt Place ID.
 */
function isBusinessId(id) {
  return typeof id === "string" && id.startsWith("ChIJ");
}

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

function takeFlag(args, name) {
  const i = args.indexOf(name);
  if (i === -1) return null;
  const value = args[i + 1];
  args.splice(i, 2);
  return value ?? null;
}

// --- argumenter -------------------------------------------------------------
const args = process.argv.slice(2);
const keyArg = takeFlag(args, "--key");
const verifyId = takeFlag(args, "--verify");
const apiKey = keyArg || process.env.GOOGLE_PLACES_API_KEY || readKeyFromEnvFile();
const query = args.join(" ").trim() || DEFAULT_QUERY;

if (!apiKey) {
  fail(
    "Ingen API-nøgle fundet.\n" +
      "   Kør: npm run find-place-id -- --key AIza...\n" +
      "   eller læg GOOGLE_PLACES_API_KEY i .env.local",
  );
}

/** Hent anmeldelser for ét Place ID og rapportér, hvad siden vil vise. */
async function verifyPlace(placeId) {
  const response = await fetch(
    `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}` +
      `?fields=displayName,formattedAddress,reviews,rating,userRatingCount` +
      `&languageCode=da&regionCode=DK`,
    { headers: { "X-Goog-Api-Key": apiKey } },
  );

  if (!response.ok) {
    console.error(`❌ Kunne ikke hente stedet (HTTP ${response.status}):\n`);
    console.error(await response.text());
    process.exit(1);
  }

  const details = await response.json();
  const reviews = details.reviews ?? [];

  console.log(`   Navn:    ${details.displayName?.text ?? "—"}`);
  console.log(`   Adresse: ${details.formattedAddress ?? "—"}`);
  console.log(`   Rating:  ${details.rating ?? "—"}`);
  console.log(`   Antal anmeldelser i alt: ${details.userRatingCount ?? "—"}`);
  console.log(`   Anmeldelser returneret af API'et: ${reviews.length}  (Google giver højst 5)`);

  // Samme filter som src/lib/reviews.ts bruger.
  const usable = reviews.filter(
    (r) => r.rating === 5 && (r.text?.text ?? r.originalText?.text ?? "").trim().length > 25,
  );
  console.log(`   Heraf brugbare på sitet (5 stjerner + tekst): ${usable.length}\n`);

  if (usable.length === 0) {
    console.log(
      "⚠️  Siden vil vise generiske klientudtalelser, ikke Google-anmeldelser.\n" +
        (isBusinessId(placeId)
          ? "   Stedet har ingen 5-stjernede anmeldelser med tekst.\n"
          : "   Årsag: Place ID'et er en adresse, ikke virksomheden.\n"),
    );
    return false;
  }

  console.log("✅ Klar. Siden vil vise ægte Google-anmeldelser med dette ID.\n");
  return true;
}

// --- verify-mode ------------------------------------------------------------
if (verifyId) {
  console.log(`\n🔍  Tester eksisterende Place ID: ${verifyId}\n`);
  if (!isBusinessId(verifyId)) {
    console.log(
      "⚠️  ID'et starter ikke med 'ChIJ'. Det er sandsynligvis en geokodet\n" +
        "   ADRESSE og ikke virksomheden. Adresser har ingen anmeldelser.\n",
    );
  }
  const ok = await verifyPlace(verifyId);
  process.exit(ok ? 0 : 1);
}

// --- søgning ----------------------------------------------------------------
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
  const flag = isBusinessId(place.id)
    ? "✅ virksomhed"
    : "⚠️  ADRESSE — har ingen anmeldelser";
  console.log(`  ${i + 1}. ${place.displayName?.text ?? "(uden navn)"}   [${flag}]`);
  console.log(`     ${place.formattedAddress ?? ""}`);
  console.log(`     Place ID: ${place.id}`);
  console.log(
    `     Tjek på kortet: https://www.google.com/maps/place/?q=place_id:${place.id}\n`,
  );
});

// Foretræk altid et virksomheds-ID frem for en adresse.
const best = places.find((p) => isBusinessId(p.id)) ?? places[0];

if (!isBusinessId(best.id)) {
  console.log(
    "⚠️  Ingen af resultaterne er en virksomhed — kun adresser.\n" +
      "   Prøv en mere præcis søgning, fx blot klinikkens navn:\n" +
      '   npm run find-place-id -- --key DIN_NOEGLE "Skønhedsklinik Aarhus"\n',
  );
}

console.log("🔐  Tester om nøglen må hente anmeldelser (Enterprise + Atmosphere)…\n");
await verifyPlace(best.id);

console.log("─".repeat(70));
console.log("\nIndsæt denne i Vercel → Settings → Environment Variables:\n");
console.log(`GOOGLE_PLACE_ID = ${best.id}\n`);
