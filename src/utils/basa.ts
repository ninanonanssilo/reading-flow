import type { ErrorCounts, ErrorType, ReadingAnalysis, WordMapping } from '../types'
import { calculateAccuracy, calculateCwpm, calculateErrorRate } from './cwpm'
import { countSyllables, splitWords } from './syllables'

type Token = { word: string; index: number }

export function isSimilar(word1: string, word2: string): boolean {
  if (!word1 || !word2) {
    return false
  }

  const a = [...word1]
  const b = [...word2]
  const longer = Math.max(a.length, b.length)
  if (!longer) {
    return false
  }

  let matches = 0
  const shortest = Math.min(a.length, b.length)
  for (let index = 0; index < shortest; index += 1) {
    if (a[index] === b[index]) {
      matches += 1
    }
  }

  return matches / longer >= 0.3
}

function detectRepetitions(tokens: Token[]) {
  const repetition: string[] = []
  const cleaned: Token[] = []

  for (let index = 0; index < tokens.length; index += 1) {
    const current = tokens[index]
    const previous = cleaned[cleaned.length - 1]

    if (previous && previous.word === current.word) {
      repetition.push(current.word)
      continue
    }

    cleaned.push(current)
  }

  return { repetition, cleaned }
}

function detectSelfCorrections(originalWords: string[], tokens: Token[]) {
  const selfCorrection: string[] = []
  const cleaned: Token[] = []

  for (let index = 0; index < tokens.length; index += 1) {
    const current = tokens[index]
    const next = tokens[index + 1]
    const target = originalWords.find((word) => word === next?.word)

    if (next && target && current.word !== next.word && isSimilar(current.word, next.word)) {
      selfCorrection.push(`${current.word}→${next.word}`)
      continue
    }

    cleaned.push(current)
  }

  return { selfCorrection, cleaned }
}

function longestCommonSubsequence(originalWords: string[], recognizedWords: string[]) {
  const table = Array.from({ length: originalWords.length + 1 }, () =>
    Array(recognizedWords.length + 1).fill(0),
  )

  for (let i = 1; i <= originalWords.length; i += 1) {
    for (let j = 1; j <= recognizedWords.length; j += 1) {
      if (originalWords[i - 1] === recognizedWords[j - 1]) {
        table[i][j] = table[i - 1][j - 1] + 1
      } else {
        table[i][j] = Math.max(table[i - 1][j], table[i][j - 1])
      }
    }
  }

  const matched = new Set<string>()
  let i = originalWords.length
  let j = recognizedWords.length

  while (i > 0 && j > 0) {
    if (originalWords[i - 1] === recognizedWords[j - 1]) {
      matched.add(`${i - 1}:${j - 1}`)
      i -= 1
      j -= 1
    } else if (table[i - 1][j] >= table[i][j - 1]) {
      i -= 1
    } else {
      j -= 1
    }
  }

  return matched
}

export function detectErrors(original: string, recognized: string) {
  const originalWords = splitWords(original)
  const initialTokens = splitWords(recognized).map((word, index) => ({ word, index }))

  const stage1 = detectRepetitions(initialTokens)
  const stage2 = detectSelfCorrections(originalWords, stage1.cleaned)
  const recognizedWords = stage2.cleaned.map((token) => token.word)
  const lcsMatches = longestCommonSubsequence(originalWords, recognizedWords)

  const mapping: WordMapping[] = []
  const correct: string[] = []
  const substitution: string[] = []
  const omission: string[] = []
  const addition: string[] = []

  let recognizedIndex = 0

  for (let originalIndex = 0; originalIndex < originalWords.length; originalIndex += 1) {
    const originalWord = originalWords[originalIndex]
    const recognizedWord = recognizedWords[recognizedIndex]
    const syllables = countSyllables(originalWord)

    if (lcsMatches.has(`${originalIndex}:${recognizedIndex}`)) {
      correct.push(originalWord)
      mapping.push({
        original: originalWord,
        recognized: recognizedWord,
        type: 'correct',
        syllables,
      })
      recognizedIndex += 1
      continue
    }

    if (recognizedWord && isSimilar(originalWord, recognizedWord)) {
      substitution.push(`${originalWord}→${recognizedWord}`)
      mapping.push({
        original: originalWord,
        recognized: recognizedWord,
        type: 'substitution',
        syllables,
      })
      recognizedIndex += 1
      continue
    }

    omission.push(originalWord)
    mapping.push({
      original: originalWord,
      recognized: '',
      type: 'omission',
      syllables,
    })
  }

  while (recognizedIndex < recognizedWords.length) {
    addition.push(recognizedWords[recognizedIndex])
    recognizedIndex += 1
  }

  const correctSyllables = correct.reduce((sum, word) => sum + countSyllables(word), 0)

  return {
    correct,
    substitution,
    omission,
    addition,
    repetition: stage1.repetition,
    selfCorrection: stage2.selfCorrection,
    correctSyllables,
    mapping,
  }
}

export function analyzeReading(
  original: string,
  recognized: string,
  readingTimeSeconds: number,
): ReadingAnalysis {
  const errors = detectErrors(original, recognized)
  const totalSyllables = countSyllables(original)
  const correctSyllables = errors.correctSyllables
  const errorCounts: ErrorCounts = {
    substitution: errors.substitution.length,
    omission: errors.omission.length,
    addition: errors.addition.length,
    repetition: errors.repetition.length,
    selfCorrection: errors.selfCorrection.length,
  }

  return {
    original,
    recognized,
    originalWords: splitWords(original),
    recognizedWords: splitWords(recognized),
    errors,
    totalSyllables,
    correctSyllables,
    accuracy: calculateAccuracy(correctSyllables, totalSyllables),
    readingTime: Number(readingTimeSeconds.toFixed(1)),
    cwpm: calculateCwpm(errors.correct, readingTimeSeconds),
    totalErrors: Object.values(errorCounts).reduce((sum, count) => sum + count, 0),
    errorRate: calculateErrorRate(correctSyllables, totalSyllables),
    errorCounts,
  }
}

export function reclassifyMapping(
  analysis: ReadingAnalysis,
  mappingIndex: number,
  newType: Exclude<ErrorType, 'correct'>,
): ReadingAnalysis {
  const nextMapping = analysis.errors.mapping.map((item, index) =>
    index === mappingIndex ? { ...item, type: newType } : item,
  )

  const grouped = nextMapping.reduce<ReadingAnalysis['errors']>(
    (acc, item) => {
      if (item.type === 'correct') {
        acc.correct.push(item.original)
      }
      if (item.type === 'substitution') {
        acc.substitution.push(`${item.original}→${item.recognized}`)
      }
      if (item.type === 'omission') {
        acc.omission.push(item.original)
      }
      if (item.type === 'addition') {
        acc.addition.push(item.recognized || item.original)
      }
      if (item.type === 'repetition') {
        acc.repetition.push(item.recognized || item.original)
      }
      if (item.type === 'selfCorrection') {
        acc.selfCorrection.push(`${item.original}→${item.recognized}`)
      }
      return acc
    },
    {
      correct: [],
      substitution: [],
      omission: [],
      addition: [],
      repetition: [],
      selfCorrection: [],
      correctSyllables: 0,
      mapping: nextMapping,
    },
  )

  grouped.correctSyllables = grouped.correct.reduce((sum, word) => sum + countSyllables(word), 0)

  const next = {
    ...analysis,
    errors: grouped,
    correctSyllables: grouped.correctSyllables,
    accuracy: calculateAccuracy(grouped.correctSyllables, analysis.totalSyllables),
    cwpm: calculateCwpm(grouped.correct, analysis.readingTime),
    errorCounts: {
      substitution: grouped.substitution.length,
      omission: grouped.omission.length,
      addition: grouped.addition.length,
      repetition: grouped.repetition.length,
      selfCorrection: grouped.selfCorrection.length,
    },
  }

  return {
    ...next,
    totalErrors: Object.values(next.errorCounts).reduce((sum, count) => sum + count, 0),
    errorRate: calculateErrorRate(next.correctSyllables, next.totalSyllables),
  }
}
