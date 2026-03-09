import { createClient } from "@/lib/supabase/server";
import { FinanceiroClient } from "@/components/financeiro/FinanceiroClient";
import type { AppointmentWithPatient } from "@/types";

export default async function FinanceiroPage() {
  const supabase = await createClient();

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const from = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const to = `${year}-${String(month).padStart(2, "0")}-${lastDay}`;

  const { data } = await supabase
    .from("appointments")
    .select("*, patients(id, full_name, phone, main_condition)")
    .gte("appointment_date", from)
    .lte("appointment_date", to)
    .neq("status", "cancelled")
    .order("appointment_date", { ascending: true })
    .order("appointment_time", { ascending: true });

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
        <p className="text-muted-foreground text-sm">Controle de pagamentos por consulta</p>
      </div>
      <FinanceiroClient
        initialAppointments={(data ?? []) as AppointmentWithPatient[]}
        initialYear={year}
        initialMonth={month}
      />
    </div>
  );
}
