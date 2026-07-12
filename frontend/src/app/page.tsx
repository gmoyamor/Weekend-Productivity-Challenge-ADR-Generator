import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center px-6">
      <div className="w-full max-w-[720px] py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-[#232f3e]">
          ADR Generator
        </h1>

        <p className="mt-4 text-lg text-gray-600">
          Genera Architecture Decision Records con IA en segundos
        </p>

        <div className="mt-10 flex flex-col items-center gap-4">
          <Link
            href="/generate"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-[#232f3e] px-8 text-base font-medium text-white transition-colors duration-150 hover:bg-[#1a2330]"
          >
            Generar ADR
          </Link>

          <Link
            href="/adrs"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-300 px-6 text-sm font-medium text-gray-600 transition-colors duration-150 hover:border-[#232f3e] hover:text-[#232f3e]"
          >
            Ver mis ADRs
          </Link>
        </div>
      </div>
    </div>
  );
}
