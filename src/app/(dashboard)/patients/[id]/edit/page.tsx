import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { PatientForm } from "@/components/patients/PatientForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Patient } from "@/types";

interface EditPatientPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPatientPage({ params }: EditPatientPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: patient } = await supabase
    .from("patients")
    .select("*")
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
          <h1 className="text-2xl font-bold text-gray-900">Editar Paciente</h1>
          <p className="text-muted-foreground text-sm">{(patient as Patient).full_name}</p>
        </div>
      </div>
      <PatientForm patient={patient as Patient} />
    </div>
  );
}
