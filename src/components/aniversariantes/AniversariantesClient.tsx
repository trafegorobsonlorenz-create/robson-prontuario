"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MessageCircle, Cake } from "lucide-react";

const MONTHS_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

interface Patient {
  id: string;
  full_name: string;
  birth_date: string;
  phone: string;
}

interface AniversariantesClientProps {
  allPatients: Patient[];
  initialMonth: number;
  initialYear: number;
}

function buildWhatsAppUrl(patient: Patient, year: number) {
  const phone = patient.phone.replace(/\D/g, "");
  const phoneWithCountry = phone.startsWith("55") ? phone : `55${phone}`;
  const firstName = patient.full_name.split(" ")[0];
  const [birthYear] = patient.birth_date.split("-").map(Number);
  const age = year - birthYear;
  const message =
    `Olá ${firstName}! 🎂 O Dr. Robson Lorenz deseja um Feliz Aniversário! ` +
    `Que este novo ano de vida (${age} anos) seja repleto de saúde e muita alegria. Um abraço! 👁️✨`;
  return `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`;
}

function formatBirthDate(birth_date: string) {
  const [, month, day] = birth_date.split("-");
  const monthName = MONTHS_PT[parseInt(month) - 1];
  return `${parseInt(day)} de ${monthName}`;
}

function getAge(birth_date: string, year: number) {
  const birthYear = parseInt(birth_date.split("-")[0]);
  return year - birthYear;
}

export function AniversariantesClient({
  allPatients,
  initialMonth,
  initialYear,
}: AniversariantesClientProps) {
  const [month, setMonth] = useState(initialMonth);
  const [year, setYear] = useState(initialYear);

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }

  function nextMonth() {
    if (month === 12) { setMonth(1); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }

  const birthdays = allPatients
    .filter((p) => parseInt(p.birth_date.split("-")[1]) === month)
    .sort((a, b) => {
      const dayA = parseInt(a.birth_date.split("-")[2]);
      const dayB = parseInt(b.birth_date.split("-")[2]);
      return dayA - dayB;
    });

  const today = new Date();
  const todayDay = today.getDate();
  const todayMonth = today.getMonth() + 1;

  return (
    <div className="space-y-6">
      {/* Navegação de mês */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900 min-w-[160px] text-center">
            {MONTHS_PT[month - 1]} {year}
          </h2>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="text-sm text-muted-foreground">
          {birthdays.length}{" "}
          {birthdays.length === 1 ? "aniversariante" : "aniversariantes"}
        </div>
      </div>

      {/* Lista */}
      {birthdays.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Cake className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>Nenhum aniversariante em {MONTHS_PT[month - 1]}.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {birthdays.map((patient) => {
            const day = parseInt(patient.birth_date.split("-")[2]);
            const isToday = day === todayDay && month === todayMonth;
            const age = getAge(patient.birth_date, year);

            return (
              <div
                key={patient.id}
                className={`flex items-center gap-4 rounded-lg border bg-white px-4 py-3 ${
                  isToday ? "border-pink-300 bg-pink-50" : ""
                }`}
              >
                {/* Dia */}
                <div className="shrink-0 w-12 text-center">
                  <p className={`text-2xl font-bold ${isToday ? "text-pink-600" : "text-gray-900"}`}>
                    {day}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {MONTHS_PT[month - 1].slice(0, 3)}
                  </p>
                </div>

                <div className="w-px h-10 bg-border shrink-0" />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/patients/${patient.id}`}
                      className="font-medium text-sm text-gray-900 hover:text-primary truncate"
                    >
                      {patient.full_name}
                    </Link>
                    {isToday && (
                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold bg-pink-100 text-pink-700 shrink-0">
                        🎂 Hoje!
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatBirthDate(patient.birth_date)} · {age} anos
                  </p>
                </div>

                {/* WhatsApp */}
                <a
                  href={buildWhatsAppUrl(patient, year)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
