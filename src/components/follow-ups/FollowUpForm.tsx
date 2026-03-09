"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FOLLOW_UP_REASONS } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface FollowUpFormProps {
  patientId: string;
  onSuccess?: () => void;
}

export function FollowUpForm({ patientId, onSuccess }: FollowUpFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason || !date) return;
    setLoading(true);
    setError(null);

    const { error } = await supabase.from("follow_ups").insert({
      patient_id: patientId,
      reason,
      scheduled_date: date,
      notes: notes || null,
      status: "pending",
    });

    if (error) {
      setError("Erro ao salvar recontato. Tente novamente.");
      setLoading(false);
      return;
    }

    setReason("");
    setDate("");
    setNotes("");
    setLoading(false);
    router.refresh();
    onSuccess?.();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Motivo</Label>
          <Select value={reason} onChange={(e) => setReason(e.target.value)} required>
            <option value="">Selecione...</option>
            {FOLLOW_UP_REASONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Data programada</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Observações (opcional)</Label>
        <Textarea
          placeholder="Ex: Paciente pegou lentes em março/2023, retorno em 2 anos..."
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
      <Button type="submit" size="sm" disabled={loading || !reason || !date}>
        {loading ? <><Loader2 className="animate-spin" /> Salvando...</> : "Programar recontato"}
      </Button>
    </form>
  );
}
