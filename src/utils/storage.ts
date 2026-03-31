import type { FlowDraft, PlayerData, SessionData } from '../types'

const PLAYER_KEY = 'reading-flow-player'
const DRAFT_KEY = 'reading-flow-draft'

export const defaultPlayerData: PlayerData = {
  name: '우주 탐험가',
  totalSessions: 0,
  totalStars: 0,
  level: 1,
  sessions: [],
}

export const defaultDraft: FlowDraft = {
  passageId: null,
  goalType: null,
  confidence: 2,
  transcript: '',
  readingStartedAt: null,
  readingEndedAt: null,
  analysis: null,
  selfAssessment: null,
}

export function readPlayerData(): PlayerData {
  try {
    const raw = window.localStorage.getItem(PLAYER_KEY)
    return raw ? ({ ...defaultPlayerData, ...JSON.parse(raw) } as PlayerData) : defaultPlayerData
  } catch {
    return defaultPlayerData
  }
}

export function writePlayerData(data: PlayerData) {
  window.localStorage.setItem(PLAYER_KEY, JSON.stringify(data))
}

export function readDraft(): FlowDraft {
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY)
    return raw ? ({ ...defaultDraft, ...JSON.parse(raw) } as FlowDraft) : defaultDraft
  } catch {
    return defaultDraft
  }
}

export function writeDraft(data: FlowDraft) {
  window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(data))
}

export function clearDraft() {
  window.sessionStorage.removeItem(DRAFT_KEY)
}

export function appendSession(player: PlayerData, session: SessionData, earnedStars: number, level: number) {
  const next: PlayerData = {
    ...player,
    totalSessions: player.totalSessions + 1,
    totalStars: player.totalStars + earnedStars,
    level,
    sessions: [...player.sessions, session],
  }

  writePlayerData(next)
  return next
}
