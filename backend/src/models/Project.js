// ============================================================
// FICHIER : src/models/Project.js
// RÔLE    : Définit le schéma et le modèle Mongoose pour
//           un projet du portfolio.
//
// CORRECTION : Ce fichier était dans src/config/
//              Il doit être dans src/models/ (convention MVC)
// ============================================================

const mongoose = require('mongoose');

// ── SCHÉMA ──────────────────────────────────────────────────
// Un schéma Mongoose définit la STRUCTURE des documents MongoDB.
// C'est comme un contrat : tout document dans la collection
// "projects" doit respecter cette forme.

const projectSchema = new mongoose.Schema(
  {
    // Titre du projet (obligatoire)
    // required: true → Mongoose rejette la création si absent
    // trim: true     → supprime les espaces en début/fin
    title: {
      type: String,
      required: [true, 'Le titre est obligatoire'],
      trim: true
    },

    // Description du projet (obligatoire)
    description: {
      type: String,
      required: [true, 'La description est obligatoire'],
      trim: true
    },

    // Tableau de chaînes : ['HTML', 'CSS', 'JavaScript']
    // Par défaut : tableau vide si non fourni
    technologies: {
      type: [String],
      default: []
    },

    // Statut du projet
    // enum : liste des valeurs autorisées
    // Si on envoie autre chose → erreur de validation Mongoose
    status: {
      type: String,
      enum: {
        values: ['active', 'inactive', 'archived'],
        message: 'Statut invalide. Valeurs acceptées : active, inactive, archived'
      },
      default: 'active'
    },

    // URL GitHub (optionnel)
    githubUrl: {
      type: String,
      trim: true
    },

    // URL de démonstration en ligne (optionnel)
    liveUrl: {
      type: String,
      trim: true
    },

    // URL de l'image de couverture (optionnel)
    // Envoyée par le frontend — doit être déclarée ici pour être persistée
    image: {
      type: String,
      trim: true
    }
  },

  // ── OPTIONS DU SCHÉMA ──────────────────────────────────────
  {
    // timestamps: true → Mongoose ajoute automatiquement
    // createdAt et updatedAt à chaque document
    timestamps: true
  }
);

// ── MODÈLE ──────────────────────────────────────────────────
// mongoose.model('Project', projectSchema) crée le modèle.
// Mongoose cherchera (ou créera) la collection "projects"
// dans MongoDB (pluriel automatique du nom du modèle).
//
// Le modèle donne accès aux méthodes :
// Project.find()           → liste tous les projets
// Project.findById(id)     → un projet par son _id
// Project.create(data)     → crée un projet
// Project.findByIdAndUpdate(id, data) → met à jour
// Project.findByIdAndDelete(id)       → supprime

module.exports = mongoose.model('Project', projectSchema);
