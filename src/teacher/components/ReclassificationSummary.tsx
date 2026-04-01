import type { Reclassification } from '../../utils/reclassification'
import { calculateCohensKappa } from '../../utils/reclassification'

interface Props {
  reclassifications: Reclassification[]
  totalWords: number
}

export default function ReclassificationSummary({ reclassifications, totalWords }: Props) {
  if (reclassifications.length === 0) {
    return (
      <div className="border border-gray-200 bg-gray-50 p-4 text-center text-xs text-gray-500">
        아직 재분류 이력이 없습니다. 어절을 클릭하여 오류 유형을 교정할 수 있습니다.
      </div>
    )
  }

  const { kappa, agreement, details } = calculateCohensKappa(reclassifications, totalWords)

  const kappaLabel =
    kappa >= 0.81 ? '거의 완벽 (Almost Perfect)'
    : kappa >= 0.61 ? '상당한 일치 (Substantial)'
    : kappa >= 0.41 ? '보통 일치 (Moderate)'
    : kappa >= 0.21 ? '약한 일치 (Fair)'
    : '미미한 일치 (Slight)'

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <div className="border border-gray-200 bg-white p-3 text-center">
          <p className="text-[10px] font-bold text-gray-500">Cohen&apos;s kappa</p>
          <p className={`mt-1 text-lg font-extrabold ${kappa >= 0.61 ? 'text-emerald-600' : kappa >= 0.41 ? 'text-orange-500' : 'text-red-500'}`}>
            {kappa.toFixed(3)}
          </p>
          <p className="mt-0.5 text-[9px] text-gray-400">{kappaLabel}</p>
        </div>
        <div className="border border-gray-200 bg-white p-3 text-center">
          <p className="text-[10px] font-bold text-gray-500">일치율</p>
          <p className="mt-1 text-lg font-extrabold text-gray-700">{(agreement * 100).toFixed(1)}%</p>
        </div>
        <div className="border border-gray-200 bg-white p-3 text-center">
          <p className="text-[10px] font-bold text-gray-500">재분류 건수</p>
          <p className="mt-1 text-lg font-extrabold text-gray-700">{reclassifications.length}</p>
          <p className="mt-0.5 text-[9px] text-gray-400">총 {totalWords}어절 중</p>
        </div>
      </div>
      {Object.keys(details).length > 0 && (
        <div className="border border-gray-200 bg-white p-3">
          <p className="mb-2 text-[10px] font-bold text-gray-500">재분류 패턴</p>
          <div className="space-y-1">
            {Object.entries(details).sort(([, a], [, b]) => b - a).map(([pattern, count]) => (
              <div key={pattern} className="flex items-center justify-between text-xs">
                <span className="text-gray-600">{pattern}</span>
                <span className="font-bold text-gray-800">{count}건</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
