import { lazy } from 'react'
import type { ComponentType } from 'react'

export interface TabDefinition {
  id: string
  label: string
  icon: string
  component: ComponentType
}

export const studentTabs: TabDefinition[] = [
  {
    id: 'guide',
    label: '사이트 안내',
    icon: '📖',
    component: lazy(() => import('../../pages/SiteGuide')),
  },
  {
    id: 'program',
    label: '프로그램',
    icon: '🧑‍🚀',
    component: lazy(() => import('./ProgramContent')),
  },
]
