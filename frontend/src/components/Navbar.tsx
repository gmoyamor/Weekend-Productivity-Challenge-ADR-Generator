"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/generate", label: "Generar" },
    { href: "/adrs", label: "Mis ADRs" },
  ];

  return (
    <nav aria-label="Navegación principal" className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-[720px] items-center justify-between px-6">
        <Link
          href="/"
          className="text-lg font-semibold text-[#232f3e] tracking-tight"
        >
          ADR Generator
        </Link>

        <ul className="flex items-center gap-6">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? "text-[#232f3e] border-b-2 border-[#232f3e] pb-0.5"
                      : "text-gray-500 hover:text-[#232f3e]"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
