"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Eye, Users, Bell, CalendarDays, LogOut, DollarSign, Cake } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/patients", label: "Pacientes", icon: Users },
  { href: "/alertas", label: "Alertas", icon: Bell },
  { href: "/financeiro", label: "Financeiro", icon: DollarSign },
  { href: "/aniversariantes", label: "Aniversariantes", icon: Cake },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-white border-r border-border flex flex-col z-10">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 bg-primary rounded-lg shrink-0">
            <Eye className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-gray-900 truncate">Dr. Robson Lorenz</p>
            <p className="text-xs text-muted-foreground">Prontuário</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              pathname.startsWith(href)
                ? "bg-primary/10 text-primary"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-gray-600 hover:text-gray-900"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          Sair
        </Button>
      </div>
    </aside>
  );
}
