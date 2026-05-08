import { PackageForm } from "../PackageForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function EditPackagePage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("packages_offers")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !data) {
    notFound();
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <Link href="/admin/pakker" className="inline-flex items-center text-sm text-textBody hover:text-cognac transition-colors mb-4">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Tilbage til Pakker
        </Link>
        <h1 className="font-heading text-3xl text-textPrimary">Rediger {data.name}</h1>
      </div>
      
      <div className="bg-white rounded-xl p-8 border border-sand shadow-sm">
        <PackageForm initialData={data} />
      </div>
    </div>
  );
}
