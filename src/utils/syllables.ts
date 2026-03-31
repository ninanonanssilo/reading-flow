export function countSyllables(text: string): number {
  return [...text].filter((char) => /[가-힣]/.test(char)).length
}

export function splitWords(text: string): string[] {
  return text
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean)
}
