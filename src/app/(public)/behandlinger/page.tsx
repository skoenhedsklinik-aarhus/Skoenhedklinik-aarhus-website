import type { Metadata } from "next";
import { getServices } from "@/lib/supabase-queries";
import { ServicesClient } from "./ServicesClient";

export const metadata: Metadata = {
  title: "Vores behandlinger — Skønhedsklinik Aarhus",
  description:
    "Udforsk alle vores skønhedsbehandlinger: laser hårfjerning, ansigtsbehandlinger, sugaring, tattoo-fjernelse, tandblegning og meget mere. Book gratis konsultation i dag.",
  alternates: { canonical: "/behandlinger" },
  openGraph: {
    title: "Vores behandlinger — Skønhedsklinik Aarhus",
    description:
      "Se alle behandlinger hos Skønhedsklinik Aarhus i Aarhus C. Laser hårfjerning, laser, sugaring, ansigtsbehandlinger og mere.",
    url: "/behandlinger",
  },
};

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const services = await getServices();

  return <ServicesClient services={services} />;
}

