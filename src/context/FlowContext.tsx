import { createContext, useContext, useEffect, useMemo, useState } from 'react'
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

  // draft가 변경될 때만 storage에 저장
  useEffect(() => {
    writeDraft(draft)
  }, [draft])

  useEffect(() => {
    writePlayerData(player)
  }, [player])

  const value = useMemo<FlowContextValue>(
    () => ({
      draft,
      player,
      setPassage: (passageId) => setDraft((current) => ({ ...current, passageId })),
      setGoal: (goalType, confidence) => setDraft((current) => ({ ...current, goalType, confidence })),
      setTranscript: (transcript) => setDraft((current) => ({ ...current, transcript })),
      markReadingWindow: (readingStartedAt, readingEndedAt) =>
        setDraft((current) => ({ ...current, readingStartedAt, readingEndedAt })),
      setAnalysis: (analysis) => setDraft((current) => ({ ...current, analysis })),
      setSelfAssessment: (selfAssessment) => setDraft((current) => ({ ...current, selfAssessment })),
      applyReclassify: (mappingIndex, type) =>
        setDraft((current) => {
          if (!current.analysis) {
            return current
          }
          return { ...current, analysis: reclassifyMapping(current.analysis, mappingIndex, type) }
        }),
      commitSession: () => {
        if (!draft.passageId || !draft.goalType || !draft.analysis || !draft.selfAssessment) {
          return null
        }

        const stars = getStarsForAccuracy(draft.analysis.accuracy)
        const nextLevel = getLevel(player.totalSessions + 1, player.totalStars + stars)

        const nextPlayer = appendSession(
          player,
          {
            passageId: draft.passageId,
            goalType: draft.goalType,
            confidence: draft.confidence,
            analysis: draft.analysis,
            selfAssessment: draft.selfAssessment,
            timestamp: Date.now(),
          },
          stars,
          nextLevel,
        )

        setPlayer(nextPlayer)
        setDraft(defaultDraft)
        clearDraft()
        return { stars, nextLevel }
      },
      resetDraft: () => {
        setDraft(defaultDraft)
        clearDraft()
      },
    }),
    [draft, player],
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
