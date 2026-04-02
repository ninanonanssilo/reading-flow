import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  createClassroom,
  deleteClassroom,
  loadTeacherClassrooms,
  loadClassroomStudentsForManagement,
} from '../../lib/api'
import { isOnlineMode } from '../../lib/supabase'
import type { Classroom, ClassroomStudent } from '../../types'
import AddStudentForm from '../components/AddStudentForm'
import StudentManagementTable from '../components/StudentManagementTable'
import PinSheet from '../components/PinSheet'

export default function ClassroomManagement() {
  const { user } = useAuth()
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [selected, setSelected] = useState<Classroom | null>(null)
  const [students, setStudents] = useState<ClassroomStudent[]>([])
  const [loading, setLoading] = useState(true)
  const [newClassName, setNewClassName] = useState('')
  const [creating, setCreating] = useState(false)
  const [showPinSheet, setShowPinSheet] = useState(false)
  const [confirmDeleteClassroom, setConfirmDeleteClassroom] = useState(false)
  const [copied, setCopied] = useState(false)

  const teacherId = user?._supabaseTeacherId

  const fetchClassrooms = useCallback(async () => {
    if (!teacherId) return
    setLoading(true)
    const data = await loadTeacherClassrooms(teacherId)
    setClassrooms(data)
    setLoading(false)
  }, [teacherId])

  useEffect(() => {
    fetchClassrooms()
  }, [fetchClassrooms])

  const fetchStudents = useCallback(async (classroomId: string) => {
    const data = await loadClassroomStudentsForManagement(classroomId)
    setStudents(data)
  }, [])

  const handleSelectClassroom = (classroom: Classroom) => {
    setSelected(classroom)
    setShowPinSheet(false)
    fetchStudents(classroom.id)
  }

  const handleCreateClassroom = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newClassName.trim() || !teacherId || creating) return
    setCreating(true)
    const classroom = await createClassroom(teacherId, newClassName.trim())
    setCreating(false)
    if (classroom) {
      setClassrooms((prev) => [classroom, ...prev])
      setNewClassName('')
    }
  }

  const handleDeleteClassroom = async () => {
    if (!selected) return
    const ok = await deleteClassroom(selected.id)
    if (ok) {
      setClassrooms((prev) => prev.filter((c) => c.id !== selected.id))
      setSelected(null)
      setStudents([])
      setConfirmDeleteClassroom(false)
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const pinLoginUrl = selected
    ? `${window.location.origin}/pin?code=${selected.classCode}`
    : ''

  if (!isOnlineMode) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--bg-main)]">
        <div className="text-center">
          <p className="text-lg font-bold text-[var(--text-main)]">온라인 모드에서만 학급 관리가 가능합니다.</p>
          <Link to="/teacher" className="mt-4 inline-block text-sm text-[var(--primary)] underline">대시보드로 돌아가기</Link>
        </div>
      </main>
    )
  }

  if (!teacherId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--bg-main)]">
        <div className="text-center">
          <p className="text-lg font-bold text-[var(--text-main)]">교사 계정 동기화 중입니다...</p>
          <p className="mt-2 text-sm text-[var(--text-sub)]">로그아웃 후 다시 로그인해주세요.</p>
          <Link to="/teacher" className="mt-4 inline-block text-sm text-[var(--primary)] underline">대시보드로 돌아가기</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[var(--bg-main)] px-6 py-6 text-[var(--text-main)] md:px-10">
      <div className="mx-auto max-w-5xl">
        {/* 헤더 */}
        <header className="mb-8">
          <div className="mb-5 flex items-center justify-between">
            <Link to="/teacher" className="flex items-center gap-2 transition hover:opacity-80">
              <span className="text-lg">🧑‍🚀</span>
              <span className="text-base font-extrabold text-[var(--secondary)]">읽기 우주탐험대</span>
              <span className="border border-[var(--border)] bg-[var(--secondary)] px-3 py-1 text-xs font-bold text-white">교사</span>
            </Link>
            <Link
              to="/teacher"
              className="border border-[var(--border)] bg-white px-4 py-2 text-sm font-bold text-[var(--text-light)] shadow-sm transition hover:text-blue-500"
            >
              대시보드
            </Link>
          </div>
          <h1 className="text-3xl font-extrabold">학급 관리</h1>
          <p className="mt-2 text-sm text-[var(--text-sub)]">
            학급을 만들고 학생을 추가하면 PIN이 자동 생성됩니다.
          </p>
        </header>

        {!selected ? (
          <>
            {/* 새 학급 만들기 */}
            <section className="mb-6 border border-[var(--border)] bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-extrabold">새 학급 만들기</h2>
              <form onSubmit={handleCreateClassroom} className="flex gap-2">
                <input
                  type="text"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="예: 3학년 1반"
                  maxLength={20}
                  className="flex-1 border border-[var(--border)] bg-white px-4 py-2 text-sm outline-none focus:border-[var(--primary)]"
                />
                <button
                  type="submit"
                  disabled={!newClassName.trim() || creating}
                  className="border border-[var(--primary)] bg-[var(--primary)] px-6 py-2 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50"
                >
                  {creating ? '생성 중...' : '만들기'}
                </button>
              </form>
            </section>

            {/* 학급 목록 */}
            <section>
              {loading ? (
                <p className="py-8 text-center text-sm text-[var(--text-light)]">불러오는 중...</p>
              ) : classrooms.length === 0 ? (
                <p className="py-8 text-center text-sm text-[var(--text-light)]">
                  아직 학급이 없습니다. 위에서 새 학급을 만들어주세요.
                </p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {classrooms.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleSelectClassroom(c)}
                      className="border border-[var(--border)] bg-white p-5 text-left shadow-sm transition hover:border-[var(--primary)]"
                    >
                      <h3 className="text-lg font-extrabold">{c.name}</h3>
                      <div className="mt-2 flex items-center gap-4 text-sm text-[var(--text-sub)]">
                        <span>
                          학급코드: <span className="font-mono font-bold text-[var(--primary)]">{c.classCode}</span>
                        </span>
                        <span>학생 {c.studentCount ?? 0}명</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : (
          <>
            {/* 학급 상세 */}
            <button
              type="button"
              onClick={() => { setSelected(null); setShowPinSheet(false); setConfirmDeleteClassroom(false) }}
              className="mb-6 text-sm font-bold text-[var(--text-light)] transition hover:text-[var(--primary)]"
            >
              &larr; 학급 목록으로
            </button>

            {/* 학급 정보 */}
            <section className="mb-6 border border-[var(--border)] bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-extrabold">{selected.name}</h2>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                    <div>
                      <span className="text-[var(--text-sub)]">학급코드: </span>
                      <button
                        type="button"
                        onClick={() => copyCode(selected.classCode)}
                        className="font-mono text-lg font-extrabold text-[var(--primary)] transition hover:opacity-70"
                        title="클릭하여 복사"
                      >
                        {selected.classCode}
                      </button>
                      {copied && <span className="ml-2 text-xs text-green-600">복사됨</span>}
                    </div>
                    <div>
                      <span className="text-[var(--text-sub)]">PIN 로그인 링크: </span>
                      <button
                        type="button"
                        onClick={() => { navigator.clipboard.writeText(pinLoginUrl); copyCode(selected.classCode) }}
                        className="text-xs text-[var(--primary)] underline"
                      >
                        {pinLoginUrl}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPinSheet(!showPinSheet)}
                    className="border border-[var(--border)] bg-white px-4 py-2 text-sm font-bold text-[var(--text-light)] shadow-sm transition hover:text-[var(--primary)]"
                  >
                    {showPinSheet ? 'PIN 목록 닫기' : 'PIN 목록 보기'}
                  </button>
                </div>
              </div>
            </section>

            {/* PIN 시트 */}
            {showPinSheet && (
              <section className="mb-6 border border-[var(--border)] bg-white p-6 shadow-sm">
                <PinSheet
                  classroomName={selected.name}
                  classCode={selected.classCode}
                  students={students}
                  pinLoginUrl={pinLoginUrl}
                />
              </section>
            )}

            {/* 학생 추가 */}
            <section className="mb-6 border border-[var(--border)] bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-extrabold">학생 추가</h3>
              <AddStudentForm
                classroomId={selected.id}
                onStudentAdded={(student) => setStudents((prev) => [...prev, student])}
              />
            </section>

            {/* 학생 목록 */}
            <section className="mb-6 border border-[var(--border)] bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-extrabold">학생 목록 ({students.length}명)</h3>
              <StudentManagementTable
                students={students}
                onStudentDeleted={(id) => setStudents((prev) => prev.filter((s) => s.id !== id))}
                onStudentUpdated={(id, name) =>
                  setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, name } : s)))
                }
              />
            </section>

            {/* 학급 삭제 */}
            <section className="border border-red-200 bg-red-50 p-6">
              <h3 className="mb-2 text-sm font-extrabold text-red-700">위험 영역</h3>
              {confirmDeleteClassroom ? (
                <div className="flex items-center gap-3">
                  <p className="text-sm text-red-600">정말 이 학급과 모든 학생 데이터를 삭제할까요?</p>
                  <button
                    type="button"
                    onClick={handleDeleteClassroom}
                    className="border border-red-500 bg-red-500 px-4 py-1 text-sm font-bold text-white"
                  >
                    삭제
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteClassroom(false)}
                    className="px-4 py-1 text-sm text-[var(--text-light)]"
                  >
                    취소
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDeleteClassroom(true)}
                  className="text-sm text-red-500 underline"
                >
                  학급 삭제
                </button>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  )
}
