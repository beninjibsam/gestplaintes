# 🚀 GestPlaintes — Guide de déploiement complet

## Stack technique
- **Backend** : Node.js + Express + PostgreSQL + JWT
- **Frontend** : React 18 + Vite + TailwindCSS + Recharts
- **Déploiement recommandé** : Render.com (gratuit)

---

## 1. DÉMARRAGE LOCAL (développement)

### Prérequis
- Node.js 18+
- PostgreSQL 14+ installé localement

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Éditez .env avec vos valeurs
npm run dev
```

### Base de données (première fois)
```bash
psql -U postgres -c "CREATE DATABASE plaintes_db;"
psql -U postgres -d plaintes_db -f models/init.sql
```

### Frontend
```bash
cd frontend
npm install
# Créez .env.local :
echo "VITE_API_URL=http://localhost:5000/api" > .env.local
npm run dev
```

**Accès local** : http://localhost:5173
**Admin par défaut** : `admin@societe.com` / `Admin@2026`
> ⚠️ Changez ce mot de passe immédiatement !

---

## 2. DÉPLOIEMENT RENDER.COM (recommandé — 100% gratuit)

### Étape 1 — Préparer GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/VOTRE_USER/gestplaintes.git
git push -u origin main
```

### Étape 2 — Base de données PostgreSQL
1. Aller sur https://render.com → **New** → **PostgreSQL**
2. Nom : `gestplaintes-db`
3. Plan : **Free**
4. Cliquez **Create Database**
5. Copiez la **Internal Database URL**
6. Dans la console SQL de Render, exécutez le contenu de `backend/models/init.sql`

### Étape 3 — Backend (Web Service)
1. **New** → **Web Service**
2. Connectez votre repo GitHub
3. **Root Directory** : `backend`
4. **Build Command** : `npm install`
5. **Start Command** : `node server.js`
6. **Plan** : Free
7. Variables d'environnement :
   ```
   DATABASE_URL    = [Internal DB URL de l'étape 2]
   JWT_SECRET      = [une chaîne aléatoire longue, ex: openssl rand -hex 32]
   NODE_ENV        = production
   FRONTEND_URL    = https://[votre-frontend].onrender.com
   MAIL_HOST       = smtp.gmail.com
   MAIL_PORT       = 587
   MAIL_USER       = votre@gmail.com
   MAIL_PASS       = [App Password Gmail]
   ```
8. Cliquez **Create Web Service**
9. Notez l'URL : `https://gestplaintes-api.onrender.com`

### Étape 4 — Frontend (Static Site)
1. **New** → **Static Site**
2. Connectez votre repo GitHub
3. **Root Directory** : `frontend`
4. **Build Command** : `npm install && npm run build`
5. **Publish Directory** : `dist`
6. Variables d'environnement :
   ```
   VITE_API_URL = https://gestplaintes-api.onrender.com/api
   ```
7. **Rewrite rules** : `/* → /index.html` (pour React Router)
8. Cliquez **Create Static Site**

### Résultat
✅ Frontend : `https://gestplaintes.onrender.com`
✅ Backend API : `https://gestplaintes-api.onrender.com`
✅ HTTPS automatique, CDN, SSL offert

---

## 3. DÉPLOIEMENT ON-PREMISE + FortiGate

### Serveur local (Ubuntu/Debian)
```bash
# Installation Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PostgreSQL
sudo apt install postgresql -y
sudo -u postgres createdb plaintes_db
sudo -u postgres psql plaintes_db < backend/models/init.sql

# PM2 (process manager)
sudo npm install -g pm2

# Lancer le backend
cd backend && npm install
pm2 start server.js --name gestplaintes-api
pm2 startup && pm2 save

# Build frontend
cd frontend && npm install
VITE_API_URL=https://votre-domaine.com/api npm run build
# Servir le build avec nginx (voir ci-dessous)
```

### Nginx (reverse proxy)
```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    # Frontend (React)
    location / {
        root /var/www/gestplaintes/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Uploads
    location /uploads {
        proxy_pass http://localhost:5000;
    }
}
```

### FortiGate — Virtual IP / DNAT
```
# Dans FortiGate : Policy & Objects > Virtual IPs
Nom         : GestPlaintes-VIP
Interface   : WAN (port1)
External IP : [IP publique WAN]
Mapped IP   : [IP serveur interne, ex: 192.168.1.50]
External port : 443
Mapped port   : 80 (ou 443 si SSL terminé sur nginx)

# Firewall Policy
Source      : all (ou subnet spécifique)
Destination : GestPlaintes-VIP
Service     : HTTPS
Action      : ACCEPT
NAT         : Activé
```

> Pour HTTPS avec FortiGate en SSL inspection, utilisez un certificat Let's Encrypt sur nginx :
> ```bash
> sudo apt install certbot python3-certbot-nginx
> sudo certbot --nginx -d votre-domaine.com
> ```

---

## 4. ALTERNATIVE — Railway.app (simple, 5$/mois)

```bash
# Installer Railway CLI
npm install -g @railway/cli
railway login

# Backend
cd backend
railway init
railway add --service postgresql
railway up

# Frontend
cd frontend
railway init
railway up
```

---

## 5. ALTERNATIVE — Fly.io (Docker, free tier)

### Dockerfile backend
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

```bash
fly launch --name gestplaintes-api
fly secrets set DATABASE_URL="..." JWT_SECRET="..."
fly deploy
```

---

## 6. COMPTES ET ACCÈS

| Compte | Email | Mot de passe | Rôle |
|--------|-------|--------------|------|
| Admin défaut | admin@societe.com | Admin@2026 | Administrateur |
| Commerciaux | Auto-enrôlement | Choisi lors de l'inscription | Commercial |

> **Sécurité** : Changez le mot de passe admin dès le premier déploiement !

---

## 7. FONCTIONNALITÉS

### Côté Commercial
- ✅ Auto-inscription avec email personnel
- ✅ Formulaire de plainte en 4 étapes guidées
- ✅ Vue de ses plaintes uniquement (middleware sécurisé)
- ✅ Suivi des statuts en temps réel
- ✅ Historique des actions
- ✅ Notifications email à chaque changement de statut
- ✅ Upload de pièces jointes (5 Mo max)

### Côté Admin
- ✅ Dashboard avec graphiques (recharts)
- ✅ Vue de TOUTES les plaintes
- ✅ Filtres avancés (service, statut, priorité, ancienneté)
- ✅ Modification statut + assignation + commentaire
- ✅ Gestion des utilisateurs (activer/suspendre/rôle/reset mdp)
- ✅ Indicateur ancienneté J+N avec code couleur
- ✅ Top services / top déclarants
- ✅ Notifications email automatiques

---

## 8. VARIABLES D'ENVIRONNEMENT

### Backend (.env)
| Variable | Description | Exemple |
|----------|-------------|---------|
| DATABASE_URL | Connection string PostgreSQL | postgresql://user:pass@host/db |
| JWT_SECRET | Clé secrète JWT (min 32 chars) | changez_ceci_absolument |
| PORT | Port du serveur | 5000 |
| FRONTEND_URL | URL du frontend (CORS) | https://app.onrender.com |
| MAIL_HOST | Serveur SMTP | smtp.gmail.com |
| MAIL_PORT | Port SMTP | 587 |
| MAIL_USER | Email expéditeur | notif@gmail.com |
| MAIL_PASS | App Password Gmail | xxxx xxxx xxxx xxxx |

### Frontend (.env / Render env vars)
| Variable | Description |
|----------|-------------|
| VITE_API_URL | URL de l'API backend |

---

## 9. SÉCURITÉ

- JWT avec expiration 7 jours
- Bcrypt (rounds=10) pour les mots de passe
- Middleware : commercial ne voit que SES plaintes
- CORS restreint au domaine frontend
- Validation des fichiers uploadés (type + taille)
- SSL/HTTPS obligatoire en production
- Variables sensibles en variables d'environnement (jamais dans le code)
