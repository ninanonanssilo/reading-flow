import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { anonymizeStudentName, anonymizeSessionForExport, deleteAllStudentData } from '../../utils/privacy'

export default function PrivacyManagement() {
  const { user } = useAuth()
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv')

  const handleExportAnonymized = async () => {
    try {
      const { loadClassroomStudents } = await import('../../lib/api')
      const students = await loadClassroomStudents('default') as { name: string; sessions: Record<string, unknown>[] }[]
      const anonymized = students.flatMap((student, idx) => {
        const code = anonymizeStudentName(student.name, idx)
        return (student.sessions ?? []).map((session, sIdx) =>
          anonymizeSessionForExport({ ...session, _sessionOrder: sIdx + 1 }, code),
        )
      })
      const content = exportFormat === 'json'
        ? JSON.stringify(anonymized, null, 2)
        : convertToCSV(anonymized)
      const blob = new Blob([content], { type: exportFormat === 'json' ? 'application/json' : 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `reading-flow-anonymized.${exportFormat}`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export failed:', err)
      alert('데이터 내보내기에 실패했습니다.')
    }
  }

  const handleDeleteStudent = async (studentId: string) => {
    if (deleteConfirm !== studentId) {
      setDeleteConfirm(studentId)
      return
    }
    await deleteAllStudentData(studentId)
    setDeleteConfirm(null)
    window.location.reload()
  }

  return (
    <main className="min-h-screen bg-[var(--bg-main)] px-6 py-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-extrabold text-gray-800">개인정보 관리</h1>
          <Link to="/teacher" className="border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-500 shadow-sm hover:text-gray-700">
            ← 대시보드로
          </Link>
        </div>

        <section className="mb-6 border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-base font-bold text-gray-700">연구 데이터 내보내기 (비식별화)</h2>
          <p className="mb-3 text-xs text-gray-500">
            학생 이름을 코드(S001, S002 등)로 대체하고, 식별 가능한 정보를 제거한 후 내보냅니다.
          </p>
          <div className="flex items-center gap-3">
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as 'csv' | 'json')}
              className="border border-gray-200 px-3 py-2 text-sm"
            >
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
            </select>
            <button
              type="button"
              onClick={handleExportAnonymized}
              className="bg-blue-600 px-4 py-2 text-sm font-bold text-white"
            >
              비식별화 데이터 다운로드
            </button>
          </div>
        </section>

        <section className="border border-red-200 bg-red-50 p-5">
          <h2 className="mb-3 text-base font-bold text-red-700">연구 참여 철회 (데이터 삭제)</h2>
          <p className="mb-3 text-xs text-red-500">
            학생의 연구 참여를 철회하면 해당 학생의 모든 데이터(읽기 기록, 음성 파일, 학습 로그)가
            영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
          </p>
          <button
            type="button"
            onClick={() => handleDeleteStudent(user?.id ?? 'local')}
            className={`px-4 py-2 text-sm font-bold text-white ${
              deleteConfirm ? 'bg-red-700' : 'bg-red-500'
            }`}
          >
            {deleteConfirm ? '정말 삭제합니다 (다시 클릭)' : '현재 데이터 삭제'}
          </button>
        </section>
      </div>
    </main>
  )
}

function convertToCSV(data: Record<string, unknown>[]): string {
  if (data.length === 0) return ''
  const headers = Object.keys(data[0])
  const rows = data.map((row) =>
    headers.map((h) => {
      const val = row[h]
      if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`
      return String(val ?? '')
    }).join(','),
  )
  return [headers.join(','), ...rows].join('\n')
}
