import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Projet from './Projet'
import { API_URL } from '../api.js'

function Dossier() {
  const [projets,    setProjets]    = useState([])
  const [chargement, setChargement] = useState(true)
  const [erreur,     setErreur]     = useState(null)
  const [recherche,  setRecherche]  = useState('')

  useEffect(() => { chargerProjets() }, [])

  const chargerProjets = async () => {
    try {
      setChargement(true)
      setErreur(null)
      const res = await fetch(API_URL)
      if (!res.ok) throw new Error('Erreur réseau ' + res.status)
      const data = await res.json()
      setProjets(data)
    } catch {
      setErreur("Impossible de charger les projets. Vérifiez que l'API Express tourne sur le port 5000.")
    } finally {
      setChargement(false)
    }
  }

  const supprimerProjet = async (id) => {
    if (!window.confirm('Supprimer ce projet ? Action irréversible.')) return
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' })
      setProjets(projets.filter(p => p._id !== id))
    } catch {
      alert('Erreur lors de la suppression.')
    }
  }

  const projetsFiltres = projets.filter(p => {
    if (!recherche) return true
    const q = recherche.toLowerCase()
    return (
      p.title?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.technologies?.some(t => t.toLowerCase().includes(q))
    )
  })

  return (
    <div className="max-w-6xl mx-auto px-6 pt-12 pb-24">

      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <p className="text-blue-600 text-xs font-mono uppercase tracking-widest mb-1">Portfolio</p>
          <h1 className="text-4xl font-black text-slate-900">Mes projets</h1>
          <p className="text-slate-500 mt-1 text-sm">
            {chargement ? 'Chargement...' : `${projets.length} projet${projets.length > 1 ? 's' : ''} au total`}
          </p>
        </div>

        {projets.length > 0 && (
          <input
            type="text"
            placeholder="Rechercher..."
            value={recherche}
            onChange={e => setRecherche(e.target.value)}
            className="w-full md:w-64 border border-slate-200 px-4 py-2.5 text-sm
                       focus:outline-none focus:border-blue-400 font-mono"
          />
        )}
      </div>

      {/* Chargement */}
      {chargement && (
        <div className="flex flex-col items-center py-24 text-slate-400">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent
                          rounded-full animate-spin mb-4" />
          <p className="text-sm font-mono">Chargement...</p>
        </div>
      )}

      {/* Erreur */}
      {erreur && (
        <div className="border border-red-200 bg-red-50 p-6 max-w-lg">
          <p className="font-semibold text-red-700 mb-1 text-sm">Erreur de connexion</p>
          <p className="text-red-600 text-sm mb-4">{erreur}</p>
          <button onClick={chargerProjets}
            className="bg-red-600 text-white px-5 py-2 text-sm font-medium hover:bg-red-700 transition">
            Réessayer
          </button>
        </div>
      )}

      {/* Liste vide */}
      {!chargement && !erreur && projets.length === 0 && (
        <div className="text-center py-24 border border-dashed border-slate-300">
          <p className="text-slate-400 mb-1 text-sm font-mono">Aucun projet</p>
          <p className="text-slate-500 text-sm mb-6">Commence à documenter tes réalisations.</p>
          <Link to="/ajouter"
            className="inline-block bg-slate-900 text-white font-semibold px-6 py-3
                       text-sm hover:bg-slate-700 transition">
            Créer le premier projet
          </Link>
        </div>
      )}

      {/* Aucun résultat */}
      {!chargement && !erreur && projets.length > 0 && projetsFiltres.length === 0 && (
        <div className="text-center py-16">
          <p className="text-slate-500 text-sm">
            Aucun résultat pour <strong>"{recherche}"</strong>
          </p>
          <button onClick={() => setRecherche('')}
            className="mt-3 text-blue-600 hover:underline text-sm">
            Effacer la recherche
          </button>
        </div>
      )}

      {/* Grille */}
      {!chargement && !erreur && projetsFiltres.length > 0 && (
        <>
          {recherche && (
            <p className="text-xs text-slate-400 mb-4 font-mono">
              {projetsFiltres.length} résultat{projetsFiltres.length > 1 ? 's' : ''} pour "{recherche}"
            </p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projetsFiltres.map(p => (
              <Projet key={p._id} projet={p} onSupprimer={supprimerProjet} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default Dossier
