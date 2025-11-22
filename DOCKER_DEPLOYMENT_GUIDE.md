# 🐳 Guide de Déploiement Docker sur VPS avec Traefik

## 📋 Prérequis

- VPS avec Docker et Docker Compose installés
- Traefik déjà configuré et en cours d'exécution
- Nom de domaine pointant vers votre VPS
- Accès SSH au VPS

## 🚀 Déploiement Rapide

### 1. Préparer les fichiers sur votre VPS

```bash
# Sur votre machine locale, transférer les fichiers
scp -r axiom-app/ user@votre-vps:/opt/axiom-app/

# Ou cloner depuis Git
ssh user@votre-vps
cd /opt
git clone https://github.com/votre-repo/axiom-app.git
cd axiom-app
```

### 2. Configurer les variables d'environnement

```bash
# Copier le fichier d'exemple
cp .env.docker .env

# Éditer avec vos vraies valeurs
nano .env
```

Remplissez les variables suivantes:
```env
DOMAIN=axiom.votre-domaine.com
GEMINI_API_KEY=votre_clé_gemini
SERPER_API_KEY=votre_clé_serper
FIREBASE_PROJECT_ID=axiom-app-3ec61
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@axiom-app-3ec61.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 3. Vérifier que Traefik est configuré

Assurez-vous que votre `docker-compose.yml` de Traefik contient:

```yaml
networks:
  traefik-network:
    external: true
```

Si le réseau n'existe pas, créez-le:
```bash
docker network create traefik-network
```

### 4. Construire et démarrer l'application

```bash
# Construire l'image
docker-compose build

# Démarrer en arrière-plan
docker-compose up -d

# Voir les logs
docker-compose logs -f
```

### 5. Vérifier le déploiement

```bash
# Vérifier que le conteneur tourne
docker ps | grep axiom

# Vérifier les logs
docker-compose logs axiom-app

# Tester l'application
curl https://axiom.votre-domaine.com
curl https://axiom.votre-domaine.com/api/health
```

## 🔧 Configuration Traefik

### Configuration minimale requise

Votre Traefik doit avoir:

1. **Entrypoints HTTP et HTTPS**:
```yaml
# Dans votre traefik.yml ou docker-compose.yml de Traefik
entryPoints:
  web:
    address: ":80"
  websecure:
    address: ":443"
```

2. **Certificats Let's Encrypt**:
```yaml
certificatesResolvers:
  letsencrypt:
    acme:
      email: votre-email@example.com
      storage: /letsencrypt/acme.json
      httpChallenge:
        entryPoint: web
```

3. **Réseau partagé**:
```bash
docker network create traefik-network
```

## 📊 Architecture du Déploiement

```
Internet
    ↓
Traefik (Port 80/443)
    ↓
┌─────────────────────────────────┐
│   Container: axiom-app          │
│                                 │
│  ┌──────────┐    ┌──────────┐  │
│  │  Nginx   │    │  Node.js │  │
│  │  (Port   │    │  (Port   │  │
│  │   80)    │    │  3000)   │  │
│  │          │    │          │  │
│  │ Frontend │    │   API    │  │
│  └──────────┘    └──────────┘  │
└─────────────────────────────────┘
```

### Routage Traefik

- `https://axiom.votre-domaine.com/` → Nginx (Frontend)
- `https://axiom.votre-domaine.com/api/*` → Node.js (API)

## 🔐 Sécurité

### 1. Fichier de credentials Firebase

Créez un fichier `firebase-credentials.json` sur votre VPS:

```bash
nano /opt/axiom-app/firebase-credentials.json
```

Collez vos credentials Firebase, puis modifiez le `docker-compose.yml`:

```yaml
volumes:
  - ./firebase-credentials.json:/app/functions/firebase-credentials.json:ro
```

Et dans le Dockerfile, ajoutez:
```dockerfile
ENV GOOGLE_APPLICATION_CREDENTIALS=/app/functions/firebase-credentials.json
```

### 2. Protéger les variables d'environnement

```bash
# Restreindre les permissions du fichier .env
chmod 600 .env
```

### 3. Firewall

```bash
# Autoriser seulement les ports nécessaires
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw enable
```

## 🔄 Mise à jour de l'application

### Mise à jour rapide

```bash
cd /opt/axiom-app

# Récupérer les dernières modifications
git pull

# Reconstruire et redémarrer
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Nettoyer les anciennes images
docker image prune -f
```

### Mise à jour sans interruption (zero-downtime)

```bash
# Construire la nouvelle image
docker-compose build

# Créer un nouveau conteneur sans arrêter l'ancien
docker-compose up -d --no-deps --build axiom-app

# Traefik basculera automatiquement vers le nouveau conteneur
```

## 📝 Commandes Utiles

### Logs et Monitoring

```bash
# Voir les logs en temps réel
docker-compose logs -f

# Logs seulement de l'app
docker-compose logs -f axiom-app

# Dernières 100 lignes
docker-compose logs --tail=100 axiom-app

# Statistiques de ressources
docker stats axiom-app
```

### Gestion du conteneur

```bash
# Redémarrer
docker-compose restart

# Arrêter
docker-compose down

# Arrêter et supprimer les volumes
docker-compose down -v

# Entrer dans le conteneur
docker-compose exec axiom-app sh
```

### Debugging

```bash
# Vérifier la configuration Nginx
docker-compose exec axiom-app nginx -t

# Tester l'API directement
docker-compose exec axiom-app curl http://localhost:3000/health

# Voir les processus dans le conteneur
docker-compose exec axiom-app ps aux
```

## 🐛 Dépannage

### Le site ne se charge pas

1. Vérifier que Traefik tourne:
   ```bash
   docker ps | grep traefik
   ```

2. Vérifier les logs Traefik:
   ```bash
   docker logs traefik
   ```

3. Vérifier que le conteneur est sur le bon réseau:
   ```bash
   docker network inspect traefik-network
   ```

### Erreur 502 Bad Gateway

1. Vérifier que les services sont démarrés dans le conteneur:
   ```bash
   docker-compose exec axiom-app ps aux
   ```

2. Vérifier les logs de l'application:
   ```bash
   docker-compose logs axiom-app
   ```

### Certificat SSL non généré

1. Vérifier les logs Traefik pour les erreurs ACME
2. S'assurer que le domaine pointe bien vers le VPS
3. Vérifier que le port 80 est accessible (requis pour le challenge HTTP)

## 📊 Monitoring et Performance

### Prometheus + Grafana (Optionnel)

Ajoutez ces labels à votre `docker-compose.yml`:

```yaml
labels:
  - "traefik.http.routers.axiom-frontend-secure.middlewares=metrics"
  - "traefik.http.middlewares.metrics.inflightreq.amount=100"
```

### Logs centralisés

Configurez un driver de logs:

```yaml
services:
  axiom-app:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## 🎯 Optimisations

### 1. Cache Docker

Utilisez BuildKit pour des builds plus rapides:
```bash
DOCKER_BUILDKIT=1 docker-compose build
```

### 2. Multi-stage build

Le Dockerfile utilise déjà un multi-stage build pour réduire la taille de l'image finale.

### 3. Health checks

Ajoutez un health check dans `docker-compose.yml`:

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

## 📞 Support

En cas de problème:
1. Vérifier les logs: `docker-compose logs -f`
2. Vérifier la configuration Traefik
3. Tester les endpoints directement
4. Consulter la documentation Docker et Traefik

## ✅ Checklist de déploiement

- [ ] VPS configuré avec Docker et Docker Compose
- [ ] Traefik installé et configuré
- [ ] Réseau `traefik-network` créé
- [ ] Domaine pointant vers le VPS
- [ ] Fichier `.env` configuré avec les bonnes valeurs
- [ ] Credentials Firebase configurés
- [ ] Application buildée et démarrée
- [ ] HTTPS fonctionnel
- [ ] API accessible et fonctionnelle
- [ ] Logs vérifiés
- [ ] Firewall configuré

🎉 **Votre application Axiom est maintenant déployée sur votre VPS avec Traefik !**
