import { z } from "zod";

export const patientSchema = z.object({
  full_name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  cpf: z
    .string()
    .min(11, "CPF inválido")
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => v.length === 11, "CPF deve ter 11 dígitos"),
  birth_date: z.string().min(1, "Data de nascimento é obrigatória"),
  phone: z
    .string()
    .min(10, "Telefone inválido")
    .transform((v) => v.replace(/\D/g, "")),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  main_condition: z.string().optional(),
  notes: z.string().optional(),
});

export type PatientFormValues = z.input<typeof patientSchema>;
