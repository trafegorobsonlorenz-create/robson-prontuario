"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SURGERY_TYPES, SURGERY_EYES, LOCATIONS, PAYMENT_METHODS } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface SurgeryFormProps {
  patientId: string;
}

export function SurgeryForm({ patientId }: SurgeryFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [surgeryType, setSurgeryType] = useState("");
  const [eye, setEye] = useState("");
  const [surgeryDate, setSurgeryDate] = useState("");
  const [location, setLocation] = useState("");
  const [postOpReturn, setPostOpReturn] = useState("");
  const [notes, setNotes] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [paidAt, setPaidAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!surgeryType || !eye) return;
    setLoading(true);
    setError(null);

    const { error } = await supabase.from("surgeries").insert({
      patient_id: patientId,
      surgery_type: surgeryType,
      eye,
      surgery_date: surgeryDate || null,
      location: location || null,
      post_op_return_date: postOpReturn || null,
      notes: notes || null,
      amount: amount ? parseFloat(amount) : null,
      payment_method: paymentMethod || null,
      payment_status: paymentStatus,
      paid_at: paidAt || null,
    });

    if (error) {
      setError("Erro ao salvar. Tente novamente.");
      setLoading(false);
      return;
    }

    router.push(`/patients/${patientId}`);
    router.refresh();
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados da cirurgia */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Dados da Cirurgia
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de cirurgia *</Label>
                <Select value={surgeryType} onChange={(e) => setSurgeryType(e.target.value)} required>
                  <option value="">Selecione...</option>
                  {SURGERY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Olho *</Label>
                <Select value={eye} onChange={(e) => setEye(e.target.value)} required>
                  <option value="">Selecione...</option>
                  {SURGERY_EYES.map((e) => <option key={e} value={e}>{e}</option>)}
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Data da cirurgia</Label>
                <Input type="date" value={surgeryDate} onChange={(e) => setSurgeryDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Local</Label>
                <Select value={location} onChange={(e) => setLocation(e.target.value)}>
                  <option value="">Selecione...</option>
                  {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Retorno pós-operatório</Label>
                <Input type="date" value={postOpReturn} onChange={(e) => setPostOpReturn(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <Label>Observações</Label>
              <Textarea
                placeholder="Detalhes da cirurgia, conduta..."
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Financeiro */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Financeiro
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valor cobrado (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Forma de pagamento</Label>
                <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  <option value="">Selecione...</option>
                  {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status do pagamento</Label>
                <Select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
                  <option value="pending">Pendente</option>
                  <option value="paid">Pago</option>
                </Select>
              </div>
              {paymentStatus === "paid" && (
                <div className="space-y-2">
                  <Label>Data do pagamento</Label>
                  <Input type="date" value={paidAt} onChange={(e) => setPaidAt(e.target.value)} />
                </div>
              )}
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={loading || !surgeryType || !eye}>
              {loading ? <><Loader2 className="animate-spin" /> Salvando...</> : "Registrar Cirurgia"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
