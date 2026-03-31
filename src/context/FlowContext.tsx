import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { FlowDraft, GoalType, PlayerData, ReadingAnalysis, SelfAssessmentData } from '../types'
import {
  appendSession,
  clearDraft,
  defaultDraft,
  readDraft,
  readPlayerData,
  writeDraft,
  writePlayerData,
} from '../utils/storage'
import { getLevel, getStarsForAccuracy } from '../data/constants'
import { reclassifyMapping } from '../utils/basa'

interface FlowContextValue {
  draft: FlowDraft
  player: PlayerData
  setPassage: (passageId: string) => void
  setGoal: (goalType: GoalType, confidence: number) => void
  setTranscript: (transcript: string) => void
  markReadingWindow: (startedAt: number | null, endedAt: number | null) => void
  setAnalysis: (analysis: ReadingAnalysis) => void
  setSelfAssessment: (assessment: SelfAssessmentData) => void
  applyReclassify: (mappingIndex: number, type: 'substitution' | 'omission' | 'addition' | 'repetition' | 'selfCorrection') => void
  commitSession: () => { stars: number; nextLevel: number } | null
  resetDraft: () => void
}

const FlowContext = createContext<FlowContextValue | null>(null)

export function FlowProvider({ children }: { children: React.ReactNode }) {
  // 동기적 초기화: storage에서 바로 읽어 레이스 컨디션 방지
  const [draft, setDraft] = useState<FlowDraft>(() => readDraft())
  const [player, setPlayer] = useState<PlayerData>(() => readPlayerData())

  // commitSession에서 최신 draft/player를 참조하기 위한 ref
  const draftRef = useRef(draft)
  draftRef.current = draft
  const playerRef = useRef(player)
  playerRef.current = player

  // draft가 변경될 때만 storage에 저장
  useEffect(() => {
    writeDraft(draft)
  }, [draft])

  useEffect(() => {
    writePlayerData(player)
  }, [player])

  // 안정적인 함수 참조 — draft/player가 바뀌어도 함수 참조는 유지
  const setPassage = useCallback(
    (passageId: string) => setDraft((current) => ({ ...current, passageId })),
    [],
  )
  const setGoal = useCallback(
    (goalType: GoalType, confidence: number) => setDraft((current) => ({ ...current, goalType, confidence })),
    [],
  )
  const setTranscript = useCallback(
    (transcript: string) => setDraft((current) => {
      if (current.transcript === transcript) return current
      return { ...current, transcript }
    }),
    [],
  )
  const markReadingWindow = useCallback(
    (readingStartedAt: number | null, readingEndedAt: number | null) =>
      setDraft((current) => ({ ...current, readingStartedAt, readingEndedAt })),
    [],
  )
  const setAnalysis = useCallback(
    (analysis: ReadingAnalysis) => setDraft((current) => ({ ...current, analysis })),
    [],
  )
  const setSelfAssessment = useCallback(
    (selfAssessment: SelfAssessmentData) => setDraft((current) => ({ ...current, selfAssessment })),
    [],
  )
  const applyReclassify = useCallback(
    (mappingIndex: number, type: 'substitution' | 'omission' | 'addition' | 'repetition' | 'selfCorrection') =>
      setDraft((current) => {
        if (!current.analysis) return current
        return { ...current, analysis: reclassifyMapping(current.analysis, mappingIndex, type) }
      }),
    [],
  )
  const commitSession = useCallback(() => {
    const d = draftRef.current
    const p = playerRef.current
    if (!d.passageId || !d.goalType || !d.analysis || !d.selfAssessment) {
      return null
    }

    const stars = getStarsForAccuracy(d.analysis.accuracy)
    const nextLevel = getLevel(p.totalSessions + 1, p.totalStars + stars)

    const nextPlayer = appendSession(
      p,
      {
        passageId: d.passageId,
        goalType: d.goalType,
        confidence: d.confidence,
        analysis: d.analysis,
        selfAssessment: d.selfAssessment,
        timestamp: Date.now(),
      },
      stars,
      nextLevel,
    )

    setPlayer(nextPlayer)
    setDraft(defaultDraft)
    clearDraft()
    return { stars, nextLevel }
  }, [])
  const resetDraft = useCallback(() => {
    setDraft(defaultDraft)
    clearDraft()
  }, [])

  const value = useMemo<FlowContextValue>(
    () => ({
      draft,
      player,
      setPassage,
      setGoal,
      setTranscript,
      markReadingWindow,
      setAnalysis,
      setSelfAssessment,
      applyReclassify,
      commitSession,
      resetDraft,
    }),
    [draft, player, setPassage, setGoal, setTranscript, markReadingWindow, setAnalysis, setSelfAssessment, applyReclassify, commitSession, resetDraft],
  )

  return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>
}

export function useFlow() {
  const context = useContext(FlowContext)
  if (!context) {
    throw new Error('useFlow must be used inside FlowProvider')
  }
  return context
}
