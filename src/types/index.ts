export type Location = "Higienópolis (Consolação)" | "Granja Vianna" | "Moema";

export const LOCATIONS: Location[] = ["Higienópolis (Consolação)", "Granja Vianna", "Moema"];

export type MainCondition =
  | "Ceratocone"
  | "Miopia"
  | "Hipermetropia"
  | "Astigmatismo"
  | "Presbiopia"
  | "Cirurgia Refrativa"
  | "Lentes de Contato"
  | "Outro";

export const MAIN_CONDITIONS: MainCondition[] = [
  "Ceratocone",
  "Miopia",
  "Hipermetropia",
  "Astigmatismo",
  "Presbiopia",
  "Cirurgia Refrativa",
  "Lentes de Contato",
  "Outro",
];

export const FOLLOW_UP_REASONS = [
  "Retorno — Lentes de Contato",
  "Retorno — Cirurgia Refrativa",
  "Retorno — Ceratocone",
  "Retorno — Consulta de rotina",
  "Vencimento de lentes",
  "Acompanhamento pós-operatório",
  "Renovação de receita",
  "Outro",
] as const;

// Slots de 30 em 30 min — Segundas-feiras 08:00 às 11:30
export const TIME_SLOTS: string[] = [
  "08:00", "08:30", "09:00", "09:30",
  "10:00", "10:30", "11:00", "11:30",
];

export type SurgeryType =
  | "LASIK"
  | "PRK"
  | "Crosslinking"
  | "Anel Intraestromal"
  | "Catarata"
  | "Outro";

export const SURGERY_TYPES: SurgeryType[] = [
  "LASIK",
  "PRK",
  "Crosslinking",
  "Anel Intraestromal",
  "Catarata",
  "Outro",
];

export type SurgeryEye = "OD" | "OE" | "Ambos";
export const SURGERY_EYES: SurgeryEye[] = ["OD", "OE", "Ambos"];

export type SurgeryStatus = "scheduled" | "done" | "cancelled";
export type PaymentMethod = "PIX" | "Dinheiro" | "Débito" | "Crédito";
export const PAYMENT_METHODS: PaymentMethod[] = ["PIX", "Dinheiro", "Débito", "Crédito"];
export type PaymentStatus = "pending" | "paid";

export type FollowUpStatus = "pending" | "contacted" | "done";
export type AppointmentStatus = "scheduled" | "confirmed" | "done" | "no_show" | "cancelled";

export interface Patient {
  id: string;
  full_name: string;
  cpf: string;
  birth_date: string;
  phone: string;
  email: string | null;
  main_condition: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Consultation {
  id: string;
  patient_id: string;
  consultation_date: string;
  location: Location;
  next_consultation: string | null;
  od_sphere: number | null;
  od_cylinder: number | null;
  od_axis: number | null;
  od_visual_acuity: string | null;
  oe_sphere: number | null;
  oe_cylinder: number | null;
  oe_axis: number | null;
  oe_visual_acuity: string | null;
  clinical_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface FollowUp {
  id: string;
  patient_id: string;
  reason: string;
  scheduled_date: string;
  status: FollowUpStatus;
  notes: string | null;
  created_at: string;
}

export interface FollowUpWithPatient extends FollowUp {
  patients: Pick<Patient, "id" | "full_name" | "phone" | "main_condition">;
}

export interface Appointment {
  id: string;
  patient_id: string;
  appointment_date: string;
  appointment_time: string;
  location: Location;
  status: AppointmentStatus;
  notes: string | null;
  amount: number | null;
  payment_method: PaymentMethod | null;
  payment_status: PaymentStatus;
  paid_at: string | null;
  created_at: string;
}

export interface AppointmentWithPatient extends Appointment {
  patients: Pick<Patient, "id" | "full_name" | "phone" | "main_condition">;
}

export interface Surgery {
  id: string;
  patient_id: string;
  indicated_in_consultation_id: string | null;
  surgery_type: string;
  eye: SurgeryEye;
  surgery_date: string | null;
  location: string | null;
  status: SurgeryStatus;
  post_op_return_date: string | null;
  notes: string | null;
  amount: number | null;
  payment_method: PaymentMethod | null;
  payment_status: PaymentStatus;
  paid_at: string | null;
  created_at: string;
}

export interface SurgeryWithPatient extends Surgery {
  patients: Pick<Patient, "id" | "full_name" | "phone">;
}
