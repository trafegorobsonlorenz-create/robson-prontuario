"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { FollowUpWithPatient } from "@/types";
import { formatDate, formatPhone } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, Calendar, ChevronRight, CheckCircle2 } from "lucide-react";

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

function whatsappLink(phone: string, name: string, reason: string) {
  const digits = phone.replace(/\D/g, "");
  const number = digits.startsWith("55") ? digits : `55${digits}`;
  const msg = encodeURIComponent(
    `Olá, ${name.split(" ")[0]}! Tudo bem? Aqui é do consultório do Dr. Robson Lorenz. Gostaríamos de agendar o seu retorno referente a: ${reason}. Quando seria um bom momento para você?`
  );
  return `https://wa.me/${number}?text=${msg}`;
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function FollowUpRow({ fu, highlight }: { fu: FollowUpWithPatient; highlight?: "red" | "yellow" }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  async function markContacted() {
    setLoading(true);
    await supabase.from("follow_ups").update({ status: "contacted" }).eq("id", fu.id);
    setLoading(false);
    router.refresh();
  }

  const bg = highlight === "red" ? "border-red-200 bg-red-50" : highlight === "yellow" ? "border-amber-200 bg-amber-50" : "bg-white";

  return (
    <div className={`flex items-center gap-4 px-4 py-3 border rounded-lg ${bg}`}>
      {/* Avatar */}
      <div className="flex items-center justify-center w-9 h-9 rounded-full bg-white border text-gray-700 font-semibold text-xs shrink-0">
        {fu.patients.full_name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Link href={`/patients/${fu.patients.id}`} className="font-medium text-gray-900 hover:text-primary text-sm">
            {fu.patients.full_name}
          </Link>
          {fu.patients.main_condition && (
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${conditionColors[fu.patients.main_condition] ?? "bg-gray-100 text-gray-700"}`}>
              {fu.patients.main_condition}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {fu.reason} · Programado para {formatDate(fu.scheduled_date)}
          {fu.status === "contacted" && " · "}
          {fu.status === "contacted" && <span className="text-blue-600 font-medium">Contatado</span>}
        </p>
        {fu.notes && (
          <p className="text-xs text-gray-500 italic mt-0.5">{fu.notes}</p>
        )}
      </div>

      {/* Ações */}
      <div className="flex items-center gap-2 shrink-0">
        {fu.status === "pending" && (
          <>
            <a
              href={whatsappLink(fu.patients.phone, fu.patients.full_name, fu.reason)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md bg-green-500 hover:bg-green-600 text-white text-xs font-medium px-3 py-1.5 transition-colors"
            >
              <WhatsAppIcon />
              Contatar
            </a>
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-7"
              disabled={loading}
              onClick={markContacted}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Contatado
            </Button>
          </>
        )}
        <Link href={`/patients/${fu.patients.id}`}>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </Link>
      </div>
    </div>
  );
}

function Section({
  title,
  icon,
  items,
  highlight,
  emptyText,
}: {
  title: string;
  icon: React.ReactNode;
  items: FollowUpWithPatient[];
  highlight?: "red" | "yellow";
  emptyText: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h2 className="font-semibold text-gray-900">{title}</h2>
        <span className="text-xs text-muted-foreground">({items.length})</span>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center border rounded-lg bg-white">{emptyText}</p>
      ) : (
        <div className="space-y-2">
          {items.map((fu) => (
            <FollowUpRow key={fu.id} fu={fu} highlight={highlight} />
          ))}
        </div>
      )}
    </div>
  );
}

interface AlertsClientProps {
  overdue: FollowUpWithPatient[];
  upcoming: FollowUpWithPatient[];
  future: FollowUpWithPatient[];
}

export function AlertsClient({ overdue, upcoming, future }: AlertsClientProps) {
  return (
    <div className="space-y-8">
      <Section
        title="Vencidos"
        icon={<AlertTriangle className="w-4 h-4 text-red-500" />}
        items={overdue}
        highlight="red"
        emptyText="Nenhum recontato vencido."
      />
      <Section
        title="Próximos 30 dias"
        icon={<Clock className="w-4 h-4 text-amber-500" />}
        items={upcoming}
        highlight="yellow"
        emptyText="Nenhum recontato nos próximos 30 dias."
      />
      <Section
        title="Futuros"
        icon={<Calendar className="w-4 h-4 text-muted-foreground" />}
        items={future}
        emptyText="Nenhum recontato futuro programado."
      />
    </div>
  );
}
