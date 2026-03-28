import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'

const SUGGESTIONS = [
  'Comment gérer le stall sur un brisket ?',
  'Quelle température pour un pulled pork ?',
  'Bois de fumage pour les ribs ?',
  'Rub Texas SPG, comment le faire ?',
  'Combien de temps pour un brisket de 5kg ?',
  'Différence entre offset et kamado ?',
]

const css = `
  @keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.38}}
  .ask-page{font-family:'DM Sans',sans-serif}
  .ask-shell{display:grid;grid-template-columns:320px 1fr;gap:14px;align-items:start}
  .ask-side-card{background:linear-gradient(180deg,#1a1a1a,#161616);border:1px solid var(--border);border-radius:20px;padding:18px;box-shadow:var(--shadow-soft)}
  .ask-suggestion{width:100%;text-align:left;padding:12px 14px;border-radius:14px;border:1px solid var(--border);background:#111111;color:var(--text2);font-size:13px;font-weight:600;cursor:pointer;transition:all .15s;font-family:'DM Sans',sans-serif}
  .ask-suggestion:hover{border-color:var(--orange-border);color:var(--text);background:var(--orange-bg)}
  .ask-chat-card{background:linear-gradient(180deg,#1a1a1a,#161616);border:1px solid var(--border);border-radius:24px;box-shadow:var(--shadow-soft);overflow:hidden}
  .ask-chat-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;padding:18px 20px;border-bottom:1px solid rgba(255,255,255,0.06)}
  .ask-chat-body{padding:18px 20px;min-height:420px;max-height:calc(100vh - 340px);overflow:auto}
  .ask-chat-foot{padding:16px 20px;border-top:1px solid rgba(255,255,255,0.06);background:rgba(0,0,0,0.16)}
  .ask-user{margin-left:48px;background:linear-gradient(180deg,rgba(198,40,40,0.18),rgba(154,27,27,0.12));border:1px solid var(--orange-border);border-radius:18px 18px 6px 18px;padding:14px 16px}
  .ask-ai{margin-right:48px;background:#111111;border:1px solid var(--border);border-radius:18px 18px 18px 6px;padding:14px 16px}
  .ask-ai p{margin:0 0 8px;line-height:1.7}
  .ask-ai p:last-child{margin-bottom:0}
  .ask-ai ul,.ask-ai ol{padding-left:18px;margin:6px 0}
  .ask-ai li{margin-bottom:4px;line-height:1.6}
  .ask-ai strong{color:var(--ember);font-weight:700}
  .ask-ai code{background:#181818;border:1px solid var(--border);border-radius:6px;padding:1px 5px;font-family:'DM Mono',monospace;font-size:12px;color:var(--ember)}
  .ask-meta{display:flex;align-items:center;gap:8px;margin-bottom:6px}
  .ask-avatar{width:30px;height:30px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
  .ask-input{background:#111111;border:1px solid var(--border);border-radius:16px;color:var(--text);font-family:'DM Sans',sans-serif;font-size:14px;padding:14px 16px;outline:none;width:100%;resize:none;line-height:1.6;transition:border-color .15s;min-height:54px}
  .ask-input:focus{border-color:var(--orange-border)}
  .ask-send{width:54px;height:54px;border-radius:16px;border:none;background:linear-gradient(180deg,var(--orange),var(--orange-deep));color:#fff;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 12px 26px rgba(198,40,40,0.24)}
  .ask-send:disabled{opacity:.5;cursor:not-allowed;box-shadow:none}
  .typing-dot{width:6px;height:6px;border-radius:50%;background:var(--ember);animation:pulse 1.2s ease infinite}
  .typing-dot:nth-child(2){animation-delay:0.2s}
  .typing-dot:nth-child(3){animation-delay:0.4s}
  .fade-up{animation:fadeUp .22s ease both}
  @media(max-width:980px){
    .ask-shell{grid-template-columns:1fr}
    .ask-user,.ask-ai{margin-left:0;margin-right:0}
    .ask-chat-body{max-height:none;min-height:320px}
  }
`

function formatMessage(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .split('\n')
    .map((line) => {
      if (line.startsWith('- ') || line.startsWith('• ')) return `<li>${line.slice(2)}</li>`
      if (line.match(/^\d+\. /)) return `<li>${line.replace(/^\d+\. /, '')}</li>`
      if (line.trim() === '') return null
      return `<p>${line}</p>`
    })
    .filter(Boolean)
    .join('')
    .replace(/(<li>.*<\/li>)+/g, (match) => `<ul>${match}</ul>`)
}

function buildPitmasterReply(question) {
  const q = (question || '').toLowerCase()

  if (q.includes('stall')) {
    return `**Le stall est normal.**

- Il arrive souvent autour de **65 à 75°C** internes.
- Ne monte pas le fumoir brutalement juste parce que ça ralentit.
- Si la bark te plaît, tu peux **wrapper** pour raccourcir cette phase.
- Sinon, laisse passer le plateau et garde un feu stable.

**Repère terrain :** tant que la couleur continue de se poser et que le fumoir reste propre, tu n’es pas en train de rater la cuisson.`
  }

  if (q.includes('wrap') || q.includes('wrapper')) {
    return `**Wrap au bon moment, pas au bon chiffre uniquement.**

- Commence à y penser quand la bark te plaît vraiment.
- Sur une grosse pièce type brisket ou paleron, un repère utile est souvent **autour de 70 à 75°C** internes.
- **Papier boucher** : garde mieux la bark.
- **Aluminium** : accélère davantage, texture plus fondante.

**Règle simple :** si la couleur n’est pas encore là, attends.`
  }

  if (q.includes('brisket')) {
    return `**Brisket : vise la régularité avant tout.**

1. Fumoir stable autour de **115 à 125°C**.
2. Wrap seulement quand la bark est bien posée.
3. Commence les tests de tendreté vers **92 à 96°C**.
4. Fais un vrai repos, idéalement **1 à 3 heures** si tu peux.

**Le bon signal final n’est pas seulement la température :** la sonde doit rentrer presque sans résistance.`
  }

  if (q.includes('pulled pork') || q.includes('pork shoulder') || q.includes('effiloch')) {
    return `**Pour un pulled pork propre :**

- Cuisson low & slow autour de **110 à 125°C**.
- Wrap possible si tu veux raccourcir le stall.
- Commence à tester vers **93 à 96°C**.
- Cherche une viande qui s’effiloche sans forcer, pas juste un chiffre affiché.

**Important :** un repos de **45 à 90 minutes** aide vraiment avant l’effilochage.`
  }

  if (q.includes('ribs')) {
    return `**Sur les ribs, regarde d’abord le visuel et la souplesse.**

- La couleur doit être bien posée.
- Tu dois voir un léger retrait sur les os.
- Le rack doit plier franchement quand tu le soulèves.
- Le wrap reste un choix de texture, pas une obligation.

**Repère pratique :** préfère le **flex test** et le rendu de surface à une simple température interne.`
  }

  if (q.includes('bois') || q.includes('fumage')) {
    return `**Bois de fumage : reste simple.**

- **Bœuf** : chêne, hickory.
- **Porc** : pommier, cerisier, chêne léger.
- **Volaille** : pommier, érable, cerisier léger.
- **Agneau** : chêne ou fruitier doux.

**Conseil pitmaster :** mieux vaut une fumée fine et propre qu’un goût trop lourd.`
  }

  if (q.includes('kamado') || q.includes('offset') || q.includes('pellet')) {
    return `**Chaque fumoir a sa logique.**

- **Kamado** : très stable, peu gourmand, parfait pour les longues cuissons.
- **Offset** : plus vivant, plus exigeant, super rendu feu/fumée.
- **Pellet** : très simple pour tenir une température régulière.

Si tu veux, pose ta question en précisant **ton fumoir**, **la viande**, **le poids** et **l’heure de service**.`
  }

  if (q.includes('repos') || q.includes('hold')) {
    return `**Le repos fait partie de la cuisson.**

- Petite pièce : souvent **20 à 40 min**.
- Grosse pièce BBQ : souvent **45 à 180 min** selon la taille et ta fenêtre de service.
- Le repos aide à stabiliser les jus et rend la découpe plus nette.

**Quand tu as de l’avance, profite-en pour tenir la viande au chaud plutôt que servir trop tôt.**`
  }

  return `**Donne-moi un peu plus de contexte et je te réponds comme au bord du fumoir.**

Précise si possible :

- la **viande**
- le **poids**
- la **température du fumoir**
- si tu veux **wrapper ou non**
- l’**heure de service**

Exemple :
**"Brisket 5,5 kg à 121°C, service à 19h, quand wrapper et combien de repos ?"**`
}

export default function AskPitmasterPage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage(text) {
    const q = (text || input).trim()
    if (!q || loading) return
    setInput('')
    setError('')

    const newMessages = [...messages, { role: 'user', content: q }]
    setMessages(newMessages)
    setLoading(true)

    try {
      await new Promise((resolve) => window.setTimeout(resolve, 450))
      const reply = buildPitmasterReply(q)
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setError('Impossible de générer une réponse pour le moment.')
      setMessages((prev) => prev.slice(0, -1))
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  function clearChat() {
    setMessages([])
    setError('')
  }

  return (
    <div className="ask-page">
      <style>{css}</style>

      <div className="pm-hero-shell" style={{ marginBottom: 18 }}>
        <div className="pm-kicker" style={{ marginBottom: 12 }}>Conseil pitmaster</div>
        <h1 style={{ marginBottom: 8 }}>
          Une réponse <span style={{ color: 'var(--ember)' }}>BBQ directe et terrain</span>
        </h1>
        <p style={{ maxWidth: 760 }}>
          Températures, stall, wrap, bois, rubs, matériel : pose une question précise et récupère une réponse courte, utile, pensée pour quelqu’un qui a déjà le fumoir en face de lui.
        </p>
      </div>

      <div className="ask-shell">
        <aside className="ask-side-card">
          <div className="pm-sec-label">🔥 Brief pitmaster</div>
          <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, marginTop: 8, marginBottom: 16 }}>
            Le meilleur résultat vient avec une question concrète : viande, poids, température fumoir, résultat voulu.
          </div>

          <div style={{ display: 'grid', gap: 10, marginBottom: 16 }}>
            {SUGGESTIONS.map((suggestion) => (
              <button key={suggestion} type="button" className="ask-suggestion" onClick={() => sendMessage(suggestion)}>
                {suggestion}
              </button>
            ))}
          </div>

          <div style={{ paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 8 }}>
              Contexte de réponse
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              <div className="pm-glow-pill"><span>🥩</span><span style={{ fontSize: 12, color: 'var(--text2)' }}>Brisket, ribs, pulled pork, volaille, agneau</span></div>
              <div className="pm-glow-pill"><span>🌯</span><span style={{ fontSize: 12, color: 'var(--text2)' }}>Wrap, stall, repos, hold</span></div>
              <div className="pm-glow-pill"><span>🪵</span><span style={{ fontSize: 12, color: 'var(--text2)' }}>Bois, fumoirs, rubs, service</span></div>
            </div>
            {user?.email ? (
              <div style={{ marginTop: 14, fontSize: 12, color: 'var(--text3)', lineHeight: 1.6 }}>
                Connecté en tant que <span style={{ color: 'var(--text2)' }}>{user.email}</span>
              </div>
            ) : null}
          </div>
        </aside>

        <section className="ask-chat-card">
          <div className="ask-chat-head">
            <div>
              <div className="pm-sec-label">🤠 Atelier questions-réponses</div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 8 }}>
                Une réponse pratique, sans jargon inutile.
              </div>
            </div>
            {messages.length > 0 ? (
              <button type="button" className="pm-btn-secondary" style={{ width: 'auto', minWidth: 150 }} onClick={clearChat}>
                Nouvelle conv.
              </button>
            ) : null}
          </div>

          <div className="ask-chat-body">
            {messages.length === 0 ? (
              <div className="pm-card" style={{ marginBottom: 0 }}>
                <div style={{ textAlign: 'center', padding: '18px 8px' }}>
                  <div style={{ fontSize: 50, marginBottom: 14 }}>🔥</div>
                  <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 24, color: 'var(--text)', marginBottom: 8 }}>
                    Pose ta question BBQ
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.7, maxWidth: 540, margin: '0 auto' }}>
                    Plus ta question est concrète, meilleure sera la réponse. Exemple : “Brisket 5 kg à 121°C, quand wrapper et combien de repos ?”
                  </div>
                </div>
              </div>
            ) : null}

            {messages.map((msg, i) => (
              <div key={i} className="fade-up" style={{ marginBottom: 14 }}>
                {msg.role === 'user' ? (
                  <div>
                    <div className="ask-meta" style={{ justifyContent: 'flex-end' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: 'var(--text4)', textTransform: 'uppercase' }}>Toi</span>
                    </div>
                    <div className="ask-user">
                      <p style={{ fontSize: 14, color: '#f5f1ea', lineHeight: 1.7, margin: 0 }}>{msg.content}</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="ask-meta">
                      <div className="ask-avatar" style={{ background: 'linear-gradient(180deg,var(--orange),var(--orange-deep))' }}>🔥</div>
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: 'var(--ember)', textTransform: 'uppercase', fontFamily: 'Syne,sans-serif' }}>
                        Pitmaster AI
                      </span>
                    </div>
                    <div className="ask-ai">
                      <div style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {loading ? (
              <div className="fade-up">
                <div className="ask-meta">
                  <div className="ask-avatar" style={{ background: 'linear-gradient(180deg,var(--orange),var(--orange-deep))' }}>🔥</div>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: 'var(--ember)', textTransform: 'uppercase', fontFamily: 'Syne,sans-serif' }}>
                    Pitmaster AI
                  </span>
                </div>
                <div className="ask-ai" style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              </div>
            ) : null}

            {error ? (
              <div className="pm-card" style={{ borderColor: 'rgba(251,113,133,0.25)', marginBottom: 0 }}>
                <div style={{ fontSize: 13, color: '#fca5a5' }}>⚠️ {error}</div>
              </div>
            ) : null}

            <div ref={messagesEndRef} />
          </div>

          <div className="ask-chat-foot">
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
              <textarea
                ref={textareaRef}
                className="ask-input"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value)
                  e.target.style.height = 'auto'
                  e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px'
                }}
                onKeyDown={handleKeyDown}
                placeholder="Exemple : brisket 6kg à 121°C, quand wrapper et combien de repos ?"
                rows={1}
              />
              <button type="button" className="ask-send" onClick={() => sendMessage()} disabled={loading || !input.trim()}>
                ↑
              </button>
            </div>
            <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text4)' }}>
              Entrée pour envoyer · Shift+Entrée pour aller à la ligne
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
