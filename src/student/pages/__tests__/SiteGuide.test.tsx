import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import SiteGuide from '../SiteGuide'

function renderSiteGuide() {
  return render(
    <MemoryRouter>
      <SiteGuide />
    </MemoryRouter>,
  )
}

describe('SiteGuide', () => {
  it('renders the main heading', () => {
    renderSiteGuide()
    expect(screen.getByText('사이트 안내')).toBeInTheDocument()
  })

  it('renders program introduction section', () => {
    renderSiteGuide()
    expect(screen.getByText('읽기 우주탐험대란?')).toBeInTheDocument()
  })

  it('renders usage steps section', () => {
    renderSiteGuide()
    expect(screen.getByText(/사용 방법/)).toBeInTheDocument()
    expect(screen.getByText(/지문 선택/)).toBeInTheDocument()
  })

  it('renders key concepts section', () => {
    renderSiteGuide()
    expect(screen.getByText(/주요 개념/)).toBeInTheDocument()
    expect(screen.getByText(/CWPM/)).toBeInTheDocument()
    expect(screen.getByText(/BASA/)).toBeInTheDocument()
  })

  it('renders Lumi character section', () => {
    renderSiteGuide()
    expect(screen.getByText('루미 소개')).toBeInTheDocument()
  })
})
