/**
 * Behandlingskategorier — værdier og læsbare etiketter.
 *
 * Værdierne er låst af CHECK-constraints i databasen (services_category_check
 * og den tilsvarende på pricing_tiers), så de må ikke ændres. Etiketterne er
 * kun til admin-brugeren og kan frit rettes.
 *
 * Ligger samlet her, så behandlinger og priser aldrig kan vise forskellige
 * navne for den samme kategori.
 */
export const SERVICE_CATEGORIES: { value: string; label: string }[] = [
  { value: "haarfjerning", label: "Laser hårfjerning" },
  { value: "sugaring", label: "Sugaring" },
  { value: "wax", label: "Wax" },
  { value: "ansigt", label: "Ansigtsbehandling" },
  { value: "bryn-vipper", label: "Bryn & vipper" },
  { value: "tand", label: "Tandblegning" },
  { value: "threading", label: "Threading" },
  { value: "tatovering", label: "Tattoo fjernelse" },
  { value: "andet", label: "Andet" },
];

const LABELS = new Map(SERVICE_CATEGORIES.map((c) => [c.value, c.label]));

/**
 * Læsbart navn for en kategoriværdi. Ukendte værdier (fx en kategori tilføjet
 * direkte i databasen) vises pænt i stedet for at forsvinde.
 */
export function categoryLabel(value: string | null | undefined): string {
  if (!value) return "Andet";
  const known = LABELS.get(value);
  if (known) return known;
  const pretty = value.replace(/[-_]/g, " ");
  return pretty.charAt(0).toUpperCase() + pretty.slice(1);
}
