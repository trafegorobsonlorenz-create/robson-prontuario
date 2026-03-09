import { createClient } from "@/lib/supabase/server";
import { NewAppointmentForm } from "@/components/agenda/NewAppointmentForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Patient } from "@/types";

interface NewAppointmentPageProps {
  searchParams: Promise<{ data?: string; paciente?: string }>;
}

export default async function NewAppointmentPage({ searchParams }: NewAppointmentPageProps) {
  const { data: dataParam, paciente: patientId } = await searchParams;
  const supabase = await createClient();

  const { data: patients } = await supabase
    .from("patients")
    .select("id, full_name")
    .order("full_name", { ascending: true });

  const today = new Date().toISOString().split("T")[0];
  const defaultDate = dataParam ?? today;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/agenda?data=${defaultDate}`}>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Novo Agendamento</h1>
          <p className="text-muted-foreground text-sm">Marque uma consulta para o paciente</p>
        </div>
      </div>
      <NewAppointmentForm
        patients={(patients as Pick<Patient, "id" | "full_name">[]) ?? []}
        defaultDate={defaultDate}
        defaultPatientId={patientId}
      />
    </div>
  );
}
