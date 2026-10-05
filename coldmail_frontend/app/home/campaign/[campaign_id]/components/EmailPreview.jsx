export default function EmailPreview({ email }) {
  return (
    <div className="rounded-xl border bg-white">
      
      <div className="px-5 py-4 border-b">
        <p className="text-xs uppercase tracking-wide text-gray-500">
          Email Subject
        </p>
        <p className="mt-1 font-medium text-gray-900">
          {email.subject}
        </p>
      </div>

      <div className="px-5 py-4 space-y-4">
        <Section title="Template">
          {email.body_template}
        </Section>

        <Section title="Preview">
          {email.body_text_preview}
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 mb-1">
        {title}
      </p>
      <pre className="rounded-lg bg-gray-50 p-3 text-sm whitespace-pre-wrap text-gray-800">
        {children}
      </pre>
    </div>
  );
}
