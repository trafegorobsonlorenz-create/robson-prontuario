import { LoginForm } from "@/components/auth/LoginForm";
import { Eye } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-blue-100">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4">
            <Eye className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Prontuário</h1>
          <p className="text-gray-500 mt-1">Dr. Robson Lorenz — CRM-SP 180197</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
