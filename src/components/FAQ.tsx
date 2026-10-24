interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  items: FAQItem[];
}

// Native <details>: every answer is in the server HTML (search engines read it, no JS needed);
// the shared `name` keeps one item open at a time where the browser supports it.
export default function FAQ({ items }: FAQProps) {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-secondary-dark/20 overflow-hidden divide-y divide-secondary-dark/20">
      {items.map((item, index) => (
        <details key={index} name="faq" className="group">
          <summary className="flex items-center justify-between w-full px-6 py-5 text-start cursor-pointer list-none transition-colors hover:bg-surface/50 [&::-webkit-details-marker]:hidden">
            <span className="text-text-primary font-medium text-base pe-4">{item.question}</span>
            <span
              aria-hidden="true"
              className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-accent transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="8" y1="2" x2="8" y2="14" />
                <line x1="2" y1="8" x2="14" y2="8" />
              </svg>
            </span>
          </summary>
          <div className="px-6 pb-5 text-text-secondary leading-relaxed text-sm">{item.answer}</div>
        </details>
      ))}
    </div>
  );
}
