import { Link } from 'react-router-dom'

const statusStyles = {
  active:   'bg-green-50 text-green-700 border-green-200',
  inactive: 'bg-slate-100 text-slate-500 border-slate-200',
  archived: 'bg-slate-50 text-slate-400 border-slate-200',
}
const statusLabels = {
  active:   'Actif',
  inactive: 'Inactif',
  archived: 'Archivé',
}

function Projet({ projet, onSupprimer }) {
  const techno = Array.isArray(projet.technologies)
    ? projet.technologies
    : (projet.technologies || '').split(',').map(t => t.trim()).filter(Boolean)

  return (
    <article className="bg-white border border-slate-200 flex flex-col
                        hover:border-blue-300 hover:shadow-md transition-all duration-200">

      {/* Image ou placeholder sobre */}
      <div className="relative overflow-hidden h-44 bg-slate-100">
        {projet.image ? (
          <img
            src={projet.image}
            alt={projet.title}
            className="w-full h-full object-cover"
            onError={e => { e.target.style.display = 'none' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-slate-300 text-xs font-mono uppercase tracking-widest">
              Aucune image
            </span>
          </div>
        )}

        {/* Badge statut */}
        {projet.status && (
          <span className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1
                           border ${statusStyles[projet.status] || statusStyles.active}`}>
            {statusLabels[projet.status] || projet.status}
          </span>
        )}
      </div>

      {/* Contenu */}
      <div className="p-5 flex flex-col flex-1 gap-3">

        <Link
          to={`/projet/${projet._id}`}
          className="font-bold text-slate-800 hover:text-blue-600 transition-colors leading-snug"
        >
          {projet.title}
        </Link>

        <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed flex-1">
          {projet.description}
        </p>

        {/* Technologies — style badge sobre */}
        {techno.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {techno.slice(0, 4).map((tech, i) => (
              <span key={i}
                className="border border-slate-200 text-slate-500 text-xs
                           font-mono px-2 py-0.5">
                {tech}
              </span>
            ))}
            {techno.length > 4 && (
              <span className="text-xs text-slate-400 px-1 py-0.5 font-mono">
                +{techno.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Liens externes — texte uniquement */}
        {(projet.githubUrl || projet.liveUrl) && (
          <div className="flex gap-4 text-xs border-t border-slate-100 pt-3">
            {projet.githubUrl && (
              <a href={projet.githubUrl} target="_blank" rel="noreferrer"
                className="text-slate-500 hover:text-slate-800 underline underline-offset-2 transition">
                GitHub
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

        {/* Actions */}
        <div className="flex gap-2 pt-1 mt-auto border-t border-slate-100">
          <Link
            to={`/projet/${projet._id}`}
            className="flex-1 text-center text-sm font-semibold py-2
                       bg-slate-900 text-white hover:bg-slate-700 transition-colors"
          >
            Détails
          </Link>
          <button
            onClick={() => onSupprimer(projet._id)}
            className="flex-1 text-sm font-semibold py-2 border border-red-200
                       text-red-400 hover:bg-red-500 hover:text-white transition-colors"
          >
            Supprimer
          </button>
        </div>
      </div>
    </article>
  )
}

export default Projet
