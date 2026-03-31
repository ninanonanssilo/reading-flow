import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { FlowProvider } from './context/FlowContext'
import { useAuth } from './context/AuthContext'

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

function Loading() {
  return (
    <div className="flex h-screen items-center justify-center bg-[var(--bg-main)]">
      <div className="text-center">
        <div className="mb-4 text-4xl animate-bounce">📚</div>
        <p className="text-[var(--text-light)]">로딩 중...</p>
      </div>
    </div>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth()
  if (!isLoggedIn) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <AuthProvider>
      <FlowProvider>
        <BrowserRouter>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/nickname" element={<ProtectedRoute><NicknameSetup /></ProtectedRoute>} />
              <Route path="/" element={<ProtectedRoute><WelcomeScreen /></ProtectedRoute>} />
              <Route path="/passage" element={<ProtectedRoute><PassageSelect /></ProtectedRoute>} />
              <Route path="/goal" element={<ProtectedRoute><GoalSetting /></ProtectedRoute>} />
              <Route path="/reading" element={<ProtectedRoute><ReadingActivity /></ProtectedRoute>} />
              <Route path="/assess" element={<ProtectedRoute><SelfAssessment /></ProtectedRoute>} />
              <Route path="/results" element={<ProtectedRoute><ResultAnalysis /></ProtectedRoute>} />
              <Route path="/complete" element={<ProtectedRoute><Completion /></ProtectedRoute>} />
              <Route path="/teacher" element={<Dashboard />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </FlowProvider>
    </AuthProvider>
  )
}
