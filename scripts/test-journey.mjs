// Enhedstest af kunderejsen. Ingen database, ingen netværk, fastfrosset ur.
//
//   node scripts/test-journey.mjs
//
// Node 22+ kører .ts direkte ved at fjerne typerne. Det virker, fordi
// src/lib/journey.ts kun indeholder typer og ren logik: ingen database-import
// og ingen læsning af uret. Præcis dét er grunden til, at besøg beregnes ved
// LÆSNING og ikke ved skrivning.

import assert from "node:assert/strict";
import { buildJourney, sourceLabel, SESSION_GAP_MINUTES } from "../src/lib/journey.ts";

let kørte = 0;
function test(navn, fn) {
  kørte++;
  try {
    fn();
    console.log(`  ok   ${navn}`);
  } catch (e) {
    console.error(`  FEJL ${navn}\n       ${e.message}`);
    process.exitCode = 1;
  }
}

/** Berøring med fornuftige standardværdier. minut = minutter efter T0. */
const T0 = Date.parse("2026-09-01T10:00:00.000Z");
let n = 0;
function tp(minut, felter = {}) {
  return {
    id: `tp-${++n}`,
    occurred_at: new Date(T0 + minut * 60_000).toISOString(),
    path: "/",
    referrer_host: null,
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    utm_content: null,
    utm_term: null,
    fbclid: null,
    gclid: null,
    ...felter,
  };
}

console.log("kunderejse");

test("tom liste giver en tom rejse", () => {
  const j = buildJourney([]);
  assert.equal(j.sessions.length, 0);
  assert.equal(j.pageviews, 0);
  assert.equal(j.firstSource, null);
  assert.equal(j.daysToLead, null);
});

test("sider tæt på hinanden er ét besøg", () => {
  const j = buildJourney([tp(0), tp(5, { path: "/priser" }), tp(20, { path: "/kontakt" })]);
  assert.equal(j.sessions.length, 1);
  assert.equal(j.pageviews, 3);
  assert.deepEqual(j.sessions[0].paths, ["/", "/priser", "/kontakt"]);
  assert.equal(j.sessions[0].minutes, 20);
});

test("en pause over 30 minutter bryder besøget", () => {
  const j = buildJourney([tp(0), tp(SESSION_GAP_MINUTES + 1)]);
  assert.equal(j.sessions.length, 2);
});

test("præcis 30 minutters pause bryder IKKE", () => {
  const j = buildJourney([tp(0), tp(SESSION_GAP_MINUTES)]);
  assert.equal(j.sessions.length, 1);
});

test("en ny utm_source bryder besøget, også uden pause", () => {
  const j = buildJourney([
    tp(0, { utm_source: "meta" }),
    tp(2, { utm_source: "google" }),
  ]);
  assert.equal(j.sessions.length, 2);
});

test("et nyt fbclid bryder besøget", () => {
  const j = buildJourney([tp(0, { fbclid: "abc" }), tp(3, { fbclid: "def" })]);
  assert.equal(j.sessions.length, 2);
});

test("intern navigation uden signal fortsætter besøget", () => {
  const j = buildJourney([
    tp(0, { utm_source: "meta", fbclid: "abc" }),
    tp(4, { path: "/priser" }),
    tp(9, { path: "/kontakt" }),
  ]);
  assert.equal(j.sessions.length, 1);
  assert.equal(j.sessions[0].source, "Meta-annonce");
});

test("rækkefølgen fra kalderen er ligegyldig", () => {
  const j = buildJourney([tp(60), tp(0), tp(120)]);
  assert.equal(j.sessions.length, 3);
  assert.equal(j.firstAt, new Date(T0).toISOString());
});

test("ubrugelige tidsstempler smides væk", () => {
  const j = buildJourney([tp(0), { ...tp(5), occurred_at: "ikke en dato" }]);
  assert.equal(j.pageviews, 1);
});

test("første og sidste kilde før henvendelsen", () => {
  const leadAt = new Date(T0 + 3 * 24 * 60 * 60_000).toISOString();
  const j = buildJourney(
    [
      tp(0, { utm_source: "meta", fbclid: "abc", utm_campaign: "efterår" }),
      tp(24 * 60, { utm_source: "google", utm_medium: "cpc", gclid: "g1" }),
      tp(2 * 24 * 60, { referrer_host: "www.instagram.com" }),
    ],
    { leadCreatedAt: leadAt },
  );
  assert.equal(j.firstSource, "Meta-annonce · efterår");
  assert.equal(j.lastSourceBeforeLead, "instagram.com");
  assert.equal(j.daysToLead, 3);
});

test("dage til henvendelsen er hele dage, og aldrig negativt", () => {
  const sammeDag = buildJourney([tp(0)], {
    leadCreatedAt: new Date(T0 + 60 * 60_000).toISOString(),
  });
  assert.equal(sammeDag.daysToLead, 0);

  // Cookien sat efter henvendelsen: vis 0 frem for et negativt tal.
  const bagvendt = buildJourney([tp(0)], {
    leadCreatedAt: new Date(T0 - 60 * 60_000).toISOString(),
  });
  assert.equal(bagvendt.daysToLead, 0);
});

test("kun besøg der BEGYNDTE efter henvendelsen tæller som tilbagevenden", () => {
  // Fælden: kvitteringen lige efter formularen. Den ligger i det besøg, der
  // allerede var i gang, og må ikke få hvert eneste lead til at se ud som om
  // det kom tilbage.
  const leadAt = new Date(T0 + 10 * 60_000).toISOString();
  const j = buildJourney(
    [
      tp(0, { path: "/lp/laser" }),
      tp(9, { path: "/priser" }),
      tp(11, { path: "/priser" }), // efter leadet, men SAMME besøg
    ],
    { leadCreatedAt: leadAt },
  );
  assert.equal(j.sessions.length, 1);
  assert.equal(j.sessionsAfterLead, 0);
  assert.equal(j.pageviewsAfterLead, 0);
});

test("et nyt besøg efter henvendelsen tæller med", () => {
  const leadAt = new Date(T0 + 10 * 60_000).toISOString();
  const j = buildJourney(
    [
      tp(0, { path: "/lp/laser" }),
      tp(9, { path: "/priser" }),
      tp(2 * 24 * 60, { path: "/priser" }),
      tp(2 * 24 * 60 + 3, { path: "/behandlinger/laser-haarfjerning" }),
    ],
    { leadCreatedAt: leadAt },
  );
  assert.equal(j.sessionsAfterLead, 1);
  assert.equal(j.pageviewsAfterLead, 2);
  assert.equal(j.sessions[1].afterLead, true);
  assert.equal(j.sessions[0].afterLead, false);
});

test("uden lead er intet efter leadet", () => {
  const j = buildJourney([tp(0), tp(1000)]);
  assert.equal(j.sessionsAfterLead, 0);
  assert.equal(j.sessions.every((s) => s.afterLead === false), true);
});

test("mest læste sider tæller uden query og sorterer faldende", () => {
  const j = buildJourney([
    tp(0, { path: "/priser?utm_source=meta" }),
    tp(1, { path: "/priser" }),
    tp(2, { path: "/kontakt" }),
  ]);
  assert.deepEqual(j.topPaths, [
    { path: "/priser", count: 2 },
    { path: "/kontakt", count: 1 },
  ]);
});

test("pausereglen kan ændres uden en migration", () => {
  const berøringer = [tp(0), tp(20)];
  assert.equal(buildJourney(berøringer).sessions.length, 1);
  assert.equal(buildJourney(berøringer, { gapMinutes: 10 }).sessions.length, 2);
});

console.log("kilder");

test("klik-id vejer tungere end alt andet", () => {
  assert.equal(sourceLabel(tp(0, { fbclid: "x", referrer_host: "google.com" })), "Meta-annonce");
  assert.equal(sourceLabel(tp(0, { gclid: "x" })), "Google Ads");
});

test("uden kilde og uden referrer er det direkte trafik", () => {
  assert.equal(sourceLabel(tp(0)), "Direkte");
});

test("referrer bruges når der ikke er utm eller klik-id", () => {
  assert.equal(sourceLabel(tp(0, { referrer_host: "www.google.dk" })), "google.dk");
});

console.log(`\n${kørte} test kørt${process.exitCode ? " — med fejl" : ", alle grønne"}`);
