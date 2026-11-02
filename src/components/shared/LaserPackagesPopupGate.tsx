import { getPricingTiers, getSiteSettings } from "@/lib/supabase-queries";
import { LASER_POPUP_SETTING } from "@/lib/laser-popup";
import { LaserPackagesPopup } from "./LaserPackagesPopup";

/**
 * Pakkerne hentes fra prislisten (laser, underkategori "Pakker"), så
 * pop-up'en og /priser altid viser de samme tal. Rettes en pris under Priser
 * i admin, følger pop-up'en med.
 */
export async function LaserPackagesPopupGate() {
  const [settings, tiers] = await Promise.all([getSiteSettings(), getPricingTiers()]);

  const pakker = tiers
    .filter((tier) => tier.category === "haarfjerning" && tier.subcategory === "Pakker")
    .map((tier) => ({ id: tier.id, navn: tier.name, pris: tier.price_dkk }));

  if (pakker.length === 0) return null;

  return (
    <LaserPackagesPopup
      pakker={pakker}
      aktiv={settings[LASER_POPUP_SETTING] === "true"}
    />
  );
}
