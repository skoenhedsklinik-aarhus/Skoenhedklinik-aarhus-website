import { ServiceForm } from "../ServiceForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function EditServicePage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (error || !data) {
    notFound();
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link href="/admin/behandlinger" className="inline-flex items-center text-sm text-textBody hover:text-cognac transition-colors mb-4">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Tilbage til Behandlinger
        </Link>
        <h1 className="font-heading text-3xl text-textPrimary">Rediger {data.name}</h1>
      </div>
      
      <div className="bg-white rounded-xl p-8 border border-sand shadow-sm">
        <ServiceForm initialData={data} />
      </div>
    </div>
  );
}
