import { PatientForm } from "@/components/patients/PatientForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewPatientPage() {
  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/patients">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Novo Paciente</h1>
          <p className="text-muted-foreground text-sm">Preencha os dados do paciente</p>
        </div>
      </div>
      <PatientForm />
    </div>
  );
}
