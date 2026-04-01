import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PRIVACY_CONSENT_PARENT, STUDENT_NOTICE } from '../../data/privacyTexts'
import StudentLayout from '../components/StudentLayout'
import Lumi from '../components/Lumi'

type ConsentStep = 'parent' | 'student'

interface ConsentState {
  required_data: boolean
  audio_recording: boolean
  event_logging: boolean
  parentName: string
  parentRelation: string
  consentDate: string
}

export default function ConsentFlow() {
  const navigate = useNavigate()
  const [step, setStep] = useState<ConsentStep>('parent')
  const [consent, setConsent] = useState<ConsentState>({
    required_data: false,
    audio_recording: false,
    event_logging: false,
    parentName: '',
    parentRelation: '',
    consentDate: new Date().toISOString().split('T')[0],
  })

  const canProceed =
    consent.required_data &&
    consent.parentName.trim().length >= 2 &&
    consent.parentRelation.trim().length > 0

  const handleParentSubmit = () => {
    const consentRecord = {
      ...consent,
      timestamp: Date.now(),
      version: PRIVACY_CONSENT_PARENT.version,
    }
    localStorage.setItem('reading-flow-consent', JSON.stringify(consentRecord))
    setStep('student')
  }

  const handleStudentConfirm = () => {
    const existing = JSON.parse(localStorage.getItem('reading-flow-consent') ?? '{}')
    localStorage.setItem(
      'reading-flow-consent',
      JSON.stringify({ ...existing, studentConfirmedAt: Date.now() }),
    )
    navigate('/')
  }

  if (step === 'student') {
    return (
      <StudentLayout title={STUDENT_NOTICE.title}>
        <div className="mx-auto max-w-md space-y-4">
          <div className="flex justify-center">
            <Lumi mood="idle" size="lg" message="반가워! 같이 읽기 탐험을 떠나자!" />
          </div>
          {STUDENT_NOTICE.paragraphs.map((p, i) => (
            <p key={i} className="text-center text-base font-bold leading-relaxed text-[var(--text-main)]">
              {p}
            </p>
          ))}
          <button
            type="button"
            onClick={handleStudentConfirm}
            className="mt-6 w-full bg-[var(--primary)] py-4 text-lg font-extrabold text-white shadow-md"
          >
            {STUDENT_NOTICE.confirmLabel}
          </button>
        </div>
      </StudentLayout>
    )
  }

  return (
    <StudentLayout title="보호자 동의서">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 border-l-4 border-l-[var(--primary)] bg-[var(--primary-light)] p-4">
          <p className="text-sm font-bold text-[var(--primary-dark)]">
            이 화면은 보호자(학부모)가 확인하고 동의해주셔야 합니다.
          </p>
        </div>

        <h2 className="mb-4 text-lg font-extrabold text-[var(--text-main)]">
          {PRIVACY_CONSENT_PARENT.title}
        </h2>

        <div className="mb-6 max-h-[400px] overflow-y-auto border border-[var(--border)] bg-white p-5">
          {PRIVACY_CONSENT_PARENT.sections.map((section, i) => (
            <div key={i} className="mb-4">
              <h3 className="text-sm font-extrabold text-[var(--text-main)]">{section.heading}</h3>
              <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-[var(--text-sub)]">
                {section.content}
              </p>
            </div>
          ))}
        </div>

        <div className="mb-6 space-y-3">
          {PRIVACY_CONSENT_PARENT.consentItems.map((item) => (
            <label key={item.id} className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consent[item.id as keyof ConsentState] as boolean}
                onChange={(e) => setConsent((prev) => ({ ...prev, [item.id]: e.target.checked }))}
                className="mt-0.5 h-5 w-5 accent-[var(--primary)]"
              />
              <span className="text-sm font-bold text-[var(--text-main)]">{item.label}</span>
            </label>
          ))}
        </div>

        <div className="mb-6 space-y-3 border border-[var(--border)] bg-white p-5">
          <h3 className="text-sm font-extrabold text-[var(--text-main)]">보호자 확인</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[var(--text-light)]">보호자 성명</label>
              <input
                type="text"
                value={consent.parentName}
                onChange={(e) => setConsent((prev) => ({ ...prev, parentName: e.target.value }))}
                className="mt-1 w-full border border-[var(--border)] p-2 text-sm"
                placeholder="홍길동"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[var(--text-light)]">학생과의 관계</label>
              <select
                value={consent.parentRelation}
                onChange={(e) => setConsent((prev) => ({ ...prev, parentRelation: e.target.value }))}
                className="mt-1 w-full border border-[var(--border)] p-2 text-sm"
              >
                <option value="">선택</option>
                <option value="부">부</option>
                <option value="모">모</option>
                <option value="기타">기타 법정대리인</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-[var(--text-light)]">동의 날짜</label>
            <input
              type="date"
              value={consent.consentDate}
              onChange={(e) => setConsent((prev) => ({ ...prev, consentDate: e.target.value }))}
              className="mt-1 w-full border border-[var(--border)] p-2 text-sm"
            />
          </div>
        </div>

        <button
          type="button"
          disabled={!canProceed}
          onClick={handleParentSubmit}
          className={`w-full py-4 text-base font-extrabold text-white shadow-md transition ${
            canProceed ? 'bg-[var(--primary)] hover:bg-[var(--primary-dark)]' : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          동의하고 다음으로
        </button>
      </div>
    </StudentLayout>
  )
}
