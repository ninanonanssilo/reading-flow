import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import type { UserRole } from '../../types'

const roleConfig = {
  student: {
    title: '학생 회원가입',
    subtitle: '읽기 우주탐험대에 합류하세요!',
    icon: '🧑‍🎓',
    color: 'var(--primary)',
    home: '/',
    loginPath: '/login/student',
    privacyItems: [
      '아이디, 비밀번호, 닉네임',
      '읽기 활동 기록(정확도, 속도, 오류 유형)',
      '자기평가 데이터, 학습 진행 현황',
    ],
  },
  teacher: {
    title: '교사 회원가입',
    subtitle: '학생들의 읽기 현황을 관리하세요.',
    icon: '👩‍🏫',
    color: 'var(--secondary)',
    home: '/teacher',
    loginPath: '/login/teacher',
    privacyItems: [
      '아이디, 비밀번호',
      '담당 학생 읽기 데이터 열람 기록',
    ],
  },
}

export default function Register() {
  const { role: roleParam } = useParams<{ role: string }>()
  const role = (roleParam === 'teacher' ? 'teacher' : 'student') as UserRole
  const config = roleConfig[role]

  const navigate = useNavigate()
  const { user, register } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [consent, setConsent] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (user && user.role === role) {
    return <Navigate to={config.home} replace />
  }

  const handleSubmit = () => {
    setError(null)
    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }
    const err = register(username, password, role, consent)
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
          {/* 아이디 */}
          <div className="border border-[var(--border)] bg-white p-5 shadow-sm">
            <label className="mb-2 block text-sm font-bold text-[var(--text-sub)]">아이디</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="2자 이상 입력"
              maxLength={20}
              className="w-full border-2 border-[var(--border)] bg-[var(--bg-main)] px-4 py-3 text-base font-bold text-[var(--text-main)] outline-none transition focus:border-[var(--primary)] placeholder:text-[var(--text-light)]"
            />
          </div>

          {/* 비밀번호 */}
          <div className="border border-[var(--border)] bg-white p-5 shadow-sm">
            <label className="mb-2 block text-sm font-bold text-[var(--text-sub)]">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="4자 이상 입력"
              className="w-full border-2 border-[var(--border)] bg-[var(--bg-main)] px-4 py-3 text-base font-bold text-[var(--text-main)] outline-none transition focus:border-[var(--primary)] placeholder:text-[var(--text-light)]"
            />
            <label className="mt-3 mb-2 block text-sm font-bold text-[var(--text-sub)]">비밀번호 확인</label>
            <input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="비밀번호를 다시 입력"
              className="w-full border-2 border-[var(--border)] bg-[var(--bg-main)] px-4 py-3 text-base font-bold text-[var(--text-main)] outline-none transition focus:border-[var(--primary)] placeholder:text-[var(--text-light)]"
            />
          </div>

          {/* 개인정보 동의 */}
          <div className="border border-[var(--border)] bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="privacy-consent"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 h-5 w-5 accent-[var(--primary)]"
              />
              <label htmlFor="privacy-consent" className="text-sm leading-relaxed text-[var(--text-sub)]">
                <span className="font-bold">[필수]</span> 개인정보 수집·이용에 동의합니다.
              </label>
            </div>
            <button
              type="button"
              onClick={() => setShowPrivacy(!showPrivacy)}
              className="mt-2 text-xs font-bold text-[var(--primary)] hover:underline"
            >
              {showPrivacy ? '접기 ▲' : '개인정보 처리방침 보기 ▼'}
            </button>

            {showPrivacy && (
              <div className="mt-3 border-l-4 border-l-[var(--primary)] bg-[var(--bg-main)] p-4 text-xs leading-relaxed text-[var(--text-sub)]">
                <p className="font-bold mb-2">개인정보 수집·이용 동의서 ({role === 'teacher' ? '교사' : '학생'}용)</p>
                <p className="mb-2">1. <strong>수집 항목</strong></p>
                <ul className="mb-2 ml-4 list-disc">
                  {config.privacyItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className="mb-2">2. <strong>수집 목적</strong>: {role === 'teacher'
                  ? '학생 읽기 유창성 데이터 열람 및 학습 관리'
                  : '읽기 유창성 학습 서비스 제공, 학습 진도 관리, 맞춤형 피드백 제공'
                }</p>
                <p className="mb-2">3. <strong>보유 기간</strong>: 회원 탈퇴 시까지 (탈퇴 후 즉시 파기)</p>
                <p className="mb-2">4. <strong>저장 위치</strong>: 사용자 브라우저 로컬 스토리지 (서버 전송 없음)</p>
                <p>5. 동의를 거부할 권리가 있으며, 거부 시 서비스 이용이 제한됩니다.</p>
              </div>
            )}
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
            가입하기
          </button>

          <p className="text-center text-sm text-[var(--text-light)]">
            이미 계정이 있나요?{' '}
            <Link to={config.loginPath} className="font-bold text-[var(--primary)] hover:underline">로그인</Link>
          </p>

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
