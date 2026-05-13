import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { API_URL } from '../api.js'

const statusStyles = {
  active:   'bg-green-50 text-green-700 border-green-200',
  inactive: 'bg-slate-100 text-slate-500 border-slate-200',
  archived: 'bg-slate-50 text-slate-400 border-slate-200',
}
const statusLabels = {
  active: 'Actif', inactive: 'Inactif', archived: 'Archivé'
}

function DetaillerProjet() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [projet,      setProjet]      = useState(null)
  const [chargement,  setChargement]  = useState(true)
  const [erreur,      setErreur]      = useState(null)
  const [enEdition,   setEnEdition]   = useState(false)
  const [sauvegarde,  setSauvegarde]  = useState(false)

  const [title,        setTitle]        = useState('')
  const [description,  setDescription]  = useState('')
  const [technologies, setTechnologies] = useState('')
  const [status,       setStatus]       = useState('active')
  const [image,        setImage]        = useState('')
  const [githubUrl,    setGithubUrl]    = useState('')
  const [liveUrl,      setLiveUrl]      = useState('')

  useEffect(() => {
    const chargerProjet = async () => {
      try {
        setChargement(true)
        setErreur(null)
        const res = await fetch(`${API_URL}/${id}`)
        if (!res.ok) throw new Error('Projet introuvable')
        const data = await res.json()
        setProjet(data)
        remplirChamps(data)
      } catch (err) {
        setErreur(err.message)
      } finally {
        setChargement(false)
      }
    }
    chargerProjet()
  }, [id])

  const remplirChamps = (data) => {
    setTitle(data.title || '')
    setDescription(data.description || '')
    setTechnologies(Array.isArray(data.technologies) ? data.technologies.join(', ') : '')
    setStatus(data.status || 'active')
    setImage(data.image || '')
    setGithubUrl(data.githubUrl || '')
    setLiveUrl(data.liveUrl || '')
  }

  const sauvegarder = async () => {
    setSauvegarde(true)
    const maj = {
      ...projet, title, description,
      technologies: technologies.split(',').map(t => t.trim()).filter(Boolean),
      status, image, githubUrl, liveUrl,
    }
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(maj)
      })
      if (!res.ok) throw new Error('Erreur sauvegarde')
      const data = await res.json()
      setProjet(data)
      setEnEdition(false)
    } catch {
      alert('Erreur lors de la sauvegarde.')
    } finally {
      setSauvegarde(false)
    }
  }

  const supprimer = async () => {
    if (!window.confirm(`Supprimer "${projet.title}" ? Action irréversible.`)) return
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' })
      navigate('/projets')
    } catch {
      alert('Erreur lors de la suppression.')
    }
  }

  const annulerEdition = () => { remplirChamps(projet); setEnEdition(false) }

  const inputClass = "w-full border border-slate-200 px-4 py-2.5 text-sm " +
    "focus:outline-none focus:border-blue-500 transition-colors bg-white"

  if (chargement) return (
    <div className="flex flex-col items-center justify-center py-32 text-slate-400">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm font-mono">Chargement...</p>
    </div>
  )

  if (erreur) return (
    <div className="max-w-lg mx-auto px-6 py-20 text-center">
      <p className="text-xl font-bold text-slate-700 mb-2">Projet introuvable</p>
      <p className="text-slate-500 mb-6 text-sm">{erreur}</p>
      <Link to="/projets" className="text-blue-600 hover:underline text-sm">
        Retour aux projets
      </Link>
    </div>
  )

  const techno = Array.isArray(projet.technologies)
    ? projet.technologies
    : (projet.technologies || '').split(',').map(t => t.trim()).filter(Boolean)

  return (
    <div className="max-w-3xl mx-auto px-6 pt-10 pb-20">

      {/* Fil d'Ariane */}
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-8 font-mono">
        <Link to="/" className="hover:text-blue-600 transition">Accueil</Link>
        <span>/</span>
        <Link to="/projets" className="hover:text-blue-600 transition">Projets</Link>
        <span>/</span>
        <span className="text-slate-600 line-clamp-1">{projet.title}</span>
      </div>

      <div className="border border-slate-200">

        {/* Image */}
        {enEdition ? (
          <div className="p-5 border-b border-slate-100 bg-slate-50">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">URL Image</label>
            <input type="url" value={image} onChange={e => setImage(e.target.value)}
              className={inputClass} placeholder="https://..." />
            {image && (
              <img src={image} alt="Aperçu"
                className="mt-2 w-full h-40 object-cover border border-slate-200"
                onError={e => e.target.style.display='none'} />
            )}
          </div>
        ) : projet.image ? (
          <img src={projet.image} alt={projet.title}
            className="w-full h-64 object-cover"
            onError={e => e.target.style.display='none'} />
        ) : (
          <div className="w-full h-36 bg-slate-100 flex items-center justify-center">
            <span className="text-slate-300 text-xs font-mono uppercase tracking-widest">
              Aucune image
            </span>
          </div>
        )}

        <div className="p-6 md:p-8 space-y-6">

          {/* Titre + statut */}
          <div>
            {enEdition ? (
              <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                className={`${inputClass} text-xl font-bold mb-3`} />
            ) : (
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <h1 className="text-3xl font-black text-slate-900">{projet.title}</h1>
                {projet.status && (
                  <span className={`text-xs font-semibold px-3 py-1 border ${statusStyles[projet.status]}`}>
                    {statusLabels[projet.status]}
                  </span>
                )}
              </div>
            )}
            {projet.createdAt && (
              <p className="text-slate-400 text-xs mt-2 font-mono">
                Ajouté le {new Date(projet.createdAt).toLocaleDateString('fr-FR', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <h2 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-2">
              Description
            </h2>
            {enEdition ? (
              <textarea rows={4} value={description} onChange={e => setDescription(e.target.value)}
                className={`${inputClass} resize-y`} />
            ) : (
              <p className="text-slate-700 leading-relaxed text-sm">{projet.description}</p>
            )}
          </div>

          {/* Technologies */}
          <div>
            <h2 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-2">
              Technologies
            </h2>
            {enEdition ? (
              <input type="text" value={technologies} onChange={e => setTechnologies(e.target.value)}
                placeholder="Linux, Docker, Terraform..." className={inputClass} />
            ) : (
              <div className="flex flex-wrap gap-2">
                {techno.map((t, i) => (
                  <span key={i} className="border border-slate-200 text-slate-500
                                           text-xs font-mono px-2.5 py-1">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Statut (édition) */}
          {enEdition && (
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-slate-400 mb-2">
                Statut
              </label>
              <select value={status} onChange={e => setStatus(e.target.value)} className={inputClass}>
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
                <option value="archived">Archivé</option>
              </select>
            </div>
          )}

          {/* Liens (édition) */}
          {enEdition && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-slate-400 mb-2">
                  GitHub
                </label>
                <input type="url" value={githubUrl} onChange={e => setGithubUrl(e.target.value)}
                  className={inputClass} placeholder="https://github.com/..." />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-slate-400 mb-2">
                  Demo live
                </label>
                <input type="url" value={liveUrl} onChange={e => setLiveUrl(e.target.value)}
                  className={inputClass} placeholder="https://..." />
              </div>
            </div>
          )}

          {/* Liens (lecture) */}
          {!enEdition && (projet.githubUrl || projet.liveUrl) && (
            <div className="flex flex-wrap gap-4 text-sm border-t border-slate-100 pt-4">
              {projet.githubUrl && (
                <a href={projet.githubUrl} target="_blank" rel="noreferrer"
                  className="text-slate-600 hover:text-slate-900 underline underline-offset-2 transition">
                  Voir sur GitHub
                </a>
              )}
              {projet.liveUrl && (
                <a href={projet.liveUrl} target="_blank" rel="noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline underline-offset-2 transition">
                  Demo live
                </a>
              )}
            </div>
          )}

          {/* Boutons */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-100">
            {enEdition ? (
              <>
                <button onClick={sauvegarder} disabled={sauvegarde}
                  className="flex-1 bg-slate-900 text-white font-semibold py-2.5 px-4
                             hover:bg-slate-700 transition disabled:opacity-50 text-sm">
                  {sauvegarde ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
                <button onClick={annulerEdition}
                  className="flex-1 border border-slate-200 text-slate-600 font-semibold
                             py-2.5 px-4 hover:bg-slate-50 transition text-sm">
                  Annuler
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setEnEdition(true)}
                  className="flex-1 bg-slate-900 text-white font-semibold py-2.5 px-4
                             hover:bg-slate-700 transition text-sm">
                  Éditer
                </button>
                <button onClick={supprimer}
                  className="flex-1 border border-red-200 text-red-400 font-semibold
                             py-2.5 px-4 hover:bg-red-500 hover:text-white transition text-sm">
                  Supprimer
                </button>
                <button onClick={() => navigate('/projets')}
                  className="w-full border border-slate-100 text-slate-400 text-sm py-2
                             hover:bg-slate-50 transition">
                  Retour a la liste
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DetaillerProjet
