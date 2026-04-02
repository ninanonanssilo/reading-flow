import type { TabDefinition } from './tabRegistry'

interface TabNavigationProps {
  tabs: TabDefinition[]
  activeTabId: string
  onTabChange: (tabId: string) => void
}

export default function TabNavigation({ tabs, activeTabId, onTabChange }: TabNavigationProps) {
  return (
    <nav
      role="tablist"
      className="mx-auto flex max-w-4xl overflow-x-auto border-b border-[var(--border)] bg-white px-6 scrollbar-none"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId
        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold transition ${
              isActive
                ? 'border-b-2 border-[var(--primary)] bg-[var(--primary-light)] text-[var(--primary)]'
                : 'text-[var(--text-sub)] hover:bg-[var(--bg-main)] hover:text-[var(--primary)]'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
