# 🐳 Guide de Déploiement Docker - AI RISK MANAGER

## Vue d'ensemble

Ce guide explique comment déployer l'application AI RISK MANAGER avec Docker et Docker Compose, incluant l'intégration MCP complète.

## Architecture Docker

```
┌─────────────────────────────────────────────────────────────────┐
│                    Docker Compose Stack                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Frontend   │  │ API Gateway  │  │Test Execution│         │
│  │  (React +    │  │  (NestJS +   │  │   Service    │         │
│  │   Vite)      │  │     MCP)     │  │              │         │
│  │  Port: 3000  │  │  Port: 3001  │  │              │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                  │                  │                  │
│         └─────────┬────────┴──────────────────┘                 │
│                   │                                              │
│  ┌────────────────┼───────────────────────────────┐            │
│  │                ▼                                │            │
│  │  ┌──────────────────┐    ┌──────────────────┐ │            │
│  │  │   PostgreSQL     │    │      Redis       │ │            │
│  │  │  Port: 5432      │    │    Port: 6379    │ │            │
│  │  └──────────────────┘    └──────────────────┘ │            │
│  │                                                 │            │
│  │              Data Layer                         │            │
│  └─────────────────────────────────────────────────┘            │
│                                                                  │
│  ┌─────────────────────────────────────────────────┐           │
│  │           Monitoring & Tools                    │           │
│  │                                                  │           │
│  │  • Adminer (DB UI)        - Port: 8080         │           │
│  │  • Redis Commander        - Port: 8081         │           │
│  │  • Mailhog (Email)        - Port: 8025         │           │
│  │  • Prometheus (Metrics)   - Port: 9090         │           │
│  │  • Grafana (Dashboards)   - Port: 3002         │           │
│  └─────────────────────────────────────────────────┘           │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Services Disponibles

| Service | Port | Description | URL |
|---------|------|-------------|-----|
| **Frontend** | 3000 | Interface React + Vite | http://localhost:3000 |
| **API Gateway** | 3001 | Backend NestJS + MCP Server | http://localhost:3001 |
| **PostgreSQL** | 5432 | Base de données | localhost:5432 |
| **Redis** | 6379 | Cache et queues | localhost:6379 |
| **Adminer** | 8080 | Interface Web PostgreSQL | http://localhost:8080 |
| **Redis Commander** | 8081 | Interface Web Redis | http://localhost:8081 |
| **Mailhog** | 8025 | Interface test emails | http://localhost:8025 |
| **Prometheus** | 9090 | Métriques | http://localhost:9090 |
| **Grafana** | 3002 | Dashboards | http://localhost:3002 |

## Prérequis

- **Docker** 24.0+
- **Docker Compose** 2.20+
- **Git** (pour cloner le repository)
- Au minimum **4GB RAM** et **10GB disque**

Vérifier l'installation:
```bash
docker --version
docker compose version
```

## Configuration Rapide

### 1. Variables d'Environnement

Créer un fichier `.env` à la racine:

```bash
# Copier le template
cp .env.example .env
```

**Variables essentielles à configurer:**

```env
# Gemini API (OBLIGATOIRE pour le chatbot MCP)
GEMINI_API_KEY=votre-cle-api-gemini-ici

# JWT Secrets (générer avec: openssl rand -hex 64)
JWT_SECRET=votre-secret-jwt-ici
JWT_REFRESH_SECRET=votre-refresh-secret-ici

# Encryption (générer avec: openssl rand -hex 32)
ENCRYPTION_KEY=votre-cle-encryption-32-chars-ici

# OpenAI API (optionnel)
OPENAI_API_KEY=sk-...
```

### 2. Démarrage Rapide

```bash
# Construire et démarrer tous les services
docker compose up -d

# Vérifier les logs
docker compose logs -f

# Vérifier le statut
docker compose ps
```

### 3. Initialiser la Base de Données

Une fois les conteneurs démarrés:

```bash
# Entrer dans le conteneur API Gateway
docker compose exec api-gateway sh

# Générer le client Prisma
npx prisma generate

# Créer les tables
npx prisma db push

# Peupler avec données de démo
npx prisma db seed

# Sortir du conteneur
exit
```

### 4. Vérification

Ouvrir dans le navigateur:
- **Application**: http://localhost:3000
- **API Docs**: http://localhost:3001/api/docs
- **MCP Tools**: http://localhost:3001/api/v1/mcp/tools/list

Se connecter avec:
- Email: `admin@demo.airiskmgr.com`
- Password: `Demo123!`

## Commandes Docker Utiles

### Gestion des Services

```bash
# Démarrer tous les services
docker compose up -d

# Démarrer un service spécifique
docker compose up -d frontend
docker compose up -d api-gateway

# Arrêter tous les services
docker compose down

# Arrêter et supprimer les volumes (ATTENTION: perte de données)
docker compose down -v

# Redémarrer un service
docker compose restart api-gateway

# Voir les logs
docker compose logs -f api-gateway
docker compose logs -f frontend
docker compose logs -f postgres

# Voir le statut
docker compose ps

# Voir l'utilisation des ressources
docker stats
```

### Construction

```bash
# Reconstruire tous les services
docker compose build

# Reconstruire un service spécifique
docker compose build frontend

# Reconstruire sans cache
docker compose build --no-cache

# Reconstruire et redémarrer
docker compose up -d --build
```

### Debugging

```bash
# Accéder au shell d'un conteneur
docker compose exec api-gateway sh
docker compose exec frontend sh
docker compose exec postgres sh

# Exécuter une commande dans un conteneur
docker compose exec api-gateway npm run test
docker compose exec postgres psql -U airiskmgr -d airiskmgr_db

# Inspecter les logs d'un service
docker compose logs --tail=100 api-gateway

# Suivre les logs en temps réel
docker compose logs -f --tail=50
```

### Nettoyage

```bash
# Supprimer les conteneurs arrêtés
docker compose rm

# Nettoyer les images non utilisées
docker image prune -a

# Nettoyer les volumes non utilisés
docker volume prune

# Nettoyage complet Docker
docker system prune -a --volumes
```

## Déploiement en Production

### 1. Fichier docker-compose.prod.yml

Créer un fichier `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
      target: production  # Utiliser stage production
    environment:
      VITE_API_URL: https://api.votre-domaine.com
      VITE_MCP_API_URL: https://api.votre-domaine.com/api/v1/mcp
    restart: always

  api-gateway:
    build:
      context: ./backend
      dockerfile: apps/api-gateway/Dockerfile
      target: production
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}  # URL production
    restart: always

  postgres:
    volumes:
      - postgres_prod_data:/var/lib/postgresql/data
    restart: always

volumes:
  postgres_prod_data:
    driver: local
```

### 2. Démarrer en Production

```bash
# Utiliser le fichier de production
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Vérifier les logs
docker compose -f docker-compose.prod.yml logs -f
```

### 3. Configuration SSL/TLS

Utiliser un reverse proxy (nginx, Traefik) pour gérer HTTPS:

```yaml
# Exemple avec nginx-proxy
services:
  nginx-proxy:
    image: nginxproxy/nginx-proxy
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/tmp/docker.sock:ro
      - certs:/etc/nginx/certs

  frontend:
    environment:
      VIRTUAL_HOST: app.votre-domaine.com
      LETSENCRYPT_HOST: app.votre-domaine.com
```

## Sauvegardes

### Sauvegarder PostgreSQL

```bash
# Créer un backup
docker compose exec postgres pg_dump -U airiskmgr airiskmgr_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurer un backup
docker compose exec -T postgres psql -U airiskmgr -d airiskmgr_db < backup_20250127_120000.sql
```

### Sauvegarder Redis

```bash
# Sauvegarder Redis
docker compose exec redis redis-cli --rdb /data/backup.rdb SAVE
docker cp airiskmgr-redis:/data/backup.rdb ./redis_backup_$(date +%Y%m%d).rdb
```

### Sauvegarder les Volumes

```bash
# Créer un backup des volumes
docker run --rm \
  -v airiskmgr_postgres_data:/source:ro \
  -v $(pwd):/backup \
  alpine tar czf /backup/postgres_backup_$(date +%Y%m%d).tar.gz -C /source .
```

## Monitoring

### Prometheus + Grafana

1. Accéder à Grafana: http://localhost:3002
2. Login: `admin` / `admin`
3. Importer les dashboards pré-configurés

### Health Checks

Tous les services exposent des health checks:

```bash
# Frontend
curl http://localhost:3000/health

# API Gateway
curl http://localhost:3001/api/health

# PostgreSQL
docker compose exec postgres pg_isready -U airiskmgr

# Redis
docker compose exec redis redis-cli ping
```

## Troubleshooting

### Problème: Conteneur ne démarre pas

```bash
# Voir les logs détaillés
docker compose logs --tail=100 nom-service

# Vérifier la configuration
docker compose config

# Reconstruire le service
docker compose up -d --build nom-service
```

### Problème: Base de données vide

```bash
# Vérifier que PostgreSQL est prêt
docker compose exec postgres pg_isready

# Re-seed la base
docker compose exec api-gateway npx prisma db seed
```

### Problème: Port déjà utilisé

Modifier le port dans `docker-compose.yml`:

```yaml
services:
  frontend:
    ports:
      - "3005:3000"  # Utiliser port 3005 au lieu de 3000
```

### Problème: Permission denied

```bash
# Sur Linux, donner les permissions
sudo chown -R $USER:$USER .

# Ou exécuter Docker avec sudo
sudo docker compose up -d
```

### Problème: Out of memory

Augmenter la mémoire Docker:
- **Docker Desktop**: Settings → Resources → Memory (min 4GB)
- **Linux**: Modifier `/etc/docker/daemon.json`

## Optimisation des Performances

### 1. Build Cache

```bash
# Utiliser BuildKit pour builds plus rapides
DOCKER_BUILDKIT=1 docker compose build
```

### 2. Multi-stage Builds

Les Dockerfiles utilisent déjà des multi-stage builds pour optimiser la taille:
- Stage `development`: Avec hot-reload
- Stage `build`: Compilation
- Stage `production`: Image minimale

### 3. Volumes pour Node Modules

Les `docker-compose.yml` utilisent des volumes anonymes pour `node_modules` afin d'éviter les conflits:

```yaml
volumes:
  - ./backend:/app
  - /app/node_modules  # Volume anonyme
```

## Checklist de Déploiement

- [ ] Configurer `.env` avec clés API réelles
- [ ] Changer tous les secrets (JWT, encryption)
- [ ] Configurer DATABASE_URL production
- [ ] Activer HTTPS avec certificat SSL
- [ ] Configurer les backups automatiques
- [ ] Activer le monitoring (Prometheus + Grafana)
- [ ] Configurer les alertes
- [ ] Tester les health checks
- [ ] Vérifier les logs
- [ ] Tester le MCP chatbot avec données réelles

## Ressources

- **Docker Docs**: https://docs.docker.com
- **Docker Compose**: https://docs.docker.com/compose
- **NestJS Docker**: https://docs.nestjs.com/recipes/docker
- **Prisma**: https://www.prisma.io/docs/guides/deployment

## Support

Pour les problèmes Docker, vérifier:
1. Logs: `docker compose logs -f`
2. Status: `docker compose ps`
3. Config: `docker compose config`
4. Resources: `docker stats`

---

**Version**: 1.0.0
**Dernière mise à jour**: 2025-10-27
