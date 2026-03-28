import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import AuthShell from '../modules/auth/AuthShell'
import { fetchAuthDebugSnapshot } from '../modules/auth/service'

function DebugCard({ title, value }) {
  return (
    <section style={{ background: '#14110f', border: '1px solid #241d18', borderRadius: 16, padding: 18 }}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>{title}</div>
      <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0, color: '#b7aea4', fontSize: 12 }}>
        {JSON.stringify(value, null, 2)}
      </pre>
    </section>
  )
}

export default function AuthDebug() {
  const { user, profile, roles, loading, reloadProfile } = useAuth()
  const [debug, setDebug] = useState({ loading: true })

  useEffect(() => {
    let active = true
    async function run() {
      if (!user?.id) {
        if (active) setDebug({ loading: false, message: 'Aucun utilisateur connecté' })
        return
      }
      const snapshot = await fetchAuthDebugSnapshot(user.id)
      if (active) setDebug({ loading: false, ...snapshot })
    }
    run()
    return () => { active = false }
  }, [user?.id])

  return (
    <AuthShell
      title="Debug Auth Supabase"
      subtitle="Page temporaire de diagnostic pendant la reconstruction propre du module auth."
      maxWidth={960}
    >
      <div style={{ marginBottom: 18, color: '#b7aea4', lineHeight: 1.7 }}>
        Projet : {debug.projectUrl || '—'}
        <br />
        Loading auth : {String(loading)}
        <br />
        User email : {user?.email || '—'}
        <br />
        User id : {user?.id || '—'}
        <br />
        Profile id : {profile?.id || '—'}
        <br />
        Profile role : {profile?.role || '—'}
        <br />
        Roles[] : {Array.isArray(roles) && roles.length ? roles.join(', ') : '—'}
      </div>

      <button
        onClick={reloadProfile}
        style={{ marginBottom: 18, minHeight: 44, padding: '0 18px', borderRadius: 12, border: '1px solid #2b2b2b', background: '#161616', color: '#f5f1ea', fontWeight: 700, cursor: 'pointer' }}
      >
        Recharger le profil
      </button>

      <div style={{ display: 'grid', gap: 16 }}>
        <DebugCard title="Local storage auth" value={debug.localStorage ?? debug.message ?? { loading: debug.loading }} />
        <DebugCard title="Select profiles" value={debug.profileQuery ?? debug.message ?? { loading: debug.loading }} />
        <DebugCard title="RPC get_my_profile" value={debug.rpcQuery ?? debug.message ?? { loading: debug.loading }} />
      </div>
    </AuthShell>
  )
}
