"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LOCATIONS, TIME_SLOTS } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import type { Patient } from "@/types";

interface NewAppointmentFormProps {
  patients: Pick<Patient, "id" | "full_name">[];
  defaultDate: string;
  defaultPatientId?: string;
}

export function NewAppointmentForm({ patients, defaultDate, defaultPatientId }: NewAppointmentFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [patientId, setPatientId] = useState(defaultPatientId ?? "");
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!patientId || !date || !time || !location) return;
    setLoading(true);
    setError(null);

    const { error } = await supabase.from("appointments").insert({
      patient_id: patientId,
      appointment_date: date,
      appointment_time: time,
      location,
      notes: notes || null,
      status: "scheduled",
    });

    if (error) {
      setError("Erro ao salvar agendamento. Verifique os dados e tente novamente.");
      setLoading(false);
      return;
    }

    router.push(`/agenda?data=${date}`);
    router.refresh();
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label>Paciente *</Label>
            <Select value={patientId} onChange={(e) => setPatientId(e.target.value)} required>
              <option value="">Selecione o paciente...</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.full_name}</option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data *</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Horário *</Label>
              <Select value={time} onChange={(e) => setTime(e.target.value)} required>
                <option value="">Selecione...</option>
                {TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Local de atendimento *</Label>
            <Select value={location} onChange={(e) => setLocation(e.target.value)} required>
              <option value="">Selecione...</option>
              {LOCATIONS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Observações (opcional)</Label>
            <Textarea
              placeholder="Motivo da consulta, observações..."
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={loading || !patientId || !time || !location}>
              {loading ? <><Loader2 className="animate-spin" /> Salvando...</> : "Confirmar agendamento"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
