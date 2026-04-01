import type { ErrorType, ReadingAnalysis, WordMapping, ErrorCounts } from '../types'

export interface Reclassification {
  wordIndex: number
  originalType: ErrorType
  reclassifiedType: ErrorType
  reclassifiedBy: string
  reclassifiedAt: number
  reason?: string
}

export interface ReclassifiedAnalysis {
  originalAnalysis: ReadingAnalysis
  reclassifications: Reclassification[]
  adjustedAccuracy: number
  adjustedCwpm: number
  adjustedErrorCounts: ErrorCounts
  adjustedWordMappings: WordMapping[]
}

export function applyReclassifications(
  original: ReadingAnalysis,
  reclassifications: Reclassification[],
): ReclassifiedAnalysis {
  const adjustedMappings: WordMapping[] = original.errors.mapping.map((m, idx) => {
    const reclass = reclassifications
      .filter((r) => r.wordIndex === idx)
      .sort((a, b) => b.reclassifiedAt - a.reclassifiedAt)[0]
    return reclass ? { ...m, type: reclass.reclassifiedType } : { ...m }
  })

  const adjustedErrorCounts: ErrorCounts = {
    substitution: 0, omission: 0, addition: 0, repetition: 0, selfCorrection: 0,
  }
  for (const m of adjustedMappings) {
    if (m.type !== 'correct' && m.type in adjustedErrorCounts) {
      adjustedErrorCounts[m.type as keyof ErrorCounts]++
    }
  }

  const correctSyllables = adjustedMappings
    .filter((m) => m.type === 'correct' || m.type === 'selfCorrection')
    .reduce((sum, m) => sum + m.syllables, 0)

  const adjustedAccuracy = original.totalSyllables > 0
    ? Math.round((correctSyllables / original.totalSyllables) * 1000) / 10
    : 0

  const adjustedCwpm = original.readingTime > 0
    ? Math.round((correctSyllables / (original.readingTime / 60)) * 10) / 10
    : 0

  return {
    originalAnalysis: original,
    reclassifications,
    adjustedAccuracy,
    adjustedCwpm,
    adjustedErrorCounts,
    adjustedWordMappings: adjustedMappings,
  }
}

export function calculateCohensKappa(
  reclassifications: Reclassification[],
  totalWords: number,
): { kappa: number; agreement: number; details: Record<string, number> } {
  if (reclassifications.length === 0 || totalWords === 0) {
    return { kappa: 1.0, agreement: 1.0, details: {} }
  }

  const agreed = totalWords - reclassifications.length
  const po = agreed / totalWords

  const types: ErrorType[] = ['correct', 'substitution', 'omission', 'addition', 'repetition', 'selfCorrection']
  const aiCounts: Record<string, number> = {}
  const teacherCounts: Record<string, number> = {}
  for (const t of types) { aiCounts[t] = 0; teacherCounts[t] = 0 }

  for (const r of reclassifications) {
    aiCounts[r.originalType] = (aiCounts[r.originalType] ?? 0) + 1
    teacherCounts[r.reclassifiedType] = (teacherCounts[r.reclassifiedType] ?? 0) + 1
  }

  let pe = 0
  for (const t of types) {
    pe += ((aiCounts[t] ?? 0) / totalWords) * ((teacherCounts[t] ?? 0) / totalWords)
  }

  const kappa = pe === 1 ? 1 : (po - pe) / (1 - pe)

  const details: Record<string, number> = {}
  for (const r of reclassifications) {
    const key = `${r.originalType} -> ${r.reclassifiedType}`
    details[key] = (details[key] ?? 0) + 1
  }

  return { kappa: Math.round(kappa * 1000) / 1000, agreement: Math.round(po * 1000) / 1000, details }
}
