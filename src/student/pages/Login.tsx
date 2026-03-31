import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import type { UserRole } from '../../types'

const roleConfig = {
  student: {
    title: '학생 로그인',
    subtitle: '읽기 우주탐험대에 돌아오셨군요!',
    icon: '🧑‍🎓',
    color: 'var(--primary)',
    colorDark: 'var(--primary-dark)',
    home: '/',
    registerPath: '/register/student',
    otherRole: { path: '/login/teacher', label: '교사로 로그인' },
  },
  teacher: {
    title: '교사 로그인',
    subtitle: '학생들의 읽기 현황을 확인하세요.',
    icon: '👩‍🏫',
    color: 'var(--secondary)',
    colorDark: '#00a88c',
    home: '/teacher',
    registerPath: '/register/teacher',
    otherRole: { path: '/login/student', label: '학생으로 로그인' },
  },
}

export default function Login() {
  const { role: roleParam } = useParams<{ role: string }>()
  const role = (roleParam === 'teacher' ? 'teacher' : 'student') as UserRole
  const config = roleConfig[role]

  const navigate = useNavigate()
  const { user, login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (user && user.role === role) {
    return <Navigate to={config.home} replace />
  }

  const handleSubmit = () => {
    setError(null)
    const err = login(username, password, role)
    if (err) {
      setError(err)
      return
    }
    navigate(config.home)
  }

  return (
    <main className="min-h-screen bg-[var(--bg-main)]">
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 py-10">
        <div className="mb-8 text-center">
          <div className="mb-3 text-5xl">{config.icon}</div>
          <h1 className="text-2xl font-extrabold text-[var(--text-main)]">{config.title}</h1>
          <p className="mt-2 text-sm text-[var(--text-sub)]">{config.subtitle}</p>
        </div>

        <div className="w-full space-y-4">
          <div className="border border-[var(--border)] bg-white p-5 shadow-sm">
            <label className="mb-2 block text-sm font-bold text-[var(--text-sub)]">아이디</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="아이디 입력"
              className="w-full border-2 border-[var(--border)] bg-[var(--bg-main)] px-4 py-3 text-base font-bold text-[var(--text-main)] outline-none transition focus:border-[var(--primary)] placeholder:text-[var(--text-light)]"
              autoFocus
            />
          </div>

          <div className="border border-[var(--border)] bg-white p-5 shadow-sm">
            <label className="mb-2 block text-sm font-bold text-[var(--text-sub)]">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="비밀번호 입력"
              className="w-full border-2 border-[var(--border)] bg-[var(--bg-main)] px-4 py-3 text-base font-bold text-[var(--text-main)] outline-none transition focus:border-[var(--primary)] placeholder:text-[var(--text-light)]"
            />
          </div>

          {error && (
            <div className="border-l-4 border-l-red-500 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            style={{ backgroundColor: config.color }}
            className="w-full py-4 text-base font-extrabold text-white shadow-md transition hover:opacity-90"
          >
            로그인
          </button>

          <div className="flex items-center justify-between text-sm">
            <Link to={config.registerPath} className="font-bold text-[var(--primary)] hover:underline">
              회원가입
            </Link>
            <Link to={config.otherRole.path} className="font-bold text-[var(--text-light)] hover:text-[var(--text-sub)]">
              {config.otherRole.label}
            </Link>
          </div>

          <div className="text-center">
            <Link to="/welcome" className="text-xs font-bold text-[var(--text-light)] hover:text-[var(--text-sub)]">
              ← 역할 선택으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
