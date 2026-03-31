export default function MetricCard({
  label,
  value,
  tone = 'blue',
}: {
  label: string
  value: string
  tone?: 'blue' | 'orange' | 'green'
}) {
  const styles = {
    blue: 'border-l-[var(--primary)] bg-[var(--primary-light)] text-[var(--primary-dark)]',
    orange: 'border-l-[var(--accent-orange)] bg-[var(--accent-orange-light)] text-[var(--accent-orange)]',
    green: 'border-l-[var(--secondary)] bg-[var(--secondary-light)] text-emerald-700',
  }

  return (
    <div className={`border-l-4 p-4 ${styles[tone]}`}>
      <p className="text-xs font-bold opacity-60">{label}</p>
      <p className="mt-1 text-2xl font-extrabold">{value}</p>
    </div>
  )
}
