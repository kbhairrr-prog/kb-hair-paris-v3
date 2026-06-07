export default function Ticker({
  text = 'RAW HAIR ONLY',
  speed = 25,
}: {
  text?: string
  speed?: number
}) {
  const items = Array.from({ length: 20 }, (_, i) => (
    <span
      key={i}
      style={{
        fontFamily: "\'Cormorant Garamond\', serif",
        fontSize: 'clamp(40px, 10vw, 72px)',
        fontWeight: 300,
        letterSpacing: '0.18em',
        color: '#C9A84C33',
        textTransform: 'uppercase' as const,
        paddingRight: '48px',
        flexShrink: 0,
        display: 'inline-block',
      }}
    >
      {text}
    </span>
  ))

  return (
    <div
      className="overflow-hidden bg-[#0a0a0a] border-y py-4"
      style={{ borderColor: 'rgba(201,168,76,0.3)' }}
      aria-hidden="true"
    >
      <div
        className="flex whitespace-nowrap"
        style={{ animation: `kb-ticker ${speed}s linear infinite` }}
      >
        {items}
      </div>
    </div>
  )
}
