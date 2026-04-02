export type ErrorType =
  | 'correct'
  | 'substitution'
  | 'omission'
  | 'addition'
  | 'repetition'
  | 'selfCorrection'

export interface WordMapping {
  original: string
  recognized: string
  type: ErrorType
  syllables: number
}

export interface ErrorCounts {
  substitution: number
  omission: number
  addition: number
  repetition: number
  selfCorrection: number
}

export interface ReadingErrors {
  correct: string[]
  substitution: string[]
  omission: string[]
  addition: string[]
  repetition: string[]
  selfCorrection: string[]
  correctSyllables: number
  mapping: WordMapping[]
}

export interface ReadingAnalysis {
  original: string
  recognized: string
  originalWords: string[]
  recognizedWords: string[]
  errors: ReadingErrors
  totalSyllables: number
  correctSyllables: number
  accuracy: number
  readingTime: number
  cwpm: number
  totalErrors: number
  errorRate: number
  errorCounts: ErrorCounts
}

export interface Passage {
  id: string
  title: string
  text: string
  difficulty: 'easy' | 'medium' | 'hard'
  thumbnailEmoji: string
}

export type GoalType = 'accuracy' | 'speed' | 'reduction'

export interface GoalOption {
  type: GoalType
  label: string
  description: string
  icon: string
}

export interface SelfAssessmentData {
  selfRating: number
  feltDifficulty: boolean
}

export interface SessionData {
  passageId: string
  goalType: GoalType
  confidence: number
  analysis: ReadingAnalysis
  selfAssessment: SelfAssessmentData
  timestamp: number
  audioId?: string // Optional ID linking to IndexedDB audio blob
  teacherMemo?: string // Optional teacher feedback text
  scaffoldOutput?: {
    scaffoldType: string
    hhairLevel: string
    message: string
  }
  eventLogs?: unknown[]
  screenDurations?: Record<string, number>
  srlDistribution?: Record<string, number>
  eventSessionId?: string
}

export interface Badge {
  id: string
  earnedAt: number
}

export interface PlayerData {
  name: string
  totalSessions: number
  totalStars: number
  level: number
  sessions: SessionData[]
  badges: Badge[]
  currentHHAIR?: RegulationLevel
  _supabaseId?: string
}

export interface BadgeDef {
  id: string
  name: string
  icon: string
  description: string
  check: (player: PlayerData, latestSession?: SessionData) => boolean
}

export interface LevelDef {
  level: number
  name: string
  icon: string
  requiredSessions: number
  requiredStars: number
}

export type RegulationLevel =
  | 'ai-adjusted'
  | 'co-regulated'
  | 'shared-regulated'
  | 'self-regulated'

export interface SRLProcess {
  type: 'orientation' | 'planning' | 'monitoring' | 'evaluation' | 'reading' | 'rereading'
  pct: number
}

export interface DashboardStudent {
  name: string
  cwpmProgress: number[]
  accuracy: number
  recentCwpm: number
  errorDist: { S: number; O: number; A: number; R: number; SC: number }
  srlScore: number
  srProcesses: SRLProcess[]
  regulationLevel: RegulationLevel
  srlBadge: string
  trend: '▲' | '→' | '▼'
}

export interface FlowDraft {
  passageId: string | null
  goalType: GoalType | null
  confidence: number
  transcript: string
  readingStartedAt: number | null
  readingEndedAt: number | null
  analysis: ReadingAnalysis | null
  selfAssessment: SelfAssessmentData | null
  audioId?: string // Link to IndexedDB
}

export type ScaffoldLevel = 'high' | 'medium' | 'low'

export type UserRole = 'student' | 'teacher'

export interface UserAccount {
  id: string
  username: string
  password: string
  realName: string
  birthdate: string
  role: UserRole
  privacyConsent: boolean
  privacyConsentAt: number
  createdAt: number
  _supabaseTeacherId?: string
}

export interface Classroom {
  id: string
  name: string
  classCode: string
  teacherId: string
  schoolYear: number
  studentCount?: number
  createdAt: string
}

export interface ClassroomStudent {
  id: string
  name: string
  pin: string
  level: number
  totalSessions: number
  createdAt: string
}

export interface AuthState {
  user: UserAccount | null
  isLoggedIn: boolean
}
