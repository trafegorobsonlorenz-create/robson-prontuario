import { createClient } from "@/lib/supabase/server";
import type { FollowUpWithPatient } from "@/types";
import { AlertsClient } from "@/components/follow-ups/AlertsClient";

export default async function AlertasPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("follow_ups")
    .select(`
      *,
      patients(id, full_name, phone, main_condition)
    `)
    .neq("status", "done")
    .order("scheduled_date", { ascending: true });

  const followUps = (data ?? []) as FollowUpWithPatient[];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const in30Days = new Date(today);
  in30Days.setDate(in30Days.getDate() + 30);

  const overdue = followUps.filter(
    (f) => new Date(f.scheduled_date + "T00:00:00") < today && f.status === "pending"
  );
  const upcoming = followUps.filter((f) => {
    const d = new Date(f.scheduled_date + "T00:00:00");
    return d >= today && d <= in30Days;
  });
  const future = followUps.filter((f) => {
    const d = new Date(f.scheduled_date + "T00:00:00");
    return d > in30Days;
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Alertas de Recontato</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          {overdue.length > 0 && (
            <span className="text-red-600 font-medium">{overdue.length} vencido{overdue.length !== 1 ? "s" : ""} · </span>
          )}
          {upcoming.length} nos próximos 30 dias · {future.length} futuros
        </p>
      </div>

      <AlertsClient overdue={overdue} upcoming={upcoming} future={future} />
    </div>
  );
}
