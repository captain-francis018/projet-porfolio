# Image de base : Node.js 20 version Alpine (legere, ~50Mo)
FROM node:20-alpine

# Definir le dossier de travail dans le conteneur
WORKDIR /app

# Copier UNIQUEMENT les fichiers de dependances d’abord
# Astuce cache : si package.json ne change pas, npm install est mis en cache
COPY package*.json ./

# Installer les dependances de production uniquement
RUN npm install --omit=dev

# Copier tout le reste du code
COPY . .

# Informer Docker que ce conteneur ecoute sur le port 5000
EXPOSE 5000

# Commande executee au demarrage du conteneur
CMD ["node", "app.js"]

