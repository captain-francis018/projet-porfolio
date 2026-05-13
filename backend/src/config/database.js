// ============================================================
// FICHIER : src/config/database.js
// RÔLE    : Connexion à MongoDB via Mongoose.
//           Appelée une seule fois au démarrage dans app.js.
// ============================================================

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // mongoose.connect() retourne une Promise
    // On attend la connexion avec await
    // process.env.MONGODB_URI est chargé depuis .env par dotenv
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    // conn.connection.host = l'adresse du serveur MongoDB
    // Ex: "localhost" en local, "cluster0.mongodb.net" en cloud
    console.log(`MongoDB connecté : ${conn.connection.host}`);

  } catch (err) {
    // Si la connexion échoue (MongoDB non démarré, mauvais URI...)
    // On affiche l'erreur et on arrête le processus Node
    // process.exit(1) = code de sortie "erreur" (0 = succès)
    console.error(`Erreur connexion MongoDB : ${err.message}`);
    process.exit(1);
  }
};

// On exporte la fonction pour l'utiliser dans app.js
module.exports = connectDB;
