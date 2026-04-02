import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import TabNavigation from '../TabNavigation'
import type { TabDefinition } from '../tabRegistry'

const mockTabs: TabDefinition[] = [
  { id: 'guide', label: '사이트 안내', icon: '📖', component: () => <div>안내</div> },
  { id: 'program', label: '프로그램', icon: '🧑‍🚀', component: () => <div>프로그램</div> },
]

describe('TabNavigation', () => {
  it('renders all tabs with label and icon', () => {
    render(<TabNavigation tabs={mockTabs} activeTabId="guide" onTabChange={() => {}} />)

    expect(screen.getByText(/사이트 안내/)).toBeInTheDocument()
    expect(screen.getByText(/프로그램/)).toBeInTheDocument()
    expect(screen.getByText('📖')).toBeInTheDocument()
    expect(screen.getByText('🧑‍🚀')).toBeInTheDocument()
  })

  it('marks active tab with aria-selected', () => {
    render(<TabNavigation tabs={mockTabs} activeTabId="program" onTabChange={() => {}} />)

    const programTab = screen.getByRole('tab', { name: /프로그램/ })
    const guideTab = screen.getByRole('tab', { name: /사이트 안내/ })

    expect(programTab).toHaveAttribute('aria-selected', 'true')
    expect(guideTab).toHaveAttribute('aria-selected', 'false')
  })

  it('calls onTabChange when tab is clicked', async () => {
    const onTabChange = vi.fn()
    const user = userEvent.setup()

    render(<TabNavigation tabs={mockTabs} activeTabId="guide" onTabChange={onTabChange} />)

    await user.click(screen.getByRole('tab', { name: /프로그램/ }))
    expect(onTabChange).toHaveBeenCalledWith('program')
  })

  it('renders tablist role on container', () => {
    render(<TabNavigation tabs={mockTabs} activeTabId="guide" onTabChange={() => {}} />)

    expect(screen.getByRole('tablist')).toBeInTheDocument()
  })

  it('renders tab role on each button', () => {
    render(<TabNavigation tabs={mockTabs} activeTabId="guide" onTabChange={() => {}} />)

    const tabs = screen.getAllByRole('tab')
    expect(tabs).toHaveLength(2)
  })
})
