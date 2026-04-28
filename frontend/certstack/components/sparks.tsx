"use client"

import * as React from "react"

export function Sparks({ keyTrigger, count = 18 }: { keyTrigger: string | number; count?: number }) {
  // re-render when keyTrigger changes
  const [active, setActive] = React.useState(false)

  React.useEffect(() => {
    if (!keyTrigger && keyTrigger !== 0) return
    setActive(true)
    const t = setTimeout(() => setActive(false), 700)
    return () => clearTimeout(t)
  }, [keyTrigger])

  if (!active) return null

  const items = Array.from({ length: count })

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-40">
      {items.map((_, i) => {
        const left = Math.random() * 100
        const size = 6 + Math.random() * 10
        const delay = Math.random() * 0.25
        const bg = `linear-gradient(180deg, hsl(${Math.floor(Math.random()*60)+170} 70% 60%), hsl(${Math.floor(Math.random()*60)+10} 70% 55%))`
        const style: React.CSSProperties = {
          left: `${left}%`,
          width: `${size}px`,
          height: `${size * (0.8 + Math.random()*0.6)}px`,
          background: bg,
          transform: `translateY(0) rotate(${Math.random()*360}deg)`,
          animationDelay: `${delay}s`,
        }
        return <span key={i} className="spark" style={style} />
      })}

      <style jsx>{`
        .spark{
          position:absolute;
          top:30%;
          border-radius:2px;
          opacity:0.95;
          transform-origin:center;
          animation: spark-rise 700ms cubic-bezier(.2,.8,.2,1) forwards;
        }
        @keyframes spark-rise{
          0%{ transform: translateY(0) scale(1); opacity:1 }
          100%{ transform: translateY(-160px) scale(0.6) rotate(180deg); opacity:0 }
        }
      `}</style>
    </div>
  )
}
