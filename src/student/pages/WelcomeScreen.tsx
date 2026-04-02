import { hasValidConsent } from '../../utils/privacy'
import { Suspense, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useFlow } from '../../context/FlowContext'
import TabNavigation from '../components/tabs/TabNavigation'
import { studentTabs } from '../components/tabs/tabRegistry'

function Loading() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="mb-4 text-4xl animate-bounce">🧑‍🚀</div>
        <p className="text-[var(--text-light)]">로딩 중...</p>
      </div>
    </div>
  )
}

export default function WelcomeScreen() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { player } = useFlow()
  const [activeTab, setActiveTab] = useState('program')

  if (!player.name) {
    return <Navigate to="/nickname" replace />
  }

  if (!hasValidConsent()) {
    return <Navigate to="/consent" replace />
  }

  const ActiveComponent = studentTabs.find((t) => t.id === activeTab)?.component ?? studentTabs[1].component

  return (
    <main className="min-h-screen bg-[var(--bg-main)]">
      {/* 헤더 */}
      <header className="mx-auto flex max-w-4xl items-center justify-between px-6 pt-5">
        <Link
          to="/"
          className="flex items-center gap-2 border border-[var(--border)] bg-white px-5 py-2 text-base font-extrabold text-[var(--primary)] shadow-sm"
        >
          <span className="text-lg">🧑‍🚀</span> 리딩플로우
        </Link>
        <div className="flex items-center gap-2">
          {user && <span className="text-sm font-bold text-[var(--text-sub)]">{user.username}</span>}
          <button
            type="button"
            onClick={() => { logout(); navigate('/welcome') }}
            className="border border-[var(--border)] bg-white px-4 py-2 text-sm font-bold text-[var(--text-light)] shadow-sm transition hover:text-red-500 hover:shadow-md"
          >
            로그아웃
          </button>
        </div>
      </header>

      {/* 탭 네비게이션 */}
      <div className="mt-5">
        <TabNavigation tabs={studentTabs} activeTabId={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* 탭 콘텐츠 */}
      <Suspense fallback={<Loading />}>
        <ActiveComponent />
      </Suspense>
    </main>
  )
}
