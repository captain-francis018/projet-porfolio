import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { useState } from 'react'

import Accueil         from './pages/Accueil'
import Dossier         from './components/Dossier'
import AjouterProjet   from './components/AjouterProjet'
import DetaillerProjet from './components/DetaillerProjet'

function Header() {
  const location = useLocation()
  const [menuOuvert, setMenuOuvert] = useState(false)
  const isActive = (path) => location.pathname === path

  const linkBase   = "text-sm font-medium px-3 py-2 transition-colors duration-150"
  const linkActif  = "text-white border-b-2 border-blue-500"
  const linkInactif = "text-slate-400 hover:text-white"

  return (
    <header className="bg-slate-900 border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-blue-600 flex items-center justify-center
                          text-white font-black text-sm tracking-tight">
            AS
          </div>
          <div className="hidden sm:block">
            <p className="font-bold text-white text-sm leading-none">Abdoukarim Sy</p>
            <p className="text-slate-400 text-xs mt-0.5">Sysadmin · Réseau · Cloud · DevOps</p>
          </div>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-1">
          <Link to="/"        className={`${linkBase} ${isActive('/')        ? linkActif : linkInactif}`}>Accueil</Link>
          <Link to="/projets" className={`${linkBase} ${isActive('/projets') ? linkActif : linkInactif}`}>Projets</Link>
          <Link to="/ajouter"
            className="ml-4 bg-blue-600 hover:bg-blue-500 text-white text-sm
                       font-semibold px-5 py-2 transition-colors duration-150">
            + Nouveau projet
          </Link>
        </nav>

        {/* Burger mobile */}
        <button
          className="md:hidden p-2 text-slate-400 hover:text-white transition"
          onClick={() => setMenuOuvert(!menuOuvert)}
        >
          <div className={`w-5 h-0.5 bg-current mb-1.5 transition-all ${menuOuvert ? 'rotate-45 translate-y-2' : ''}`} />
          <div className={`w-5 h-0.5 bg-current mb-1.5 transition-all ${menuOuvert ? 'opacity-0' : ''}`} />
          <div className={`w-5 h-0.5 bg-current transition-all ${menuOuvert ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Menu mobile */}
      {menuOuvert && (
        <div className="md:hidden border-t border-slate-700 bg-slate-900 px-6 py-4 flex flex-col gap-2">
          <Link to="/"        onClick={() => setMenuOuvert(false)} className={`${linkBase} ${isActive('/')        ? linkActif : linkInactif}`}>Accueil</Link>
          <Link to="/projets" onClick={() => setMenuOuvert(false)} className={`${linkBase} ${isActive('/projets') ? linkActif : linkInactif}`}>Projets</Link>
          <Link to="/ajouter" onClick={() => setMenuOuvert(false)}
            className="bg-blue-600 text-white text-sm font-semibold px-5 py-2 text-center mt-1 transition">
            + Nouveau projet
          </Link>
        </div>
      )}
    </header>
  )
}

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1">
        <Routes>
          <Route path="/"           element={<Accueil />} />
          <Route path="/projets"    element={<Dossier />} />
          <Route path="/ajouter"    element={<AjouterProjet />} />
          <Route path="/projet/:id" element={<DetaillerProjet />} />
        </Routes>
      </main>

      <footer className="bg-slate-900 border-t border-slate-700 text-slate-500 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row
                        justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-blue-600 flex items-center justify-center
                            text-white text-xs font-black">
              AS
            </div>
            <div>
              <p className="text-white text-sm font-semibold">Abdoukarim Sy</p>
              <p className="text-xs">Sysadmin · Réseau · Cloud · DevOps / SRE</p>
            </div>
          </div>
          <p className="text-xs">© {new Date().getFullYear()} — Portfolio technique</p>
          <div className="flex gap-5 text-sm">
            <Link to="/"        className="hover:text-white transition">Accueil</Link>
            <Link to="/projets" className="hover:text-white transition">Projets</Link>
            <Link to="/ajouter" className="hover:text-white transition">Ajouter</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
