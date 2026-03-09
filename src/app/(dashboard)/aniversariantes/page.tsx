import { createClient } from "@/lib/supabase/server";
import { AniversariantesClient } from "@/components/aniversariantes/AniversariantesClient";

export default async function AniversariantesPage() {
  const supabase = await createClient();
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const { data: patients } = await supabase
    .from("patients")
    .select("id, full_name, birth_date, phone")
    .order("full_name");

  const allPatients = (patients ?? []) as {
    id: string;
    full_name: string;
    birth_date: string;
    phone: string;
  }[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Aniversariantes</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Pacientes que fazem aniversário no mês selecionado
        </p>
      </div>
      <AniversariantesClient
        allPatients={allPatients}
        initialMonth={currentMonth}
        initialYear={currentYear}
      />
    </div>
  );
}
