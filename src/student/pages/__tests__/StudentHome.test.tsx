import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

// Mock contexts
vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '1', username: 'test', role: 'student' },
    isLoggedIn: true,
    logout: vi.fn(),
  }),
}))

vi.mock('../../../context/FlowContext', () => ({
  useFlow: () => ({
    player: {
      name: '테스트학생',
      totalSessions: 5,
      totalStars: 10,
      level: 2,
      sessions: [],
      badges: [],
    },
    setName: vi.fn(),
  }),
}))

vi.mock('../../../utils/privacy', () => ({
  hasValidConsent: () => true,
}))

// Import after mocks
import WelcomeScreen from '../WelcomeScreen'

function renderHome() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <WelcomeScreen />
    </MemoryRouter>,
  )
}

describe('StudentHome (WelcomeScreen with tabs)', () => {
  it('renders tab navigation', () => {
    renderHome()
    expect(screen.getByRole('tablist')).toBeInTheDocument()
  })

  it('renders guide and program tabs', () => {
    renderHome()
    expect(screen.getByRole('tab', { name: /사이트 안내/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /프로그램/ })).toBeInTheDocument()
  })

  it('defaults to program tab', () => {
    renderHome()
    const programTab = screen.getByRole('tab', { name: /프로그램/ })
    expect(programTab).toHaveAttribute('aria-selected', 'true')
  })

  it('switches to guide content on tab click', async () => {
    const user = userEvent.setup()
    renderHome()

    await user.click(screen.getByRole('tab', { name: /사이트 안내/ }))

    const guideTab = screen.getByRole('tab', { name: /사이트 안내/ })
    expect(guideTab).toHaveAttribute('aria-selected', 'true')
  })

  it('keeps header regardless of tab switch', async () => {
    const user = userEvent.setup()
    renderHome()

    expect(screen.getByText('읽기 우주탐험대')).toBeInTheDocument()
    expect(screen.getByText('로그아웃')).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: /사이트 안내/ }))

    expect(screen.getByText('읽기 우주탐험대')).toBeInTheDocument()
    expect(screen.getByText('로그아웃')).toBeInTheDocument()
  })
})
