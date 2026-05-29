/**
 * Central place for constructing Planway booking URLs.
 *
 * --- Planway deep-linking status (investigated 2026-05-29) ---
 * Planway publishes NO public documentation for deep-linking a service, and the
 * live booking widget JS (assets/js/widget.js) does NOT read any URL query param
 * to pre-select a service — selection only happens by clicking elements with a
 * `data-id` inside the widget. So appending a param here currently has no effect
 * on Planway's side; it is forward-compatible plumbing, not a working deep link.
 *
 * If Planway later adds support (or the real format is confirmed from the
 * dashboard), this is a ONE-LINE change: update PLANWAY_SERVICE_PARAM (and, if
 * needed, the URL shape in buildPlanwayUrl). Everything else flows from here.
 *
 * The ID appended is the service's `planway_service_id` (Planway's internal id),
 * NOT our site slug. Populate it per service in the admin CMS
 * (/admin/behandlinger → "Planway Service ID"). Until it's populated,
 * buildPlanwayUrl falls back to the plain base URL automatically.
 */

export const PLANWAY_BASE_URL = "https://skonhedsklinik-aarhus.planway.com/";

/**
 * Query param Planway would use to pre-select a service.
 * UNVERIFIED best guess — see file header. Change only this when confirmed.
 */
export const PLANWAY_SERVICE_PARAM = "service";

/**
 * Build a Planway booking URL, optionally deep-linked to a specific service.
 * Returns the bare base URL when no Planway service id is supplied.
 */
export function buildPlanwayUrl(planwayServiceId?: string | null): string {
  if (!planwayServiceId) return PLANWAY_BASE_URL;
  const url = new URL(PLANWAY_BASE_URL);
  url.searchParams.set(PLANWAY_SERVICE_PARAM, planwayServiceId);
  return url.toString();
}

/** Minimal service info the /book page hands to the client booking embed. */
export type BookableService = {
  slug: string;
  name: string;
  /** Planway's internal service id, or null until mapped in the CMS. */
  planwayServiceId: string | null;
};
