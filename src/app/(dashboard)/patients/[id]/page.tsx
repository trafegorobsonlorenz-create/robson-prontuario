import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ConsultationList } from "@/components/consultations/ConsultationList";
import { FollowUpForm } from "@/components/follow-ups/FollowUpForm";
import { FollowUpList } from "@/components/follow-ups/FollowUpList";
import { SurgeryList } from "@/components/surgeries/SurgeryList";
import Link from "next/link";
import { ArrowLeft, Pencil, Plus, Phone, Mail, Bell, CalendarDays, Scissors } from "lucide-react";
import { formatCPF, formatPhone, formatDate, calculateAge } from "@/lib/utils";
import type { Patient, Consultation, FollowUp, Surgery } from "@/types";

const conditionColors: Record<string, string> = {
  Ceratocone: "bg-purple-100 text-purple-700",
  Miopia: "bg-blue-100 text-blue-700",
  Hipermetropia: "bg-sky-100 text-sky-700",
  Astigmatismo: "bg-teal-100 text-teal-700",
  Presbiopia: "bg-orange-100 text-orange-700",
  "Cirurgia Refrativa": "bg-green-100 text-green-700",
  "Lentes de Contato": "bg-pink-100 text-pink-700",
  Outro: "bg-gray-100 text-gray-700",
};

interface PatientPageProps {
  params: Promise<{ id: string }>;
}

export default async function PatientPage({ params }: PatientPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: patient }, { data: consultations }, { data: followUps }, { data: surgeries }] = await Promise.all([
    supabase.from("patients").select("*").eq("id", id).single(),
    supabase
      .from("consultations")
      .select("*")
      .eq("patient_id", id)
      .order("consultation_date", { ascending: false }),
    supabase
      .from("follow_ups")
      .select("*")
      .eq("patient_id", id)
      .neq("status", "done")
      .order("scheduled_date", { ascending: true }),
    supabase
      .from("surgeries")
      .select("*")
      .eq("patient_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (!patient) notFound();

  const p = patient as Patient;
  const c = (consultations ?? []) as Consultation[];
  const fu = (followUps ?? []) as FollowUp[];
  const s = (surgeries ?? []) as Surgery[];
  const pendingCount = fu.filter((f) => f.status === "pending").length;

  return (
    <div className="max-w-3xl space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/patients">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{p.full_name}</h1>
            {p.main_condition && (
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${conditionColors[p.main_condition] ?? "bg-gray-100 text-gray-700"}`}>
                {p.main_condition}
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-sm">
            Paciente desde {formatDate(p.created_at.split("T")[0])}
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/agenda/novo?paciente=${id}`}>
            <CalendarDays className="w-3.5 h-3.5" />
            Agendar
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/patients/${id}/edit`}>
            <Pencil className="w-3.5 h-3.5" />
            Editar
          </Link>
        </Button>
      </div>

      {/* Dados pessoais */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Dados do Paciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">CPF</p>
              <p className="font-medium">{formatCPF(p.cpf)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">Nascimento</p>
              <p className="font-medium">
                {formatDate(p.birth_date)} ({calculateAge(p.birth_date)} anos)
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">Telefone</p>
              <p className="font-medium flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                {formatPhone(p.phone)}
              </p>
            </div>
            {p.email && (
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">Email</p>
                <p className="font-medium flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                  {p.email}
                </p>
              </div>
            )}
            {p.notes && (
              <div className="col-span-2">
                <p className="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">Observações</p>
                <p className="text-gray-700 whitespace-pre-wrap">{p.notes}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recontatos */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Recontatos
            {pendingCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold">
                {pendingCount}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FollowUpList followUps={fu} phone={p.phone} patientName={p.full_name} />
          {fu.length > 0 && <Separator />}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Programar novo recontato
            </p>
            <FollowUpForm patientId={id} />
          </div>
        </CardContent>
      </Card>

      {/* Cirurgias */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Scissors className="w-4 h-4" />
              Cirurgias
              {s.length > 0 && (
                <span className="text-sm font-normal text-muted-foreground">({s.length})</span>
              )}
            </CardTitle>
            <Button size="sm" variant="outline" asChild>
              <Link href={`/patients/${id}/surgeries/new`}>
                <Plus className="w-3.5 h-3.5" />
                Registrar Cirurgia
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <SurgeryList surgeries={s} patientId={id} />
        </CardContent>
      </Card>

      {/* Histórico de consultas */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Histórico de Consultas
            <span className="ml-2 text-sm font-normal text-muted-foreground">({c.length})</span>
          </h2>
          <Button size="sm" asChild>
            <Link href={`/patients/${id}/consultations/new`}>
              <Plus className="w-3.5 h-3.5" />
              Nova Consulta
            </Link>
          </Button>
        </div>
        <ConsultationList consultations={c} />
      </div>
    </div>
  );
}
