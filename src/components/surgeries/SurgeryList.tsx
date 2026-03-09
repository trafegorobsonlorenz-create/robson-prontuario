"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Surgery, SurgeryStatus } from "@/types";
import { LOCATIONS, PAYMENT_METHODS } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Scissors, CalendarDays, MapPin, CheckCircle2, Clock, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { formatDate } from "@/lib/utils";

const statusConfig: Record<SurgeryStatus, { label: string; color: string; icon: React.ElementType }> = {
  scheduled: { label: "Agendada", color: "text-blue-600 bg-blue-50", icon: Clock },
  done: { label: "Realizada", color: "text-green-600 bg-green-50", icon: CheckCircle2 },
  cancelled: { label: "Cancelada", color: "text-red-500 bg-red-50", icon: XCircle },
};

const eyeColors: Record<string, string> = {
  OD: "bg-sky-100 text-sky-700",
  OE: "bg-violet-100 text-violet-700",
  Ambos: "bg-teal-100 text-teal-700",
};

interface SurgeryCardProps {
  surgery: Surgery;
  onUpdate: () => void;
}

function SurgeryCard({ surgery, onUpdate }: SurgeryCardProps) {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<SurgeryStatus>(surgery.status);
  const [surgeryDate, setSurgeryDate] = useState(surgery.surgery_date ?? "");
  const [location, setLocation] = useState(surgery.location ?? "");
  const [postOpReturn, setPostOpReturn] = useState(surgery.post_op_return_date ?? "");
  const [amount, setAmount] = useState(surgery.amount?.toString() ?? "");
  const [paymentMethod, setPaymentMethod] = useState(surgery.payment_method ?? "");
  const [paymentStatus, setPaymentStatus] = useState(surgery.payment_status);
  const [paidAt, setPaidAt] = useState(surgery.paid_at ?? "");

  async function save() {
    setLoading(true);
    await supabase.from("surgeries").update({
      status,
      surgery_date: surgeryDate || null,
      location: location || null,
      post_op_return_date: postOpReturn || null,
      amount: amount ? parseFloat(amount) : null,
      payment_method: paymentMethod || null,
      payment_status: paymentStatus,
      paid_at: paidAt || null,
    }).eq("id", surgery.id);
    setLoading(false);
    setOpen(false);
    onUpdate();
  }

  const cfg = statusConfig[status];
  const Icon = cfg.icon;

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 bg-white">
        <Scissors className="w-4 h-4 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm text-gray-900">{surgery.surgery_type}</span>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${eyeColors[surgery.eye] ?? "bg-gray-100 text-gray-700"}`}>
              {surgery.eye}
            </span>
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.color}`}>
              <Icon className="w-3 h-3" />
              {cfg.label}
            </span>
            {surgery.payment_status === "paid" ? (
              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700">
                Pago {surgery.payment_method ? `· ${surgery.payment_method}` : ""}
              </span>
            ) : surgery.amount ? (
              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700">
                Pendente · R$ {surgery.amount.toFixed(2).replace(".", ",")}
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            {surgery.surgery_date && (
              <span className="flex items-center gap-1">
                <CalendarDays className="w-3 h-3" />
                {formatDate(surgery.surgery_date)}
              </span>
            )}
            {surgery.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {surgery.location}
              </span>
            )}
            {surgery.post_op_return_date && (
              <span>Retorno: {formatDate(surgery.post_op_return_date)}</span>
            )}
          </div>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="text-muted-foreground hover:text-gray-900 transition-colors p-1"
        >
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {open && (
        <div className="border-t bg-gray-50 px-4 py-4 space-y-4">
          {surgery.notes && (
            <p className="text-sm text-gray-600 italic">{surgery.notes}</p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Status</label>
              <Select value={status} onChange={(e) => setStatus(e.target.value as SurgeryStatus)}>
                <option value="scheduled">Agendada</option>
                <option value="done">Realizada</option>
                <option value="cancelled">Cancelada</option>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Local</label>
              <Select value={location} onChange={(e) => setLocation(e.target.value)}>
                <option value="">Selecione...</option>
                {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Data da cirurgia</label>
              <Input type="date" value={surgeryDate} onChange={(e) => setSurgeryDate(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Retorno pós-op</label>
              <Input type="date" value={postOpReturn} onChange={(e) => setPostOpReturn(e.target.value)} />
            </div>
          </div>

          <div className="border-t pt-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Financeiro</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Valor cobrado (R$)</label>
                <Input type="number" step="0.01" placeholder="0,00" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Forma de pagamento</label>
                <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  <option value="">Selecione...</option>
                  {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Status pagamento</label>
                <Select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value as "pending" | "paid")}>
                  <option value="pending">Pendente</option>
                  <option value="paid">Pago</option>
                </Select>
              </div>
              {paymentStatus === "paid" && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Data do pagamento</label>
                  <Input type="date" value={paidAt} onChange={(e) => setPaidAt(e.target.value)} />
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button size="sm" onClick={save} disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          </div>
        </div>
      )}
    </div>
  );
}

interface SurgeryListProps {
  surgeries: Surgery[];
  patientId: string;
}

export function SurgeryList({ surgeries, patientId }: SurgeryListProps) {
  const [list, setList] = useState(surgeries);

  async function refresh() {
    const supabase = createClient();
    const { data } = await supabase
      .from("surgeries")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false });
    if (data) setList(data as Surgery[]);
  }

  if (list.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-2">Nenhuma cirurgia registrada.</p>
    );
  }

  return (
    <div className="space-y-2">
      {list.map((s) => (
        <SurgeryCard key={s.id} surgery={s} onUpdate={refresh} />
      ))}
    </div>
  );
}
