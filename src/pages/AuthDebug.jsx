import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const PROJECT_URL = 'https://zkjfuzclkrwyustgsezd.supabase.co'

export default function AuthDebug() {
  const { user, profile, roles, loading, reloadProfile } = useAuth()
  const [debug, setDebug] = useState({ loading: true })

  useEffect(() => {
    let cancelled = false

    async function run() {
      if (!user?.id) {
        if (!cancelled) {
          setDebug({ loading: false, message: 'Aucun utilisateur connecté' })
        }
        return
      }

      const [profileRes, rpcRes, sessionRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id),
        supabase.rpc('get_my_profile'),
        supabase.auth.getSession(),
      ])

      if (!cancelled) {
        let storageSnapshot = {}
        try {
          storageSnapshot = Object.fromEntries(
            Object.keys(localStorage)
              .filter((key) => key.includes('supabase') || key.includes('sb-') || key.includes('cf-supabase-auth'))
              .map((key) => [key, localStorage.getItem(key)])
          )
        } catch (error) {
          storageSnapshot = { error: error.message }
        }

        setDebug({
          loading: false,
          projectUrl: PROJECT_URL,
          sessionEmail: sessionRes.data?.session?.user?.email || null,
          sessionUserId: sessionRes.data?.session?.user?.id || null,
          localStorage: storageSnapshot,
          profileQuery: {
            data: profileRes.data || null,
            error: profileRes.error || null,
          },
          rpcQuery: {
            data: rpcRes.data || null,
            error: rpcRes.error || null,
          },
        })
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [user?.id])

  return (
    <div style={{ minHeight: '100vh', background: '#080706', color: '#f5f1ea', padding: 24, fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, marginBottom: 12 }}>
          Debug Auth Supabase
        </h1>
        <div style={{ marginBottom: 18, color: '#b7aea4', lineHeight: 1.7 }}>
          Projet : {PROJECT_URL}
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
          <section style={{ background: '#14110f', border: '1px solid #241d18', borderRadius: 16, padding: 18 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Local storage auth</div>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0, color: '#b7aea4', fontSize: 12 }}>
              {JSON.stringify(debug.localStorage ?? debug.message ?? { loading: debug.loading }, null, 2)}
            </pre>
          </section>

          <section style={{ background: '#14110f', border: '1px solid #241d18', borderRadius: 16, padding: 18 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Select profiles</div>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0, color: '#b7aea4', fontSize: 12 }}>
              {JSON.stringify(debug.profileQuery ?? debug.message ?? { loading: debug.loading }, null, 2)}
            </pre>
          </section>

          <section style={{ background: '#14110f', border: '1px solid #241d18', borderRadius: 16, padding: 18 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>RPC get_my_profile</div>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0, color: '#b7aea4', fontSize: 12 }}>
              {JSON.stringify(debug.rpcQuery ?? debug.message ?? { loading: debug.loading }, null, 2)}
            </pre>
          </section>
        </div>
      </div>
    </div>
  )
}
