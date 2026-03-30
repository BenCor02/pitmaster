/**
 * AdminShell — Coque du panel admin avec navigation par onglets
 */

import { useState } from 'react'

const TABS = [
  { id: 'overview', label: 'Vue d\'ensemble', icon: '📊' },
  { id: 'settings', label: 'Réglages', icon: '⚙️' },
  { id: 'seo', label: 'Blocs SEO', icon: '🔍' },
  { id: 'affiliate', label: 'Affiliation', icon: '🛠️' },
  { id: 'guides', label: 'Guides', icon: '📚' },
  { id: 'recipes', label: 'Recettes', icon: '🧂' },
  { id: 'faq', label: 'FAQ', icon: '❓' },
  { id: 'woods', label: 'Bois', icon: '🪵' },
  { id: 'bbq', label: 'Types BBQ', icon: '🏭' },
]

export default function AdminShell({ activeTab, onTabChange, children }) {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-white/[0.06] px-6 lg:px-10 py-5">
        <div className="max-w-6xl">
          <h1 className="text-[22px] font-bold text-white tracking-tight">Atelier CMS</h1>
          <p className="text-[13px] text-zinc-500 mt-0.5">Gérez vos contenus, guides et produits affiliés</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/[0.06] px-6 lg:px-10 overflow-x-auto">
        <div className="flex gap-1 max-w-6xl">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-[13px] font-medium border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-[#ff6b1a] text-white'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <span className="text-sm">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 lg:px-10 py-8 max-w-6xl">
        {children}
      </div>
    </div>
  )
}
