import { useEffect, useRef, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { PROFILE_STATUS, SESSION_STATUS, hasStableProfile, isProfilePending } from '../../modules/auth/state'

export function LoadingScreen({ label = 'Chargement...' }) {
  return (
    <div style={{ minHeight:'100vh', background:'#080706', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ fontFamily:"'Syne',sans-serif", fontSize:14, color:'#4a3a2e' }}>{label}</div>
    </div>
  )
}

export function PrivateRoute({ children, redirectTo = '/' }) {
  const { user, profile, loading, sessionStatus, profileStatus, profileError, reloadProfile } = useAuth()

  if (loading || sessionStatus === SESSION_STATUS.LOADING || isProfilePending(profileStatus)) return <LoadingScreen />
  if (sessionStatus === SESSION_STATUS.UNAUTHENTICATED || !user) return <Navigate to={redirectTo} replace />
  if (profileStatus === PROFILE_STATUS.ERROR && !profile) {
    return (
      <div style={{ minHeight:'100vh', background:'#080706', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
        <div style={{ textAlign:'center', maxWidth:440 }}>
          <div style={{ fontSize:44, marginBottom:16 }}>⚠️</div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20, color:'#fff', marginBottom:8 }}>Profil temporairement indisponible</div>
          <div style={{ fontSize:13, color:'#6a5a4a', lineHeight:1.7, marginBottom:16 }}>
            {profileError?.message || 'Le profil ne répond pas pour le moment. La session est toujours là, mais on attend une lecture stable avant de continuer.'}
          </div>
          <button className="pm-btn-secondary" onClick={() => reloadProfile(user)} style={{ width:'auto', minWidth:180 }}>
            Réessayer
          </button>
        </div>
      </div>
    )
  }
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
  const { user, isAdmin, loading, profile, reloadProfile, sessionStatus, profileStatus, profileError } = useAuth()
  const retriedRef = useRef(false)
  const [syncingProfile, setSyncingProfile] = useState(false)

  useEffect(() => {
    if (!user || loading || isAdmin || retriedRef.current) return
    if (hasStableProfile(profileStatus)) return

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

  if (loading || sessionStatus === SESSION_STATUS.LOADING || isProfilePending(profileStatus) || syncingProfile) {
    return <LoadingScreen label="Chargement de l’atelier admin..." />
  }

  if (sessionStatus === SESSION_STATUS.UNAUTHENTICATED || !user) return <Navigate to="/app" replace />

  if (profileStatus === PROFILE_STATUS.ERROR && !isAdmin) {
    return (
      <div style={{ minHeight:'100vh', background:'#080706', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
        <div style={{ maxWidth:460, width:'100%', background:'#14110f', border:'1px solid #241d18', borderRadius:16, padding:24, color:'#f5f1ea', fontFamily:"'DM Sans', sans-serif" }}>
          <div style={{ fontFamily:"'Syne', sans-serif", fontWeight:800, fontSize:28, marginBottom:10 }}>Profil admin non stabilisé</div>
          <div style={{ color:'#b7aea4', lineHeight:1.7, marginBottom:18 }}>
            La session est bien active, mais le profil Supabase n’a pas encore pu être relu correctement. On ne prend aucune décision d’accès tant que l’état n’est pas stable.
          </div>
          <div style={{ color:'#8a7060', fontSize:13, marginBottom:18 }}>
            {profileError?.message || 'Erreur temporaire de lecture du profil.'}
          </div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            <button className="pm-btn-secondary" style={{ width:'auto', minWidth:180 }} onClick={() => reloadProfile(user)}>
              Recharger le profil
            </button>
            <Link to="/app" style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', minHeight:44, padding:'0 18px', borderRadius:12, border:'1px solid #2b2b2b', background:'#161616', color:'#f5f1ea', textDecoration:'none', fontWeight:700 }}>
              Retour au calculateur
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    const missingProfile = profileStatus === PROFILE_STATUS.MISSING
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
            {missingProfile ? 'État actuel : profil manquant dans public.profiles' : `Rôle actuel : ${profile?.role}`}
          </div>
          <Link to="/app" style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', minHeight:44, padding:'0 18px', borderRadius:12, border:'1px solid #2b2b2b', background:'#161616', color:'#f5f1ea', textDecoration:'none', fontWeight:700 }}>
            Retour au calculateur
          </Link>
        </div>
      </div>
    )
  }

  return children
}
