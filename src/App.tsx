import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { FlowProvider } from './context/FlowContext'

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
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-[#E8F4FD] to-[#F0E6FF]">
      <div className="text-center">
        <div className="mb-4 text-4xl animate-bounce">📚</div>
        <p className="text-gray-500">로딩 중...</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <FlowProvider>
      <BrowserRouter>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<WelcomeScreen />} />
            <Route path="/passage" element={<PassageSelect />} />
            <Route path="/goal" element={<GoalSetting />} />
            <Route path="/reading" element={<ReadingActivity />} />
            <Route path="/assess" element={<SelfAssessment />} />
            <Route path="/results" element={<ResultAnalysis />} />
            <Route path="/complete" element={<Completion />} />
            <Route path="/teacher" element={<Dashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </FlowProvider>
  )
}
