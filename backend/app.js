// ============================================================
// FICHIER : app.js
// RÔLE    : Point d'entrée de l'application Express.
//           Configure les middlewares, connecte la BDD,
//           déclare les routes et démarre le serveur.
// ============================================================

// dotenv charge les variables du fichier .env dans process.env
// DOIT être la première ligne pour que toutes les configs en bénéficient
require('dotenv').config();

const express = require('express');
const cors    = require('cors');

// Notre fonction de connexion MongoDB
const connectDB = require('./src/config/database');

const app = express();

// ── MIDDLEWARES ──────────────────────────────────────────────

// CORRECTION 1 : CORS restreint à l'origine définie dans .env
// On autorise explicitement les méthodes et headers nécessaires
// pour que les requêtes PUT, DELETE et POST avec JSON fonctionnent
app.use(cors({
  origin:  process.env.CORS_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parse le corps des requêtes JSON (Content-Type: application/json)
// Nécessaire pour lire req.body dans le contrôleur
app.use(express.json());

// ── CONNEXION BASE DE DONNÉES ────────────────────────────────
// On connecte MongoDB AVANT de déclarer les routes
connectDB();

// ── ROUTES ──────────────────────────────────────────────────
// Toutes les routes commençant par /api/projects
// sont gérées par le fichier projectRoutes.js
app.use('/api/projects', require('./src/routes/projectRoutes'));

// ── MIDDLEWARE 404 ───────────────────────────────────────────
// CORRECTION 2 : Ce middleware DOIT être APRÈS les routes
// mais AVANT app.listen()
// Il intercepte toutes les requêtes qui n'ont pas matchée une route
app.use((req, res) => {
  res.status(404).json({ message: 'Route introuvable' });
});

// ── DÉMARRAGE DU SERVEUR ─────────────────────────────────────
// CORRECTION 3 : app.listen() est maintenant EN DERNIER
// Le PORT vient du .env (PORT=5000)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

// CORRECTION 4 : On n'affiche PLUS la chaîne MongoDB en console
// Exposer process.env.MONGODB_URI dans les logs = faille de sécurité
// console.log("MONGO URI:", process.env.MONGODB_URI); ← SUPPRIMÉ
