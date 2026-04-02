import { useState } from 'react'
import { deleteStudent, updateStudent } from '../../lib/api'
import type { ClassroomStudent } from '../../types'

interface Props {
  students: ClassroomStudent[]
  onStudentDeleted: (id: string) => void
  onStudentUpdated: (id: string, name: string) => void
}

export default function StudentManagementTable({
  students,
  onStudentDeleted,
  onStudentUpdated,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const startEdit = (student: ClassroomStudent) => {
    setEditingId(student.id)
    setEditName(student.name)
  }

  const saveEdit = async (id: string) => {
    if (!editName.trim()) return
    const ok = await updateStudent(id, editName.trim())
    if (ok) {
      onStudentUpdated(id, editName.trim())
      setEditingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    const ok = await deleteStudent(id)
    if (ok) {
      onStudentDeleted(id)
      setConfirmDeleteId(null)
    }
  }

  const copyPin = (pin: string, id: string) => {
    navigator.clipboard.writeText(pin)
    setCopied(id)
    setTimeout(() => setCopied(null), 1500)
  }

  if (students.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-[var(--text-light)]">
        아직 등록된 학생이 없습니다. 위에서 학생을 추가해주세요.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] text-left text-xs font-bold text-[var(--text-sub)]">
            <th className="px-4 py-3">이름</th>
            <th className="px-4 py-3">PIN</th>
            <th className="px-4 py-3">레벨</th>
            <th className="px-4 py-3">세션</th>
            <th className="px-4 py-3 text-right">관리</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.id} className="border-b border-[var(--border)] hover:bg-gray-50">
              <td className="px-4 py-3">
                {editingId === s.id ? (
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-24 border border-[var(--border)] px-2 py-1 text-sm outline-none focus:border-[var(--primary)]"
                      onKeyDown={(e) => e.key === 'Enter' && saveEdit(s.id)}
                    />
                    <button
                      type="button"
                      onClick={() => saveEdit(s.id)}
                      className="px-2 py-1 text-xs font-bold text-[var(--primary)]"
                    >
                      저장
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="px-2 py-1 text-xs text-[var(--text-light)]"
                    >
                      취소
                    </button>
                  </div>
                ) : (
                  <span className="font-bold">{s.name}</span>
                )}
              </td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => copyPin(s.pin, s.id)}
                  className="font-mono font-extrabold text-[var(--primary)] transition hover:opacity-70"
                  title="클릭하여 복사"
                >
                  {s.pin}
                  {copied === s.id && (
                    <span className="ml-2 text-xs font-normal text-green-600">복사됨</span>
                  )}
                </button>
              </td>
              <td className="px-4 py-3 text-[var(--text-sub)]">Lv.{s.level}</td>
              <td className="px-4 py-3 text-[var(--text-sub)]">{s.totalSessions}회</td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-1">
                  {editingId !== s.id && (
                    <button
                      type="button"
                      onClick={() => startEdit(s)}
                      className="px-2 py-1 text-xs text-[var(--text-light)] transition hover:text-[var(--primary)]"
                    >
                      수정
                    </button>
                  )}
                  {confirmDeleteId === s.id ? (
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleDelete(s.id)}
                        className="px-2 py-1 text-xs font-bold text-red-600"
                      >
                        확인
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2 py-1 text-xs text-[var(--text-light)]"
                      >
                        취소
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(s.id)}
                      className="px-2 py-1 text-xs text-[var(--text-light)] transition hover:text-red-500"
                    >
                      삭제
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
