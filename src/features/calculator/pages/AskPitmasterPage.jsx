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

Tu es passionné, direct et pratique. Tu donnes des conseils précis avec des températures, des durées et des techniques concrètes. Tu peux utiliser des emojis BBQ avec parcimonie. Tu ne réponds qu'aux questions liées au BBQ, fumage, grill et cuisine au feu.`

const SUGGESTIONS = [
  "Comment gérer le stall sur un brisket ?",
  "Quelle température pour un pulled pork ?",
  "Bois de fumage pour les ribs ?",
  "Rub Texas SPG, comment le faire ?",
  "Combien de temps pour un brisket de 5kg ?",
  "Différence entre offset et kamado ?",
]

const css = `
  @keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
  .fade-up{animation:fadeUp 0.2s ease both}
  .msg-user{background:linear-gradient(135deg,rgba(232,93,4,0.15),rgba(244,140,6,0.1));border:1px solid rgba(232,93,4,0.2);border-radius:14px 14px 4px 14px;padding:12px 16px;margin-left:40px}
  .msg-ai{background:#171410;border:1px solid #1e1a14;border-radius:14px 14px 14px 4px;padding:12px 16px;margin-right:40px}
  .msg-ai p{margin:0 0 8px;line-height:1.6}
  .msg-ai p:last-child{margin-bottom:0}
  .msg-ai ul,.msg-ai ol{padding-left:18px;margin:6px 0}
  .msg-ai li{margin-bottom:4px;line-height:1.5}
  .msg-ai strong{color:#f48c06;font-weight:600}
  .msg-ai code{background:#0e0c0a;border:1px solid #252018;border-radius:4px;padding:1px 5px;font-family:'DM Mono',monospace;font-size:12px;color:#f48c06}
  .suggest-btn{padding:8px 14px;background:#171410;border:1px solid #1e1a14;border-radius:8px;color:#8a7060;font-size:12px;cursor:pointer;transition:all 0.15s;white-space:nowrap;font-family:'DM Sans',sans-serif}
  .suggest-btn:hover{border-color:rgba(232,93,4,0.3);color:#e85d04;background:rgba(232,93,4,0.06)}
  .chat-input{background:#0e0c0a;border:1px solid #252018;border-radius:12px;color:#d4c4b0;font-family:'DM Sans',sans-serif;font-size:14px;padding:12px 16px;outline:none;width:100%;resize:none;transition:border-color 0.15s;line-height:1.5}
  .chat-input:focus{border-color:#e85d04;box-shadow:0 0 0 3px rgba(232,93,4,0.07)}
  .send-btn{width:44px;height:44px;border-radius:10px;border:none;background:linear-gradient(135deg,#f48c06,#d44e00);color:#fff;font-size:18px;cursor:pointer;transition:all 0.15s;flex-shrink:0;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 12px rgba(232,93,4,0.3)}
  .send-btn:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(232,93,4,0.4)}
  .send-btn:active{transform:scale(0.96)}
  .send-btn:disabled{opacity:0.5;cursor:not-allowed;transform:none;box-shadow:none}
  .typing-dot{width:6px;height:6px;border-radius:50%;background:#e85d04;animation:pulse 1.2s ease infinite}
  .typing-dot:nth-child(2){animation-delay:0.2s}
  .typing-dot:nth-child(3){animation-delay:0.4s}
`

function formatMessage(text) {
  // Convertir markdown basique en HTML
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .split('\n')
    .map(line => {
      if (line.startsWith('- ') || line.startsWith('• ')) return `<li>${line.slice(2)}</li>`
      if (line.match(/^\d+\. /)) return `<li>${line.replace(/^\d+\. /, '')}</li>`
      if (line.trim() === '') return null
      return `<p>${line}</p>`
    })
    .filter(Boolean)
    .join('')
    .replace(/(<li>.*<\/li>)+/g, match => `<ul>${match}</ul>`)
}

export default function AskPitmasterPage() {
  useAuth()
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
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      })

      const data = await response.json()

      if (data.error) throw new Error(data.error.message)

      const reply = data.content?.[0]?.text || 'Désolé, je nai pas pu répondre.'
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setError('Erreur de connexion. Réessaie dans un instant.')
      setMessages(prev => prev.slice(0, -1))
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

  const isEmpty = messages.length === 0

  return (
    <div style={{ fontFamily: 'DM Sans,sans-serif', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', minHeight: 500 }}>
      <style>{css}</style>

      {/* TITRE */}
      <div style={{ marginBottom: 20, flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 28, color: '#fff', letterSpacing: '-0.5px' }}>
              Ask The <span style={{ color: '#e85d04' }}>Pitmaster</span>
            </h1>
            <p style={{ fontSize: 11, color: '#8a7060', marginTop: 6, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 600 }}>
              IA spécialisée BBQ · Powered by Claude
            </p>
          </div>
          {messages.length > 0 && (
            <button onClick={clearChat} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #1e1a14', background: 'transparent', color: '#4a3a2e', fontFamily: 'Syne,sans-serif', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0 }}
              onMouseEnter={e => { e.currentTarget.style.color = '#8a7060'; e.currentTarget.style.borderColor = '#2a2418' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#4a3a2e'; e.currentTarget.style.borderColor = '#1e1a14' }}>
              Nouvelle conv.
            </button>
          )}
        </div>
      </div>

      {/* ZONE MESSAGES */}
      <div style={{ flex: 1, overflowY: 'auto', marginBottom: 16, paddingRight: 4 }}>

        {/* ÉTAT VIDE */}
        {isEmpty && (
          <div style={{ textAlign: 'center', padding: '30px 0 20px' }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>🔥</div>
            <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 18, color: '#d4c4b0', marginBottom: 6 }}>
              Pose ta question BBQ
            </div>
            <div style={{ fontSize: 13, color: '#6a5a4a', lineHeight: 1.6, marginBottom: 24 }}>
              Températures, techniques, bois, rubs...<br />Je réponds à tout sur le fumage et le BBQ.
            </div>
            {/* SUGGESTIONS */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {SUGGESTIONS.map((s, i) => (
                <button key={i} className="suggest-btn" onClick={() => sendMessage(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MESSAGES */}
        {messages.map((msg, i) => (
          <div key={i} className="fade-up" style={{ marginBottom: 12, animationDelay: `${i * 0.02}s` }}>
            {msg.role === 'user' ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '1px', color: '#4a3a2e', textTransform: 'uppercase' }}>Toi</span>
                </div>
                <div className="msg-user">
                  <p style={{ fontSize: 14, color: '#f0e8df', lineHeight: 1.6, margin: 0 }}>{msg.content}</p>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 8, background: 'linear-gradient(135deg,#f48c06,#c04400)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>🔥</div>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: '#e85d04', textTransform: 'uppercase', fontFamily: 'Syne,sans-serif' }}>PitMaster AI</span>
                </div>
                <div className="msg-ai">
                  <div style={{ fontSize: 14, color: '#d4c4b0', lineHeight: 1.6 }}
                    dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
                </div>
              </div>
            )}
          </div>
        ))}

        {/* TYPING INDICATOR */}
        {loading && (
          <div className="fade-up">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ width: 26, height: 26, borderRadius: 8, background: 'linear-gradient(135deg,#f48c06,#c04400)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>🔥</div>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: '#e85d04', textTransform: 'uppercase', fontFamily: 'Syne,sans-serif' }}>PitMaster AI</span>
            </div>
            <div className="msg-ai" style={{ display: 'inline-flex', gap: 6, alignItems: 'center', padding: '14px 16px' }}>
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
            </div>
          </div>
        )}

        {/* ERREUR */}
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#fca5a5', marginBottom: 10 }}>
            ⚠️ {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div style={{ flexShrink: 0 }}>
        {/* SUGGESTIONS rapides si déjà des messages */}
        {messages.length > 0 && messages.length < 6 && (
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 10, paddingBottom: 2 }}>
            {SUGGESTIONS.slice(0, 3).map((s, i) => (
              <button key={i} className="suggest-btn" onClick={() => sendMessage(s)} style={{ flexShrink: 0 }}>
                {s}
              </button>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <textarea
            ref={textareaRef}
            className="chat-input"
            value={input}
            onChange={e => {
              setInput(e.target.value)
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
            }}
            onKeyDown={handleKeyDown}
            placeholder="Pose ta question BBQ... (Entrée pour envoyer)"
            rows={1}
            style={{ minHeight: 44 }}
          />
          <button className="send-btn" onClick={() => sendMessage()} disabled={loading || !input.trim()}>
            {loading
              ? <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
              : '↑'}
          </button>
        </div>
        <div style={{ fontSize: 10, color: '#2e2218', marginTop: 6, textAlign: 'center', letterSpacing: '0.5px' }}>
          Entrée pour envoyer · Shift+Entrée pour nouvelle ligne · Powered by Anthropic Claude
        </div>
      </div>
    </div>
  )
}
