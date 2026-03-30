import { useState, useRef, useCallback } from 'react'
import { renderMarkdown } from '../../lib/markdown.js'

/**
 * MarkdownEditor — Éditeur de texte avec toolbar et aperçu live
 */

const TOOLS = [
  { id: 'h2', label: 'H2', icon: 'H2', wrap: ['## ', ''], block: true },
  { id: 'h3', label: 'H3', icon: 'H3', wrap: ['### ', ''], block: true },
  { id: 'sep1', separator: true },
  { id: 'bold', label: 'Gras', icon: 'B', wrap: ['**', '**'] },
  { id: 'italic', label: 'Italique', icon: 'I', wrap: ['*', '*'], italic: true },
  { id: 'sep2', separator: true },
  { id: 'ul', label: 'Liste', icon: '•', wrap: ['- ', ''], block: true },
  { id: 'ol', label: 'Liste num.', icon: '1.', wrap: ['1. ', ''], block: true },
  { id: 'sep3', separator: true },
  { id: 'link', label: 'Lien', icon: '🔗', action: 'link' },
  { id: 'table', label: 'Tableau', icon: '▦', action: 'table' },
]

export default function MarkdownEditor({ value, onChange, rows = 16, placeholder }) {
  const [mode, setMode] = useState('edit') // 'edit' | 'preview' | 'split'
  const textareaRef = useRef(null)

  const insertText = useCallback((before, after, blockLevel = false) => {
    const ta = textareaRef.current
    if (!ta) return
    ta.focus()

    const start = ta.selectionStart
    const end = ta.selectionEnd
    const text = value || ''
    const selected = text.substring(start, end)

    let insertion
    if (blockLevel) {
      // For block-level, ensure we're at start of line
      const lineStart = text.lastIndexOf('\n', start - 1) + 1
      const prefix = text.substring(lineStart, start)
      if (selected) {
        // Wrap each selected line
        const lines = selected.split('\n')
        insertion = lines.map(l => `${before}${l}`).join('\n')
      } else {
        insertion = `${before}${selected || 'texte'}${after}`
      }
      // If not at line start and prefix is not empty, add newline
      if (prefix.trim() && !blockLevel) {
        insertion = '\n' + insertion
      }
    } else {
      insertion = `${before}${selected || 'texte'}${after}`
    }

    const newText = text.substring(0, start) + insertion + text.substring(end)
    onChange(newText)

    // Set cursor position after insert
    requestAnimationFrame(() => {
      if (selected) {
        ta.selectionStart = start
        ta.selectionEnd = start + insertion.length
      } else {
        const cursorPos = start + before.length
        ta.selectionStart = cursorPos
        ta.selectionEnd = cursorPos + (selected || 'texte').length
      }
    })
  }, [value, onChange])

  const handleTool = useCallback((tool) => {
    if (tool.separator) return

    if (tool.action === 'link') {
      const ta = textareaRef.current
      const selected = ta ? (value || '').substring(ta.selectionStart, ta.selectionEnd) : ''
      insertText('[', '](https://)', false)
      return
    }

    if (tool.action === 'table') {
      const table = '\n| Colonne 1 | Colonne 2 | Colonne 3 |\n| --- | --- | --- |\n| cellule | cellule | cellule |\n'
      const ta = textareaRef.current
      if (!ta) return
      const start = ta.selectionStart
      const text = value || ''
      const newText = text.substring(0, start) + table + text.substring(start)
      onChange(newText)
      return
    }

    if (tool.wrap) {
      insertText(tool.wrap[0], tool.wrap[1], tool.block || false)
    }
  }, [value, onChange, insertText])

  const handleKeyDown = useCallback((e) => {
    // Ctrl/Cmd + B = bold
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault()
      insertText('**', '**', false)
    }
    // Ctrl/Cmd + I = italic
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
      e.preventDefault()
      insertText('*', '*', false)
    }
    // Tab = indent
    if (e.key === 'Tab') {
      e.preventDefault()
      const ta = e.target
      const start = ta.selectionStart
      const text = value || ''
      const newText = text.substring(0, start) + '  ' + text.substring(ta.selectionEnd)
      onChange(newText)
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 2
      })
    }
  }, [value, onChange, insertText])

  return (
    <div className="rounded-xl border border-white/[0.08] overflow-hidden bg-white/[0.02]">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-white/[0.06] bg-white/[0.02] flex-wrap">
        {/* Format tools */}
        {TOOLS.map((tool) => {
          if (tool.separator) {
            return <div key={tool.id} className="w-px h-5 bg-white/[0.08] mx-1" />
          }
          return (
            <button
              key={tool.id}
              type="button"
              onClick={() => handleTool(tool)}
              title={tool.label}
              className={`px-2 py-1 rounded-md text-[12px] font-semibold transition-all hover:bg-[#ff6b1a]/10 hover:text-[#ff6b1a] text-zinc-500 ${
                tool.italic ? 'italic' : ''
              } ${tool.id === 'bold' ? 'font-black' : ''}`}
            >
              {tool.icon}
            </button>
          )
        })}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Mode toggle */}
        <div className="flex items-center bg-white/[0.03] rounded-lg p-0.5">
          {[
            { id: 'edit', label: 'Écrire' },
            { id: 'split', label: 'Split' },
            { id: 'preview', label: 'Aperçu' },
          ].map(m => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
                mode === m.id
                  ? 'bg-[#ff6b1a]/15 text-[#ff6b1a]'
                  : 'text-zinc-600 hover:text-zinc-400'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Editor area */}
      <div className={`${mode === 'split' ? 'grid grid-cols-2 divide-x divide-white/[0.06]' : ''}`}>
        {/* Textarea */}
        {(mode === 'edit' || mode === 'split') && (
          <textarea
            ref={textareaRef}
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={rows}
            className="w-full px-4 py-3 bg-transparent text-[13px] text-white placeholder-zinc-700 focus:outline-none font-mono leading-relaxed resize-y"
          />
        )}

        {/* Preview */}
        {(mode === 'preview' || mode === 'split') && (
          <div
            className={`px-5 py-4 overflow-y-auto ${mode === 'preview' ? '' : 'max-h-[500px]'}`}
            style={mode === 'preview' ? { minHeight: `${rows * 1.625}rem` } : {}}
          >
            {value ? (
              <div
                className="prose-guide"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
              />
            ) : (
              <p className="text-zinc-700 text-[13px] italic">Aucun contenu à afficher...</p>
            )}
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="px-3 py-1.5 border-t border-white/[0.04] flex items-center justify-between">
        <span className="text-[10px] text-zinc-700">
          Markdown supporté · <span className="font-mono">Ctrl+B</span> gras · <span className="font-mono">Ctrl+I</span> italique
        </span>
        <span className="text-[10px] text-zinc-700">
          {(value || '').length} car.
        </span>
      </div>
    </div>
  )
}
