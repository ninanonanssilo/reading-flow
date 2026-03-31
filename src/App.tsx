import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { FlowProvider } from './context/FlowContext'
import { useAuth } from './context/AuthContext'

const RoleSelect = lazy(() => import('./student/pages/RoleSelect'))
const Login = lazy(() => import('./student/pages/Login'))
const Register = lazy(() => import('./student/pages/Register'))
const NicknameSetup = lazy(() => import('./student/pages/NicknameSetup'))
const WelcomeScreen = lazy(() => import('./student/pages/WelcomeScreen'))
const PassageSelect = lazy(() => import('./student/pages/PassageSelect'))
const GoalSetting = lazy(() => import('./student/pages/GoalSetting'))
const ReadingActivity = lazy(() => import('./student/pages/ReadingActivity'))
const SelfAssessment = lazy(() => import('./student/pages/SelfAssessment'))
const ResultAnalysis = lazy(() => import('./student/pages/ResultAnalysis'))
const Completion = lazy(() => import('./student/pages/Completion'))
const Dashboard = lazy(() => import('./teacher/pages/Dashboard'))
const PinLogin = lazy(() => import('./student/pages/PinLogin'))
const SessionHistory = lazy(() => import('./student/pages/SessionHistory'))

function Loading() {
  return (
    <div className="flex h-screen items-center justify-center bg-[var(--bg-main)]">
      <div className="text-center">
        <div className="mb-4 text-4xl animate-bounce">🧑‍🚀</div>
        <p className="text-[var(--text-light)]">로딩 중...</p>
      </div>
    </div>
  )
}

function StudentRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/welcome" replace />
  if (user.role !== 'student') return <Navigate to="/teacher" replace />
  return <>{children}</>
}

function TeacherRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/welcome" replace />
  if (user.role !== 'teacher') return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <AuthProvider>
      <FlowProvider>
        <BrowserRouter>
          <Suspense fallback={<Loading />}>
            <Routes>
              {/* 공개 */}
              <Route path="/welcome" element={<RoleSelect />} />
              <Route path="/login/:role" element={<Login />} />
              <Route path="/register/:role" element={<Register />} />
              <Route path="/pin" element={<PinLogin />} />

              {/* 학생 전용 */}
              <Route path="/nickname" element={<StudentRoute><NicknameSetup /></StudentRoute>} />
              <Route path="/" element={<StudentRoute><WelcomeScreen /></StudentRoute>} />
              <Route path="/history" element={<StudentRoute><SessionHistory /></StudentRoute>} />
              <Route path="/passage" element={<StudentRoute><PassageSelect /></StudentRoute>} />
              <Route path="/goal" element={<StudentRoute><GoalSetting /></StudentRoute>} />
              <Route path="/reading" element={<StudentRoute><ReadingActivity /></StudentRoute>} />
              <Route path="/assess" element={<StudentRoute><SelfAssessment /></StudentRoute>} />
              <Route path="/results" element={<StudentRoute><ResultAnalysis /></StudentRoute>} />
              <Route path="/complete" element={<StudentRoute><Completion /></StudentRoute>} />

              {/* 교사 전용 */}
              <Route path="/teacher" element={<TeacherRoute><Dashboard /></TeacherRoute>} />

              <Route path="*" element={<Navigate to="/welcome" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </FlowProvider>
    </AuthProvider>
  )
}
