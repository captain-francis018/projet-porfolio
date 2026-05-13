// ============================================================
// FICHIER : src/routes/projectRoutes.js
// RÔLE    : Déclare toutes les routes de l'API projets.
//           Fait le lien entre les URLs HTTP et les fonctions
//           du contrôleur.
//
// CORRECTION : Chemin d'import du contrôleur corrigé.
//   Avant    : require('../controllers/projectController')
//              → dossier "controllers" inexistant = CRASH
//   Maintenant : require('../controllers/projectController')
//              → fonctionne car on a créé src/controllers/
// ============================================================

const express    = require('express');
const router     = express.Router();

// Import du contrôleur depuis le bon dossier
// __dirname = src/routes/ donc ../controllers/ = src/controllers/
const controller = require('../controllers/projectController');

// ── DÉFINITION DES ROUTES ────────────────────────────────────
//
// Ces routes sont préfixées par "/api/projects" (défini dans app.js)
// Donc "/" ici = "/api/projects" vu de l'extérieur
//
// HTTP Method | URL complète             | Contrôleur
// ──────────────────────────────────────────────────────────
// GET         | /api/projects            | getAllProjects
// GET         | /api/projects/:id        | getProjectById
// POST        | /api/projects            | createProject
// PUT         | /api/projects/:id        | updateProject
// DELETE      | /api/projects/:id        | deleteProject

// Récupérer tous les projets
router.get('/', controller.getAllProjects);

// Récupérer un projet par son id
// :id = paramètre dynamique → accessible via req.params.id
router.get('/:id', controller.getProjectById);

// Créer un nouveau projet
// Le corps JSON est accessible via req.body (grâce à express.json() dans app.js)
router.post('/', controller.createProject);

// Modifier un projet (remplacement complet)
router.put('/:id', controller.updateProject);

// Supprimer un projet
router.delete('/:id', controller.deleteProject);

// On exporte le router pour l'utiliser dans app.js
module.exports = router;
