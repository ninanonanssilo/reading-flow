import { Link, useLocation } from 'react-router-dom'

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
  const currentIndex = steps.findIndex((s) => s.path === location.pathname)

  return (
    <main className="min-h-screen bg-[#FFF9F0]">
      {/* 배경 장식 */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-orange-100/50 blur-3xl" />
        <div className="absolute top-1/3 -left-20 h-48 w-48 rounded-full bg-yellow-100/60 blur-3xl" />
        <div className="absolute bottom-20 right-1/4 h-40 w-40 rounded-full bg-green-100/40 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 py-5 md:px-8">
        {/* 헤더 */}
        <header className="mb-6 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-base font-extrabold text-orange-600 shadow-md transition hover:scale-105 hover:shadow-lg"
          >
            <span className="text-2xl animate-float">🚀</span>
            리딩플로우
          </Link>
          <Link
            to="/teacher"
            className="rounded-full bg-white px-4 py-2 text-sm font-bold text-amber-700 shadow-sm transition hover:scale-105"
          >
            👩‍🏫 교사용
          </Link>
        </header>

        {/* 진행 단계 - 행성 여행 */}
        <nav className="mb-8 flex items-center justify-center gap-0.5 overflow-x-auto rounded-full bg-white/80 px-4 py-3 shadow-sm scrollbar-none">
          {steps.map((step, i) => {
            const isCurrent = step.path === location.pathname
            const isPast = i < currentIndex
            const isClickable = isPast || isCurrent

            const node = (
              <div className="flex flex-col items-center gap-0.5" key={step.path}>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-lg transition-all ${
                    isCurrent
                      ? 'bg-orange-500 shadow-lg shadow-orange-200 scale-115 ring-4 ring-orange-100'
                      : isPast
                        ? 'bg-green-100'
                        : 'bg-gray-100'
                  }`}
                >
                  {isPast ? '✅' : step.emoji}
                </div>
                <span
                  className={`text-[10px] font-bold whitespace-nowrap ${
                    isCurrent ? 'text-orange-600' : isPast ? 'text-green-600' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            )

            return (
              <div key={step.path} className="flex items-center gap-0.5">
                {i > 0 && (
                  <div
                    className={`h-1 w-3 rounded-full md:w-5 ${
                      isPast ? 'bg-green-300' : isCurrent ? 'bg-orange-200' : 'bg-gray-200'
                    }`}
                  />
                )}
                {isClickable ? (
                  <Link to={step.path} className="transition hover:scale-110">
                    {node}
                  </Link>
                ) : (
                  <div className="opacity-50">{node}</div>
                )}
              </div>
            )
          })}
        </nav>

        {/* 페이지 타이틀 */}
        <div className="mb-6 rounded-3xl bg-white px-6 py-5 shadow-sm">
          <h1 className="text-2xl font-extrabold text-amber-900 md:text-3xl">{title}</h1>
          <p className="mt-1.5 text-sm leading-relaxed text-amber-700/70">{subtitle}</p>
        </div>

        {/* 본문 */}
        <div className="pb-10">{children}</div>
      </div>
    </main>
  )
}
