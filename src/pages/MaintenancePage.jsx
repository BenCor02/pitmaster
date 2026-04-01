import { LogoFull } from '../components/Logo.jsx'

export default function MaintenancePage({ message }) {
  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <LogoFull iconSize={36} />
        </div>

        {/* Flamme animée */}
        <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-[#ff6b1a]/20 to-[#dc2626]/10 flex items-center justify-center border border-[#ff6b1a]/10">
          <span className="text-4xl animate-pulse">🔥</span>
        </div>

        {/* Message */}
        <h1 className="font-display text-[24px] lg:text-[30px] font-black text-white tracking-tight mb-4">
          On revient vite
        </h1>
        <p className="text-[15px] text-stone-400 leading-relaxed mb-8">
          {message || "Le site est en cours de maintenance. On prépare quelque chose de bon — reviens dans quelques minutes."}
        </p>

        {/* Indicateur */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#ff6b1a]/[0.08] border border-[#ff6b1a]/15">
          <span className="w-2 h-2 rounded-full bg-[#ff6b1a] animate-pulse" />
          <span className="text-[12px] font-semibold text-[#ff8c4a]">Maintenance en cours</span>
        </div>
      </div>
    </div>
  )
}
