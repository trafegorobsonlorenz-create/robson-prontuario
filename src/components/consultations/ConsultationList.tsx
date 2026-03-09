import type { Consultation } from "@/types";
import { ConsultationCard } from "./ConsultationCard";
import { FileText } from "lucide-react";

interface ConsultationListProps {
  consultations: Consultation[];
}

export function ConsultationList({ consultations }: ConsultationListProps) {
  if (consultations.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground border rounded-lg bg-white">
        <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="font-medium">Nenhuma consulta registrada</p>
        <p className="text-sm mt-1">Clique em "Nova Consulta" para registrar o primeiro atendimento.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {consultations.map((consultation) => (
        <ConsultationCard key={consultation.id} consultation={consultation} />
      ))}
    </div>
  );
}
