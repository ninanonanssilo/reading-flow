import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function RoleSelect() {
  const { user } = useAuth()

  // 이미 로그인된 경우 역할에 맞게 리다이렉트
  if (user) {
    if (user.role === 'teacher') {
      window.location.href = '/teacher'
      return null
    }
    window.location.href = '/'
    return null
  }

  return (
    <main className="min-h-screen bg-[var(--bg-main)]">
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 py-10">
        <div className="mb-10 text-center animate-slide-up">
          <div className="mb-4 text-6xl">📚</div>
          <h1 className="text-3xl font-extrabold text-[var(--text-main)] md:text-4xl">읽기 우주탐험대</h1>
          <p className="mt-3 text-base text-[var(--text-sub)]">Reading Flow</p>
        </div>

        <div className="grid w-full gap-5 md:grid-cols-2">
          {/* 학생 */}
          <Link
            to="/login/student"
            className="group border-2 border-[var(--border)] bg-white p-8 text-center shadow-sm transition hover:border-[var(--primary)] hover:shadow-md"
          >
            <div className="mb-4 text-5xl">🧑‍🎓</div>
            <h2 className="text-xl font-extrabold text-[var(--text-main)] group-hover:text-[var(--primary)]">학생</h2>
            <p className="mt-2 text-sm text-[var(--text-sub)]">
              읽기 연습을 하고<br />실력을 키워보세요!
            </p>
            <div className="mt-5 inline-block bg-[var(--primary)] px-6 py-2.5 text-sm font-bold text-white transition group-hover:bg-[var(--primary-dark)]">
              학생 로그인 →
            </div>
          </Link>

          {/* 교사 */}
          <Link
            to="/login/teacher"
            className="group border-2 border-[var(--border)] bg-white p-8 text-center shadow-sm transition hover:border-[var(--secondary)] hover:shadow-md"
          >
            <div className="mb-4 text-5xl">👩‍🏫</div>
            <h2 className="text-xl font-extrabold text-[var(--text-main)] group-hover:text-[var(--secondary)]">교사</h2>
            <p className="mt-2 text-sm text-[var(--text-sub)]">
              학생들의 읽기 현황을<br />한눈에 확인하세요.
            </p>
            <div className="mt-5 inline-block bg-[var(--secondary)] px-6 py-2.5 text-sm font-bold text-white transition group-hover:opacity-90">
              교사 로그인 →
            </div>
          </Link>
        </div>
      </div>
    </main>
  )
}
