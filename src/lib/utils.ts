import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCPF(cpf: string): string {
  const digits = cpf.replace(/\D/g, "");
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
}

export function formatDate(date: string): string {
  if (!date) return "";
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

export function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function formatRefraction(
  sphere: number | null,
  cylinder: number | null,
  axis: number | null
): string {
  if (sphere === null && cylinder === null) return "—";
  const s = sphere !== null ? (sphere >= 0 ? `+${sphere.toFixed(2)}` : sphere.toFixed(2)) : "—";
  const c = cylinder !== null ? (cylinder >= 0 ? `+${cylinder.toFixed(2)}` : cylinder.toFixed(2)) : "—";
  const a = axis !== null ? `${axis}°` : "—";
  return `${s} ${c} x ${a}`;
}
