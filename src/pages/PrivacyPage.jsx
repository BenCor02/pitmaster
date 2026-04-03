import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { updateMeta } from '../lib/seo.js'

export default function PrivacyPage() {
  useEffect(() => {
    updateMeta({
      title: 'Politique de confidentialité — Charbon & Flamme',
      description: 'Politique de confidentialité de l\'application Charbon & Flamme. Données collectées, utilisation et vos droits.',
      canonical: 'https://charbonetflamme.fr/confidentialite',
    })
  }, [])

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 px-4 py-8 max-w-3xl mx-auto">
      <Link to="/" className="text-amber-500 text-sm mb-6 inline-block">&larr; Retour à l'accueil</Link>

      <h1 className="text-2xl font-bold text-white mb-6">Politique de confidentialité</h1>
      <p className="text-zinc-400 text-sm mb-8">Dernière mise à jour : 3 avril 2026</p>

      <section className="space-y-6 text-zinc-300 leading-relaxed">
        <div>
          <h2 className="text-lg font-semibold text-white mb-2">Éditeur de l'application</h2>
          <p>
            Charbon & Flamme est une application éditée par Benjamin Corette, accessible sur le web
            à l'adresse <a href="https://charbonetflamme.fr" className="text-amber-500">charbonetflamme.fr</a> et
            sur Android via le Google Play Store.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white mb-2">Données collectées</h2>
          <p>L'application collecte le minimum de données nécessaire à son fonctionnement :</p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-zinc-400">
            <li><strong className="text-zinc-200">Compte utilisateur (optionnel) :</strong> adresse email et mot de passe via Supabase Auth, uniquement si vous créez un compte pour sauvegarder vos favoris.</li>
            <li><strong className="text-zinc-200">Données de cuisson :</strong> les paramètres que vous entrez dans le calculateur (viande, poids, température) ne sont pas stockés sur nos serveurs. Ils restent sur votre appareil.</li>
            <li><strong className="text-zinc-200">Connexion sondes (Meater, FireBoard) :</strong> vos identifiants de connexion aux services tiers sont stockés uniquement en session sur votre appareil. Nous ne les conservons pas.</li>
            <li><strong className="text-zinc-200">Bluetooth :</strong> l'application peut utiliser le Bluetooth pour se connecter à vos sondes de température. Aucune donnée Bluetooth n'est transmise à nos serveurs.</li>
            <li><strong className="text-zinc-200">Analytics :</strong> nous utilisons Plausible Analytics, un service respectueux de la vie privée, sans cookies et conforme au RGPD. Aucune donnée personnelle n'est collectée.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white mb-2">Cookies</h2>
          <p>
            Charbon & Flamme n'utilise <strong>aucun cookie</strong> de tracking ou publicitaire.
            Plausible Analytics fonctionne sans cookies. Seuls des cookies techniques de session
            peuvent être utilisés pour maintenir votre connexion si vous avez un compte.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white mb-2">Partage des données</h2>
          <p>
            Vos données ne sont jamais vendues, louées ou partagées à des tiers à des fins commerciales.
            Les seuls services tiers utilisés sont :
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-zinc-400">
            <li><strong className="text-zinc-200">Supabase</strong> — hébergement de la base de données et authentification (serveurs UE)</li>
            <li><strong className="text-zinc-200">Vercel</strong> — hébergement du site web</li>
            <li><strong className="text-zinc-200">Plausible Analytics</strong> — statistiques anonymes (serveurs UE)</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white mb-2">Vos droits (RGPD)</h2>
          <p>
            Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez
            d'un droit d'accès, de rectification, de suppression et de portabilité de vos données.
            Vous pouvez supprimer votre compte à tout moment depuis l'application, ou nous contacter
            pour exercer vos droits.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white mb-2">Sécurité</h2>
          <p>
            Toutes les communications sont chiffrées via HTTPS. Les mots de passe sont hashés
            et jamais stockés en clair. Nous appliquons les bonnes pratiques de sécurité web
            (CSP, HSTS, protection XSS).
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white mb-2">Contact</h2>
          <p>
            Pour toute question relative à vos données personnelles, contactez-nous à :{' '}
            <a href="mailto:contact@charbonetflamme.fr" className="text-amber-500">contact@charbonetflamme.fr</a>
          </p>
        </div>
      </section>

      <div className="mt-12 pt-6 border-t border-zinc-800 text-center text-zinc-500 text-sm">
        © {new Date().getFullYear()} Charbon & Flamme. Tous droits réservés.
      </div>
    </div>
  )
}
