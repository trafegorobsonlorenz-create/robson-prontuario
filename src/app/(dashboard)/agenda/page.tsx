import { createClient } from "@/lib/supabase/server";
import { AgendaClient } from "@/components/agenda/AgendaClient";
import type { AppointmentWithPatient } from "@/types";

interface AgendaPageProps {
  searchParams: Promise<{ data?: string; view?: string }>;
}

function toISO(date: Date): string {
  return date.toISOString().split("T")[0];
}

// Retorna a segunda-feira da semana da data fornecida
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Dom, 1=Seg...
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

export default async function AgendaPage({ searchParams }: AgendaPageProps) {
  const { data: dataParam, view } = await searchParams;
  const isWeekView = view === "semana";

  const selectedDate = dataParam
    ? new Date(dataParam + "T00:00:00")
    : new Date();

  const dateStr = toISO(selectedDate);
  const supabase = await createClient();

  let appointments: AppointmentWithPatient[] = [];

  if (isWeekView) {
    // Busca a semana inteira (Seg a Dom)
    const weekStart = getWeekStart(selectedDate);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const { data } = await supabase
      .from("appointments")
      .select("*, patients(id, full_name, phone, main_condition)")
      .gte("appointment_date", toISO(weekStart))
      .lte("appointment_date", toISO(weekEnd))
      .neq("status", "cancelled")
      .order("appointment_date", { ascending: true })
      .order("appointment_time", { ascending: true });

    appointments = (data ?? []) as AppointmentWithPatient[];
  } else {
    const { data } = await supabase
      .from("appointments")
      .select("*, patients(id, full_name, phone, main_condition)")
      .eq("appointment_date", dateStr)
      .neq("status", "cancelled")
      .order("appointment_time", { ascending: true });

    appointments = (data ?? []) as AppointmentWithPatient[];
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Agendamentos · 08:00 às 11:30
        </p>
      </div>
      <AgendaClient
        appointments={appointments}
        selectedDate={dateStr}
        view={isWeekView ? "semana" : "dia"}
      />
    </div>
  );
}
