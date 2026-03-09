"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { AppointmentWithPatient, AppointmentStatus } from "@/types";
import { TIME_SLOTS } from "@/types";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft, ChevronRight, Plus, Calendar,
  CheckCircle2, Clock, XCircle, Check, CalendarDays, List, UserX,
} from "lucide-react";

// ─── helpers ────────────────────────────────────────────────────────────────

const DAYS_PT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const DAYS_FULL = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
const MONTHS_PT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

function toISO(date: Date): string {
  return date.toISOString().split("T")[0];
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return toISO(d);
}

function getWeekStart(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return toISO(d);
}

function getNextMonday(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDay();
  if (day === 1) {
    // já é segunda, vai para a próxima
    d.setDate(d.getDate() + 7);
  } else {
    const diff = (8 - day) % 7 || 7;
    d.setDate(d.getDate() + diff);
  }
  return toISO(d);
}

function formatDisplayDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return {
    weekday: DAYS_FULL[d.getDay()],
    weekdayShort: DAYS_PT[d.getDay()],
    day: d.getDate(),
    month: MONTHS_PT[d.getMonth()],
    year: d.getFullYear(),
    isMonday: d.getDay() === 1,
  };
}

function isToday(dateStr: string): boolean {
  return dateStr === toISO(new Date());
}

// ─── WhatsApp ────────────────────────────────────────────────────────────────

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// ─── status config ────────────────────────────────────────────────────────────

const statusConfig: Record<AppointmentStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  scheduled: { label: "Aguardando", color: "text-gray-500", bg: "", icon: Clock },
  confirmed: { label: "Consulta confirmada", color: "text-green-600", bg: "bg-green-50", icon: CheckCircle2 },
  done: { label: "Compareceu", color: "text-blue-600", bg: "bg-blue-50", icon: Check },
  no_show: { label: "Faltou", color: "text-orange-600", bg: "bg-orange-50", icon: UserX },
  cancelled: { label: "Cancelado", color: "text-red-500", bg: "", icon: XCircle },
};

const locationColors: Record<string, string> = {
  "Higienópolis (Consolação)": "bg-violet-100 text-violet-700",
  "Granja Vianna": "bg-emerald-100 text-emerald-700",
  "Moema": "bg-amber-100 text-amber-700",
};

// ─── AppointmentCard (view dia) ───────────────────────────────────────────────

function AppointmentCard({ appt, onUpdate }: { appt: AppointmentWithPatient; onUpdate: () => void }) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const { label, color, bg, icon: Icon } = statusConfig[appt.status];

  async function updateStatus(status: AppointmentStatus) {
    setLoading(true);
    await supabase.from("appointments").update({ status }).eq("id", appt.id);
    setLoading(false);
    onUpdate();
  }

  function whatsappConfirm() {
    const digits = appt.patients.phone.replace(/\D/g, "");
    const number = digits.startsWith("55") ? digits : `55${digits}`;
    const d = new Date(appt.appointment_date + "T00:00:00");
    const dateFormatted = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
    const time = appt.appointment_time.slice(0, 5);
    const msg = encodeURIComponent(
      `Olá, ${appt.patients.full_name.split(" ")[0]}! Aqui é do consultório do Dr. Robson Lorenz. Sua consulta está agendada para ${dateFormatted} às ${time} em ${appt.location}. Por favor, confirme sua presença respondendo esta mensagem. Obrigado!`
    );
    window.open(`https://wa.me/${number}?text=${msg}`, "_blank");
    updateStatus("confirmed");
  }

  function whatsappNoShow() {
    const digits = appt.patients.phone.replace(/\D/g, "");
    const number = digits.startsWith("55") ? digits : `55${digits}`;
    const d = new Date(appt.appointment_date + "T00:00:00");
    const dateFormatted = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
    const msg = encodeURIComponent(
      `Olá, ${appt.patients.full_name.split(" ")[0]}! Aqui é do consultório do Dr. Robson Lorenz. Notamos que você não compareceu à consulta agendada para ${dateFormatted}. Gostaríamos de reagendar. Quando seria um bom horário para você? Obrigado!`
    );
    window.open(`https://wa.me/${number}?text=${msg}`, "_blank");
    updateStatus("no_show");
  }

  return (
    <div className={`flex items-center gap-3 px-4 py-3 border rounded-lg ${bg} hover:shadow-sm transition-shadow`}>
      <div className="text-center shrink-0 w-12">
        <p className="text-sm font-bold text-gray-900">{appt.appointment_time.slice(0, 5)}</p>
      </div>
      <div className="w-px h-8 bg-border shrink-0" />
      <div className="flex-1 min-w-0">
        <Link href={`/patients/${appt.patients.id}`} className="font-medium text-gray-900 hover:text-primary text-sm">
          {appt.patients.full_name}
        </Link>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${locationColors[appt.location] ?? "bg-gray-100 text-gray-700"}`}>
            {appt.location}
          </span>
          {appt.notes && <span className="text-xs text-muted-foreground italic truncate max-w-[180px]">{appt.notes}</span>}
        </div>
      </div>
      <div className={`hidden sm:flex items-center gap-1 text-xs font-medium shrink-0 ${color}`}>
        <Icon className="w-3.5 h-3.5" />
        {label}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {appt.status === "scheduled" && (
          <button onClick={whatsappConfirm} disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-md bg-green-500 hover:bg-green-600 text-white text-xs font-medium px-2.5 py-1.5 transition-colors disabled:opacity-50">
            <WhatsAppIcon /> Confirmar
          </button>
        )}
        {appt.status === "confirmed" && (
          <>
            <Button size="sm" variant="outline" className="text-xs h-7 text-blue-600 border-blue-200 hover:bg-blue-50" disabled={loading} onClick={() => updateStatus("done")}>
              <Check className="w-3.5 h-3.5" /> Compareceu
            </Button>
            <button onClick={whatsappNoShow} disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium px-2.5 py-1.5 transition-colors disabled:opacity-50">
              <WhatsAppIcon /> Faltou
            </button>
          </>
        )}
        {(appt.status === "scheduled" || appt.status === "confirmed") && (
          <Button size="sm" variant="ghost" className="text-xs h-7 text-red-500 hover:text-red-600 hover:bg-red-50" disabled={loading} onClick={() => updateStatus("cancelled")}>
            <XCircle className="w-3.5 h-3.5" />
          </Button>
        )}
        {(appt.status === "done" || appt.status === "no_show") && (
          <Button size="sm" variant="ghost" className="text-xs h-7 text-gray-400 hover:text-gray-600" disabled={loading} onClick={() => updateStatus("confirmed")} title="Desfazer">
            ↩
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── AppointmentPill (view semana) ────────────────────────────────────────────

function AppointmentPill({ appt, onUpdate }: { appt: AppointmentWithPatient; onUpdate: () => void }) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const { color, bg } = statusConfig[appt.status];

  async function updateStatus(status: AppointmentStatus) {
    setLoading(true);
    await supabase.from("appointments").update({ status }).eq("id", appt.id);
    setLoading(false);
    onUpdate();
  }

  function whatsappConfirm() {
    const digits = appt.patients.phone.replace(/\D/g, "");
    const number = digits.startsWith("55") ? digits : `55${digits}`;
    const d = new Date(appt.appointment_date + "T00:00:00");
    const dateFormatted = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
    const time = appt.appointment_time.slice(0, 5);
    const msg = encodeURIComponent(
      `Olá, ${appt.patients.full_name.split(" ")[0]}! Aqui é do consultório do Dr. Robson Lorenz. Sua consulta está agendada para ${dateFormatted} às ${time} em ${appt.location}. Por favor, confirme sua presença respondendo esta mensagem. Obrigado!`
    );
    window.open(`https://wa.me/${number}?text=${msg}`, "_blank");
    updateStatus("confirmed");
  }

  function whatsappNoShow() {
    const digits = appt.patients.phone.replace(/\D/g, "");
    const number = digits.startsWith("55") ? digits : `55${digits}`;
    const d = new Date(appt.appointment_date + "T00:00:00");
    const dateFormatted = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
    const msg = encodeURIComponent(
      `Olá, ${appt.patients.full_name.split(" ")[0]}! Aqui é do consultório do Dr. Robson Lorenz. Notamos que você não compareceu à consulta agendada para ${dateFormatted}. Gostaríamos de reagendar. Quando seria um bom horário para você? Obrigado!`
    );
    window.open(`https://wa.me/${number}?text=${msg}`, "_blank");
    updateStatus("no_show");
  }

  return (
    <div className={`rounded-md border px-2 py-1.5 text-xs ${bg} group`}>
      <div className="flex items-center justify-between gap-1">
        <span className="font-semibold text-gray-800">{appt.appointment_time.slice(0, 5)}</span>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {appt.status === "scheduled" && (
            <button onClick={whatsappConfirm} disabled={loading} title="Confirmar via WhatsApp"
              className="rounded bg-green-500 hover:bg-green-600 text-white p-0.5 transition-colors">
              <WhatsAppIcon />
            </button>
          )}
          {appt.status === "confirmed" && (
            <>
              <button onClick={() => updateStatus("done")} disabled={loading} title="Compareceu"
                className="rounded bg-blue-500 hover:bg-blue-600 text-white p-0.5 transition-colors">
                <Check className="w-3 h-3" />
              </button>
              <button onClick={whatsappNoShow} disabled={loading} title="Faltou — enviar WhatsApp"
                className="rounded bg-orange-500 hover:bg-orange-600 text-white p-0.5 transition-colors">
                <UserX className="w-3 h-3" />
              </button>
            </>
          )}
          {(appt.status === "scheduled" || appt.status === "confirmed") && (
            <button onClick={() => updateStatus("cancelled")} disabled={loading} title="Cancelar"
              className="rounded bg-red-400 hover:bg-red-500 text-white p-0.5 transition-colors">
              <XCircle className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
      <Link href={`/patients/${appt.patients.id}`} className={`block truncate font-medium hover:underline ${color || "text-gray-700"}`}>
        {appt.patients.full_name.split(" ")[0]}
      </Link>
      <span className={`inline-flex mt-0.5 items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${locationColors[appt.location] ?? "bg-gray-100 text-gray-600"}`}>
        {appt.location}
      </span>
    </div>
  );
}

// ─── WeekView ─────────────────────────────────────────────────────────────────

function WeekView({ appointments, weekStartStr, onUpdate }: {
  appointments: AppointmentWithPatient[];
  weekStartStr: string;
  onUpdate: () => void;
}) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStartStr, i));
  const todayStr = toISO(new Date());

  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((dayStr) => {
        const { weekdayShort, day, month, isMonday } = formatDisplayDate(dayStr);
        const dayAppts = appointments.filter((a) => a.appointment_date === dayStr);
        const isCurrentDay = dayStr === todayStr;

        return (
          <div key={dayStr} className={`rounded-lg border bg-white overflow-hidden ${isMonday ? "ring-2 ring-primary/30" : ""}`}>
            {/* Header do dia */}
            <div className={`px-2 py-2 text-center border-b ${isCurrentDay ? "bg-primary text-white" : isMonday ? "bg-primary/5" : "bg-gray-50"}`}>
              <p className={`text-xs font-semibold uppercase tracking-wide ${isCurrentDay ? "text-white" : "text-muted-foreground"}`}>
                {weekdayShort}
              </p>
              <p className={`text-lg font-bold leading-tight ${isCurrentDay ? "text-white" : "text-gray-900"}`}>
                {day}
              </p>
              <p className={`text-[10px] ${isCurrentDay ? "text-white/80" : "text-muted-foreground"}`}>
                {month}
              </p>
            </div>

            {/* Agendamentos */}
            <div className="p-1.5 space-y-1 min-h-[80px]">
              {dayAppts.length === 0 ? (
                <p className="text-[10px] text-center text-muted-foreground pt-2">—</p>
              ) : (
                dayAppts.map((appt) => (
                  <AppointmentPill key={appt.id} appt={appt} onUpdate={onUpdate} />
                ))
              )}
              <Link
                href={`/agenda/novo?data=${dayStr}`}
                className="flex items-center justify-center w-full mt-1 rounded border border-dashed border-gray-200 py-1 text-[10px] text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <Plus className="w-2.5 h-2.5 mr-0.5" /> add
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── DayView ─────────────────────────────────────────────────────────────────

function DayView({ appointments, selectedDate, onUpdate }: {
  appointments: AppointmentWithPatient[];
  selectedDate: string;
  onUpdate: () => void;
}) {
  if (appointments.length === 0) {
    return (
      <div className="text-center py-14 text-muted-foreground border rounded-lg bg-white">
        <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="font-medium">Nenhum agendamento neste dia</p>
        <p className="text-sm mt-1 mb-4">Clique em "Agendar" para marcar uma consulta.</p>
        <Button asChild size="sm">
          <Link href={`/agenda/novo?data=${selectedDate}`}>
            <Plus className="w-3.5 h-3.5" /> Novo agendamento
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {TIME_SLOTS.map((slot) => {
        const appt = appointments.find((a) => a.appointment_time.slice(0, 5) === slot);
        if (appt) {
          return <AppointmentCard key={appt.id} appt={appt} onUpdate={onUpdate} />;
        }
        return (
          <div key={slot} className="flex items-center gap-4 px-4 py-2 rounded-lg border border-dashed border-gray-200 opacity-40">
            <span className="text-xs text-muted-foreground w-12 shrink-0">{slot}</span>
            <span className="text-xs text-muted-foreground">— livre</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── AgendaClient (main) ─────────────────────────────────────────────────────

interface AgendaClientProps {
  appointments: AppointmentWithPatient[];
  selectedDate: string;
  view: "dia" | "semana";
}

export function AgendaClient({ appointments, selectedDate, view }: AgendaClientProps) {
  const router = useRouter();
  const todayStr = toISO(new Date());
  const weekStartStr = getWeekStart(selectedDate);
  const nextMondayStr = getNextMonday(selectedDate);

  const { weekday, day, month, year } = formatDisplayDate(selectedDate);
  const { day: wsDay, month: wsMonth } = formatDisplayDate(weekStartStr);
  const { day: weDay, month: weMonth, year: weYear } = formatDisplayDate(addDays(weekStartStr, 6));

  function navigate(days: number) {
    const step = view === "semana" ? days * 7 : days;
    const newDate = addDays(selectedDate, step);
    router.push(`/agenda?data=${newDate}&view=${view}`);
  }

  function goToday() {
    router.push(`/agenda?data=${todayStr}&view=${view}`);
  }

  function goNextMonday() {
    router.push(`/agenda?data=${nextMondayStr}&view=${view}`);
  }

  function toggleView(v: "dia" | "semana") {
    router.push(`/agenda?data=${selectedDate}&view=${v}`);
  }

  const confirmedCount = appointments.filter((a) => a.status === "confirmed").length;
  const scheduledCount = appointments.filter((a) => a.status === "scheduled").length;

  const dateLabel = view === "semana"
    ? `${wsDay} ${wsMonth} — ${weDay} ${weMonth}. ${weYear}`
    : `${weekday}, ${day} de ${month}. de ${year}`;

  return (
    <div className="space-y-4 max-w-5xl">
      {/* Barra de navegação */}
      <div className="flex items-center gap-2 bg-white border rounded-lg px-4 py-3 flex-wrap">
        {/* Setas */}
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {/* Data atual */}
        <div className="flex-1 text-center min-w-0">
          <p className="font-semibold text-gray-900 capitalize truncate">{dateLabel}</p>
          {appointments.length > 0 && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {appointments.length} agendamento{appointments.length !== 1 ? "s" : ""}
              {confirmedCount > 0 && ` · ${confirmedCount} confirmado${confirmedCount !== 1 ? "s" : ""}`}
              {scheduledCount > 0 && ` · ${scheduledCount} aguardando`}
            </p>
          )}
        </div>

        <Button variant="ghost" size="icon" onClick={() => navigate(1)}>
          <ChevronRight className="w-4 h-4" />
        </Button>

        {/* Botões rápidos */}
        <div className="flex items-center gap-1.5 ml-2 flex-wrap">
          {selectedDate !== todayStr && (
            <Button variant="outline" size="sm" onClick={goToday} className="text-xs">
              Hoje
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={goNextMonday} className="text-xs">
            Próxima Segunda
          </Button>

          {/* Toggle dia / semana */}
          <div className="flex items-center border rounded-md overflow-hidden">
            <button
              onClick={() => toggleView("dia")}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium transition-colors ${view === "dia" ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-100"}`}
            >
              <List className="w-3.5 h-3.5" /> Dia
            </button>
            <button
              onClick={() => toggleView("semana")}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium transition-colors ${view === "semana" ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-100"}`}
            >
              <CalendarDays className="w-3.5 h-3.5" /> Semana
            </button>
          </div>

          <Button size="sm" asChild>
            <Link href={`/agenda/novo?data=${selectedDate}`}>
              <Plus className="w-3.5 h-3.5" /> Agendar
            </Link>
          </Button>
        </div>
      </div>

      {/* Conteúdo */}
      {view === "semana" ? (
        <WeekView
          appointments={appointments}
          weekStartStr={weekStartStr}
          onUpdate={() => router.refresh()}
        />
      ) : (
        <DayView
          appointments={appointments}
          selectedDate={selectedDate}
          onUpdate={() => router.refresh()}
        />
      )}
    </div>
  );
}
