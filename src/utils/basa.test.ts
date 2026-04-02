import { describe, it, expect } from 'vitest'
import { analyzeReading, reclassifyMapping } from './basa'

describe('analyzeReading - BASA 5-type error detection', () => {
  it('should detect correct reading with 100% accuracy', () => {
    const original = '나비가 꽃 위에 앉았다'
    const recognized = '나비가 꽃 위에 앉았다'
    const result = analyzeReading(original, recognized, 10)

    expect(result.accuracy).toBe(100)
    expect(result.totalErrors).toBe(0)
    expect(result.errorCounts.substitution).toBe(0)
    expect(result.errorCounts.omission).toBe(0)
    expect(result.errorCounts.addition).toBe(0)
  })

  it('should detect substitution errors (대치)', () => {
    const original = '나비가 꽃 위에 앉았다'
    const recognized = '나비가 풀 위에 앉았다'
    const result = analyzeReading(original, recognized, 10)

    expect(result.totalErrors).toBeGreaterThanOrEqual(1)
    expect(result.accuracy).toBeLessThan(100)
  })

  it('should detect omission errors (생략)', () => {
    const original = '나비가 꽃 위에 앉았다'
    const recognized = '나비가 위에 앉았다'
    const result = analyzeReading(original, recognized, 10)

    expect(result.errorCounts.omission).toBeGreaterThanOrEqual(1)
  })

  it('should detect addition errors (첨가)', () => {
    const original = '나비가 꽃 위에 앉았다'
    const recognized = '나비가 예쁜 꽃 위에 앉았다'
    const result = analyzeReading(original, recognized, 10)

    expect(result.errorCounts.addition).toBeGreaterThanOrEqual(1)
  })

  it('should detect repetition errors (반복)', () => {
    const original = '나비가 꽃 위에 앉았다'
    const recognized = '나비가 나비가 꽃 위에 앉았다'
    const result = analyzeReading(original, recognized, 10)

    expect(result.errorCounts.repetition).toBeGreaterThanOrEqual(1)
  })

  it('should calculate CWPM correctly', () => {
    const original = '나비가 꽃 위에 앉았다'
    const recognized = '나비가 꽃 위에 앉았다'
    const result = analyzeReading(original, recognized, 60)

    expect(result.cwpm).toBeGreaterThan(0)
    expect(result.readingTime).toBe(60)
  })

  it('should handle empty recognized text', () => {
    const original = '나비가 꽃 위에 앉았다'
    const recognized = ''
    const result = analyzeReading(original, recognized, 10)

    expect(result.accuracy).toBe(0)
    expect(result.errorCounts.omission).toBe(original.split(/\s+/).length)
  })

  it('should return mapping array with correct structure', () => {
    const original = '나비가 꽃 위에 앉았다'
    const recognized = '나비가 꽃 위에 앉았다'
    const result = analyzeReading(original, recognized, 10)

    expect(result.errors.mapping).toBeInstanceOf(Array)
    expect(result.errors.mapping.length).toBeGreaterThan(0)
    result.errors.mapping.forEach((m) => {
      expect(m).toHaveProperty('original')
      expect(m).toHaveProperty('recognized')
      expect(m).toHaveProperty('type')
      expect(m).toHaveProperty('syllables')
    })
  })
})

describe('reclassifyMapping', () => {
  it('should change word type and recalculate accuracy', () => {
    const original = '나비가 꽃 위에 앉았다'
    const recognized = '나비가 풀 위에 앉았다'
    const analysis = analyzeReading(original, recognized, 10)

    const subIdx = analysis.errors.mapping.findIndex((m) => m.type === 'substitution')
    if (subIdx >= 0) {
      const reclassified = reclassifyMapping(analysis, subIdx, 'selfCorrection')
      expect(reclassified.accuracy).toBeGreaterThan(analysis.accuracy)
      expect(reclassified.errorCounts.substitution).toBeLessThan(analysis.errorCounts.substitution)
    }
  })
})
