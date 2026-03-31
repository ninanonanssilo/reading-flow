import { countSyllables } from './syllables'

export function calculateCwpm(correctText: string[], readingTimeSeconds: number): number {
  const safeSeconds = Math.max(readingTimeSeconds, 1)
  const correctSyllables = correctText.reduce((sum, word) => sum + countSyllables(word), 0)
  return Math.round((correctSyllables / safeSeconds) * 60)
}

export function calculateAccuracy(correctSyllables: number, totalSyllables: number): number {
  if (!totalSyllables) {
    return 0
  }

  return Number(((correctSyllables / totalSyllables) * 100).toFixed(1))
}

export function calculateErrorRate(correctSyllables: number, totalSyllables: number): number {
  if (!totalSyllables) {
    return 0
  }

  return Number((((totalSyllables - correctSyllables) / totalSyllables) * 100).toFixed(1))
}
