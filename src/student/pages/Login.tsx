import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { isLoggedIn, login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (isLoggedIn) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = () => {
    setError(null)
    const err = login(username, password)
    if (err) {
      setError(err)
      return
    }
    navigate('/')
  }

  return (
    <main className="min-h-screen bg-[var(--bg-main)]">
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 py-10">
        <div className="mb-8 text-center">
          <div className="mb-3 text-5xl">📚</div>
          <h1 className="text-2xl font-extrabold text-[var(--text-main)]">로그인</h1>
          <p className="mt-2 text-sm text-[var(--text-sub)]">읽기 우주탐험대에 돌아오셨군요!</p>
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
            className="w-full bg-[var(--primary)] py-4 text-base font-extrabold text-white shadow-md transition hover:bg-[var(--primary-dark)]"
          >
            로그인
          </button>

          <p className="text-center text-sm text-[var(--text-light)]">
            계정이 없나요?{' '}
            <Link to="/register" className="font-bold text-[var(--primary)] hover:underline">회원가입</Link>
          </p>
        </div>
      </div>
    </main>
  )
}
