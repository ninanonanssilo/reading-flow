import type { GoalOption, LevelDef } from '../types'

export const goalOptions: GoalOption[] = [
  {
    type: 'accuracy',
    label: '정확하게 읽기',
    description: '소리를 놓치지 않고 또박또박 읽는 데 집중해요.',
    icon: '🎯',
  },
  {
    type: 'speed',
    label: '빠르게 읽기',
    description: '멈춤을 줄이고 리듬감 있게 읽어 봐요.',
    icon: '🚀',
  },
  {
    type: 'reduction',
    label: '틀린 부분 줄이기',
    description: '헷갈리는 어절을 다시 보고 오류를 줄여 봐요.',
    icon: '🛠️',
  },
]

export const levels: LevelDef[] = [
  { level: 1, name: '달 기지', icon: '🌙', requiredSessions: 0, requiredStars: 0 },
  { level: 2, name: '화성 탐험', icon: '🪐', requiredSessions: 3, requiredStars: 5 },
  { level: 3, name: '토성 고리', icon: '💫', requiredSessions: 7, requiredStars: 15 },
  { level: 4, name: '은하 여행', icon: '🌌', requiredSessions: 12, requiredStars: 30 },
  { level: 5, name: '별자리 마스터', icon: '⭐', requiredSessions: 20, requiredStars: 50 },
]

export function getStarsForAccuracy(accuracy: number) {
  if (accuracy >= 85) {
    return 3
  }
  if (accuracy >= 60) {
    return 2
  }
  return 1
}

export function getLevel(totalSessions: number, totalStars: number) {
  return [...levels]
    .reverse()
    .find((item) => totalSessions >= item.requiredSessions && totalStars >= item.requiredStars)
    ?.level ?? 1
}
