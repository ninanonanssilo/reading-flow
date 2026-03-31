import type { BadgeDef, GoalOption, LevelDef } from '../types'

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

export const badges: BadgeDef[] = [
  {
    id: 'first-read',
    name: '첫 발걸음',
    icon: '👣',
    description: '첫 번째 읽기를 완료했어요!',
    check: (p) => p.totalSessions >= 1,
  },
  {
    id: 'accuracy-90',
    name: '또박또박 읽기왕',
    icon: '🎯',
    description: '정확도 90% 이상 달성!',
    check: (_p, s) => (s?.analysis.accuracy ?? 0) >= 90,
  },
  {
    id: 'perfect-read',
    name: '완벽한 읽기',
    icon: '💎',
    description: '정확도 100%를 달성했어요!',
    check: (_p, s) => (s?.analysis.accuracy ?? 0) >= 100,
  },
  {
    id: 'speed-star',
    name: '빠른 별똥별',
    icon: '💨',
    description: 'CWPM 80 이상 달성!',
    check: (_p, s) => (s?.analysis.cwpm ?? 0) >= 80,
  },
  {
    id: 'sessions-5',
    name: '꾸준한 탐험가',
    icon: '🏕️',
    description: '읽기 5회 달성!',
    check: (p) => p.totalSessions >= 5,
  },
  {
    id: 'sessions-10',
    name: '읽기 달인',
    icon: '🏆',
    description: '읽기 10회 달성!',
    check: (p) => p.totalSessions >= 10,
  },
  {
    id: 'stars-10',
    name: '별 수집가',
    icon: '🌟',
    description: '별 10개 모으기!',
    check: (p) => p.totalStars >= 10,
  },
  {
    id: 'stars-30',
    name: '은하수 여행자',
    icon: '🌌',
    description: '별 30개 모으기!',
    check: (p) => p.totalStars >= 30,
  },
  {
    id: 'three-stars',
    name: '만점 스타',
    icon: '⭐',
    description: '별 3개를 획득했어요!',
    check: (_p, s) => (s?.analysis.accuracy ?? 0) >= 85,
  },
  {
    id: 'level-3',
    name: '토성 도착',
    icon: '🪐',
    description: '레벨 3에 도달했어요!',
    check: (p) => p.level >= 3,
  },
]
