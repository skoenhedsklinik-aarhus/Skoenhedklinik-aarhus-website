/**
 * High-fidelity production-ready content fallback for Skønhedsklinik Aarhus treatments.
 * Populates all descriptions, benefits, pre/post safety guidelines, and FAQs in Danish.
 * Also provides full skeleton service objects for slugs not yet in Supabase.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

const skeletonServices: Record<string, any> = {
  "laser-haarfjerning": { name: "Laser hårfjerning", slug: "laser-haarfjerning", category: "laser", short_description: "Effektiv og skånsom laser hårfjerning med avanceret diode-laser.", hero_image_url: "/placeholder.jpg", requires_consultation: true, is_popular: true, is_active: true },
  "tattoo-fjernelse": { name: "Tattoo-fjernelse", slug: "tattoo-fjernelse", category: "laser", short_description: "Professionel fjernelse af uønskede tatoveringer med Pico Laser-teknologi.", hero_image_url: "/placeholder.jpg", requires_consultation: true, is_popular: true, is_active: true },
  "ansigtsbehandling": { name: "Ansigtsbehandling", slug: "ansigtsbehandling", category: "hudpleje", short_description: "Skræddersyede ansigtsbehandlinger for alle hudtyper – opnå en sund og strålende hud.", hero_image_url: "/placeholder.jpg", requires_consultation: false, is_popular: true, is_active: true },
  "sugaring": { name: "Sugaring hårfjerning", slug: "sugaring", category: "haarfjerning", short_description: "Naturlig og skånsom hårfjerning med sukker. Glat hud i 4–6 uger.", hero_image_url: "/placeholder.jpg", requires_consultation: false, is_popular: true, is_active: true },
  "tandblegning": { name: "Tandblegning", slug: "tandblegning", category: "kosmetisk", short_description: "Smertefri kosmetisk tandblegning med LED-lys. 2–8 toner lysere på én behandling.", hero_image_url: "/placeholder.jpg", requires_consultation: false, is_popular: true, is_active: true },
  "threading": { name: "Threading", slug: "threading", category: "haarfjerning", short_description: "Præcis og skånsom ansigtshårfjerning med tråd. Perfekt til brynformning og fine ansigtshår.", hero_image_url: "/placeholder.jpg", requires_consultation: false, is_popular: false, is_active: true },
  "bb-glow": { name: "BB Glow", slug: "bb-glow", category: "hudpleje", short_description: "Revolutionerende hudforskønnelse med microneedling. Ensartet hudtone og naturlig glød.", hero_image_url: "/placeholder.jpg", requires_consultation: false, is_popular: false, is_active: true },
  "bryn-og-vipper": { name: "Bryn & vipper", slug: "bryn-og-vipper", category: "bryn-vipper", short_description: "Lash Lift, Brow Lamination, farvning og formning af bryn og vipper.", hero_image_url: "/placeholder.jpg", requires_consultation: false, is_popular: true, is_active: true },
  "wax-behandling": { name: "Wax behandling", slug: "wax-behandling", category: "haarfjerning", short_description: "Professionel voksbehandling for silkeblød og hårfri hud i ugevis.", hero_image_url: "/placeholder.jpg", requires_consultation: false, is_popular: false, is_active: true },
  "mix-sugaring-og-wax": { name: "Mix Sugaring & Wax", slug: "mix-sugaring-og-wax", category: "haarfjerning", short_description: "Det bedste fra to verdener – sugaring på de følsomme områder, voks på resten.", hero_image_url: "/placeholder.jpg", requires_consultation: false, is_popular: false, is_active: true },
};

/**
 * Returns a skeleton service object for known slugs not yet in Supabase.
 * Returns null for unknown slugs (which will correctly 404).
 */
export function getSkeletonService(slug: string): any | null {
  const skeleton = skeletonServices[slug];
  if (!skeleton) return null;
  return { id: `fallback-${slug}`, ...skeleton, benefits: [], faq: [], pre_instructions: [], post_instructions: [] };
}

/**
 * Locally-available variant images per service (excluding the hero).
 * Used to populate the secondary detail image and the gallery section.
 */
const galleryMap: Record<string, string[]> = {
  "ansigtsbehandling": [
    // retinol (serum-dråbe-billedet) er hovedbilledet for ansigtsbehandling — det
    // er gallery[0] og bruges som thumbnail på kort/forside + sekundært detaljebillede.
    "/images/services/ansigtsbehandling-retinol.avif",
    "/images/services/ansigtsbehandling-clear-skin.avif",
    "/images/services/ansigtsbehandling-even-skin.avif",
    "/images/services/ansigtsbehandling-firm-smooth.avif",
    "/images/services/ansigtsbehandling-hydra-boost.avif",
    // BB Glow is folded into Ansigtsbehandling — keep its imagery in the gallery.
    "/images/services/bb-glow-2.avif",
  ],
  "bb-glow": ["/images/services/bb-glow-2.avif"],
  "bryn-og-vipper": [
    "/images/services/bryn-og-vipper-brow-lift.avif",
    "/images/services/bryn-og-vipper-henna.avif",
    "/images/services/bryn-og-vipper-lashlift.avif",
  ],
  "mix-sugaring-og-wax": ["/images/services/mix-sugaring-og-wax-2.avif"],
  "laser-haarfjerning": ["/images/services/laser-haarfjerning-2.avif"],
  "sugaring": ["/images/services/sugaring-2.avif"],
  "tattoo-fjernelse": ["/images/services/tattoo-fjernelse-2.avif"],
  "tandblegning": ["/images/services/tandblegning-hero-live.jpg"],
  "threading": ["/images/services/threading-2.avif"],
  "wax-behandling": ["/images/services/wax-behandling-2.avif"],
};

/**
 * Atmospheric hero background videos (mirrored from the original site).
 * Pages not listed here keep their static image hero.
 */
const heroVideoMap: Record<string, string> = {
  "threading": "/videos/services/threading.mp4",
  "ansigtsbehandling": "/videos/services/ansigtsbehandling.mp4",
  "laser-haarfjerning": "/videos/services/laser-haarfjerning.mp4",
  "sugaring": "/videos/services/sugaring.mp4",
  "bryn-og-vipper": "/videos/services/bryn-og-vipper.mp4",
  "mix-sugaring-og-wax": "/videos/services/mix-sugaring-og-wax.mp4",
  "bb-glow": "/videos/services/bb-glow.mp4",
  "tandblegning": "/videos/services/tandblegning.mp4",
  "tattoo-fjernelse": "/videos/services/tattoo-fjernelse.mp4",
  "wax-behandling": "/videos/services/wax-behandling.mp4",
};

/**
 * The image used to represent a treatment everywhere outside its detail hero
 * (homepage cards, listing grid, related-services). Mirrors the secondary
 * image shown on the detail page (gallery[0]), falling back to the hero image.
 */
export function getServiceThumbnail(slug: string, heroImageUrl?: string | null): string {
  const gallery = galleryMap[slug];
  return (gallery && gallery[0]) || heroImageUrl || "/placeholder.jpg";
}

export function enrichServiceWithFallback(slug: string, service: any): any {
  if (!service) return null;
  const s = { ...service };

  // Make sure these arrays exist
  if (!s.benefits) s.benefits = [];
  if (!s.faq) s.faq = [];
  if (!s.pre_instructions) s.pre_instructions = [];
  if (!s.post_instructions) s.post_instructions = [];
  if (!s.gallery || s.gallery.length === 0) s.gallery = galleryMap[slug] || [];
  if (!s.hero_video_url) s.hero_video_url = heroVideoMap[slug] || null;

  switch (slug) {
    case "laser-haarfjerning":
      if (!s.long_description || s.long_description.length < 200) {
        s.long_description = `<p>Diode-laser er den mest effektive metode til varig reduktion af uønsket hårvækst. Laseren målretter pigmentet i hårsækken og ødelægger den ved roden, så hårene enten stopper med at vokse eller bliver markant finere og svagere over tid.</p><p>Behandlingen er skånsom, hurtig og velegnet til de fleste hudtyper. Diode-laseren har indbygget køling, som gør den mere behagelig end mange andre hårfjerningsmetoder. Allerede efter få behandlinger vil du opleve en tydelig reduktion af hårvæksten.</p><p>Hvis du ønsker et langtidsresultat uden barbering, voks eller indgroede hår, er diode-laser den mest moderne og holdbare løsning.</p><h3>Glat hud uden irritation</h3><p>Laser hårfjerning med diode-laser hjælper ikke kun med at fjerne uønsket hår – den reducerer også risikoen for irritation og indgroede hår markant.</p><p>Når hårsækken ødelægges, stopper den med at producere hår, der kan vokse skævt ind i huden. Det gør diode-laser særligt ideel til dig, der ofte oplever røde knopper, skægpest-lignende irritation eller indgroede hår efter barbering eller voksbehandlinger.</p><p>Behandlingen giver en mere ensartet, blød og glat hud med færre gener i hverdagen. Kontakt os for rådgivning, eller book en tid for at komme i gang.</p>`;
      }
      if (s.benefits.length === 0) {
        s.benefits = [
          { icon: "shield", title: "Glat hud uden irritation", description: "Reducerer risikoen for irritation, røde knopper og indgroede hår markant." },
          { icon: "leaf", title: "Skånsom & smertefri", description: "Avanceret diode-laser med indbygget køling, der gør behandlingen behagelig." },
          { icon: "clock", title: "Hurtige & varige resultater", description: "Oplev en markant reduktion af hårvæksten allerede efter få behandlinger." }
        ];
      }
      if (s.faq.length === 0) {
        s.faq = [
          {
            question: "Hvad er laser hårfjerning med diode-laser?",
            answer: "<p>Laser hårfjerning med diode-laser er en avanceret og effektiv metode til at reducere uønsket hårvækst markant. Laseren sender et præcist lysimpuls ned i hårsækken, hvor varmeenergien ødelægger hårroden, så den ikke kan producere hår igen.</p>"
          },
          {
            question: "Gør laserbehandlingen ondt?",
            answer: "<p>De fleste oplever kun en let varme eller prikken i huden, da diode-laseren har indbygget køling. Det er markant mere behageligt end voks eller epilering.</p>"
          },
          {
            question: "Hvor mange behandlinger skal man have?",
            answer: "<p>De fleste opnår optimale resultater efter 6–10 behandlinger, med 4–8 ugers mellemrum, afhængigt af område, hårtype og hormoner.</p>"
          }
        ];
      }
      if (s.pre_instructions.length === 0) {
        s.pre_instructions = [
          "Barber området 12–24 timer før behandlingen",
          "Undgå voks, sugaring eller epilering 4 uger før behandlingen",
          "Undgå sol, solarium og selvbruner 2 uger før behandlingen",
          "Mød op uden cremer, olier eller deodoranter på huden"
        ];
      }
      if (s.post_instructions.length === 0) {
        s.post_instructions = [
          "Undgå direkte solbadning og solarium i minimum 14 dage efter behandlingen",
          "Brug solcreme med høj faktor (SPF 30/50) ved ophold udendørs",
          "Undgå ekstrem varme (sauna, dampbad, varme bade) i 48 timer",
          "Undgå intens træning og sved i 24 timer"
        ];
      }
      break;

    case "tattoo-fjernelse":
      if (!s.long_description || s.long_description.length < 200) {
        s.long_description = `<p>Hos Skønhedsklinik Aarhus tilbyder vi professionel og skånsom fjernelse af uønskede tatoveringer ved hjælp af den absolut nyeste Pico Laser-teknologi. Pico-laseren arbejder med ultrakorte laserimpulser (picosekunder), som effektivt nedbryder tatoveringsblækket i mikroskopiske partikler, som kroppens eget immunsystem efterfølgende fjerner naturligt.</p><p>Denne avancerede teknologi giver en langt mere effektiv behandling med mindre belastning af den omkringliggende hud og færre bivirkninger. Teknologien er yderst velegnet til både sorte, mørke og genstridige farvede tatoveringer.</p><h3>Fjern dine uønskede tatoveringer helt</h3><p>Antallet af behandlinger varierer fra person til person og afhænger blandt andet af tatoveringens størrelse, farver, dybde, alder samt din hudtype.</p><p>Inden behandlingsstart foretages der altid en individuel, lovpligtig konsultation hos vores registrerede sygeplejerske. Her vurderes din tatovering grundigt, og der gives professionel information om behandlingsforløb, forventninger og et estimat over det nødvendige antal behandlinger.</p>`;
      }
      if (s.benefits.length === 0) {
        s.benefits = [
          { icon: "shield", title: "Avanceret Pico-laser", description: "Ultrakorte impulser sprænger blækket uden at beskadige huden." },
          { icon: "star", title: "Alle farver behandles", description: "Særligt effektiv på både sorte, mørke og svære farvepigmenter." },
          { icon: "leaf", title: "Færre behandlinger", description: "Hurtigere og mere skånsomt forløb sammenlignet med ældre lasere." }
        ];
      }
      if (s.faq.length === 0) {
        s.faq = [
          {
            question: "Hvordan fungerer laser tattoo removal?",
            answer: "<p>Laser tattoo removal er en avanceret behandling, hvor laserlys nedbryder blækpigmenterne i tatoveringen. Kroppen fjerner derefter pigmenterne naturligt over tid via lymfesystemet og immunforsvaret. Behandlingen er skånsom mod huden og kan anvendes på både små og store tatoveringer.</p>"
          },
          {
            question: "Gør laserfjernelse ondt?",
            answer: "<p>De fleste oplever en prikkende eller smældende fornemmelse (som en elastik mod huden). Da pico-laseren har indbygget køling, mindskes ubehaget markant. Ved lav smertetolerance anbefaler vi at påføre bedøvende creme (fx Emla) 30-45 minutter før behandlingen under husholdningsfilm.</p>"
          },
          {
            question: "Hvor mange behandlinger skal jeg have?",
            answer: "<p>De fleste tatoveringer kræver mellem 4 og 10 behandlinger for komplet fjernelse. Intervallet mellem hver behandling er 6-8 uger, så huden kan nå at hele fuldstændigt og immunforsvaret kan transportere blækket væk.</p>"
          }
        ];
      }
      if (s.pre_instructions.length === 0) {
        s.pre_instructions = [
          "Undgå direkte sol, solarium og selvbruner i mindst 14 dage før",
          "Huden skal være fuldstændig intakt og må ikke være solskoldet eller irriteret",
          "Undgå aktive syrer (AHA, BHA, Retinol) på området i 5-7 dage før",
          "Barber hårene af området på selve behandlingsdagen",
          "Påfør bedøvende creme 30-45 minutter før, hvis du har lav smertetolerance"
        ];
      }
      if (s.post_instructions.length === 0) {
        s.post_instructions = [
          "Rødme, varme, let hævelse og små blærer er normale reaktioner, der svinder på få dage",
          "Undgå vand på området de første 48 timer (ingen bad, svømning eller sved)",
          "Undgå sol og solarium i minimum 4 uger efter behandlingen, og brug altid SPF 50",
          "Undgå sauna, dampbad og hård træning i 48-72 timer",
          "Undgå at røre, kradse eller pille i huden (skorper skal falde af af sig selv for at undgå ar)"
        ];
      }
      break;

    case "ansigtsbehandling":
      if (!s.long_description || s.long_description.length < 200) {
        s.long_description = `<p>Forkæl din hud med vores skræddersyede ansigtsbehandlinger hos Skønhedsklinik Aarhus. Vi tror på, at en sund hud er en smuk hud, og vi tilpasser altid vores ansigtsbehandlinger nøje efter din specifikke hudtype, tilstand og dine personlige mål. Hvad enten du kæmper med akne, tørhed, fine linjer eller blot ønsker at genfinde en sund, ungdommelig og levende glød, står vi klar til at hjælpe dig.</p><p>Vi anvender udelukkende klinisk dokumenterede hudplejeprodukter af højeste kvalitet, som nærer huden i dybden, genskaber balancen og efterlader huden synligt genopfrisket, blød og strålende.</p><h3>Professionel hudpleje tilpasset dig</h3><p>En professionel ansigtsbehandling er ikke kun ren selvforkælelse og afslapning – det er en målrettet investering i din huds langsigtede sundhed. Ved at fjerne døde hudceller, dybderense porerne og tilføre intensive serummer hjælper vi din hud med at regenerere hurtigere og beskytte sig bedre mod hverdagens påvirkninger.</p><p>Giv din hud den opmærksomhed, den fortjener. Vores dygtige kosmetologer guider dig også i den rette hjemmepleje for at bevare det smukke resultat.</p><h3 style="margin-top:3.5rem">BB Glow – semi-permanent glød &amp; ensartet teint</h3><p>Som en del af vores ansigtsbehandlinger tilbyder vi også BB Glow – en af de mest populære hudforskønnende behandlinger. Behandlingen udføres med avanceret microneedling, hvor et specialudviklet meso-serum med naturlige farvepigmenter og intensive vitaminer sluses blidt ned i hudens øverste lag. Det giver huden en smuk, ensartet og langvarig 'BB-creme-effekt' med en naturlig glød.</p><p>Udover at give en jævn hudtone arbejder BB Glow på at reducere pigmentforandringer, solskader, fine linjer, mørke render under øjnene samt ar efter akne, mens huden boostes med fugt og kollagen indefra. Behandlingen er smertefri og kræver ingen restitutionstid – og du kan altid spørge din behandler, om BB Glow er det rette valg for netop din hud.</p>`;
      }
      if (s.benefits.length === 0) {
        s.benefits = [
          { icon: "star", title: "Skræddersyet pleje", description: "Behandlingen tilpasses 100% efter din huds specifikke behov." },
          { icon: "leaf", title: "Intensiv fugt & glød", description: "Genopbygger hudbarrieren og efterlader en sund, levende udstråling." },
          { icon: "shield", title: "Dybderensende effekt", description: "Fjerner urenheder, døde hudceller og mindsker grove porer." }
        ];
      }
      if (s.faq.length === 0) {
        s.faq = [
          {
            question: "Hvor ofte bør man få en ansigtsbehandling?",
            answer: "<p>For at opretholde en sund hud i balance anbefaler vi en professionel ansigtsbehandling hver 4.-6. uge. Det matcher hudens naturlige cellefornyelsescyklus, som varer cirka 28 dage.</p>"
          },
          {
            question: "Hvilken ansigtsbehandling skal jeg vælge?",
            answer: "<p>Du behøver ikke beslutte dig på forhånd! Vores erfarne behandler foretager altid en grundig hudanalyse ved starten af din tid og sammensætter den perfekte behandling til din hudtype og dine ønsker.</p>"
          },
          {
            question: "Tilbyder I BB Glow?",
            answer: "<p>Ja. BB Glow er en del af vores ansigtsbehandlinger. Med microneedling sluses et meso-serum med farvepigmenter og vitaminer ned i hudens øverste lag, så du får en ensartet teint og en naturlig glød. For et optimalt resultat anbefaler vi et kurforløb på 3–4 behandlinger med 2–3 ugers mellemrum. Spørg din behandler, om BB Glow passer til din hud.</p>"
          }
        ];
      }
      if (s.pre_instructions.length === 0) {
        s.pre_instructions = [
          "Undgå voksning eller hårfjerningscreme i ansigtet 48 timer før",
          "Undgå skrappe eksfolieringer eller retinolprodukter 3 dage før",
          "Mænd bør undgå tæt barbering på selve behandlingsdagen for at undgå irritation",
          "Informér din behandler, hvis du bruger receptpligtig hudmedicin"
        ];
      }
      if (s.post_instructions.length === 0) {
        s.post_instructions = [
          "Undgå direkte makeup på huden de første 12–24 timer for at lade porerne ånde",
          "Undgå hård træning, sauna og dampbad på selve behandlingsdagen",
          "Beskyt altid din nybehandlede hud med en god solcreme (mindst SPF 30)",
          "Drik rigeligt med vand for at støtte hudens naturlige udrensning"
        ];
      }
      break;

    case "sugaring":
      if (!s.long_description || s.long_description.length < 200) {
        s.long_description = `<p>Sugaring er en af de ældste, mest skånsomme og naturlige metoder til midlertidig hårfjerning. Behandlingen udføres med en 100% naturlig sukkerpasta lavet udelukkende af sukker, vand og citronsaft. Sukkerpastaen påføres mod hårretningen og trækkes lynhurtigt af i hårets naturlige vækstretning. Dette reducerer smerten markant og minimerer risikoen for knækkede hår.</p><p>Da massen kun klæber sig til hårene og ikke til de levende hudceller, er sugaring ekstremt skånsomt og velegnet til selv de mest følsomme områder, herunder intim hårfjerning (Intim Sugaring / Brazilian) for både mænd og kvinder.</p><h3>Silkeblød hud i ugevis</h3><p>Når hårene fjernes helt fra roden med sugaring, tager det markant længere tid for dem at vokse ud igen sammenlignet med barbering. Du kan nyde glat hud i 4–6 uger.</p><p>Over tid vil du desuden opleve, at de nye hår vokser ud meget blødere, finere og svagere, og mange oplever, at hårvæksten reduceres mærkbart over et regelmæssigt forløb. Desuden reduceres forekomsten af indgroede hår markant, da hårene ikke knækker under huden.</p>`;
      }
      if (s.benefits.length === 0) {
        s.benefits = [
          { icon: "leaf", title: "100% Naturligt", description: "Lavet udelukkende af sukker, vand og citron. Indeholder ingen kemikalier." },
          { icon: "shield", title: "Færre indgroede hår", description: "Hårene trækkes ud i vækstretningen, så de ikke knækker under huden." },
          { icon: "star", title: "Ekstremt skånsom", description: "Klæber kun til håret, ikke huden. Perfekt til sart hud og intimzoner." }
        ];
      }
      if (s.faq.length === 0) {
        s.faq = [
          {
            question: "Hvor langt skal håret være til sugaring?",
            answer: "<p>Hårene skal være mindst 5–6 mm lange (cirka 2 ugers udgroning efter barbering). Dette sikrer, at sukkerpastaen kan få ordentligt fat og trække hårsækken helt med op.</p>"
          },
          {
            question: "Er sugaring bedre end almindelig voks?",
            answer: "<p>Ja, mange foretrækker sugaring frem for voks, da sukkeret trækker hårene ud <em>med</em> groretningen i stedet for mod. Dette mindsker smerten, minimerer hudirritation og forhindrer, at hårene knækker og bliver til indgroede hår.</p>"
          },
          {
            question: "Hvor ofte skal jeg have sugaring?",
            answer: "<p>Vi anbefaler en sugaring-behandling hver 4.-6. uge. Regelmæssighed sikrer, at hårene fanges i den rigtige vækstfase, hvilket gør hårene markant finere over tid.</p>"
          }
        ];
      }
      if (s.pre_instructions.length === 0) {
        s.pre_instructions = [
          "Lad håret vokse til mindst 5-6 mm før behandlingen",
          "Undgå at påføre cremer, olier eller deodoranter på området på selve dagen",
          "Eksfoliér gerne området blidt 1-2 dage før for at løsne døde hudceller",
          "Undgå solbadning eller solarium 24 timer før behandlingen"
        ];
      }
      if (s.post_instructions.length === 0) {
        s.post_instructions = [
          "Undgå varme bade, sauna, dampbad og solbadning i de første 24 timer",
          "Undgå hård træning og intens sved i 24 timer for at undgå røde knopper",
          "Undgå stramt tøj lige efter behandlingen for at minimere gnidningsirritation",
          "Undgå skrappe scrubs eller peelinger på området i 48 timer",
          "Hold området rent, og påfør kun milde, beroligende produkter som aloe vera"
        ];
      }
      break;

    case "tandblegning":
      if (!s.long_description || s.long_description.length < 200) {
        s.long_description = `<p>Få dit drømmesmil tilbage med en skånsom og effektiv kosmetisk tandblegning hos Skønhedsklinik Aarhus. Vores tandblegning er 100% smertefri og skader hverken tændernes emalje eller dit tandkød. Vi anvender en mild blegegel i kombination med et koldt LED-lys, som skånsomt nedbryder misfarvninger fra kaffe, te, rødvin, tobak og madvarer.</p><p>Allerede efter en enkelt behandling på kun 45–60 minutter vil du opleve en synlig forandring, hvor dine tænder typisk bliver mellem 2 og 8 toner lysere. Det er den perfekte og sikreste genvej til et sundt, hvidt og strålende smil.</p><h3>Sikker og smertefri blegning</h3><p>I modsætning til ældre tandblegningsmetoder eller hjemmekits, der kan give stærke isninger i tænderne, er vores kosmetiske blegning skånsom og behagelig. Gelen indeholder under 0,1% hydrogenperoxid, hvilket overholder alle EU-direktiver og sikrer en fuldstændig smertefri proces uden bivirkninger.</p><p>Uanset om du skal til bryllup, konfirmation, jobsamtale eller bare ønsker et selvtillidsboost i hverdagen, er vores kosmetiske tandblegning den mest effektive og sikre løsning.</p>`;
      }
      if (s.benefits.length === 0) {
        s.benefits = [
          { icon: "star", title: "2-8 Toner lysere", description: "Hurtige og synlige resultater på under en time." },
          { icon: "shield", title: "100% Smertefrit", description: "Ingen isninger, smerter eller skader på emaljen og tandkødet." },
          { icon: "leaf", title: "Skånsom LED-teknik", description: "Mild gel kombineret med koldt blåt LED-lys for optimal sikkerhed." }
        ];
      }
      if (s.faq.length === 0) {
        s.faq = [
          {
            question: "Gør tandblegningen ondt?",
            answer: "<p>Nej, behandlingen er 100% smertefri! Vores gel er ekstremt skånsom og giver hverken smerter under behandlingen eller isninger bagefter, hvilket traditionelle tandblegninger hos tandlægen ellers kan gøre.</p>"
          },
          {
            question: "Hvor længe holder resultatet?",
            answer: "<p>Holdbarheden afhænger meget af dine mad- og drikkevaner samt mundhygiejne. Typisk holder resultatet i 6–12 måneder. Forbrug af misfarvende syreholdige drikke (kaffe, cola, rødvin) eller rygning vil forkorte holdbarheden.</p>"
          }
        ];
      }
      if (s.pre_instructions.length === 0) {
        s.pre_instructions = [
          "Børst dine tænder grundigt inden din tid",
          "Få gerne foretaget en almindelig tandrensning hos din egen tandlæge inden forløbet for optimal effekt",
          "Bemærk at plastfyldninger, kroner eller broer ikke bleges, men genfinder deres oprindelige farve"
        ];
      }
      if (s.post_instructions.length === 0) {
        s.post_instructions = [
          "Undgå mad og drikke med stærke farvestoffer (kaffe, te, rødvin, karry, lakrids) i de første 48 timer ('den hvide diæt')",
          "Undgå rygning og e-cigaretter i 48 timer efter behandlingen",
          "Drik primært vand og spis lyse/hvide fødevarer (kylling, ris, kartofler, mælk) de første to døgn"
        ];
      }
      break;

    case "threading":
      if (!s.long_description || s.long_description.length < 200) {
        s.long_description = `<p>Threading (eller ansigtstrådning) er en urgammel og yderst præcis hårfjerningsmetode, hvor der anvendes en speciel, steril bomuldstråd. Tråden rulles hen over huden i en tæt løkke, som fanger og trækker selv de fineste dun og hårsække helt op ved roden. Metoden er verdenskendt for sin uovertrufne præcision og er den absolut bedste teknik til at forme perfekte øjenbryn samt fjerne uønsket hårvækst i ansigtet (overlæbe, hage og kinder).</p><p>Da threading overhovedet ikke involverer varme, voks eller kemikalier, slides der ikke på hudens yderste barriere. Det gør det til den mest skånsomme metode for den sarte ansigtshud, og behandlingen anbefales varmt til personer med følsom hud eller allergi.</p><h3>Perfekt definerede bryn og silkeblød ansigtshud</h3><p>I modsætning til pincetter, der kun tager ét hår ad gangen, kan threading fjerne hele rækker af hår på én gang med millimeterpræcision. Dette skaber knivskarpe linjer og en perfekt symmetri til dine øjenbryn, som rammer dit ansigt smukt ind.</p><p>Når de fine dun i ansigtet (peach fuzz) fjernes fuldstændigt med tråd, efterlades huden silkeblød og glat. Det giver desuden din makeup en fejlfri og fuldstændig jævn finish, og dine hudplejeprodukter trænger markant bedre ind i huden.</p>`;
      }
      if (s.benefits.length === 0) {
        s.benefits = [
          { icon: "star", title: "Knivskarp præcision", description: "Fjerner selv de mindste dun og definerer bryn med millimeterpræcision." },
          { icon: "leaf", title: "100% Naturligt & skånsomt", description: "Ingen kemikalier, voks eller varme – kun ren bomuldstråd. Perfekt til sart hud." },
          { icon: "clock", title: "Langtidsholdbart", description: "Hårene trækkes op ved roden, så huden forbliver glat i 3–5 uger." }
        ];
      }
      if (s.faq.length === 0) {
        s.faq = [
          {
            question: "Gør threading ondt?",
            answer: "<p>De fleste oplever en hurtig, prikkende fornemmelse i huden. Da hårene fjernes hurtigt i rækker, er ubehaget kortvarigt og aftager med det samme. Mange finder det mindre smertefuldt end at plukke med pincet.</p>"
          },
          {
            question: "Hvorfor vælge threading frem for voks i ansigtet?",
            answer: "<p>Threading trækker ikke i selve huden, hvilket voks gør. Derved undgår man rødme, afskalning og slap hud over tid. Threading er desuden mere hygiejnisk, da der bruges en ny, ren tråd hver gang.</p>"
          }
        ];
      }
      if (s.pre_instructions.length === 0) {
        s.pre_instructions = [
          "Undgå at bruge pincet eller barbere ansigtet 2 uger før behandlingen",
          "Mød op med et rent ansigt uden tung makeup på selve behandlingsdagen",
          "Undgå aktive syreprodukter eller stærke scrubs 24 timer før"
        ];
      }
      if (s.post_instructions.length === 0) {
        s.post_instructions = [
          "Undgå at røre ved det behandlede område de første timer for at forhindre bakterier i de åbne porer",
          "Undgå makeup, parfumerede cremer og direkte sol på området i 24 timer",
          "Brug en mild aloe vera gel eller kildevandsspray til at berolige huden, hvis der opstår let rødme"
        ];
      }
      break;

    case "bb-glow":
      if (!s.long_description || s.long_description.length < 200) {
        s.long_description = `<p>BB Glow er en af de mest populære og revolutionerende anti-aging og hudforskønnende behandlinger på markedet. Behandlingen udføres med avanceret microneedling (eller nanoneedling), hvor et specialudviklet meso-serum med naturlige farvepigmenter og intensive vitaminer sluses blidt ned i hudens øverste lag. Det giver huden en smuk, ensartet og langvarig 'BB-creme-effekt' med en uimodståelig, naturlig glød.</p><p>Udover at give en jævn hudtone arbejder BB Glow intenst på at reducere pigmentforandringer, solskader, fine linjer, mørke render under øjnene samt ar efter akne. Huden boostes med fugt og kollagen helt indefra.</p><h3>Udligner uregelmæssigheder og giver strålende glød</h3><p>BB Glow er den perfekte behandling til dig, der ønsker at vågne op hver dag med et friskt, jævnt og velplejet udseende uden at skulle lægge foundation eller pudder.</p><p>Huden efterlades med en markant mere ensartet farve og en sund udstråling. Behandlingen er smertefri og kræver ingen restitutionstid, så du kan fortsætte din dag med det samme med et strålende smil.</p>`;
      }
      if (s.benefits.length === 0) {
        s.benefits = [
          { icon: "star", title: "Ensartet hudtone", description: "Reducerer rødme, hyperpigmentering og mørke render synligt." },
          { icon: "leaf", title: "Intens kollagen-boost", description: "Microneedling stimulerer hudens egen kollagenproduktion for øget elasticitet." },
          { icon: "shield", title: "Langvarig glød", description: "Vågn op med en sund og strålende hud med en naturlig BB-creme-finish." }
        ];
      }
      if (s.faq.length === 0) {
        s.faq = [
          {
            question: "Hvor mange BB Glow behandlinger skal man have?",
            answer: "<p>Allerede efter den første behandling vil du opleve en flot effekt. For at opnå et optimalt og langvarigt resultat (der holder i op til 6 måneder) anbefaler vi et kurforløb på 3–4 behandlinger med 2-3 ugers mellemrum.</p>"
          },
          {
            question: "Er BB Glow en tatovering?",
            answer: "<p>Nej, BB Glow er ikke en tatovering! Meso-serummet sluses kun ned i epidermis (hudens allerøverste lag) og indeholder godkendte, biologiske ingredienser, som huden gradvist og naturligt omsætter over tid.</p>"
          }
        ];
      }
      if (s.pre_instructions.length === 0) {
        s.pre_instructions = [
          "Undgå solbadning og solarium i minimum 7 dage før behandlingen",
          "Undgå aktive hudplejeprodukter (retinol, syrer) 3-5 dage før",
          "Huden skal være intakt og må ikke have aktive udbrud af akne eller herpes på dagen"
        ];
      }
      if (s.post_instructions.length === 0) {
        s.post_instructions = [
          "Undgå at vaske ansigtet med vand de første 24 timer for at lade serummet virke fuldt ud",
          "Undgå makeup de første 24–48 timer efter behandlingen",
          "Brug altid en god solcreme (SPF 50) i ugerne efter for at beskytte mod nye pigmentpletter",
          "Undgå sauna, dampbad, varme bade og hård svedfremkaldende træning i 3 dage"
        ];
      }
      break;

    case "bryn-og-vipper":
      if (!s.long_description || s.long_description.length < 200) {
        s.long_description = `<p>Fremhæv dine øjnes naturlige skønhed med vores professionelle bryn- og vippebehandlinger hos Skønhedsklinik Aarhus. Vi tilbyder et bredt udvalg af behandlinger – herunder farvning af bryn og vipper, præcis retning med voks og pincet, samt det utroligt populære Lash Lift (vippebuk) og Brow Lamination (bryn-løft). Hver eneste behandling skræddersyes nøje efter dine ansigtstræk, farver og personlige ønsker.</p><p>Vi anvender milde, skånsomme kvalitetsprodukter, som plejer og styrker hårene undervejs, så du opnår et sundt, smukt og langtidsholdbart resultat.</p><h3>Vågn op med et friskt og åbent blik</h3><p>Et Lash Lift er den ideelle løsning til dig, der ønsker smukt buede vipper, som får dine øjne til at se større og mere åbne ud, helt uden brug af vippebukker eller mascara.</p><p>Kombineret med Brow Lamination og farvning kan du tæmme vilde brynhår og give dem en fyldig, perfekt defineret form, der holder i ugevis. Det sparer dig dyrebar tid foran spejlet hver eneste morgen.</p>`;
      }
      if (s.benefits.length === 0) {
        s.benefits = [
          { icon: "star", title: "Lash Lift & Laminering", description: "Giver vipperne et smukt naturligt buk og brynene en flot, fyldig form." },
          { icon: "clock", title: "Holdbarhed i 4-6 uger", description: "Flotte og velplejede bryn og vipper, der holder formen i op til halvanden måned." },
          { icon: "leaf", title: "Milde & plejende produkter", description: "Skånsomme ingredienser, der beskytter og styrker hårene under behandlingen." }
        ];
      }
      if (s.faq.length === 0) {
        s.faq = [
          {
            question: "Hvad er forskellen på Lash Lift og Eyelash Extensions?",
            answer: "<p>Lash Lift er et semi-permanent buk af dine egne, naturlige vipper. Der påsættes ingen kunstige hår. Det er en ekstremt nem, naturlig og vedligeholdelsesfri løsning, der ikke skader dine egne vipper.</p>"
          },
          {
            question: "Hvor ofte skal jeg have lavet Lash Lift / Brow Lamination?",
            answer: "<p>Da dine bryn- og vippehår naturligt fornys løbende, anbefaler vi en ny behandling hver 5.-7. uge for at vedligeholde det smukke og skarpe buk og løft.</p>"
          }
        ];
      }
      if (s.pre_instructions.length === 0) {
        s.pre_instructions = [
          "Mød op fuldstændig uden øjenmakeup og mascara til din tid",
          "Undgå at bruge olieholdige makeupfjernere på øjnene på selve behandlingsdagen",
          "Fjern kontaktlinser inden behandlingen påbegyndes"
        ];
      }
      if (s.post_instructions.length === 0) {
        s.post_instructions = [
          "Undgå at udsætte bryn og vipper for vand, damp, sved og makeup de første 24 timer (vigtigt for at bukkets form sætter sig)",
          "Undgå at sove med ansigtet direkte nede i puden det første døgn",
          "Undgå olieholdige produkter på øjnene for at forlænge holdbarheden af farven og løftet"
        ];
      }
      break;

    case "wax-behandling":
    case "mix-sugaring-og-wax":
      if (!s.long_description || s.long_description.length < 200) {
        s.long_description = `<p>Få silkeblød, glat og hårfri hud med vores professionelle voksbehandlinger hos Skønhedsklinik Aarhus. Vi tilbyder både traditionel voksbehandling af højeste kvalitet samt vores yderst populære <strong>Mix Sugaring & Voksbehandling</strong>. Ved at kombinere det bedste fra begge verdener anvender vi den milde, naturlige sugaring på hudens mest følsomme områder (såsom ansigt, armhuler og intimzone) og hurtig, effektiv strip-voks på de større flader (som arme og ben).</p><p>Denne kombinerede tilgang sikrer dig en maksimalt behagelig, hurtig og yderst skånsom hårfjerningsoplevelse, hvor huden efterlades helt glat og uden den voldsomme irritation, som barbering ofte medfører.</p><h3>Holdbart resultat uden stubbe</h3><p>Når hårene hives ud ved roden med voks eller sugaring, undgår du de stikkende stubbe, der ellers dukker op dagen efter barbering. Huden forbliver blød og hårfri i 4–6 uger.</p><p>Over tid vil dine hårsække blive svagere, hvilket medfører en markant finere, blødere og langsommere hårvækst. Det er den perfekte løsning til dig, der ønsker en bekymringsfri hverdag uden skraber.</p>`;
      }
      if (s.benefits.length === 0) {
        s.benefits = [
          { icon: "leaf", title: "Kombineret luksus", description: "Brug af sugaring på de følsomme områder og voks på de store områder for optimal komfort." },
          { icon: "shield", title: "Ingen skarpe stubbe", description: "Hårene fjernes helt fra roden, så de vokser ud igen som bløde, fine hår." },
          { icon: "star", title: "Mindre irritation", description: "Reduceret risiko for røde knopper, svie og indgroede hår sammenlignet med barbering." }
        ];
      }
      if (s.faq.length === 0) {
        s.faq = [
          {
            question: "Hvad er fordelen ved at mixe sugaring og voks?",
            answer: "<p>Ved at mixe kan vi skræddersy behandlingen perfekt til din krop. Vi bruger den blide sugaring på de ekstremt følsomme områder (intim/brasiliansk, ansigt og armhuler) for at undgå hudirritation, og den hurtige voks på ben og arme for at gøre behandlingen så effektiv og hurtig som muligt.</p>"
          },
          {
            question: "Hvor lange skal hårene være før voksning?",
            answer: "<p>Hårene skal være mindst 5–6 mm lange (cirka 2 ugers udgroning efter barbering). Hvis hårene er for korte, kan voksen ikke få fat, og hvis de er for lange, kan det nappe lidt ekstra under aftrækket.</p>"
          }
        ];
      }
      if (s.pre_instructions.length === 0) {
        s.pre_instructions = [
          "Sørg for, at hårene har en længde på mindst 5–6 mm",
          "Undgå at smøre kroppen ind i creme eller kropsolie på selve behandlingsdagen",
          "Eksfoliér gerne huden blidt dagen før for at fjerne døde hudceller og løfte hårene"
        ];
      }
      if (s.post_instructions.length === 0) {
        s.post_instructions = [
          "Undgå varme bade, sauna, solbadning og solarium de første 24 timer",
          "Undgå hård træning og intens sved i 24 timer for at undgå røde knopper",
          "Undgå stramt tøj lige efter behandlingen for at lade huden ånde",
          "Påfør kun milde og beroligende produkter (fx ren aloe vera gel) det første døgn"
        ];
      }
      break;

    default:
      // Fallback in case a new service is added
      if (!s.long_description) {
        s.long_description = `<p>${s.short_description || ""}</p>`;
      }
      break;
  }

  return s;
}
