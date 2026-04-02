import { describe, it, expect } from 'vitest'
import { determineHHAIRLevel, generateScaffold, getPreReadingScaffold, getDuringReadingScaffold, getMetacognitionFeedback } from './scaffold'
import type { SessionData } from '../types'

function makeSession(accuracy: number, selfRating: number = 3): SessionData {
  return {
    passageId: 'test',
    goalType: 'accuracy',
    confidence: 3,
    analysis: {
      original: '', recognized: '', originalWords: [], recognizedWords: [],
      errors: { correct: [], substitution: [], omission: [], addition: [], repetition: [], selfCorrection: [], correctSyllables: 0, mapping: [] },
      totalSyllables: 100, correctSyllables: accuracy, accuracy, readingTime: 60, cwpm: accuracy * 0.6,
      totalErrors: 100 - accuracy, errorRate: 100 - accuracy,
      errorCounts: { substitution: Math.floor((100 - accuracy) / 2), omission: Math.ceil((100 - accuracy) / 2), addition: 0, repetition: 0, selfCorrection: 0 },
    },
    selfAssessment: { selfRating, feltDifficulty: accuracy < 60 },
    timestamp: Date.now(),
  }
}

describe('determineHHAIRLevel', () => {
  it('should return ai-adjusted for low accuracy with < 3 sessions', () => {
    expect(determineHHAIRLevel([], 30)).toBe('ai-adjusted')
    expect(determineHHAIRLevel([makeSession(40)], 40)).toBe('ai-adjusted')
  })

  it('should return co-regulated for moderate accuracy with < 3 sessions', () => {
    expect(determineHHAIRLevel([], 85)).toBe('co-regulated')
  })

  it('should return ai-adjusted for low average accuracy with 3+ sessions', () => {
    const sessions = [makeSession(30), makeSession(35), makeSession(40)]
    expect(determineHHAIRLevel(sessions, 40)).toBe('ai-adjusted')
  })

  it('should return co-regulated for 50-64% accuracy', () => {
    const sessions = [makeSession(55), makeSession(58), makeSession(60)]
    expect(determineHHAIRLevel(sessions, 60)).toBe('co-regulated')
  })

  it('should return self-regulated for high accuracy + good metacognition', () => {
    const sessions = [makeSession(85, 4), makeSession(88, 4), makeSession(90, 5)]
    expect(determineHHAIRLevel(sessions, 90)).toBe('self-regulated')
  })
})

describe('generateScaffold', () => {
  it('should return directive scaffold for ai-adjusted level', () => {
    const analysis = makeSession(30).analysis
    const result = generateScaffold(analysis, 'accuracy', 2, [])
    expect(result.scaffoldType).toBe('directive')
    expect(result.hhairLevel).toBe('ai-adjusted')
    expect(result.message).toBeTruthy()
  })

  it('should return celebratory scaffold for high accuracy', () => {
    const sessions = [makeSession(85, 4), makeSession(88, 4), makeSession(92, 5)]
    const analysis = makeSession(95).analysis
    const result = generateScaffold(analysis, 'accuracy', 5, sessions)
    expect(result.scaffoldType).toBe('celebratory')
    expect(result.mood).toBe('cheering')
  })

  it('should include hint for directive scaffolds', () => {
    const analysis = makeSession(20).analysis
    const result = generateScaffold(analysis, 'accuracy', 1, [])
    expect(result.hint).toBeTruthy()
  })
})

describe('getPreReadingScaffold', () => {
  it('should return scaffold with message and mood', () => {
    const result = getPreReadingScaffold('accuracy', [])
    expect(result.message).toBeTruthy()
    expect(result.mood).toBeTruthy()
  })

  it('should give different messages for different goals', () => {
    const acc = getPreReadingScaffold('accuracy', [])
    const spd = getPreReadingScaffold('speed', [])
    expect(acc.message).not.toBe(spd.message)
  })
})

describe('getDuringReadingScaffold', () => {
  it('should return listening mood for all levels', () => {
    expect(getDuringReadingScaffold('ai-adjusted').mood).toBe('listening')
    expect(getDuringReadingScaffold('self-regulated').mood).toBe('listening')
  })
})

describe('getMetacognitionFeedback', () => {
  it('should celebrate exact match', () => {
    const result = getMetacognitionFeedback(0, 4, 4)
    expect(result.mood).toBe('cheering')
  })

  it('should note large gap', () => {
    const result = getMetacognitionFeedback(3, 5, 2)
    expect(result.mood).toBe('thinking')
  })
})
