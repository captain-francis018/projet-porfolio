import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { API_URL } from '../api.js'

function AjouterProjet() {
  const [title,        setTitle]        = useState('')
  const [description,  setDescription]  = useState('')
  const [technologies, setTechnologies] = useState('')
  const [status,       setStatus]       = useState('active')
  const [image,        setImage]        = useState('')
  const [githubUrl,    setGithubUrl]    = useState('')
  const [liveUrl,      setLiveUrl]      = useState('')
  const [envoi,        setEnvoi]        = useState(false)
  const [erreur,       setErreur]       = useState(null)

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setEnvoi(true)
    setErreur(null)

    const projet = {
      title,
      description,
      technologies: technologies.split(',').map(t => t.trim()).filter(Boolean),
      status,
      ...(image     && { image }),
      ...(githubUrl && { githubUrl }),
      ...(liveUrl   && { liveUrl }),
    }

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projet)
      })
      if (!res.ok) throw new Error('Erreur serveur ' + res.status)
      navigate('/projets')
    } catch {
      setErreur("Impossible d'ajouter le projet. Vérifiez que l'API tourne sur le port 5000.")
      setEnvoi(false)
    }
  }

  const inputClass = "w-full border border-slate-200 px-4 py-2.5 text-sm bg-white " +
    "focus:outline-none focus:border-blue-500 transition-colors"

  const Label = ({ htmlFor, children, optional }) => (
    <label htmlFor={htmlFor} className="block text-sm font-semibold text-slate-700 mb-1.5">
      {children}
      {optional && <span className="text-slate-400 font-normal ml-1 text-xs">(optionnel)</span>}
    </label>
  )

  return (
    <div className="max-w-2xl mx-auto px-6 pt-10 pb-20">

      {/* Fil d'Ariane */}
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-8 font-mono">
        <Link to="/" className="hover:text-blue-600 transition">Accueil</Link>
        <span>/</span>
        <Link to="/projets" className="hover:text-blue-600 transition">Projets</Link>
        <span>/</span>
        <span className="text-slate-600">Nouveau projet</span>
      </div>

      <div className="border border-slate-200">

        {/* En-tête */}
        <div className="bg-slate-900 px-6 py-5">
          <h1 className="text-xl font-black text-white">Nouveau projet</h1>
          <p className="text-slate-400 text-sm mt-1">Documente une réalisation technique</p>
        </div>

        <div className="p-6 space-y-5">

          {erreur && (
            <div className="border border-red-200 bg-red-50 text-red-700 p-4 text-sm">
              {erreur}
            </div>
          )}

          <div>
            <Label htmlFor="title">Titre du projet *</Label>
            <input id="title" type="text" value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex : Automatisation Ansible, Monitoring Prometheus..."
              required className={inputClass} />
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <textarea id="description" rows={4} value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Contexte, objectifs, ce que tu as mis en place..."
              required className={`${inputClass} resize-y`} />
          </div>

          <div>
            <Label htmlFor="technologies">Technologies</Label>
            <input id="technologies" type="text" value={technologies}
              onChange={e => setTechnologies(e.target.value)}
              placeholder="Linux, Docker, Terraform, Ansible..."
              className={inputClass} />
            {technologies && (
              <div className="flex flex-wrap gap-2 mt-2">
                {technologies.split(',').map((t, i) => t.trim() && (
                  <span key={i} className="border border-slate-200 text-slate-500
                                           text-xs font-mono px-2 py-0.5">
                    {t.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="status">Statut</Label>
            <select id="status" value={status} onChange={e => setStatus(e.target.value)}
              className={inputClass}>
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
              <option value="archived">Archivé</option>
            </select>
          </div>

          <div>
            <Label htmlFor="image" optional>URL de l'image de couverture</Label>
            <input id="image" type="url" value={image}
              onChange={e => setImage(e.target.value)}
              placeholder="https://..."
              className={inputClass} />
            {image && (
              <img src={image} alt="Aperçu"
                className="mt-2 w-full h-36 object-cover border border-slate-200"
                onError={e => e.target.style.display = 'none'} />
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="github" optional>URL GitHub</Label>
              <input id="github" type="url" value={githubUrl}
                onChange={e => setGithubUrl(e.target.value)}
                placeholder="https://github.com/..."
                className={inputClass} />
            </div>
            <div>
              <Label htmlFor="live" optional>URL Demo live</Label>
              <input id="live" type="url" value={liveUrl}
                onChange={e => setLiveUrl(e.target.value)}
                placeholder="https://..."
                className={inputClass} />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" onClick={handleSubmit} disabled={envoi}
              className="flex-1 bg-slate-900 hover:bg-slate-700 text-white font-semibold
                         py-3 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {envoi ? 'Envoi en cours...' : 'Ajouter le projet'}
            </button>
            <button type="button" onClick={() => navigate('/projets')}
              className="flex-1 border border-slate-200 text-slate-600 font-semibold
                         py-3 text-sm hover:bg-slate-50 transition-colors">
              Annuler
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

export default AjouterProjet
