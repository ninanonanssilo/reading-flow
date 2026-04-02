import { supabase, isOnlineMode } from './supabase'
import {
  readPlayerData,
  appendSession as localAppendSession,
} from '../utils/storage'
import type {
  PlayerData,
  SessionData,
  RegulationLevel,
  Classroom,
  ClassroomStudent,
  UserAccount,
} from '../types'

// ──────────────────────────────────────────
// 1. 학생 인증 (PIN 로그인)
// ──────────────────────────────────────────

export async function loginStudent(classroomId: string, pin: string): Promise<{
  success: boolean
  player?: PlayerData
  message?: string
}> {
  if (!isOnlineMode) {
    const localPlayer = readPlayerData()
    if (localPlayer.sessions && localPlayer.sessions.length > 0) {
      const { mockStudents } = await import('../data/mockStudents')
      return [{ id: 'local', name: localPlayer.name || 'Local Student', sessions: localPlayer.sessions, level: localPlayer.level, totalSessions: localPlayer.totalSessions, totalStars: localPlayer.totalStars, badges: localPlayer.badges, regulationLevel: 'ai-adjusted' }, ...mockStudents]
    }
    return { success: true, player: readPlayerData() }
  }

  const { data, error } = await supabase!
    .from('students')
    .select('*')
    .eq('classroom_id', classroomId)
    .eq('pin', pin)
    .single()

  if (error || !data) {
    return { success: false, message: 'PIN이 맞지 않아요. 다시 입력해주세요.' }
  }

  const row = data as Record<string, unknown>
  return {
    success: true,
    player: {
      name: row.name as string,
      totalSessions: row.total_sessions as number,
      totalStars: row.total_stars as number,
      level: row.level as number,
      badges: ((row.badges as unknown[]) ?? []).map((b) => ({
        id: typeof b === 'string' ? b : (b as Record<string, string>).id,
        earnedAt: 0,
      })),
      sessions: [],
      _supabaseId: row.id as string,
    },
  }
}

// ──────────────────────────────────────────
// 2. 세션 저장
// ──────────────────────────────────────────

interface SaveSessionParams {
  studentId: string
  session: SessionData
  earnedStars: number
  newLevel: number
  audioBlob?: Blob
}

export async function saveSession(params: SaveSessionParams): Promise<boolean> {
  if (!isOnlineMode) {
    const localPlayer = readPlayerData()
    if (localPlayer.sessions && localPlayer.sessions.length > 0) {
      const { mockStudents } = await import('../data/mockStudents')
      return [{ id: 'local', name: localPlayer.name || 'Local Student', sessions: localPlayer.sessions, level: localPlayer.level, totalSessions: localPlayer.totalSessions, totalStars: localPlayer.totalStars, badges: localPlayer.badges, regulationLevel: 'ai-adjusted' }, ...mockStudents]
    }
    const player = readPlayerData()
    localAppendSession(player, params.session, params.earnedStars, params.newLevel)
    return true
  }

  const { session, studentId, earnedStars, newLevel, audioBlob } = params

  let audioUrl: string | null = null
  if (audioBlob) {
    const fileName = `${studentId}/${Date.now()}.webm`
    const { error: uploadError } = await supabase!.storage
      .from('reading-audio')
      .upload(fileName, audioBlob, { contentType: 'audio/webm' })

    if (!uploadError) {
      const { data: urlData } = supabase!.storage
        .from('reading-audio')
        .getPublicUrl(fileName)
      audioUrl = urlData.publicUrl
    }
  }

  const insertData = {
    student_id: studentId,
    passage_id: session.passageId,
    goal_type: session.goalType,
    confidence: session.confidence,
    transcript: session.analysis?.original ?? '',
    accuracy: session.analysis.accuracy,
    cwpm: session.analysis.cwpm,
    error_counts: session.analysis.errorCounts as unknown as Record<string, number>,
    word_mappings: session.analysis.errors.mapping as unknown[],
    self_rating: session.selfAssessment?.selfRating ?? null,
    felt_difficulty: session.selfAssessment?.feltDifficulty ?? null,
    scaffold_data: session.scaffoldOutput ?? null,
    hhair_level: session.scaffoldOutput?.hhairLevel ?? 'ai-adjusted',
    reading_started_at: session.timestamp ? new Date(session.timestamp).toISOString() : null,
    reading_ended_at: null,
    audio_url: audioUrl,
    event_logs: session.eventLogs ?? [],
    screen_durations: session.screenDurations ?? {},
    srl_distribution: session.srlDistribution ?? {},
    event_session_id: session.eventSessionId ?? null,
  }

  const { error: sessionError } = await supabase!
    .from('sessions')
    .insert(insertData as never)

  if (sessionError) {
    console.error('[api] 세션 저장 실패:', sessionError)
    return false
  }

  // 학생 누적 통계 업데이트
  try {
    await supabase!.rpc('increment_student_stats' as never, {
      p_student_id: studentId,
      p_stars: earnedStars,
      p_new_level: newLevel,
    } as never)
  } catch {
    await supabase!
      .from('students')
      .update({ level: newLevel } as never)
      .eq('id', studentId)
  }

  return true
}

// ──────────────────────────────────────────
// 3. 대시보드: 학급 학생 로드
// ──────────────────────────────────────────

export async function loadClassroomStudents(classroomId: string): Promise<unknown[]> {
  if (!isOnlineMode) {
    const localPlayer = readPlayerData()
    if (localPlayer.sessions && localPlayer.sessions.length > 0) {
      const { mockStudents } = await import('../data/mockStudents')
      return [{ id: 'local', name: localPlayer.name || 'Local Student', sessions: localPlayer.sessions, level: localPlayer.level, totalSessions: localPlayer.totalSessions, totalStars: localPlayer.totalStars, badges: localPlayer.badges, regulationLevel: 'ai-adjusted' }, ...mockStudents]
    }
    const { mockStudents } = await import('../data/mockStudents')
    return mockStudents
  }

  const { data: students, error } = await supabase!
    .from('students')
    .select(`
      id, name, level, total_sessions, total_stars, badges,
      sessions (
        id, passage_id, goal_type, accuracy, cwpm,
        error_counts, word_mappings, self_rating, felt_difficulty,
        scaffold_data, hhair_level, reading_started_at, reading_ended_at,
        audio_url, teacher_memo, created_at
      )
    `)
    .eq('classroom_id', classroomId)
    .order('name')

  if (error || !students) return []

  return (students as unknown as Record<string, unknown>[]).map((s) => ({
    id: s.id,
    name: s.name,
    level: s.level,
    totalSessions: s.total_sessions,
    totalStars: s.total_stars,
    sessions: ((s.sessions as unknown[]) ?? []).map((sess) => mapDbSessionToLocal(sess as Record<string, unknown>)),
    badges: ((s.badges as unknown[]) ?? []).map((b) => ({
      id: typeof b === 'string' ? b : (b as Record<string, string>).id,
      earnedAt: 0,
    })),
    regulationLevel: determineLatestHHAIR((s.sessions as unknown[]) ?? []),
  }))
}

// ──────────────────────────────────────────
// 4. 교사 메모 저장
// ──────────────────────────────────────────

export async function saveTeacherMemo(sessionId: string, memo: string): Promise<boolean> {
  if (!isOnlineMode) return true

  const { error } = await supabase!
    .from('sessions')
    .update({ teacher_memo: memo } as never)
    .eq('id', sessionId)

  return !error
}

// ──────────────────────────────────────────
// 5. 오류 재분류 저장
// ──────────────────────────────────────────

export async function saveReclassification(params: {
  sessionId: string
  wordIndex: number
  originalType: string
  reclassifiedType: string
  teacherId: string
}): Promise<boolean> {
  if (!isOnlineMode) return true

  const { error } = await supabase!.from('error_reclassifications').insert({
    session_id: params.sessionId,
    word_index: params.wordIndex,
    original_type: params.originalType,
    reclassified_type: params.reclassifiedType,
    reclassified_by: params.teacherId,
  } as never)

  return !error
}

// ──────────────────────────────────────────
// 6. 실시간 구독 (대시보드용)
// ──────────────────────────────────────────

export function subscribeToClassroomSessions(
  classroomId: string,
  onNewSession: (session: unknown) => void,
) {
  if (!isOnlineMode) return { unsubscribe: () => {} }

  const channel = supabase!
    .channel(`classroom-${classroomId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'sessions',
      },
      (payload) => {
        onNewSession(payload.new)
      },
    )
    .subscribe()

  return {
    unsubscribe: () => {
      supabase!.removeChannel(channel)
    },
  }
}

// ──────────────────────────────────────────
// 헬퍼 함수
// ──────────────────────────────────────────

function mapDbSessionToLocal(dbSession: Record<string, unknown>): SessionData {
  return {
    passageId: dbSession.passage_id as string,
    goalType: dbSession.goal_type as SessionData['goalType'],
    confidence: (dbSession.confidence as number) ?? 2,
    analysis: {
      original: (dbSession.transcript as string) ?? '',
      recognized: (dbSession.transcript as string) ?? '',
      originalWords: [],
      recognizedWords: [],
      errors: {
        correct: [],
        substitution: [],
        omission: [],
        addition: [],
        repetition: [],
        selfCorrection: [],
        correctSyllables: 0,
        mapping: ((dbSession.word_mappings as unknown[]) ?? []),
      } as unknown as SessionData['analysis']['errors'],
      totalSyllables: 0,
      correctSyllables: 0,
      accuracy: dbSession.accuracy as number,
      readingTime: 0,
      cwpm: dbSession.cwpm as number,
      totalErrors: 0,
      errorRate: 0,
      errorCounts: dbSession.error_counts as unknown as SessionData['analysis']['errorCounts'],
    },
    selfAssessment: {
      selfRating: (dbSession.self_rating as number) ?? 3,
      feltDifficulty: (dbSession.felt_difficulty as boolean) ?? false,
    },
    timestamp: dbSession.created_at ? new Date(dbSession.created_at as string).getTime() : Date.now(),
  }
}

function determineLatestHHAIR(sessions: unknown[]): RegulationLevel {
  if (!sessions.length) return 'ai-adjusted'
  const sorted = [...sessions].sort(
    (a, b) =>
      new Date((b as Record<string, unknown>).created_at as string).getTime() -
      new Date((a as Record<string, unknown>).created_at as string).getTime(),
  )
  return ((sorted[0] as Record<string, unknown>).hhair_level as RegulationLevel) ?? 'ai-adjusted'
}

// ──────────────────────────────────────────
// 7. 교사 Supabase 동기화
// ──────────────────────────────────────────

export async function syncTeacherToSupabase(
  user: UserAccount,
): Promise<string | null> {
  if (!isOnlineMode) return null

  const { data, error } = await supabase!
    .from('teachers')
    .upsert(
      {
        email: user.username,
        name: user.realName || user.username,
        password_hash: user.password,
      } as never,
      { onConflict: 'email' },
    )
    .select('id')
    .single()

  if (error || !data) {
    console.error('[api] 교사 동기화 실패:', error)
    return null
  }

  return (data as { id: string }).id
}

// ──────────────────────────────────────────
// 8. 학급 관리 CRUD
// ──────────────────────────────────────────

function generateClassCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

function generate4DigitPin(): string {
  return String(Math.floor(Math.random() * 10000)).padStart(4, '0')
}

export async function createClassroom(
  teacherId: string,
  name: string,
): Promise<Classroom | null> {
  if (!isOnlineMode) return null

  const classCode = generateClassCode()

  const { data, error } = await supabase!
    .from('classrooms')
    .insert({ name, teacher_id: teacherId, class_code: classCode } as never)
    .select()
    .single()

  if (error || !data) {
    console.error('[api] 학급 생성 실패:', error)
    return null
  }

  const row = data as Record<string, unknown>
  return {
    id: row.id as string,
    name: row.name as string,
    classCode: row.class_code as string,
    teacherId: row.teacher_id as string,
    schoolYear: row.school_year as number,
    studentCount: 0,
    createdAt: row.created_at as string,
  }
}

export async function loadTeacherClassrooms(
  teacherId: string,
): Promise<Classroom[]> {
  if (!isOnlineMode) return []

  const { data, error } = await supabase!
    .from('classrooms')
    .select('*, students(count)')
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false })

  if (error || !data) return []

  return (data as unknown as Record<string, unknown>[]).map((row) => ({
    id: row.id as string,
    name: row.name as string,
    classCode: row.class_code as string,
    teacherId: row.teacher_id as string,
    schoolYear: row.school_year as number,
    studentCount: ((row.students as { count: number }[])?.[0]?.count) ?? 0,
    createdAt: row.created_at as string,
  }))
}

export async function addStudentToClassroom(
  classroomId: string,
  studentName: string,
): Promise<ClassroomStudent | null> {
  if (!isOnlineMode) return null

  // 기존 PIN 조회 후 충돌 없는 PIN 생성
  const { data: existing } = await supabase!
    .from('students')
    .select('pin')
    .eq('classroom_id', classroomId)

  const usedPins = new Set((existing ?? []).map((s) => (s as { pin: string }).pin))
  let pin = generate4DigitPin()
  let attempts = 0
  while (usedPins.has(pin) && attempts < 50) {
    pin = generate4DigitPin()
    attempts++
  }

  const { data, error } = await supabase!
    .from('students')
    .insert({ classroom_id: classroomId, name: studentName, pin } as never)
    .select()
    .single()

  if (error || !data) {
    console.error('[api] 학생 추가 실패:', error)
    return null
  }

  const row = data as Record<string, unknown>
  return {
    id: row.id as string,
    name: row.name as string,
    pin: row.pin as string,
    level: row.level as number,
    totalSessions: row.total_sessions as number,
    createdAt: row.created_at as string,
  }
}

export async function loadClassroomStudentsForManagement(
  classroomId: string,
): Promise<ClassroomStudent[]> {
  if (!isOnlineMode) return []

  const { data, error } = await supabase!
    .from('students')
    .select('id, name, pin, level, total_sessions, created_at')
    .eq('classroom_id', classroomId)
    .order('name')

  if (error || !data) return []

  return (data as unknown as Record<string, unknown>[]).map((row) => ({
    id: row.id as string,
    name: row.name as string,
    pin: row.pin as string,
    level: row.level as number,
    totalSessions: row.total_sessions as number,
    createdAt: row.created_at as string,
  }))
}

export async function updateStudent(
  studentId: string,
  name: string,
): Promise<boolean> {
  if (!isOnlineMode) return false

  const { error } = await supabase!
    .from('students')
    .update({ name } as never)
    .eq('id', studentId)

  return !error
}

export async function deleteStudent(studentId: string): Promise<boolean> {
  if (!isOnlineMode) return false

  const { error } = await supabase!
    .from('students')
    .delete()
    .eq('id', studentId)

  return !error
}

export async function deleteClassroom(classroomId: string): Promise<boolean> {
  if (!isOnlineMode) return false

  const { error } = await supabase!
    .from('classrooms')
    .delete()
    .eq('id', classroomId)

  return !error
}

export async function resolveClassCode(
  code: string,
): Promise<{ id: string; name: string } | null> {
  if (!isOnlineMode) return null

  const { data, error } = await supabase!
    .from('classrooms')
    .select('id, name')
    .eq('class_code', code.toUpperCase())
    .single()

  if (error || !data) return null

  const row = data as { id: string; name: string }
  return { id: row.id, name: row.name }
}
