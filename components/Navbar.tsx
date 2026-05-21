"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ClipboardList, ShieldCheck, Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const isAdmin = pathname.startsWith("/admin");

  const links = [
    { href: "/", label: "Encuestas", icon: ClipboardList },
    { href: "/admin", label: "Admin", icon: ShieldCheck },
  ];

  const handleLogout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <nav className="bg-red-700 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/logo-cuc.png"
              alt="Logo CUC"
              width={36}
              height={36}
              className="rounded object-contain"
            />
            <span className="font-bold text-lg leading-tight">
              Universidad de la Costa
            </span>
          </Link>

          {/* Desktop */}
          <div className="hidden sm:flex items-center gap-1">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  pathname === href || (href !== "/" && pathname.startsWith(href))
                    ? "bg-white/20 text-white"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
            {isAdmin && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-all"
              >
                <LogOut className="w-4 h-4" />
                Salir
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setOpen(!open)}
            className="sm:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="sm:hidden border-t border-white/20 px-4 py-2 space-y-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                pathname === href || (href !== "/" && pathname.startsWith(href))
                  ? "bg-white/20"
                  : "hover:bg-white/10"
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          ))}
          {isAdmin && (
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-white/10 transition-all"
            >
              <LogOut className="w-5 h-5" />
              Salir
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
