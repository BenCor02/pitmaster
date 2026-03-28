import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'

const SYSTEM_PROMPT = `Tu es PitMaster AI, un expert en BBQ américain, fumage low & slow, et cuisine au feu. Tu réponds uniquement en français, de manière concise et pratique.

Tu maîtrises parfaitement :
- Le fumage low & slow (brisket, pulled pork, ribs, beef ribs, volaille, agneau)
- Les températures internes et de fumoir
- Les techniques de wrap (Texas Crutch, papier boucher)
- Les rubs, sauces et marinades BBQ
- Les bois de fumage et leurs associations
- La méthode 3-2-1 pour les ribs
- Le stall et comment le gérer
- Le matériel (fumoir offset, kamado, kettle, pellet grill)
- Les recettes et accompagnements BBQ

Tu es passionné, direct et pratique. Tu donnes des conseils précis avec des températures, des durées et des techniques concrètes. Tu peux utiliser des emojis BBQ avec parcimonie. Tu ne réponds qu’aux questions liées au BBQ, fumage, grill et cuisine au feu.`

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
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      })

      const data = await response.json()
      if (data.error) throw new Error(data.error.message)

      const reply = data.content?.[0]?.text || 'Désolé, je n’ai pas pu répondre.'
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setError('Erreur de connexion. Réessaie dans un instant.')
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
        <div className="pm-kicker" style={{ marginBottom: 12 }}>Ask the Pitmaster</div>
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
