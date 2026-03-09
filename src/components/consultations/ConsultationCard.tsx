import type { Consultation } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, formatRefraction } from "@/lib/utils";
import { MapPin, Calendar, Eye } from "lucide-react";

const locationColors: Record<string, string> = {
  "Higienópolis (Consolação)": "bg-violet-50 text-violet-700 border-violet-200",
  "Granja Vianna": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Moema": "bg-amber-50 text-amber-700 border-amber-200",
};

interface ConsultationCardProps {
  consultation: Consultation;
}

export function ConsultationCard({ consultation: c }: ConsultationCardProps) {
  const hasRefraction =
    c.od_sphere !== null ||
    c.od_cylinder !== null ||
    c.oe_sphere !== null ||
    c.oe_cylinder !== null;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-start gap-4 p-4">
          {/* Data */}
          <div className="text-center shrink-0 w-14">
            <p className="text-2xl font-bold text-gray-900 leading-none">
              {formatDate(c.consultation_date).split("/")[0]}
            </p>
            <p className="text-xs text-muted-foreground uppercase mt-0.5">
              {new Date(c.consultation_date + "T00:00:00").toLocaleDateString("pt-BR", { month: "short" })}
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(c.consultation_date + "T00:00:00").getFullYear()}
            </p>
          </div>

          <div className="w-px self-stretch bg-border shrink-0" />

          <div className="flex-1 min-w-0 space-y-3">
            {/* Local */}
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                  locationColors[c.location] ?? "bg-gray-50 text-gray-700 border-gray-200"
                }`}
              >
                <MapPin className="w-3 h-3" />
                {c.location}
              </span>
              {c.next_consultation && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  Retorno: {formatDate(c.next_consultation)}
                </span>
              )}
            </div>

            {/* Refração */}
            {hasRefraction && (
              <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-md p-3 text-sm">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                    <Eye className="w-3 h-3" /> OD
                  </p>
                  <p className="font-mono text-xs">
                    {formatRefraction(c.od_sphere, c.od_cylinder, c.od_axis)}
                  </p>
                  {c.od_visual_acuity && (
                    <p className="text-xs text-muted-foreground mt-0.5">AV: {c.od_visual_acuity}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                    <Eye className="w-3 h-3" /> OE
                  </p>
                  <p className="font-mono text-xs">
                    {formatRefraction(c.oe_sphere, c.oe_cylinder, c.oe_axis)}
                  </p>
                  {c.oe_visual_acuity && (
                    <p className="text-xs text-muted-foreground mt-0.5">AV: {c.oe_visual_acuity}</p>
                  )}
                </div>
              </div>
            )}

            {/* Notas */}
            {c.clinical_notes && (
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {c.clinical_notes}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
