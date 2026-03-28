import { useEffect, useRef, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export function LoadingScreen({ label = 'Chargement...' }) {
  return (
    <div style={{ minHeight:'100vh', background:'#080706', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ fontFamily:"'Syne',sans-serif", fontSize:14, color:'#4a3a2e' }}>{label}</div>
    </div>
  )
}

export function PrivateRoute({ children, redirectTo = '/' }) {
  const { user, profile, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to={redirectTo} replace />
  if (profile?.account_status === 'suspended') {
    return (
      <div style={{ minHeight:'100vh', background:'#080706', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
        <div style={{ textAlign:'center', maxWidth:400 }}>
          <div style={{ fontSize:44, marginBottom:16 }}>🔒</div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20, color:'#fff', marginBottom:8 }}>Compte suspendu</div>
          <div style={{ fontSize:13, color:'#6a5a4a' }}>Contacte le support pour plus d'informations.</div>
        </div>
      </div>
    )
  }

  return children
}

export function AdminRoute({ children }) {
  const { user, isAdmin, loading, profile, reloadProfile } = useAuth()
  const retriedRef = useRef(false)
  const [syncingProfile, setSyncingProfile] = useState(false)

  useEffect(() => {
    if (!user || loading || isAdmin || retriedRef.current) return
    if (profile && profile.role) return

    retriedRef.current = true
    setSyncingProfile(true)

    Promise.resolve(reloadProfile?.())
      .catch((error) => {
        console.warn('admin profile sync failed', error)
      })
      .finally(() => {
        setSyncingProfile(false)
      })
  }, [user, loading, isAdmin, profile, reloadProfile])

  if (loading || syncingProfile) {
    return <LoadingScreen label="Chargement de l’atelier admin..." />
  }

  if (!user) return <Navigate to="/app" replace />

  if (!isAdmin) {
    const missingProfile = profile?.source === 'missing-profile'
    return (
      <div style={{ minHeight:'100vh', background:'#080706', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
        <div style={{ maxWidth:460, width:'100%', background:'#14110f', border:'1px solid #241d18', borderRadius:16, padding:24, color:'#f5f1ea', fontFamily:"'DM Sans', sans-serif" }}>
          <div style={{ fontFamily:"'Syne', sans-serif", fontWeight:800, fontSize:28, marginBottom:10 }}>Accès admin refusé</div>
          <div style={{ color:'#b7aea4', lineHeight:1.7, marginBottom:18 }}>
            {missingProfile
              ? 'Le compte connecté existe bien dans Auth, mais aucun profil public n’a encore été créé dans Supabase.'
              : 'Le compte connecté n’a pas de rôle admin actif pour accéder à l’atelier.'}
          </div>
          <div style={{ color:'#8a7060', fontSize:13, marginBottom:18 }}>
            {missingProfile ? 'État actuel : profil manquant dans public.profiles' : `Rôle actuel : ${profile?.role || 'inconnu'}`}
          </div>
          <a href="/app" style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', minHeight:44, padding:'0 18px', borderRadius:12, border:'1px solid #2b2b2b', background:'#161616', color:'#f5f1ea', textDecoration:'none', fontWeight:700 }}>
            Retour au calculateur
          </a>
        </div>
      </div>
    )
  }

  return children
}
