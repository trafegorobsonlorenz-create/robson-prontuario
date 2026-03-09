import { createClient } from "@/lib/supabase/server";
import { PatientList } from "@/components/patients/PatientList";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { Patient } from "@/types";

interface PatientsPageProps {
  searchParams: Promise<{ q?: string; condition?: string }>;
}

export type PatientWithLastConsultation = Patient & {
  last_consultation_date: string | null;
};

export default async function PatientsPage({ searchParams }: PatientsPageProps) {
  const { q, condition } = await searchParams;
  const supabase = await createClient();

  // Busca pacientes com a data da última consulta via subquery
  let query = supabase
    .from("patients")
    .select(`
      *,
      consultations(consultation_date)
    `)
    .order("full_name", { ascending: true });

  if (q) {
    query = query.or(`full_name.ilike.%${q}%,cpf.ilike.%${q}%`);
  }
  if (condition) {
    query = query.eq("main_condition", condition);
  }

  const { data: raw } = await query;

  // Extrai a data da última consulta de cada paciente
  const patients: PatientWithLastConsultation[] = (raw ?? []).map((p: any) => {
    const dates: string[] = (p.consultations ?? []).map((c: any) => c.consultation_date);
    const last = dates.sort().reverse()[0] ?? null;
    const { consultations: _, ...patient } = p;
    return { ...patient, last_consultation_date: last };
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pacientes</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {patients.length} paciente{patients.length !== 1 ? "s" : ""} encontrado{patients.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button asChild>
          <Link href="/patients/new">
            <Plus className="w-4 h-4" />
            Novo Paciente
          </Link>
        </Button>
      </div>

      <PatientList patients={patients} />
    </div>
  );
}
