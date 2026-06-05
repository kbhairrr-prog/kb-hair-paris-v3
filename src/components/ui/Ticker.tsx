export default function Ticker({
  text = 'RAW HAIR ONLY',
  speed = 20,
}: {
  text?: string
  speed?: number
}) {
  const items = Array.from({ length: 12 }, (_, i) => (
    <span
      key={i}
      style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: '28px',
        fontWeight: 300,
        letterSpacing: '0.18em',
        color: 'rgba(0,0,0,0.1)',
        textTransform: 'uppercase' as const,
        paddingRight: '64px',
        flexShrink: 0,
        display: 'inline-block',
      }}
    >
      {text}
    </span>
  ))

  return (
    <div
      className="overflow-hidden bg-[#f0f0f0] border-y border-[#e0e0e0] py-3.5"
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
