import Link from "next/link";

function SparklesIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[#FF9900]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
    </svg>
  );
}

function StorageIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[#FF9900]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125v-3.75" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[#FF9900]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

const features = [
  {
    icon: SparklesIcon,
    title: "IA con Amazon Bedrock",
    description: "Genera ADRs estructurados usando Claude o Nova como modelo base",
  },
  {
    icon: StorageIcon,
    title: "Almacenamiento en S3",
    description: "Tus decisiones se guardan como Markdown en un bucket privado",
  },
  {
    icon: DocumentIcon,
    title: "Formato Markdown estándar",
    description: "Compatible con cualquier wiki, repo o sistema de documentación",
  },
];

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="animate-fade-in-up py-16 md:py-28 px-6 text-center">
        <h1 className="text-3xl md:text-5xl font-bold text-white">
          ADR Generator
        </h1>

        <p className="mt-5 text-lg text-gray-300">
          Genera Architecture Decision Records con IA en segundos
        </p>

        <div className="mt-12 flex flex-col items-center gap-4">
          <Link
            href="/generate"
            className="inline-flex items-center justify-center bg-[#FF9900] hover:bg-[#FFB84D] text-white font-semibold px-8 py-3 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF9900] focus:ring-offset-2 focus:ring-offset-[#1A242F]"
          >
            Generar ADR
          </Link>

          <Link
            href="/adrs"
            className="inline-flex items-center justify-center border border-gray-400 text-gray-200 font-medium px-8 py-3 rounded-md transition-colors duration-200 hover:bg-white/10 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF9900] focus:ring-offset-2 focus:ring-offset-[#1A242F]"
          >
            Ver mis ADRs
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-gray-700 pt-20 pb-16 px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto items-stretch">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="animate-fade-in-up bg-[#2A3A4A] border border-[#3B4B5B] rounded-lg p-6 flex flex-col"
              style={{ animationDelay: `${0.2 + index * 0.15}s`, opacity: 0 }}
            >
              <div className="mb-4">
                <feature.icon />
              </div>
              <h3 className="text-base font-semibold text-white">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-400 mt-2 min-h-[3rem]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-700 bg-[#232F3E] py-6 px-6">
        <div className="flex flex-col items-center gap-3">
          <p className="text-xs text-gray-500">Construido con</p>
          <div className="flex items-center gap-4 text-gray-400">
            <span className="text-xs font-medium px-2 py-1 rounded border border-gray-600">
              Next.js
            </span>
            <span className="text-xs font-medium px-2 py-1 rounded border border-gray-600">
              AWS Lambda
            </span>
            <span className="text-xs font-medium px-2 py-1 rounded border border-gray-600">
              Amazon Bedrock
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
