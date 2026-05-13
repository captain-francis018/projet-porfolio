# ─── ETAPE 1 : BUILDER ──────────────────────────────
# On utilise Node.js pour compiler React en fichiers statiques
FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json ./

# Forcer Vite 5 et le bon plugin React — ignore le package-lock.json corrompu
RUN npm install --legacy-peer-deps
RUN npm install vite@5.4.0 @vitejs/plugin-react@4.3.4 --save-dev --legacy-peer-deps

COPY . .

# Construire le bundle de production (genere le dossier dist/)
RUN npm run build

# ─── ETAPE 2 : SERVEUR ──────────────────────────────
# Image finale : Nginx (serveur web leger)
# Node.js n'est PAS dans l'image finale = image 10x plus legere
FROM nginx:alpine

# Copier le resultat du build depuis l'etape "builder"
COPY --from=builder /app/dist /usr/share/nginx/html

# Copier notre configuration Nginx personnalisee
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

