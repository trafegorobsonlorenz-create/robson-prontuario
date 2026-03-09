import { z } from "zod";
import { LOCATIONS } from "@/types";

export const consultationSchema = z.object({
  consultation_date: z.string().min(1, "Data é obrigatória"),
  location: z.enum(["Higienópolis (Consolação)", "Granja Vianna", "Moema"] as const, {
    required_error: "Local é obrigatório",
  }),
  next_consultation: z.string().optional(),
  od_sphere: z.string().optional(),
  od_cylinder: z.string().optional(),
  od_axis: z.string().optional(),
  od_visual_acuity: z.string().optional(),
  oe_sphere: z.string().optional(),
  oe_cylinder: z.string().optional(),
  oe_axis: z.string().optional(),
  oe_visual_acuity: z.string().optional(),
  clinical_notes: z.string().optional(),
});

export type ConsultationFormValues = z.infer<typeof consultationSchema>;

// Converte os valores do formulário para o formato do banco
export function consultationFormToDb(values: ConsultationFormValues) {
  const parseNum = (v: string | undefined) => {
    if (!v || v.trim() === "") return null;
    const n = parseFloat(v.replace(",", "."));
    return isNaN(n) ? null : n;
  };
  const parseInt_ = (v: string | undefined) => {
    if (!v || v.trim() === "") return null;
    const n = parseInt(v);
    return isNaN(n) ? null : n;
  };

  return {
    consultation_date: values.consultation_date,
    location: values.location,
    next_consultation: values.next_consultation || null,
    od_sphere: parseNum(values.od_sphere),
    od_cylinder: parseNum(values.od_cylinder),
    od_axis: parseInt_(values.od_axis),
    od_visual_acuity: values.od_visual_acuity || null,
    oe_sphere: parseNum(values.oe_sphere),
    oe_cylinder: parseNum(values.oe_cylinder),
    oe_axis: parseInt_(values.oe_axis),
    oe_visual_acuity: values.oe_visual_acuity || null,
    clinical_notes: values.clinical_notes || null,
  };
}
