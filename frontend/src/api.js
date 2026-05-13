// ============================================================
// FICHIER : src/api.js
// RÔLE    : Centralise l'URL de base de l'API.
//
// CORRECTION : On utilise une URL RELATIVE (/api/projects)
// au lieu de l'URL absolue (http://localhost:5000/api/projects).
// Vite proxy redirige /api/* vers http://localhost:5000 en dev.
// En production, configurer VITE_API_URL dans .env du frontend.
//
// Les champs de l'API Express/MongoDB sont :
//   - title, description, technologies (tableau)
//   - status (active / inactive / archived)
//   - githubUrl, liveUrl, image (optionnels, persistés en BDD)
//   - _id (généré par MongoDB)
// ============================================================

// En dev  : Vite proxy redirige /api/* → http://localhost:5000
// En prod : définir VITE_API_URL=https://ton-api.com/api/projects dans .env
export const API_URL = import.meta.env.VITE_API_URL || '/api/projects'
