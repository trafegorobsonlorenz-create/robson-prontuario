"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { FollowUp } from "@/types";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

const statusConfig = {
  pending: { label: "Aguardando", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  contacted: { label: "Contatado", color: "bg-blue-100 text-blue-700", icon: CheckCircle2 },
  done: { label: "Concluído", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
};

function isOverdue(date: string) {
  return new Date(date + "T00:00:00") < new Date();
}

interface FollowUpListProps {
  followUps: FollowUp[];
  phone: string;
  patientName: string;
}

export function FollowUpList({ followUps, phone, patientName }: FollowUpListProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState<string | null>(null);

  async function updateStatus(id: string, status: FollowUp["status"]) {
    setLoading(id);
    await supabase.from("follow_ups").update({ status }).eq("id", id);
    setLoading(null);
    router.refresh();
  }

  function whatsappLink(followUp: FollowUp) {
    const digits = phone.replace(/\D/g, "");
    const number = digits.startsWith("55") ? digits : `55${digits}`;
    const msg = encodeURIComponent(
      `Olá, ${patientName.split(" ")[0]}! Tudo bem? Aqui é do consultório do Dr. Robson Lorenz. Gostaríamos de agendar o seu retorno referente a: ${followUp.reason}. Quando seria um bom momento para você?`
    );
    return `https://wa.me/${number}?text=${msg}`;
  }

  if (followUps.length === 0) return null;

  return (
    <div className="space-y-2">
      {followUps.map((fu) => {
        const overdue = isOverdue(fu.scheduled_date) && fu.status === "pending";
        const { label, color, icon: Icon } = statusConfig[fu.status];

        return (
          <div
            key={fu.id}
            className={`flex items-start gap-3 p-3 rounded-lg border text-sm ${overdue ? "border-red-200 bg-red-50" : "bg-white"}`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-gray-900">{fu.reason}</span>
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>
                  <Icon className="w-3 h-3" />
                  {label}
                </span>
                {overdue && (
                  <span className="text-xs text-red-600 font-medium">Vencido</span>
                )}
              </div>
              <p className="text-muted-foreground text-xs mt-0.5">
                Programado para {formatDate(fu.scheduled_date)}
              </p>
              {fu.notes && (
                <p className="text-gray-600 text-xs mt-1 italic">{fu.notes}</p>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {fu.status === "pending" && (
                <>
                  <a
                    href={whatsappLink(fu)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-md bg-green-500 hover:bg-green-600 text-white text-xs font-medium px-2.5 py-1.5 transition-colors"
                  >
                    <WhatsAppIcon />
                    Contatar
                  </a>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7 px-2"
                    disabled={loading === fu.id}
                    onClick={() => updateStatus(fu.id, "contacted")}
                  >
                    Marcar contatado
                  </Button>
                </>
              )}
              {fu.status === "contacted" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7 px-2"
                  disabled={loading === fu.id}
                  onClick={() => updateStatus(fu.id, "done")}
                >
                  Concluir
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
