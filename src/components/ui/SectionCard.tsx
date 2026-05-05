export function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className='rounded border bg-white p-4'><h2 className='mb-3 text-sm font-semibold text-slate-700'>{title}</h2>{children}</section>;
}
