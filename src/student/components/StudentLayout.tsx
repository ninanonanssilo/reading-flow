import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const steps = [
  { path: '/', label: '홈', emoji: '🏠' },
  { path: '/passage', label: '지문', emoji: '📖' },
  { path: '/goal', label: '목표', emoji: '🎯' },
  { path: '/reading', label: '읽기', emoji: '🎤' },
  { path: '/assess', label: '평가', emoji: '⭐' },
  { path: '/results', label: '결과', emoji: '📊' },
  { path: '/complete', label: '완료', emoji: '🏆' },
]

export default function StudentLayout({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode
  title: string
  subtitle: string
  step?: string
}) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const currentIndex = steps.findIndex((s) => s.path === location.pathname)

  const handleLogout = () => {
    logout()
    navigate('/welcome')
  }

  return (
    <main className="min-h-screen bg-[var(--bg-main)]">
      <div className="mx-auto max-w-5xl px-4 py-5 md:px-8">
        {/* 헤더 */}
        <header className="mb-5 flex items-center justify-between">
          {/* 좌측: 홈 */}
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="flex items-center gap-2 border border-[var(--border)] bg-white px-5 py-2 text-base font-extrabold text-[var(--primary)] shadow-sm transition hover:shadow-md"
            >
              <span className="text-lg">🧑‍🚀</span>
              리딩플로우
            </Link>
          </div>

          {/* 우측: 회원 정보 */}
          <div className="flex items-center gap-2">
            {user && (
              <span className="text-sm font-bold text-[var(--text-sub)]">
                {user.username}
              </span>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="border border-[var(--border)] bg-white px-4 py-2 text-sm font-bold text-[var(--text-light)] shadow-sm transition hover:text-red-500 hover:shadow-md"
            >
              로그아웃
            </button>
          </div>
        </header>

        {/* 진행 단계 */}
        <nav className="mb-6 flex items-center justify-center gap-0 overflow-x-auto bg-white border border-[var(--border)] shadow-sm scrollbar-none">
          {steps.map((step, i) => {
            const isCurrent = step.path === location.pathname
            const isPast = i < currentIndex
            const isClickable = isPast || isCurrent

            const node = (
              <div className="flex flex-col items-center gap-1 px-3 py-3 md:px-5" key={step.path}>
                <div
                  className={`flex h-9 w-9 items-center justify-center text-base transition-all ${
                    isCurrent
                      ? 'bg-[var(--primary)] text-white shadow-md'
                      : isPast
                        ? 'bg-[var(--secondary-light)] text-[var(--secondary)]'
                        : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {isPast ? '✓' : step.emoji}
                </div>
                <span
                  className={`text-[10px] font-bold whitespace-nowrap ${
                    isCurrent ? 'text-[var(--primary)]' : isPast ? 'text-[var(--secondary)]' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            )

            return (
              <div key={step.path} className="flex items-center">
                {i > 0 && (
                  <div
                    className={`h-0.5 w-4 md:w-6 ${
                      isPast ? 'bg-[var(--secondary)]' : isCurrent ? 'bg-[var(--primary-light)]' : 'bg-gray-200'
                    }`}
                  />
                )}
                {isClickable ? (
                  <Link to={step.path} className="transition hover:opacity-80">
                    {node}
                  </Link>
                ) : (
                  <div className="opacity-40">{node}</div>
                )}
              </div>
            )
          })}
        </nav>

        {/* 페이지 타이틀 */}
        <div className="mb-6 border-l-4 border-[var(--primary)] bg-white px-6 py-5 shadow-sm">
          <h1 className="text-2xl font-extrabold text-[var(--text-main)] md:text-3xl">{title}</h1>
          <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-light)]">{subtitle}</p>
        </div>

        {/* 본문 */}
        <div className="pb-10">{children}</div>
      </div>
    </main>
  )
}
