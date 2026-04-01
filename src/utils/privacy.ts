export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const computed = await hashPassword(password)
  return computed === hash
}

export interface ConsentRecord {
  required_data: boolean
  audio_recording: boolean
  event_logging: boolean
  parentName: string
  parentRelation: string
  consentDate: string
  timestamp: number
  version: string
  studentConfirmedAt?: number
}

const CONSENT_KEY = 'reading-flow-consent'

export function getConsent(): ConsentRecord | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function hasValidConsent(): boolean {
  const consent = getConsent()
  return !!consent?.required_data && !!consent?.studentConfirmedAt
}

export function hasAudioConsent(): boolean {
  return getConsent()?.audio_recording === true
}

export function hasEventLogConsent(): boolean {
  return getConsent()?.event_logging === true
}

export function anonymizeStudentName(_name: string, index: number): string {
  return `S${String(index + 1).padStart(3, '0')}`
}

export function anonymizeSessionForExport(
  session: Record<string, unknown>,
  studentCode: string,
): Record<string, unknown> {
  return {
    studentCode,
    passageId: session.passageId,
    goalType: session.goalType,
    confidence: session.confidence,
    accuracy: session.accuracy ?? (session.analysis as Record<string, unknown>)?.accuracy,
    cwpm: session.cwpm ?? (session.analysis as Record<string, unknown>)?.cwpm,
    errorCounts: session.errorCounts ?? (session.analysis as Record<string, unknown>)?.errorCounts,
    selfRating: (session.selfAssessment as Record<string, unknown>)?.selfRating,
    feltDifficulty: (session.selfAssessment as Record<string, unknown>)?.feltDifficulty,
    screenDurations: session.screenDurations,
    srlDistribution: session.srlDistribution,
    sessionOrder: session._sessionOrder,
  }
}

export async function deleteAllStudentData(studentId: string): Promise<void> {
  localStorage.removeItem('reading-flow-player')
  localStorage.removeItem('reading-flow-draft')
  localStorage.removeItem('reading-flow-consent')
  localStorage.removeItem('reading-flow-session')
  sessionStorage.removeItem('reading-flow-draft')

  try {
    const req = indexedDB.open('reading-flow-audio', 1)
    req.onsuccess = () => {
      const db = req.result
      if (db.objectStoreNames.contains('audio')) {
        const tx = db.transaction('audio', 'readwrite')
        tx.objectStore('audio').clear()
      }
    }
  } catch { /* ignore */ }

  try {
    const { supabase, isOnlineMode } = await import('../lib/supabase')
    if (isOnlineMode && supabase) {
      await supabase.from('sessions').delete().eq('student_id', studentId)
      const { data: files } = await supabase.storage.from('reading-audio').list(studentId)
      if (files?.length) {
        await supabase.storage.from('reading-audio').remove(files.map((f) => `${studentId}/${f.name}`))
      }
      await supabase.from('students').delete().eq('id', studentId)
    }
  } catch { /* offline mode, local already cleared */ }
}
