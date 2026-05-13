// ============================================================
// FICHIER : src/controllers/projectController.js
// RÔLE    : Contient toute la logique métier (business logic)
//           pour les opérations CRUD sur les projets.
//
// CORRECTIONS apportées :
//   1. Chemin d'import corrigé (../models/Project au lieu de ../config/Project)
//   2. try/catch ajouté sur TOUTES les fonctions (évite les crashes)
//   3. Vérification d'existence sur updateProject et deleteProject
//   4. runValidators: true sur updateProject (valide le schéma à la mise à jour)
//   5. Messages d'erreur explicites
// ============================================================

// CORRECTION 1 : Bon chemin d'import
// Avant : require('../models/Project') → fichier introuvable = CRASH
// Maintenant : ../models/Project → correspond à src/models/Project.js
const Project = require('../models/Project');


// ── GET /api/projects ────────────────────────────────────────
// Retourne tous les projets de la base de données
// Réponse : tableau JSON de projets (peut être vide [])

exports.getAllProjects = async (req, res) => {
  try {
    // Project.find() sans argument = récupère TOUT
    // .sort({ createdAt: -1 }) = du plus récent au plus ancien
    const projects = await Project.find().sort({ createdAt: -1 });

    // Status 200 (OK) est implicite avec res.json()
    res.json(projects);

  } catch (err) {
    // CORRECTION 2 : try/catch manquait
    // Sans ça, une erreur MongoDB fait crasher toute l'appli
    console.error('Erreur getAllProjects :', err.message);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};


// ── GET /api/projects/:id ────────────────────────────────────
// Retourne UN projet par son identifiant MongoDB (_id)
// :id = paramètre dynamique dans l'URL (ex: /api/projects/64abc...)

exports.getProjectById = async (req, res) => {
  try {
    // req.params.id = la valeur de :id dans l'URL
    // findById cherche par le champ _id de MongoDB
    const project = await Project.findById(req.params.id);

    // Si l'id n'existe pas → findById retourne null
    // On répond 404 (Not Found) plutôt que renvoyer null
    if (!project) {
      return res.status(404).json({ message: 'Projet introuvable' });
    }

    res.json(project);

  } catch (err) {
    // Un id mal formaté (pas un ObjectId valide) lève une CastError
    // On la gère ici avec un 400 (Bad Request)
    console.error('Erreur getProjectById :', err.message);

    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Identifiant invalide' });
    }
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};


// ── POST /api/projects ───────────────────────────────────────
// Crée un nouveau projet
// Corps attendu : { title, description, technologies?, status?, githubUrl?, liveUrl? }

exports.createProject = async (req, res) => {
  try {
    // Project.create(req.body) = crée ET sauvegarde le document
    // Mongoose valide les champs selon le schéma avant d'insérer
    // Si title ou description manquent → ValidationError
    const project = await Project.create(req.body);

    // Status 201 (Created) = ressource créée avec succès
    res.status(201).json(project);

  } catch (err) {
    console.error('Erreur createProject :', err.message);

    // ValidationError = champ requis manquant ou valeur invalide (enum)
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};


// ── PUT /api/projects/:id ────────────────────────────────────
// Met à jour UN projet complet (remplace tous les champs envoyés)

exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,  // l'id à mettre à jour
      req.body,       // les nouvelles données
      {
        new: true,           // retourne le document APRÈS modification
                             // (sans ça, retourne l'ancien document)
        runValidators: true  // CORRECTION 3 : réexécute les validations du schéma
                             // (sans ça, on peut mettre un status invalide)
      }
    );

    // CORRECTION 4 : Vérification d'existence
    // Avant : on répondait avec null si le projet n'existait pas
    if (!project) {
      return res.status(404).json({ message: 'Projet introuvable' });
    }

    res.json(project);

  } catch (err) {
    console.error('Erreur updateProject :', err.message);

    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Identifiant invalide' });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};


// ── DELETE /api/projects/:id ─────────────────────────────────
// Supprime UN projet par son id

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);

    // CORRECTION 5 : Vérification d'existence avant suppression
    if (!project) {
      return res.status(404).json({ message: 'Projet introuvable' });
    }

    // Status 200 avec message de confirmation
    // (on peut aussi faire 204 No Content mais sans corps JSON)
    res.json({ message: 'Projet supprimé avec succès' });

  } catch (err) {
    console.error('Erreur deleteProject :', err.message);

    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Identifiant invalide' });
    }
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};
