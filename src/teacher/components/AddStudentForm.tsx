import { useState } from 'react'
import { addStudentToClassroom } from '../../lib/api'
import type { ClassroomStudent } from '../../types'

interface Props {
  classroomId: string
  onStudentAdded: (student: ClassroomStudent) => void
}

export default function AddStudentForm({ classroomId, onStudentAdded }: Props) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [lastAdded, setLastAdded] = useState<{ name: string; pin: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || loading) return

    setLoading(true)
    const student = await addStudentToClassroom(classroomId, name.trim())
    setLoading(false)

    if (student) {
      setLastAdded({ name: student.name, pin: student.pin })
      setName('')
      onStudentAdded(student)
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="학생 이름 입력"
          maxLength={10}
          className="flex-1 border border-[var(--border)] bg-white px-4 py-2 text-sm outline-none focus:border-[var(--primary)]"
        />
        <button
          type="submit"
          disabled={!name.trim() || loading}
          className="border border-[var(--primary)] bg-[var(--primary)] px-6 py-2 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? '추가 중...' : '추가'}
        </button>
      </form>

      {lastAdded && (
        <div className="mt-3 border border-green-200 bg-green-50 px-4 py-3 text-sm">
          <span className="font-bold text-green-700">{lastAdded.name}</span> 학생이 추가되었습니다.
          PIN: <span className="font-mono font-extrabold text-green-800">{lastAdded.pin}</span>
        </div>
      )}
    </div>
  )
}
