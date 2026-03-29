/**
 * AdminTable — Composant table réutilisable pour le CMS
 */

export default function AdminTable({ columns, rows, onEdit, onToggle, onDelete, emptyMessage }) {
  if (!rows?.length) {
    return (
      <div className="text-center py-12 text-zinc-600 text-[13px]">
        {emptyMessage || 'Aucun élément'}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/[0.08]">
            {columns.map(col => (
              <th key={col.key} className="text-left px-4 py-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                {col.label}
              </th>
            ))}
            <th className="text-right px-4 py-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
              {columns.map(col => (
                <td key={col.key} className="px-4 py-3 text-[13px] text-zinc-300">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  {onToggle && (
                    <button
                      onClick={() => onToggle(row)}
                      className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-all ${
                        row.status === 'published'
                          ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                          : 'border-zinc-700 bg-zinc-800 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {row.status === 'published' ? 'Publié' : 'Brouillon'}
                    </button>
                  )}
                  {onEdit && (
                    <button
                      onClick={() => onEdit(row)}
                      className="text-[11px] font-medium text-zinc-500 hover:text-white px-2.5 py-1 rounded-lg hover:bg-white/[0.06] transition-all"
                    >
                      Modifier
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(row)}
                      className="text-[11px] font-medium text-zinc-600 hover:text-red-400 px-2.5 py-1 rounded-lg hover:bg-red-500/10 transition-all"
                    >
                      ×
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function StatusBadge({ status }) {
  const styles = {
    published: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
    draft: 'border-zinc-700 bg-zinc-800 text-zinc-500',
    archived: 'border-red-500/20 bg-red-500/10 text-red-400',
  }

  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${styles[status] || styles.draft}`}>
      {status}
    </span>
  )
}
