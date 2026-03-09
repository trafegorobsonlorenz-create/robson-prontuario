import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SurgeryForm } from "@/components/surgeries/SurgeryForm";
import type { Patient } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function NewSurgeryPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: patient } = await supabase
    .from("patients")
    .select("id, full_name")
    .eq("id", id)
    .single();

  if (!patient) notFound();

  const p = patient as Pick<Patient, "id" | "full_name">;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/patients/${id}`}>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Registrar Cirurgia</h1>
          <p className="text-muted-foreground text-sm">{p.full_name}</p>
        </div>
      </div>
      <SurgeryForm patientId={id} />
    </div>
  );
}
