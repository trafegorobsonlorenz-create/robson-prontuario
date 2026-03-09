"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { MAIN_CONDITIONS } from "@/types";
import { formatCPF, formatPhone, formatDate, calculateAge } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Search, UserRound, ChevronRight, Clock } from "lucide-react";
import type { PatientWithLastConsultation } from "@/app/(dashboard)/patients/page";

interface PatientListProps {
  patients: PatientWithLastConsultation[];
}

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

export function PatientList({ patients }: PatientListProps) {
  const [search, setSearch] = useState("");
  const [condition, setCondition] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  function handleSearch(value: string) {
    setSearch(value);
    const params = new URLSearchParams();
    if (value) params.set("q", value);
    if (condition) params.set("condition", condition);
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  function handleCondition(value: string) {
    setCondition(value);
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (value) params.set("condition", value);
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou CPF..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={condition} onChange={(e) => handleCondition(e.target.value)} className="w-52">
          <option value="">Todas as condições</option>
          {MAIN_CONDITIONS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </Select>
      </div>

      {/* Lista */}
      {patients.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <UserRound className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Nenhum paciente encontrado</p>
          <p className="text-sm mt-1">Tente ajustar os filtros ou cadastre um novo paciente.</p>
        </div>
      ) : (
        <Card className="divide-y divide-border overflow-hidden">
          {patients.map((patient) => (
            <Link
              key={patient.id}
              href={`/patients/${patient.id}`}
              className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
            >
              {/* Avatar */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-semibold text-sm shrink-0">
                {patient.full_name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()}
              </div>

              {/* Info principal */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{patient.full_name}</p>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>CPF: {formatCPF(patient.cpf)}</span>
                  <span>·</span>
                  <span>{calculateAge(patient.birth_date)} anos</span>
                  <span>·</span>
                  <span>{formatPhone(patient.phone)}</span>
                </div>
              </div>

              {/* Última consulta */}
              <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {patient.last_consultation_date
                    ? formatDate(patient.last_consultation_date)
                    : "Sem consulta"}
                </span>
              </div>

              {/* Condição */}
              {patient.main_condition && (
                <span className={`hidden sm:inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold shrink-0 ${conditionColors[patient.main_condition] ?? "bg-gray-100 text-gray-700"}`}>
                  {patient.main_condition}
                </span>
              )}

              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </Link>
          ))}
        </Card>
      )}
    </div>
  );
}
