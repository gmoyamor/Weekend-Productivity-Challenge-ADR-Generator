"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const links = [
    { href: "/generate", label: "Generar" },
    { href: "/adrs", label: "Mis ADRs" },
  ];

  return (
    <nav
      aria-label="Navegación principal"
      className="sticky top-0 z-50 w-full border-b border-gray-700 bg-[#232F3E]"
    >
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-6">
        <Link
          href="/"
          className="text-lg font-semibold text-white tracking-tight"
        >
          ADR Generator
        </Link>

        <ul className="flex items-center gap-6">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`pb-1 text-sm font-medium border-b-2 transition-colors duration-150 ${
                  isActive(link.href)
                    ? "text-white border-[#FF9900]"
                    : "text-gray-400 border-transparent hover:text-gray-200"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
