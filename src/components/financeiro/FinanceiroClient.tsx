"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { AppointmentWithPatient, PaymentMethod } from "@/types";
import { PAYMENT_METHODS } from "@/types";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CheckCircle2, Clock } from "lucide-react";

const MONTHS_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const locationColors: Record<string, string> = {
  "Higienópolis (Consolação)": "bg-violet-100 text-violet-700",
  "Granja Vianna": "bg-emerald-100 text-emerald-700",
  "Moema": "bg-amber-100 text-amber-700",
};

function formatCurrency(v: number | null) {
  if (v == null) return "—";
  return `R$ ${v.toFixed(2).replace(".", ",")}`;
}

interface PaymentRowProps {
  appt: AppointmentWithPatient;
  onUpdate: (id: string, updates: Partial<AppointmentWithPatient>) => void;
}

function PaymentRow({ appt, onUpdate }: PaymentRowProps) {
  const supabase = createClient();
  const [editing, setEditing] = useState(false);
  const [amount, setAmount] = useState(appt.amount?.toString() ?? "");
  const [method, setMethod] = useState<string>(appt.payment_method ?? "");
  const [paidAt, setPaidAt] = useState(appt.paid_at ?? new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);

  const isPaid = appt.payment_status === "paid";

  async function markPaid() {
    setLoading(true);
    const updates = {
      payment_status: "paid" as const,
      payment_method: (method || null) as PaymentMethod | null,
      amount: amount ? parseFloat(amount) : appt.amount,
      paid_at: paidAt,
    };
    await supabase.from("appointments").update(updates).eq("id", appt.id);
    setLoading(false);
    setEditing(false);
    onUpdate(appt.id, updates);
  }

  async function markPending() {
    setLoading(true);
    const updates = { payment_status: "pending" as const, paid_at: null };
    await supabase.from("appointments").update(updates).eq("id", appt.id);
    setLoading(false);
    onUpdate(appt.id, updates);
  }

  async function saveAmount() {
    setLoading(true);
    const updates = {
      amount: amount ? parseFloat(amount) : null,
      payment_method: (method || null) as PaymentMethod | null,
    };
    await supabase.from("appointments").update(updates).eq("id", appt.id);
    setLoading(false);
    setEditing(false);
    onUpdate(appt.id, updates);
  }

  const d = new Date(appt.appointment_date + "T00:00:00");
  const dateStr = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 bg-white">
        <div className="shrink-0 w-12 text-center">
          <p className="text-sm font-bold text-gray-900">{dateStr}</p>
          <p className="text-xs text-muted-foreground">{appt.appointment_time.slice(0, 5)}</p>
        </div>
        <div className="w-px h-8 bg-border shrink-0" />
        <div className="flex-1 min-w-0">
          <Link href={`/patients/${appt.patients.id}`} className="font-medium text-sm text-gray-900 hover:text-primary">
            {appt.patients.full_name}
          </Link>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${locationColors[appt.location] ?? "bg-gray-100 text-gray-700"}`}>
              {appt.location}
            </span>
          </div>
        </div>
        <div className="text-right shrink-0 space-y-0.5">
          <p className="text-sm font-semibold text-gray-900">{formatCurrency(appt.amount)}</p>
          {appt.payment_method && (
            <p className="text-xs text-muted-foreground">{appt.payment_method}</p>
          )}
        </div>
        <div className="shrink-0 ml-2">
          {isPaid ? (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium bg-green-100 text-green-700">
                <CheckCircle2 className="w-3 h-3" /> Pago
              </span>
              <button
                onClick={markPending}
                disabled={loading}
                className="text-xs text-muted-foreground hover:text-gray-700 underline"
              >
                desfazer
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium bg-orange-100 text-orange-700">
                <Clock className="w-3 h-3" /> Pendente
              </span>
              <button
                onClick={() => setEditing((v) => !v)}
                className="text-xs text-primary hover:underline"
              >
                Registrar
              </button>
            </div>
          )}
        </div>
      </div>

      {editing && (
        <div className="border-t bg-gray-50 px-4 py-3 flex items-end gap-3 flex-wrap">
          <div className="space-y-1 min-w-[100px]">
            <label className="text-xs font-medium text-muted-foreground">Valor (R$)</label>
            <Input
              type="number"
              step="0.01"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1 min-w-[130px]">
            <label className="text-xs font-medium text-muted-foreground">Forma</label>
            <Select value={method} onChange={(e) => setMethod(e.target.value)} className="h-8 text-sm">
              <option value="">Selecione...</option>
              {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
            </Select>
          </div>
          <div className="space-y-1 min-w-[130px]">
            <label className="text-xs font-medium text-muted-foreground">Data pagamento</label>
            <Input
              type="date"
              value={paidAt}
              onChange={(e) => setPaidAt(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="flex gap-2 pb-0.5">
            <Button size="sm" className="h-8" onClick={markPaid} disabled={loading}>
              {loading ? "Salvando..." : "Marcar pago"}
            </Button>
            <Button size="sm" variant="ghost" className="h-8" onClick={saveAmount} disabled={loading}>
              Só salvar valor
            </Button>
            <Button size="sm" variant="ghost" className="h-8 text-muted-foreground" onClick={() => setEditing(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

interface FinanceiroClientProps {
  initialAppointments: AppointmentWithPatient[];
  initialYear: number;
  initialMonth: number;
}

export function FinanceiroClient({ initialAppointments, initialYear, initialMonth }: FinanceiroClientProps) {
  const supabase = createClient();
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [appointments, setAppointments] = useState<AppointmentWithPatient[]>(initialAppointments);
  const [loading, setLoading] = useState(false);

  async function fetchMonth(y: number, m: number) {
    setLoading(true);
    const from = `${y}-${String(m).padStart(2, "0")}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    const to = `${y}-${String(m).padStart(2, "0")}-${lastDay}`;
    const { data } = await supabase
      .from("appointments")
      .select("*, patients(id, full_name, phone, main_condition)")
      .gte("appointment_date", from)
      .lte("appointment_date", to)
      .neq("status", "cancelled")
      .order("appointment_date", { ascending: true })
      .order("appointment_time", { ascending: true });
    setAppointments((data ?? []) as AppointmentWithPatient[]);
    setLoading(false);
  }

  function prevMonth() {
    const m = month === 1 ? 12 : month - 1;
    const y = month === 1 ? year - 1 : year;
    setMonth(m);
    setYear(y);
    fetchMonth(y, m);
  }

  function nextMonth() {
    const m = month === 12 ? 1 : month + 1;
    const y = month === 12 ? year + 1 : year;
    setMonth(m);
    setYear(y);
    fetchMonth(y, m);
  }

  function updateRow(id: string, updates: Partial<AppointmentWithPatient>) {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
  }

  const paid = appointments.filter((a) => a.payment_status === "paid");
  const pending = appointments.filter((a) => a.payment_status === "pending");
  const totalPaid = paid.reduce((sum, a) => sum + (a.amount ?? 0), 0);
  const totalPending = pending.reduce((sum, a) => sum + (a.amount ?? 0), 0);

  // Agrupar por dia
  const byDay: Record<string, AppointmentWithPatient[]> = {};
  for (const a of appointments) {
    if (!byDay[a.appointment_date]) byDay[a.appointment_date] = [];
    byDay[a.appointment_date].push(a);
  }

  return (
    <div className="space-y-6">
      {/* Header com navegação de mês */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="p-1.5 rounded-md hover:bg-gray-100 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900 min-w-[160px] text-center">
            {MONTHS_PT[month - 1]} {year}
          </h2>
          <button onClick={nextMonth} className="p-1.5 rounded-md hover:bg-gray-100 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="text-sm text-muted-foreground">
          {appointments.length} {appointments.length === 1 ? "consulta" : "consultas"}
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Total do mês</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalPaid + totalPending)}</p>
          <p className="text-xs text-muted-foreground mt-1">{appointments.length} consultas</p>
        </div>
        <div className="rounded-lg border bg-green-50 border-green-200 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-green-700 mb-1">Recebido</p>
          <p className="text-2xl font-bold text-green-700">{formatCurrency(totalPaid)}</p>
          <p className="text-xs text-green-600 mt-1">{paid.length} consultas</p>
        </div>
        <div className="rounded-lg border bg-orange-50 border-orange-200 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-orange-700 mb-1">Pendente</p>
          <p className="text-2xl font-bold text-orange-700">{formatCurrency(totalPending)}</p>
          <p className="text-xs text-orange-600 mt-1">{pending.length} consultas</p>
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando...</div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Nenhuma consulta em {MONTHS_PT[month - 1]} {year}.
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(byDay).map(([date, dayAppts]) => {
            const d = new Date(date + "T00:00:00");
            const label = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")} (${["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][d.getDay()]})`;
            return (
              <div key={date}>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{label}</p>
                <div className="space-y-2">
                  {dayAppts.map((a) => (
                    <PaymentRow key={a.id} appt={a} onUpdate={updateRow} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
