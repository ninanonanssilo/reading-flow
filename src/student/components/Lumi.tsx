interface LumiProps {
  mood: 'idle' | 'listening' | 'happy' | 'thinking' | 'cheering'
  message?: string
  size?: 'sm' | 'md' | 'lg'
  showBubble?: boolean
  className?: string
}

const sizes = { sm: 48, md: 80, lg: 120 }

export default function Lumi({ mood, message, size = 'md', showBubble = true, className = '' }: LumiProps) {
  const px = sizes[size]

  return (
    <div className={`inline-flex flex-col items-center gap-1 ${className}`}>
      {/* 말풍선 */}
      {showBubble && message && (
        <div className="lumi-bubble relative max-w-[220px] rounded-xl bg-white px-3 py-2 text-center shadow-md border border-[var(--border)]">
          <p className="text-sm font-bold text-[var(--text-main)] leading-snug">{message}</p>
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-3 w-3 rotate-45 bg-white border-r border-b border-[var(--border)]" />
        </div>
      )}
      {/* SVG 캐릭터 */}
      <svg
        width={px}
        height={px * (160 / 120)}
        viewBox="0 0 120 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={mood === 'cheering' ? 'animate-lumi-jump' : ''}
      >
        {/* 몸통 — 흰색 우주복 */}
        <rect x="35" y="72" width="50" height="55" rx="14" fill="#fff" stroke="var(--primary)" strokeWidth="2.5" />
        {/* 별 마크 */}
        <text x="60" y="105" textAnchor="middle" fontSize="18">⭐</text>

        {/* 다리 */}
        <rect x="40" y="122" width="14" height="22" rx="6" fill="#fff" stroke="var(--primary)" strokeWidth="2" />
        <rect x="66" y="122" width="14" height="22" rx="6" fill="#fff" stroke="var(--primary)" strokeWidth="2" />
        {/* 부츠 */}
        <rect x="38" y="138" width="18" height="10" rx="5" fill="var(--primary)" />
        <rect x="64" y="138" width="18" height="10" rx="5" fill="var(--primary)" />

        {/* 팔 — mood별 */}
        {mood === 'idle' && (
          <>
            {/* 왼팔 올려 인사 */}
            <line x1="35" y1="82" x2="16" y2="65" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" />
            <circle cx="14" cy="63" r="4" fill="#fff" stroke="var(--primary)" strokeWidth="2" />
            {/* 오른팔 내려 */}
            <line x1="85" y1="85" x2="100" y2="105" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" />
            <circle cx="102" cy="107" r="4" fill="#fff" stroke="var(--primary)" strokeWidth="2" />
          </>
        )}
        {mood === 'listening' && (
          <>
            {/* 왼팔 귀에 */}
            <line x1="35" y1="82" x2="20" y2="55" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" />
            <circle cx="18" cy="52" r="4" fill="#fff" stroke="var(--primary)" strokeWidth="2" />
            {/* 오른팔 내려 */}
            <line x1="85" y1="85" x2="100" y2="105" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" />
            <circle cx="102" cy="107" r="4" fill="#fff" stroke="var(--primary)" strokeWidth="2" />
          </>
        )}
        {mood === 'thinking' && (
          <>
            {/* 왼팔 내려 */}
            <line x1="35" y1="85" x2="18" y2="105" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" />
            <circle cx="16" cy="107" r="4" fill="#fff" stroke="var(--primary)" strokeWidth="2" />
            {/* 오른팔 턱에 */}
            <line x1="85" y1="82" x2="78" y2="66" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" />
            <circle cx="78" cy="63" r="4" fill="#fff" stroke="var(--primary)" strokeWidth="2" />
          </>
        )}
        {(mood === 'happy' || mood === 'cheering') && (
          <>
            {/* 양팔 들기 */}
            <line x1="35" y1="80" x2="12" y2="62" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" />
            <circle cx="10" cy="60" r="4" fill="#fff" stroke="var(--primary)" strokeWidth="2" />
            <line x1="85" y1="80" x2="108" y2="62" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" />
            <circle cx="110" cy="60" r="4" fill="#fff" stroke="var(--primary)" strokeWidth="2" />
          </>
        )}

        {/* 헬멧 */}
        <circle cx="60" cy="38" r="30" fill="var(--primary)" opacity="0.12" />
        <circle cx="60" cy="38" r="30" fill="none" stroke="var(--primary)" strokeWidth="3" />
        {/* 반사광 */}
        <ellipse cx="47" cy="24" rx="8" ry="5" fill="#fff" opacity="0.5" transform="rotate(-20,47,24)" />

        {/* 얼굴 — mood별 */}
        {mood === 'idle' && (
          <>
            <circle cx="50" cy="36" r="4" fill="var(--text-main)" />
            <circle cx="70" cy="36" r="4" fill="var(--text-main)" />
            <circle cx="51" cy="34.5" r="1.2" fill="#fff" />
            <circle cx="71" cy="34.5" r="1.2" fill="#fff" />
            <path d="M52 48 Q60 55 68 48" stroke="var(--text-main)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </>
        )}
        {mood === 'listening' && (
          <>
            {/* 큰 눈 */}
            <circle cx="50" cy="36" r="5" fill="var(--text-main)" />
            <circle cx="70" cy="36" r="5" fill="var(--text-main)" />
            <circle cx="51.5" cy="34" r="1.8" fill="#fff" />
            <circle cx="71.5" cy="34" r="1.8" fill="#fff" />
            {/* 입 살짝 벌림 */}
            <ellipse cx="60" cy="49" rx="4" ry="3" fill="var(--text-main)" opacity="0.7" />
          </>
        )}
        {mood === 'happy' && (
          <>
            {/* 웃음눈 ∧∧ */}
            <path d="M46 36 Q50 31 54 36" stroke="var(--text-main)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M66 36 Q70 31 74 36" stroke="var(--text-main)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M50 48 Q60 57 70 48" stroke="var(--text-main)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </>
        )}
        {mood === 'thinking' && (
          <>
            {/* 한쪽 눈 위로 */}
            <circle cx="50" cy="36" r="4" fill="var(--text-main)" />
            <circle cx="51" cy="34.5" r="1.2" fill="#fff" />
            <circle cx="70" cy="34" r="3.5" fill="var(--text-main)" />
            <circle cx="71" cy="32.5" r="1.2" fill="#fff" />
            {/* 입 ~ */}
            <path d="M50 49 Q55 52 60 48 Q65 44 70 49" stroke="var(--text-main)" strokeWidth="2" strokeLinecap="round" fill="none" />
          </>
        )}
        {mood === 'cheering' && (
          <>
            {/* 웃음눈 ∧∧ */}
            <path d="M46 36 Q50 31 54 36" stroke="var(--text-main)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M66 36 Q70 31 74 36" stroke="var(--text-main)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            {/* 큰 웃음 */}
            <path d="M48 47 Q60 60 72 47" stroke="var(--text-main)" strokeWidth="2.5" strokeLinecap="round" fill="var(--accent-orange-light)" />
          </>
        )}

        {/* 이펙트 — mood별 */}
        {mood === 'happy' && (
          <>
            <text x="10" y="20" fontSize="10" className="animate-sparkle">✨</text>
            <text x="98" y="18" fontSize="10" className="animate-sparkle" style={{ animationDelay: '0.3s' }}>✨</text>
            <text x="6" y="50" fontSize="8" className="animate-sparkle" style={{ animationDelay: '0.6s' }}>⭐</text>
          </>
        )}
        {mood === 'cheering' && (
          <>
            <text x="5" y="15" fontSize="9" className="animate-sparkle">🎉</text>
            <text x="100" y="12" fontSize="9" className="animate-sparkle" style={{ animationDelay: '0.2s' }}>🎊</text>
            <text x="15" y="55" fontSize="8" className="animate-sparkle" style={{ animationDelay: '0.5s' }}>✨</text>
            <text x="95" y="50" fontSize="8" className="animate-sparkle" style={{ animationDelay: '0.7s' }}>⭐</text>
          </>
        )}
      </svg>

      {/* 음파 애니메이션 (listening) */}
      {mood === 'listening' && (
        <div className="lumi-soundwave flex items-end h-4">
          <span style={{ height: 12 }} /><span style={{ height: 16 }} /><span style={{ height: 10 }} /><span style={{ height: 14 }} /><span style={{ height: 11 }} />
        </div>
      )}
    </div>
  )
}
