import { describe, it, expect } from 'vitest'
import { applyReclassifications, calculateCohensKappa } from './reclassification'
import type { ReadingAnalysis, WordMapping } from '../types'

function makeMappings(): WordMapping[] {
  return [
    { original: '나비가', recognized: '나비가', type: 'correct', syllables: 3 },
    { original: '꽃', recognized: '풀', type: 'substitution', syllables: 1 },
    { original: '위에', recognized: '위에', type: 'correct', syllables: 2 },
    { original: '앉았다', recognized: '', type: 'omission', syllables: 3 },
  ]
}

function makeAnalysis(): ReadingAnalysis {
  const mappings = makeMappings()
  return {
    original: '나비가 꽃 위에 앉았다',
    recognized: '나비가 풀 위에',
    originalWords: ['나비가', '꽃', '위에', '앉았다'],
    recognizedWords: ['나비가', '풀', '위에'],
    errors: {
      correct: ['나비가', '위에'],
      substitution: ['꽃'],
      omission: ['앉았다'],
      addition: [], repetition: [], selfCorrection: [],
      correctSyllables: 5,
      mapping: mappings,
    },
    totalSyllables: 9,
    correctSyllables: 5,
    accuracy: 55.6,
    readingTime: 10,
    cwpm: 33.3,
    totalErrors: 2,
    errorRate: 44.4,
    errorCounts: { substitution: 1, omission: 1, addition: 0, repetition: 0, selfCorrection: 0 },
  }
}

describe('applyReclassifications', () => {
  it('should recalculate accuracy when reclassifying substitution to correct', () => {
    const analysis = makeAnalysis()
    const result = applyReclassifications(analysis, [{
      wordIndex: 1,
      originalType: 'substitution',
      reclassifiedType: 'correct',
      reclassifiedBy: 'teacher1',
      reclassifiedAt: Date.now(),
    }])

    expect(result.adjustedAccuracy).toBeGreaterThan(analysis.accuracy)
    expect(result.adjustedErrorCounts.substitution).toBe(0)
    expect(result.originalAnalysis).toBe(analysis)
  })

  it('should preserve original analysis', () => {
    const analysis = makeAnalysis()
    const originalAccuracy = analysis.accuracy
    applyReclassifications(analysis, [{
      wordIndex: 1,
      originalType: 'substitution',
      reclassifiedType: 'correct',
      reclassifiedBy: 'teacher1',
      reclassifiedAt: Date.now(),
    }])

    expect(analysis.accuracy).toBe(originalAccuracy)
  })

  it('should use latest reclassification for same word', () => {
    const analysis = makeAnalysis()
    const result = applyReclassifications(analysis, [
      { wordIndex: 1, originalType: 'substitution', reclassifiedType: 'omission', reclassifiedBy: 't1', reclassifiedAt: 1000 },
      { wordIndex: 1, originalType: 'substitution', reclassifiedType: 'correct', reclassifiedBy: 't1', reclassifiedAt: 2000 },
    ])

    expect(result.adjustedWordMappings[1].type).toBe('correct')
  })

  it('should handle empty reclassifications', () => {
    const analysis = makeAnalysis()
    const result = applyReclassifications(analysis, [])
    expect(result.adjustedAccuracy).toBe(analysis.accuracy)
  })
})

describe('calculateCohensKappa', () => {
  it('should return 1.0 for no reclassifications (perfect agreement)', () => {
    const { kappa, agreement } = calculateCohensKappa([], 10)
    expect(kappa).toBe(1.0)
    expect(agreement).toBe(1.0)
  })

  it('should return lower kappa for many reclassifications', () => {
    const recls = [
      { wordIndex: 0, originalType: 'correct' as const, reclassifiedType: 'substitution' as const, reclassifiedBy: 't', reclassifiedAt: 1 },
      { wordIndex: 1, originalType: 'substitution' as const, reclassifiedType: 'correct' as const, reclassifiedBy: 't', reclassifiedAt: 1 },
      { wordIndex: 2, originalType: 'omission' as const, reclassifiedType: 'correct' as const, reclassifiedBy: 't', reclassifiedAt: 1 },
    ]
    const { kappa, agreement } = calculateCohensKappa(recls, 10)
    expect(kappa).toBeLessThan(1.0)
    expect(agreement).toBe(0.7)
  })

  it('should track reclassification patterns in details', () => {
    const recls = [
      { wordIndex: 0, originalType: 'substitution' as const, reclassifiedType: 'correct' as const, reclassifiedBy: 't', reclassifiedAt: 1 },
      { wordIndex: 1, originalType: 'substitution' as const, reclassifiedType: 'correct' as const, reclassifiedBy: 't', reclassifiedAt: 1 },
    ]
    const { details } = calculateCohensKappa(recls, 10)
    expect(details['substitution -> correct']).toBe(2)
  })
})
