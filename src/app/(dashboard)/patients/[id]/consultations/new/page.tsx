import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ConsultationForm } from "@/components/consultations/ConsultationForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Patient } from "@/types";

interface NewConsultationPageProps {
  params: Promise<{ id: string }>;
}

export default async function NewConsultationPage({ params }: NewConsultationPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: patient } = await supabase
    .from("patients")
    .select("id, full_name")
    .eq("id", id)
    .single();

  if (!patient) notFound();

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/patients/${id}`}>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nova Consulta</h1>
          <p className="text-muted-foreground text-sm">{patient.full_name}</p>
        </div>
      </div>
      <ConsultationForm patientId={id} />
    </div>
  );
}
