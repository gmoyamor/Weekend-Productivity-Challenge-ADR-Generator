import ReactMarkdown from "react-markdown";

interface ADRViewerProps {
  content: string;
  title?: string;
}

/**
 * Strips YAML front matter from markdown content.
 * Front matter is delimited by --- at the start of the file.
 */
function stripFrontMatter(markdown: string): string {
  const trimmed = markdown.trimStart();
  if (!trimmed.startsWith("---")) return markdown;

  const endIndex = trimmed.indexOf("---", 3);
  if (endIndex === -1) return markdown;

  return trimmed.slice(endIndex + 3).trimStart();
}

export default function ADRViewer({ content, title }: ADRViewerProps) {
  const cleanContent = stripFrontMatter(content);

  return (
    <article>
      {title && (
        <h1 className="text-2xl font-semibold text-white mb-6">{title}</h1>
      )}
      <div className="prose-adr">
        <ReactMarkdown
          components={{
            h1: ({ children }) => (
              <h1 className="text-2xl font-semibold text-white mt-8 mb-3">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-lg font-semibold text-white mt-6 mb-2 pb-1 border-b border-gray-700">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-base font-semibold text-white mt-4 mb-1">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="text-base text-gray-300 leading-relaxed mb-3">
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul className="list-disc pl-6 mb-3 space-y-1 text-gray-300">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal pl-6 mb-3 space-y-1 text-gray-300">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="text-base leading-relaxed">{children}</li>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold text-white">{children}</strong>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-2 border-gray-700 pl-4 my-3 text-gray-400 italic">
                {children}
              </blockquote>
            ),
            code: ({ children }) => (
              <code className="bg-[#2A3A4A] text-sm px-1.5 py-0.5 rounded text-gray-300">
                {children}
              </code>
            ),
            hr: () => <hr className="my-6 border-gray-700" />,
          }}
        >
          {cleanContent}
        </ReactMarkdown>
      </div>
    </article>
  );
}
