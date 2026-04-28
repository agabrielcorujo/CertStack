"use client"

import * as React from "react"

export function Confetti({pieces = 80}:{pieces?: number}){
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(()=>{
    setMounted(true)
    const t = setTimeout(()=> setMounted(false), 4000)
    return ()=> clearTimeout(t)
  },[])

  if(!mounted) return null

  const items = Array.from({length: pieces})

  return (
    <div aria-hidden className="confetti-container pointer-events-none fixed inset-0 z-50">
      {items.map((_,i)=>{
        const style: React.CSSProperties = {
          left: Math.random()*100 + "%",
          background: `hsl(${Math.floor(Math.random()*360)}deg ${40+Math.random()*60}% ${50+Math.random()*10}%)`,
          transform: `rotate(${Math.random()*360}deg)`,
          animationDelay: `${Math.random()*0.6}s`,
          width: `${6+Math.random()*10}px`,
          height: `${8+Math.random()*14}px`,
        }
        return <span key={i} className="confetti-piece" style={style} />
      })}

      <style jsx>{`
        .confetti-container{overflow:visible}
        .confetti-piece{
          position:fixed;
          top:-10%;
          border-radius:2px;
          opacity:0.95;
          transform-origin:center;
          animation: confetti-fall 3.2s cubic-bezier(0.18,0.67,0.3,1) forwards;
        }

        @keyframes confetti-fall{
          0%{transform:translateY(0) rotate(0); opacity:1}
          100%{transform:translateY(110vh) rotate(540deg); opacity:0}
        }
      `}</style>
    </div>
  )
}
