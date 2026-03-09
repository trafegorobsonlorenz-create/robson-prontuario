"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  consultationSchema,
  type ConsultationFormValues,
  consultationFormToDb,
} from "@/lib/validations/consultation";
import { LOCATIONS, SURGERY_TYPES, SURGERY_EYES } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, Eye, Scissors } from "lucide-react";

interface ConsultationFormProps {
  patientId: string;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
      {children}
    </p>
  );
}

function EyeFields({
  eye,
  label,
  register,
  prefix,
}: {
  eye: "od" | "oe";
  label: string;
  register: ReturnType<typeof useForm<ConsultationFormValues>>["register"];
  prefix: string;
}) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
      <p className="text-sm font-semibold flex items-center gap-1.5">
        <Eye className="w-3.5 h-3.5 text-muted-foreground" />
        {label}
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Esférico</Label>
          <Input
            placeholder="-3.50"
            {...register(`${eye}_sphere` as keyof ConsultationFormValues)}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Cilíndrico</Label>
          <Input
            placeholder="-1.25"
            {...register(`${eye}_cylinder` as keyof ConsultationFormValues)}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Eixo (°)</Label>
          <Input
            placeholder="180"
            {...register(`${eye}_axis` as keyof ConsultationFormValues)}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Acuidade Visual</Label>
          <Input
            placeholder="20/20"
            {...register(`${eye}_visual_acuity` as keyof ConsultationFormValues)}
          />
        </div>
      </div>
    </div>
  );
}

export function ConsultationForm({ patientId }: ConsultationFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [serverError, setServerError] = useState<string | null>(null);

  // Indicação de cirurgia
  const [indicateSurgery, setIndicateSurgery] = useState(false);
  const [surgeryType, setSurgeryType] = useState("");
  const [surgeryEye, setSurgeryEye] = useState("");
  const [surgeryNotes, setSurgeryNotes] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ConsultationFormValues>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      consultation_date: today,
    },
  });

  async function onSubmit(values: ConsultationFormValues) {
    setServerError(null);

    const payload = {
      patient_id: patientId,
      ...consultationFormToDb(values),
    };

    const { data: consultData, error } = await supabase
      .from("consultations")
      .insert(payload)
      .select("id")
      .single();

    if (error) {
      setServerError("Erro ao salvar consulta. Tente novamente.");
      return;
    }

    if (indicateSurgery && surgeryType && surgeryEye) {
      await supabase.from("surgeries").insert({
        patient_id: patientId,
        indicated_in_consultation_id: consultData.id,
        surgery_type: surgeryType,
        eye: surgeryEye,
        notes: surgeryNotes || null,
      });
    }

    router.push(`/patients/${patientId}`);
    router.refresh();
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Logística */}
          <div>
            <SectionTitle>Informações da Consulta</SectionTitle>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="consultation_date">Data da consulta *</Label>
                <Input
                  id="consultation_date"
                  type="date"
                  {...register("consultation_date")}
                />
                {errors.consultation_date && (
                  <p className="text-xs text-destructive">{errors.consultation_date.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Local de atendimento *</Label>
                <Select id="location" {...register("location")}>
                  <option value="">Selecione...</option>
                  {LOCATIONS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </Select>
                {errors.location && (
                  <p className="text-xs text-destructive">{errors.location.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="next_consultation">Próxima consulta</Label>
                <Input
                  id="next_consultation"
                  type="date"
                  {...register("next_consultation")}
                />
              </div>
            </div>
          </div>

          {/* Refração */}
          <div>
            <SectionTitle>Refração</SectionTitle>
            <div className="grid gap-4">
              <EyeFields eye="od" label="Olho Direito (OD)" register={register} prefix="od" />
              <EyeFields eye="oe" label="Olho Esquerdo (OE)" register={register} prefix="oe" />
            </div>
          </div>

          {/* Notas clínicas */}
          <div>
            <SectionTitle>Notas Clínicas</SectionTitle>
            <Textarea
              placeholder="Achados do exame, conduta, orientações ao paciente..."
              rows={5}
              {...register("clinical_notes")}
            />
          </div>

          {/* Indicação de cirurgia */}
          <div>
            <Separator className="mb-4" />
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={indicateSurgery}
                onChange={(e) => setIndicateSurgery(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="flex items-center gap-1.5 text-sm font-medium">
                <Scissors className="w-3.5 h-3.5 text-muted-foreground" />
                Indicar cirurgia para este paciente
              </span>
            </label>

            {indicateSurgery && (
              <div className="mt-4 rounded-lg border bg-amber-50/60 p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo de cirurgia *</Label>
                    <Select value={surgeryType} onChange={(e) => setSurgeryType(e.target.value)}>
                      <option value="">Selecione...</option>
                      {SURGERY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Olho *</Label>
                    <Select value={surgeryEye} onChange={(e) => setSurgeryEye(e.target.value)}>
                      <option value="">Selecione...</option>
                      {SURGERY_EYES.map((e) => <option key={e} value={e}>{e}</option>)}
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Notas da indicação</Label>
                  <Textarea
                    placeholder="Detalhes da indicação, urgência, observações..."
                    rows={2}
                    value={surgeryNotes}
                    onChange={(e) => setSurgeryNotes(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {serverError && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
              {serverError}
            </p>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Consulta"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
