'use client'

interface Props {
  onAction: (tool: string) => void
}

export default function TimeAwareCard({ onAction }: Props) {
  const h = new Date().getHours()
  const isMorning = h >= 5 && h < 12
  const isEvening = h >= 18 || h < 5

  const config = isMorning ? {
    icon: '🌅',
    title: 'Morning Brief',
    sub: 'MCQ review + quick cases to start your day',
    color: '#ffd60a',
    tool: 'aigen',
    btn: 'Start'
  } : isEvening ? {
    icon: '🌙',
    title: 'Night Shift Mode',
    sub: 'Complex emergency cases for on-call',
    color: '#00C4B4',
    tool: 'codeblue',
    btn: 'Go'
  } : {
    icon: '☀️',
    title: 'Afternoon Challenge',
    sub: 'Rapid Fire is live — compete globally',
    color: '#30d158',
    tool: 'rapid',
    btn: 'Play'
  }

  return (
    <div style={{background:'rgba(36,63,82,0.60)',borderRadius:20,padding:14,marginBottom:14,border:'1px solid rgba(255,255,255,0.18)',display:'flex',alignItems:'center',gap:12}}>
      <span style={{fontSize:26,flexShrink:0}}>{config.icon}</span>
      <div style={{flex:1}}>
        <div style={{fontSize:13,fontWeight:800,color:'white',marginBottom:2}}>{config.title}</div>
        <div style={{fontSize:11,color:'rgba(255,255,255,0.4)'}}>{config.sub}</div>
      </div>
      <button onClick={()=>onAction(config.tool)}
        style={{background:config.color+'20',border:'1px solid '+config.color+'40',borderRadius:12,padding:'7px 14px',fontSize:12,fontWeight:700,color:config.color,cursor:'pointer',flexShrink:0,fontFamily:'inherit'}}>
        {config.btn} →
      </button>
    </div>
  )
}
