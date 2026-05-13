import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { API_URL } from '../api.js'

function Accueil() {
  const [nbProjets, setNbProjets] = useState(null)

  useEffect(() => {
    fetch(API_URL)
      .then(r => r.json())
      .then(data => setNbProjets(Array.isArray(data) ? data.length : 0))
      .catch(() => setNbProjets(0))
  }, [])

  const domaines = [
    {
      label: 'Administration Système',
      desc: 'Linux, Windows Server, virtualisation (VMware, KVM), scripting Bash & PowerShell, gestion de services et automatisation.',
      accent: 'border-l-slate-700',
    },
    {
      label: 'Réseau',
      desc: 'Configuration et sécurisation de réseaux LAN/WAN, routage, switching, VPN, pare-feux, protocoles TCP/IP, OSPF, BGP.',
      accent: 'border-l-blue-600',
    },
    {
      label: 'Cloud & Infrastructure',
      desc: 'AWS (EC2, S3, VPC, IAM), infrastructure as code avec Terraform, déploiement et supervision d\'environnements cloud.',
      accent: 'border-l-slate-500',
    },
    {
      label: 'Culture DevOps / SRE',
      desc: 'CI/CD (GitHub Actions), conteneurisation Docker, monitoring (Prometheus, Grafana), fiabilité et observabilité des systèmes.',
      accent: 'border-l-blue-400',
    },
  ]

  const stack = [
    'Linux', 'Bash', 'Python', 'AWS', 'Terraform', 'Docker',
    'Kubernetes', 'Ansible', 'Prometheus', 'Grafana', 'Git',
    'GitHub Actions', 'Nginx', 'TCP/IP', 'OSPF', 'VPN',
  ]

  const stats = [
    { val: nbProjets ?? '—', label: 'Projets documentés' },
    { val: '2+',             label: 'Ans de formation'   },
    { val: '16+',            label: 'Technologies'        },
    { val: 'ODC',            label: 'Orange Digital Ctr'  },
  ]

  return (
    <div>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="bg-slate-900 text-white relative overflow-hidden">

        {/* Ligne décorative verticale */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />

        <div className="max-w-5xl mx-auto px-8 py-28 md:py-36">

          {/* Statut */}
          <div className="flex items-center gap-2 mb-8">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 text-sm font-mono tracking-wide">
              Disponible — Dakar, Sénégal
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black leading-none tracking-tight mb-6">
            Abdoukarim<br />
            <span className="text-blue-500">Sy</span>
          </h1>

          <p className="text-slate-300 text-xl md:text-2xl font-light mb-4 max-w-2xl">
            Administration Système · Réseau · Cloud
          </p>
          <p className="text-slate-400 text-base mb-12 max-w-xl leading-relaxed">
            Passionné par les infrastructures robustes et fiables, imprégné de la culture
            DevOps et orienté vers les pratiques SRE — automatiser, monitorer, améliorer en continu.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/projets"
              className="inline-flex items-center justify-center gap-3 bg-blue-600
                         hover:bg-blue-500 text-white font-semibold px-8 py-3.5
                         transition-colors duration-200"
            >
              Voir mes projets
              {nbProjets !== null && (
                <span className="bg-white/20 text-xs px-2 py-0.5 font-mono">
                  {nbProjets}
                </span>
              )}
            </Link>
            <Link
              to="/ajouter"
              className="inline-flex items-center justify-center border border-slate-600
                         text-slate-300 hover:text-white hover:border-slate-400
                         font-semibold px-8 py-3.5 transition-colors duration-200"
            >
              Ajouter un projet
            </Link>
          </div>
        </div>

        {/* Bordure basse */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-slate-700" />
      </section>

      {/* ── STATS ────────────────────────────────────────── */}
      <section className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-5xl mx-auto px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-700">
            {stats.map((s, i) => (
              <div key={i} className="py-8 px-6 text-center">
                <div className="text-3xl font-black text-white font-mono">{s.val}</div>
                <div className="text-slate-400 text-xs mt-1 uppercase tracking-widest">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DOMAINES ─────────────────────────────────────── */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-5xl mx-auto px-8">

          <div className="mb-12">
            <p className="text-blue-600 text-sm font-mono uppercase tracking-widest mb-2">Domaines</p>
            <h2 className="text-3xl font-black text-slate-900">Expertise technique</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {domaines.map((d, i) => (
              <div
                key={i}
                className={`bg-white border-l-4 ${d.accent} border border-slate-200
                            p-6 hover:shadow-md transition-shadow duration-200`}
              >
                <h3 className="font-bold text-slate-800 text-base mb-2">{d.label}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STACK ────────────────────────────────────────── */}
      <section className="bg-white border-y border-slate-200 py-16">
        <div className="max-w-5xl mx-auto px-8">
          <p className="text-slate-400 text-xs font-mono uppercase tracking-widest mb-6 text-center">
            Stack & outils
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {stack.map((tech, i) => (
              <span
                key={i}
                className="border border-slate-200 text-slate-600 text-sm font-mono
                           px-4 py-1.5 hover:border-blue-400 hover:text-blue-700
                           transition-colors duration-150 cursor-default"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="bg-slate-900 py-24">
        <div className="max-w-3xl mx-auto px-8 text-center">
          <p className="text-blue-500 text-sm font-mono uppercase tracking-widest mb-4">Portfolio</p>
          <h2 className="text-4xl font-black text-white mb-4">Mes réalisations</h2>
          <p className="text-slate-400 mb-10 leading-relaxed">
            Scripts d'automatisation, configurations réseau, déploiements cloud,
            pipelines CI/CD — l'ensemble de mes projets techniques documentés.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/projets"
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold
                         px-8 py-3.5 transition-colors duration-200"
            >
              Voir tous les projets
            </Link>
            <Link
              to="/ajouter"
              className="border border-slate-600 text-slate-300 hover:text-white
                         hover:border-slate-400 font-semibold px-8 py-3.5
                         transition-colors duration-200"
            >
              Ajouter un projet
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}

export default Accueil
