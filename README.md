# Déploiement local avec Docker

> Portfolio full-stack (React + Express + MongoDB) conteneurisé et lancé
> en une seule commande via Docker Compose.

---

## Pourquoi Docker ?

En développement classique, lancer ce projet demande :
- Installer Node.js (et la bonne version)
- Installer MongoDB et le démarrer comme service
- Lancer le backend (`npm run dev`)
- Lancer le frontend (`npm run dev`)
- Gérer les conflits de ports, les versions, etc.

Avec Docker, tout ça est **encapsulé** dans des conteneurs.
Une seule commande suffit, sur n'importe quelle machine.

---

## Architecture des conteneurs

Quand tu lances `docker compose up`, Docker crée **3 conteneurs**
qui communiquent entre eux via un réseau interne privé :

```
ton navigateur
      │
      │  http://localhost  (port 80)
      ▼
┌─────────────────────────────────────────────────────┐
│  CONTENEUR  frontend  — Nginx                       │
│                                                     │
│  • sert les fichiers React compilés (HTML/CSS/JS)   │
│  • quand l'URL commence par /api → redirige vers    │
│    le conteneur backend (proxy inverse)             │
└──────────────────────────┬──────────────────────────┘
                           │ réseau interne Docker
                           │ (portfolio-net)
                           ▼
┌─────────────────────────────────────────────────────┐
│  CONTENEUR  backend  — Node.js / Express            │
│                                                     │
│  • reçoit les requêtes /api/projects                │
│  • applique la logique métier (CRUD)                │
│  • lit/écrit dans MongoDB                           │
└──────────────────────────┬──────────────────────────┘
                           │ réseau interne Docker
                           ▼
┌─────────────────────────────────────────────────────┐
│  CONTENEUR  mongodb  — MongoDB 7                    │
│                                                     │
│  • base de données                                  │
│  • données stockées dans un volume Docker           │
│    (persistent même si le conteneur est supprimé)   │
└─────────────────────────────────────────────────────┘
```

**Point clé :** seul le port 80 est exposé vers ta machine.
Les ports 5000 (backend) et 27017 (MongoDB) restent internes à Docker,
invisibles depuis l'extérieur. C'est plus sécurisé.

---

## Structure du dossier

```
deploiement-local-avec-docker/
│
├── docker-compose.yml          ← chef d'orchestre : décrit les 3 conteneurs
│
├── backend/
│   ├── Dockerfile              ← recette pour construire l'image backend
│   ├── .dockerignore           ← fichiers à exclure du build Docker
│   ├── app.js                  ← point d'entrée Express
│   ├── package.json
│   └── src/
│       ├── config/database.js
│       ├── controllers/projectController.js
│       ├── models/Project.js
│       └── routes/projectRoutes.js
│
└── frontend/
    ├── Dockerfile              ← recette en 2 étapes : build React + Nginx
    ├── .dockerignore
    ├── nginx.conf              ← config Nginx : fichiers statiques + proxy /api
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── api.js
        ├── main.jsx
        ├── components/
        └── pages/
```

---

## Prérequis

Un seul outil à installer : **Docker Desktop**

- macOS / Windows → https://www.docker.com/products/docker-desktop
- Linux → https://docs.docker.com/engine/install/

Vérifie l'installation :

```bash
docker --version        # ex : Docker version 26.1.4
docker compose version  # ex : Docker Compose version v2.27.1
```

> Assure-toi que Docker Desktop est **lancé** (icône dans la barre système)
> avant de continuer.

---

## Lancer l'application

### 1. Se placer dans ce dossier

```bash
cd deploiement-local-avec-docker
```

### 2. Construire les images et démarrer les conteneurs

```bash
docker compose up --build
```

Que fait cette commande ?
- `--build` : lit chaque `Dockerfile` et construit les images localement
- Lance les 3 conteneurs dans le bon ordre (MongoDB → backend → frontend)
- Affiche les logs en temps réel dans ton terminal

> **Première fois :** Docker télécharge les images de base
> (`node:20-alpine`, `nginx:alpine`, `mongo:7`). Cela prend 1 à 3 minutes
> selon ta connexion. Les fois suivantes, le **cache** accélère tout.

### 3. Ouvrir dans le navigateur

```
http://localhost
```

L'API directement :

```
http://localhost/api/projects
```

### 4. Arrêter

```bash
# Dans le terminal où tourne Docker : Ctrl + C
# Puis pour supprimer les conteneurs :
docker compose down
```

---

## Lancer en arrière-plan

```bash
# Démarrer sans bloquer le terminal
docker compose up --build -d

# Voir les logs
docker compose logs -f

# Voir les logs d'un seul service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mongodb

# Arrêter
docker compose down
```

---

## Comprendre les fichiers Docker

### `docker-compose.yml` — l'orchestrateur

Ce fichier décrit les 3 services, leurs relations, et le réseau qui les relie.

**Ordre de démarrage contrôlé :**

```yaml
backend:
  depends_on:
    mongodb:
      condition: service_healthy   # attend que MongoDB soit PRÊT
```

Sans ça, le backend pourrait démarrer avant que MongoDB soit prêt
à accepter des connexions → crash immédiat.
Le `healthcheck` sur MongoDB envoie un ping toutes les 10 secondes
et retente jusqu'à 5 fois avant d'échouer.

**Variables d'environnement passées au backend :**

```yaml
environment:
  - MONGODB_URI=mongodb://mongodb:27017/portfolio
  - PORT=5000
  - CORS_ORIGIN=http://localhost
```

`mongodb` (dans l'URI) n'est pas `localhost` — c'est le **nom du service**
dans docker-compose.yml. Docker résout ce nom via son DNS interne :
il sait que `mongodb` = l'adresse IP du conteneur MongoDB.

**Réseau interne :**

```yaml
networks:
  portfolio-net:
    driver: bridge
```

Tous les conteneurs sont sur ce réseau privé.
Ils se voient entre eux par leur nom de service.
L'extérieur ne voit que le port 80.

---

### `backend/Dockerfile` — recette en 1 étape

```dockerfile
FROM node:20-alpine          # image de base légère (~50 Mo vs ~900 Mo pour node:20)

WORKDIR /app                 # dossier de travail dans le conteneur

COPY package*.json ./        # ① copie les fichiers de dépendances EN PREMIER
RUN npm install --omit=dev   # ② installe (mis en cache si package.json n'a pas changé)
COPY . .                     # ③ copie le code source ensuite

EXPOSE 5000
CMD ["node", "app.js"]
```

**Pourquoi cet ordre `COPY package*.json` → `RUN npm install` → `COPY . .` ?**

Docker construit les images **couche par couche**.
Si le code source change mais pas `package.json`, Docker réutilise
le cache jusqu'à l'étape `npm install` et ne réinstalle pas les dépendances.
Le rebuild ne prend alors que quelques secondes.

Si tu inversais l'ordre (`COPY . .` en premier), le moindre changement
dans ton code forcerait un `npm install` complet à chaque rebuild.

---

### `frontend/Dockerfile` — recette en 2 étapes (multi-stage build)

```dockerfile
# ── ÉTAPE 1 : BUILDER ──────────────────────────
FROM node:20-alpine AS builder    # nommée "builder"

WORKDIR /app
COPY package.json ./
RUN npm install --legacy-peer-deps
RUN npm install vite@5.4.0 @vitejs/plugin-react@4.3.4 --save-dev --legacy-peer-deps

COPY . .
RUN npm run build                 # génère le dossier dist/

# ── ÉTAPE 2 : SERVEUR FINAL ────────────────────
FROM nginx:alpine                 # image Nginx ultra-légère

COPY --from=builder /app/dist /usr/share/nginx/html   # ← uniquement le résultat
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Pourquoi 2 étapes ?**

L'étape 1 (builder) a besoin de Node.js pour compiler React.
Mais une fois la compilation faite, Node.js n'est **plus utile**.
L'étape 2 copie uniquement le dossier `dist/` (fichiers HTML/CSS/JS statiques)
dans une image Nginx vierge.

Résultat : l'image finale fait ~25 Mo au lieu de ~300 Mo.
Node.js, npm, les dépendances de build → rien de tout ça n'est dans la prod.

---

### `frontend/nginx.conf` — 2 rôles en un

```nginx
server {
    listen 80;

    # RÔLE 1 : servir les fichiers React statiques
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;   # ← clé pour React Router
    }

    # RÔLE 2 : proxy inverse vers le backend
    location /api {
        proxy_pass http://backend:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 60s;
    }
}
```

**`try_files $uri $uri/ /index.html` — pourquoi c'est important ?**

React Router gère la navigation côté client (dans le navigateur).
Si tu navigues vers `/projets` et que tu actualises la page,
Nginx cherche un fichier `/projets` qui n'existe pas → erreur 404.
Avec `try_files ... /index.html`, Nginx renvoie toujours `index.html`
et React Router prend le relais pour afficher la bonne page.

**`proxy_pass http://backend:5000` — le proxy inverse**

Quand ton frontend appelle `/api/projects`, Nginx intercepte la requête
et la transmet à `http://backend:5000/api/projects`.
Le navigateur ne sait pas que le backend existe à une autre adresse —
tout passe par le port 80.

---

## Persistance des données

Les données MongoDB sont stockées dans un **volume Docker** nommé `mongo_data` :

```yaml
volumes:
  mongo_data:          # volume géré par Docker

mongodb:
  volumes:
    - mongo_data:/data/db    # monté dans le conteneur MongoDB
```

Un volume Docker est un espace de stockage **géré par Docker**,
indépendant du cycle de vie des conteneurs.
Si tu fais `docker compose down` puis `docker compose up`,
tes données sont toujours là.

| Commande | Conteneurs | Volume / données |
|----------|-----------|------------------|
| `docker compose down` | Supprimés | ✅ Conservées |
| `docker compose down -v` | Supprimés | ❌ Effacées |
| `docker compose up` | Recréés | ✅ Retrouvées |

---

## Commandes utiles

```bash
# Voir les conteneurs en cours d'exécution
docker compose ps

# Voir les logs en temps réel (tous les services)
docker compose logs -f

# Entrer dans le shell du conteneur backend
docker compose exec backend sh

# Entrer dans MongoDB via mongosh
docker compose exec mongodb mongosh

# Reconstruire un seul service (ex: après modif du code backend)
docker compose up --build backend

# Tout effacer et repartir de zéro (conteneurs + volumes)
docker compose down -v
docker compose up --build
```

---

## Problèmes fréquents

**Erreur : port 80 déjà utilisé**

Un autre programme (WAMP, Apache, XAMPP...) occupe le port 80.
Change le mapping dans `docker-compose.yml` :

```yaml
frontend:
  ports:
    - "8080:80"    # accès sur http://localhost:8080
```

**Le backend crashe au démarrage**

Vérifie que MongoDB a bien démarré :

```bash
docker compose logs mongodb
```

Si MongoDB n'est pas encore prêt, le healthcheck retente automatiquement.
Tu peux aussi relancer manuellement :

```bash
docker compose restart backend
```

** Modifications du code non prises en compte**

Docker garde les images en cache. Après avoir modifié du code source :

```bash
docker compose up --build
```

Le `--build` force la reconstruction des images depuis les Dockerfiles.
