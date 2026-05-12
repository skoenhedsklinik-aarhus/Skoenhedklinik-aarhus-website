import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Book din tid — Skønhedsklinik Aarhus",
  robots: { index: false, follow: false },
};

export default function BookPage() {
  redirect("https://skonhedsklinik-aarhus.planway.com/");
}
