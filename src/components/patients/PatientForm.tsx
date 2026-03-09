"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { patientSchema, type PatientFormValues } from "@/lib/validations/patient";
import { MAIN_CONDITIONS, LOCATIONS } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";
import type { Patient } from "@/types";

interface PatientFormProps {
  patient?: Patient;
}

export function PatientForm({ patient }: PatientFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showFirstConsultation, setShowFirstConsultation] = useState(false);

  // Campos da consulta inicial (só no cadastro novo)
  const [consultDate, setConsultDate] = useState("");
  const [consultLocation, setConsultLocation] = useState("");
  const [consultNotes, setConsultNotes] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: patient
      ? {
          full_name: patient.full_name,
          cpf: patient.cpf,
          birth_date: patient.birth_date,
          phone: patient.phone,
          email: patient.email ?? "",
          main_condition: patient.main_condition ?? "",
          notes: patient.notes ?? "",
        }
      : undefined,
  });

  async function onSubmit(values: PatientFormValues) {
    setServerError(null);

    const payload = {
      full_name: values.full_name,
      cpf: values.cpf.replace(/\D/g, ""),
      birth_date: values.birth_date,
      phone: values.phone.replace(/\D/g, ""),
      email: values.email || null,
      main_condition: values.main_condition || null,
      notes: values.notes || null,
    };

    if (patient) {
      const { error } = await supabase.from("patients").update(payload).eq("id", patient.id);
      if (error) {
        setServerError("Erro ao salvar. Verifique os dados e tente novamente.");
        return;
      }
      router.push(`/patients/${patient.id}`);
    } else {
      const { data, error } = await supabase
        .from("patients")
        .insert(payload)
        .select("id")
        .single();

      if (error) {
        setServerError(
          error.code === "23505"
            ? "Já existe um paciente cadastrado com este CPF."
            : "Erro ao cadastrar. Verifique os dados e tente novamente."
        );
        return;
      }

      // Se preencheu a consulta inicial, cria também
      if (showFirstConsultation && consultDate && consultLocation) {
        await supabase.from("consultations").insert({
          patient_id: data.id,
          consultation_date: consultDate,
          location: consultLocation,
          clinical_notes: consultNotes || null,
        });
      }

      router.push(`/patients/${data.id}`);
    }

    router.refresh();
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Dados pessoais */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Dados Pessoais
            </p>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nome completo *</Label>
                <Input id="full_name" placeholder="Maria da Silva" {...register("full_name")} />
                {errors.full_name && (
                  <p className="text-xs text-destructive">{errors.full_name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input id="cpf" placeholder="000.000.000-00" {...register("cpf")} />
                  {errors.cpf && (
                    <p className="text-xs text-destructive">{errors.cpf.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birth_date">Data de nascimento *</Label>
                  <Input id="birth_date" type="date" {...register("birth_date")} />
                  {errors.birth_date && (
                    <p className="text-xs text-destructive">{errors.birth_date.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input id="phone" placeholder="(11) 99999-9999" {...register("phone")} />
                  {errors.phone && (
                    <p className="text-xs text-destructive">{errors.phone.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="paciente@email.com"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Dados clínicos */}
          <div className="pt-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Dados Clínicos
            </p>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="main_condition">Condição principal</Label>
                <Select id="main_condition" {...register("main_condition")}>
                  <option value="">Selecione...</option>
                  {MAIN_CONDITIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Observações gerais</Label>
                <Textarea
                  id="notes"
                  placeholder="Histórico relevante, alergias, observações..."
                  rows={3}
                  {...register("notes")}
                />
              </div>
            </div>
          </div>

          {/* Consulta inicial — só exibida no cadastro novo */}
          {!patient && (
            <>
              <Separator />
              <div>
                <button
                  type="button"
                  onClick={() => setShowFirstConsultation((v) => !v)}
                  className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  {showFirstConsultation ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                  {showFirstConsultation
                    ? "Ocultar consulta inicial"
                    : "Registrar última consulta (opcional)"}
                </button>

                {showFirstConsultation && (
                  <div className="mt-4 space-y-4 rounded-lg border bg-gray-50 p-4">
                    <p className="text-xs text-muted-foreground">
                      Preencha se o paciente já foi atendido antes de ser cadastrado no sistema.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Data da consulta</Label>
                        <Input
                          type="date"
                          value={consultDate}
                          onChange={(e) => setConsultDate(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Local de atendimento</Label>
                        <Select
                          value={consultLocation}
                          onChange={(e) => setConsultLocation(e.target.value)}
                        >
                          <option value="">Selecione...</option>
                          {LOCATIONS.map((l) => (
                            <option key={l} value={l}>{l}</option>
                          ))}
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Notas da consulta (opcional)</Label>
                      <Textarea
                        placeholder="Resumo do atendimento, diagnóstico, conduta..."
                        rows={2}
                        value={consultNotes}
                        onChange={(e) => setConsultNotes(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {serverError && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
              {serverError}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <><Loader2 className="animate-spin" /> Salvando...</>
              ) : patient ? (
                "Salvar alterações"
              ) : (
                "Cadastrar paciente"
              )}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
