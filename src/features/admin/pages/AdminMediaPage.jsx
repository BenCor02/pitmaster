import { useEffect, useState } from 'react'
import { deleteMediaAsset, fetchMediaLibrary, uploadMediaAsset } from '../../../modules/cms/repository'
import { useAuth } from '../../../context/AuthContext'

const css = `
  .media-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px}
  .media-card{background:#171410;border:1px solid #1e1a14;border-radius:14px;overflow:hidden}
  .media-input,.media-select{background:#0e0c0a;border:1px solid #252018;border-radius:10px;color:#d4c4b0;font-family:'DM Sans',sans-serif;font-size:13px;padding:10px 12px;outline:none;width:100%}
`

export default function AdminMediaPage() {
  const { user } = useAuth()
  const [assets, setAssets] = useState([])
  const [bucket, setBucket] = useState('site-media')
  const [title, setTitle] = useState('')
  const [altText, setAltText] = useState('')
  const [uploading, setUploading] = useState(false)

  async function loadAssets() {
    setAssets(await fetchMediaLibrary())
  }

  async function onFileChange(event) {
    const file = event.target.files?.[0]
    if (!file) return
    setUploading(true)
    await uploadMediaAsset(file, {
      bucket,
      altText,
      title: title || file.name,
      uploadedBy: user?.id || null,
    })
    setTitle('')
    setAltText('')
    event.target.value = ''
    setUploading(false)
    await loadAssets()
  }

  useEffect(() => {
    const timer = setTimeout(() => { loadAssets() }, 0)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div style={{ fontFamily: 'DM Sans,sans-serif' }}>
      <style>{css}</style>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 28, color: '#fff' }}>
          Médias <span style={{ color: '#e85d04' }}>Supabase</span>
        </h1>
        <p style={{ fontSize: 11, color: '#8a7060', marginTop: 6, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 600 }}>
          Upload · prévisualisation · suppression
        </p>
      </div>

      <section style={{ background: '#171410', border: '1px solid #1e1a14', borderRadius: 14, padding: 18, marginBottom: 18 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 12, alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '1.4px', textTransform: 'uppercase', color: '#6a5a4a', marginBottom: 7 }}>Bucket</label>
            <select className="media-select" value={bucket} onChange={(e) => setBucket(e.target.value)}>
              <option value="site-media">site-media</option>
              <option value="seo-media">seo-media</option>
              <option value="article-media">article-media</option>
              <option value="affiliate-media">affiliate-media</option>
              <option value="calculator-media">calculator-media</option>
              <option value="user-uploads">user-uploads</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '1.4px', textTransform: 'uppercase', color: '#6a5a4a', marginBottom: 7 }}>Titre</label>
            <input className="media-input" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '1.4px', textTransform: 'uppercase', color: '#6a5a4a', marginBottom: 7 }}>Alt text</label>
            <input className="media-input" value={altText} onChange={(e) => setAltText(e.target.value)} />
          </div>
          <label className="pm-btn-primary" style={{ width: 'auto', padding: '12px 18px', cursor: 'pointer' }}>
            {uploading ? 'Upload…' : 'Uploader'}
            <input type="file" hidden onChange={onFileChange} disabled={uploading} />
          </label>
        </div>
      </section>

      <div className="media-grid">
        {assets.map((asset) => (
          <article key={asset.id} className="media-card">
            <div style={{ aspectRatio: '4 / 3', background: '#0e0c0a' }}>
              {asset.public_url ? (
                <img src={asset.public_url} alt={asset.alt_text || asset.title || asset.file_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : null}
            </div>
            <div style={{ padding: 14 }}>
              <div style={{ color: '#f5f1ea', fontWeight: 700, marginBottom: 6 }}>{asset.title || asset.file_name}</div>
              <div style={{ color: '#8a7060', fontSize: 12, lineHeight: 1.5, marginBottom: 10 }}>{asset.alt_text || asset.file_path}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <a className="pm-btn-secondary" href={asset.public_url} target="_blank" rel="noreferrer" style={{ width: 'auto', padding: '10px 12px', fontSize: 12 }}>
                  Ouvrir
                </a>
                <button className="pm-btn-secondary" style={{ width: 'auto', padding: '10px 12px', fontSize: 12 }} onClick={async () => { await deleteMediaAsset(asset); await loadAssets() }}>
                  Supprimer
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
