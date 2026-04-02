import type { ClassroomStudent } from '../../types'

interface Props {
  classroomName: string
  classCode: string
  students: ClassroomStudent[]
  pinLoginUrl: string
}

export default function PinSheet({
  classroomName,
  classCode,
  students,
  pinLoginUrl,
}: Props) {
  const handlePrint = () => window.print()

  return (
    <div>
      <button
        type="button"
        onClick={handlePrint}
        className="mb-4 border border-[var(--border)] bg-white px-4 py-2 text-sm font-bold text-[var(--text-light)] shadow-sm transition hover:text-[var(--primary)] print:hidden"
      >
        인쇄하기
      </button>

      <div className="print:block">
        <div className="mb-6 text-center">
          <h2 className="text-xl font-extrabold">{classroomName} - PIN 목록</h2>
          <p className="mt-1 text-sm text-[var(--text-sub)]">
            학급코드: <span className="font-mono font-bold">{classCode}</span>
          </p>
          <p className="mt-1 text-xs text-[var(--text-light)]">
            접속 주소: {pinLoginUrl}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {students.map((s) => (
            <div
              key={s.id}
              className="border border-[var(--border)] bg-white px-4 py-3 text-center"
            >
              <p className="text-sm font-bold text-[var(--text-main)]">{s.name}</p>
              <p className="mt-1 font-mono text-2xl font-extrabold text-[var(--primary)]">
                {s.pin}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
