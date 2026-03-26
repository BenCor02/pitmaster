import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

const STEPS = [
  {
    id: 'welcome',
    title: 'Bienvenue sur PitMaster 🔥',
    subtitle: 'L\'outil BBQ qui va changer ta façon de cuisiner',
    content: null,
  },
  {
    id: 'experience',
    title: 'Ton niveau en BBQ ?',
    subtitle: 'Pour personnaliser ton expérience',
    options: [
      { value: 'beginner', icon: '🌱', label: 'Débutant', desc: 'Je commence le BBQ' },
      { value: 'intermediate', icon: '🔥', label: 'Intermédiaire', desc: 'J\'ai déjà fumé quelques pièces' },
      { value: 'advanced', icon: '⚡', label: 'Avancé', desc: 'Brisket, ribs, pulled pork — je maîtrise' },
      { value: 'pro', icon: '👑', label: 'Professionnel', desc: 'Restaurateur ou traiteur' },
    ],
  },
  {
    id: 'smoker',
    title: 'Tu as quel type de fumoir ?',
    subtitle: 'On peut adapter les conseils',
    options: [
      { value: 'offset', icon: '🏭', label: 'Offset', desc: 'Fumoir décalé traditionnel' },
      { value: 'kamado', icon: '🥚', label: 'Kamado', desc: 'Big Green Egg, Kamado Joe...' },
      { value: 'kettle', icon: '⚫', label: 'Kettle', desc: 'Weber et similaires' },
      { value: 'pellet', icon: '🟤', label: 'Pellet', desc: 'Traeger, Pit Boss...' },
      { value: 'other', icon: '❓', label: 'Autre / Pas encore', desc: 'Je cherche encore' },
    ],
  },
  {
    id: 'goal',
    title: 'Ton objectif principal ?',
    subtitle: 'Pour te recommander les bonnes features',
    options: [
      { value: 'family', icon: '👨‍👩‍👧', label: 'BBQ en famille', desc: 'Week-ends et occasions spéciales' },
      { value: 'friends', icon: '🎉', label: 'BBQ entre amis', desc: 'Grandes tablées et Cook Parties' },
      { value: 'competition', icon: '🏆', label: 'Compétition', desc: 'Je participe à des concours' },
      { value: 'restaurant', icon: '🍽️', label: 'Restaurant / Traiteur', desc: 'Usage professionnel' },
    ],
  },
  {
    id: 'done',
    title: 'Tout est prêt ! 🎉',
    subtitle: 'Ton compte est configuré. Lance ton premier calcul.',
    content: null,
  },
]

export default function Onboarding() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [selected, setSelected] = useState(null)
  const [saving, setSaving] = useState(false)

  const current = STEPS[step]
  const isFirst = step === 0
  const isLast = step === STEPS.length - 1
  const progress = ((step) / (STEPS.length - 1)) * 100

  async function next() {
    if (current.options && selected) {
      setAnswers(prev => ({ ...prev, [current.id]: selected }))
      setSelected(null)
    }
    if (isLast) {
      setSaving(true)
      await supabase.from('profiles').upsert({
        user_id: user.id,
        plan: 'free',
        onboarding_done: true,
        ...answers,
      }, { onConflict: 'user_id' })
      setSaving(false)
      navigate('/app')
    } else {
      setStep(s => s + 1)
    }
  }

  function skip() {
    navigate('/app')
  }

  return (
    <div style={{ minHeight:'100vh', background:'#080706', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px', fontFamily:'DM Sans,sans-serif' }}>

      {/* PROGRESS BAR */}
      <div style={{ width:'100%', maxWidth:480, marginBottom:32 }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
          <span style={{ fontSize:11, color:'#4a3a2e', fontWeight:600 }}>Étape {step + 1} / {STEPS.length}</span>
          <button onClick={skip} style={{ background:'none', border:'none', color:'#3a2e24', cursor:'pointer', fontSize:12, fontFamily:'Syne,sans-serif', fontWeight:600 }}>
            Passer →
          </button>
        </div>
        <div style={{ height:3, background:'#1e1a14', borderRadius:2, overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${progress}%`, background:'linear-gradient(90deg,#f48c06,#e85d04)', borderRadius:2, transition:'width 0.4s ease' }} />
        </div>
      </div>

      {/* CARD */}
      <div style={{ width:'100%', maxWidth:480, background:'#171410', border:'1px solid #1e1a14', borderRadius:20, padding:32, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,#e85d04,transparent)' }} />

        <div style={{ textAlign: current.options ? 'left' : 'center', marginBottom: current.options ? 24 : 28 }}>
          {isFirst && <div style={{ fontSize:48, marginBottom:16 }}>🔥</div>}
          {isLast && <div style={{ fontSize:48, marginBottom:16 }}>🎉</div>}
          <h2 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:22, color:'#fff', marginBottom:6 }}>{current.title}</h2>
          <p style={{ fontSize:13, color:'#6a5a4a', lineHeight:1.6 }}>{current.subtitle}</p>
        </div>

        {/* OPTIONS */}
        {current.options && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:24 }}>
            {current.options.map(opt => (
              <div key={opt.value} onClick={() => setSelected(opt.value)} style={{
                padding:'14px 12px', borderRadius:12,
                border:`1px solid ${selected===opt.value?'rgba(232,93,4,0.4)':'#1e1a14'}`,
                background:selected===opt.value?'rgba(232,93,4,0.08)':'#0e0c0a',
                cursor:'pointer', transition:'all 0.15s',
              }}>
                <div style={{ fontSize:22, marginBottom:6 }}>{opt.icon}</div>
                <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13, color:selected===opt.value?'#e85d04':'#d4c4b0', marginBottom:3 }}>{opt.label}</div>
                <div style={{ fontSize:11, color:'#4a3a2e', lineHeight:1.4 }}>{opt.desc}</div>
              </div>
            ))}
          </div>
        )}

        {/* LAST STEP FEATURES */}
        {isLast && (
          <div style={{ marginBottom:24 }}>
            {['Calculateur BBQ complet', 'Ask The Pitmaster IA', 'Journal de cuisson', 'Fumage à froid & SSV'].map((f, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:i<3?'1px solid #1e1a14':'none' }}>
                <span style={{ color:'#22c55e', fontSize:14 }}>✓</span>
                <span style={{ fontSize:13, color:'#d4c4b0' }}>{f}</span>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <button onClick={next} disabled={current.options && !selected || saving}
          style={{
            width:'100%', padding:'14px', border:'none', borderRadius:12,
            fontFamily:'Syne,sans-serif', fontSize:14, fontWeight:700, cursor:(current.options && !selected)||saving?'not-allowed':'pointer',
            background:(current.options && !selected)||saving?'#2a2218':'linear-gradient(135deg,#f48c06,#d44e00)',
            color:'#fff', opacity:(current.options && !selected)||saving?0.5:1,
            boxShadow:(current.options && !selected)||saving?'none':'0 4px 16px rgba(232,93,4,0.25)',
            transition:'all 0.2s',
          }}>
          {saving ? '⏳ Configuration...' : isLast ? '🔥 Lancer PitMaster' : 'Continuer →'}
        </button>
      </div>
    </div>
  )
}