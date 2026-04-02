import Lumi from '../components/Lumi'

export default function SiteGuide() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-8 text-center">
        <Lumi mood="idle" size="lg" message="리딩플로우에 대해 알려줄게!" />
        <h1 className="text-3xl font-extrabold text-[var(--text-main)]">사이트 안내</h1>
      </div>

      {/* 프로그램 소개 */}
      <section className="mb-6 border border-[var(--border)] bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-lg font-extrabold text-[var(--text-main)]">읽기 우주탐험대란?</h2>
        <p className="text-sm leading-relaxed text-[var(--text-sub)]">
          읽기 우주탐험대(리딩플로우)는 초등학생의 읽기 유창성을 키워주는 프로그램이에요.
          루미와 함께 소리 내어 읽고, AI가 분석해주는 결과를 확인하며 실력을 쑥쑥 키울 수 있어요.
          매일 꾸준히 읽으면 별과 뱃지를 모을 수 있고, 레벨도 올라갑니다!
        </p>
      </section>

      {/* 사용 방법 */}
      <section className="mb-6 border border-[var(--border)] bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-extrabold text-[var(--text-main)]">사용 방법</h2>
        <div className="space-y-3">
          {[
            { num: '01', title: '지문 선택', desc: '읽고 싶은 글을 골라요. 쉬운 글, 보통 글, 어려운 글 중에서 선택할 수 있어요.', color: 'border-l-[var(--primary)]' },
            { num: '02', title: '목표 설정', desc: '오늘의 읽기 목표를 정해요. 정확하게 읽기, 빠르게 읽기, 틀린 곳 줄이기 중 하나를 선택해요.', color: 'border-l-[var(--accent-orange)]' },
            { num: '03', title: '소리 내어 읽기', desc: '마이크를 켜고 글을 소리 내어 읽어요. AI가 실시간으로 듣고 분석해요.', color: 'border-l-[var(--accent-purple)]' },
            { num: '04', title: '스스로 평가', desc: '읽기를 마친 후 스스로 어땠는지 평가해요. 별점과 난이도를 체크합니다.', color: 'border-l-[var(--accent-yellow)]' },
            { num: '05', title: '결과 분석', desc: '어떤 단어를 틀렸는지, 얼마나 빨리 읽었는지 자세한 결과를 확인해요.', color: 'border-l-[var(--secondary)]' },
          ].map((step) => (
            <div key={step.num} className={`border-l-4 ${step.color} bg-[var(--bg-main)] px-4 py-3`}>
              <div className="flex items-center gap-3">
                <span className="text-xs font-extrabold text-[var(--text-light)]">{step.num}</span>
                <span className="text-sm font-bold text-[var(--text-main)]">{step.title}</span>
              </div>
              <p className="mt-1 pl-8 text-xs text-[var(--text-sub)]">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 주요 개념 */}
      <section className="mb-6 border border-[var(--border)] bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-extrabold text-[var(--text-main)]">주요 개념</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-[var(--primary)]">CWPM (분당 정확 음절수)</h3>
            <p className="mt-1 text-xs text-[var(--text-sub)]">
              1분 동안 정확하게 읽은 음절 수예요. 숫자가 높을수록 유창하게 읽고 있다는 뜻이에요.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[var(--accent-orange)]">BASA 오류 분석</h3>
            <p className="mt-1 text-xs text-[var(--text-sub)]">
              읽기 오류를 5가지로 나눠 분석해요: 대치(다른 단어로 읽기), 생략(빼먹고 읽기),
              첨가(없는 단어 추가), 반복(같은 단어 되풀이), 자기교정(틀렸다가 고쳐 읽기).
            </p>
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[var(--accent-purple)]">HHAIR 조절 수준</h3>
            <p className="mt-1 text-xs text-[var(--text-sub)]">
              읽기 실력에 따라 AI가 도움 수준을 조절해요. AI 조절 → 공동 조절 → 공유 조절 → 자기 조절 순서로
              점점 스스로 읽기를 조절할 수 있게 됩니다.
            </p>
          </div>
        </div>
      </section>

      {/* 루미 소개 */}
      <section className="border border-[var(--border)] bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-lg font-extrabold text-[var(--text-main)]">루미 소개</h2>
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center bg-[var(--primary-light)] text-3xl">
            🧑‍🚀
          </div>
          <p className="text-sm leading-relaxed text-[var(--text-sub)]">
            루미는 읽기 우주탐험대의 AI 도우미예요. 읽기 연습을 할 때마다 루미가 함께하며
            응원하고, 도움을 주고, 잘한 점을 알려줘요. 루미와 함께 매일 조금씩 읽기 실력을 키워보아요!
          </p>
        </div>
      </section>
    </div>
  )
}
