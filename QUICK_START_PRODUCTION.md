# 🚀 QUICK START - PRODUCTION DEPLOYMENT

**Démarrage rapide de la plateforme unifiée de pentest AI en production**

---

## ⚡ Déploiement Express (5 Minutes)

### Prérequis

- Docker Engine ≥ 20.10
- Docker Compose ≥ 2.0
- 16 GB RAM minimum
- 50 GB espace disque

### Étape 1: Configuration (2 min)

```bash
# 1. Copier le template d'environnement
cp .env.production.example .env.production

# 2. Générer des secrets forts
echo "POSTGRES_PASSWORD=$(openssl rand -base64 32)" >> .env.production
echo "REDIS_PASSWORD=$(openssl rand -base64 32)" >> .env.production
echo "JWT_SECRET=$(openssl rand -base64 48)" >> .env.production
echo "ENCRYPTION_KEY=$(openssl rand -hex 32)" >> .env.production
echo "GITHUB_WEBHOOK_SECRET=$(openssl rand -base64 32)" >> .env.production
echo "MINIO_ROOT_PASSWORD=$(openssl rand -base64 32)" >> .env.production
echo "GRAFANA_PASSWORD=$(openssl rand -base64 16)" >> .env.production

# 3. Éditer .env.production pour ajouter vos clés API
nano .env.production
# Remplacer:
# - GEMINI_API_KEY=your_gemini_api_key_here
# - OPENAI_API_KEY=sk-your_openai_key_here
# - GROQ_API_KEY=your_groq_api_key_here
# - CORS_ORIGIN=https://your-domain.com
```

### Étape 2: Déploiement (3 min)

```bash
# 1. Rendre le script exécutable
chmod +x scripts/deploy.sh

# 2. Lancer le déploiement
./scripts/deploy.sh

# ⏳ Attendre 2-3 minutes pendant que les services démarrent...
```

### Étape 3: Vérification (30 sec)

```bash
# Vérifier que tous les services sont UP
docker-compose -f docker-compose.production.yml ps

# Tester les health checks
curl http://localhost:3003/health  # API Gateway
curl http://localhost:3005/health  # GitHub Sync
```

---

## 🎯 Accès aux Services

Une fois déployé, accédez aux interfaces:

| Service | URL | Identifiants |
|---------|-----|--------------|
| **Frontend** | http://localhost:3004 | - |
| **API Gateway** | http://localhost:3003 | - |
| **API Docs (Swagger)** | http://localhost:3003/api/docs | - |
| **Grafana** | http://localhost:3002 | admin / `$GRAFANA_PASSWORD` |
| **Prometheus** | http://localhost:9090 | - |
| **Kibana** | http://localhost:5601 | - |
| **MinIO Console** | http://localhost:9001 | `$MINIO_ROOT_USER` / `$MINIO_ROOT_PASSWORD` |

---

## 🔧 Configuration GitHub Webhooks (Optionnel)

Pour activer l'auto-update depuis GitHub:

### Pour chaque repository (Promptfoo, Garak, Strix):

1. Aller dans **Settings** → **Webhooks** → **Add webhook**

2. Configurer:
   ```
   Payload URL: https://your-domain.com:3005/webhook
   Content type: application/json
   Secret: <valeur de GITHUB_WEBHOOK_SECRET>
   Events: Just the push event
   Active: ✅
   ```

3. Tester en poussant un tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

4. Vérifier les logs:
   ```bash
   docker-compose -f docker-compose.production.yml logs -f github-sync
   ```

---

## 📊 Monitoring Rapide

### Vérifier l'état des services

```bash
# Status de tous les containers
docker-compose -f docker-compose.production.yml ps

# Logs en temps réel
docker-compose -f docker-compose.production.yml logs -f

# Logs d'un service spécifique
docker-compose -f docker-compose.production.yml logs -f api-gateway
docker-compose -f docker-compose.production.yml logs -f github-sync
```

### Métriques Prometheus

Accéder à http://localhost:9090 et exécuter ces requêtes:

```promql
# Services UP
up{job="api-gateway"}
up{job="github-sync"}

# Taux d'erreur
rate(test_runs_total{status="failure"}[5m])

# Déploiements
deployments_total

# Vulnérabilités trouvées
vulnerabilities_found_total
```

### Dashboards Grafana

1. Ouvrir http://localhost:3002
2. Login: `admin` / mot de passe depuis `.env.production`
3. Aller dans **Dashboards**
4. Créer un nouveau dashboard avec les métriques ci-dessus

---

## 🔥 Commandes Utiles

### Gestion des services

```bash
# Démarrer tous les services
docker-compose -f docker-compose.production.yml up -d

# Arrêter tous les services
docker-compose -f docker-compose.production.yml down

# Redémarrer un service spécifique
docker-compose -f docker-compose.production.yml restart api-gateway

# Voir les logs
docker-compose -f docker-compose.production.yml logs -f <service-name>

# Entrer dans un container
docker-compose -f docker-compose.production.yml exec <service-name> sh
```

### Health Checks

```bash
# Script de vérification rapide
cat > check-health.sh << 'EOF'
#!/bin/bash
echo "🏥 Health Checks..."
echo -n "API Gateway: " && curl -sf http://localhost:3003/health && echo "✅" || echo "❌"
echo -n "GitHub Sync: " && curl -sf http://localhost:3005/health && echo "✅" || echo "❌"
echo -n "Prometheus: " && curl -sf http://localhost:9090/-/healthy && echo "✅" || echo "❌"
echo -n "Grafana: " && curl -sf http://localhost:3002/api/health && echo "✅" || echo "❌"
EOF

chmod +x check-health.sh
./check-health.sh
```

### Backup Base de Données

```bash
# Backup manuel
mkdir -p backups/$(date +%Y%m%d-%H%M%S)
docker-compose -f docker-compose.production.yml exec -T postgres \
  pg_dump -U airiskmgr -d airiskmgr_db -Fc > backups/$(date +%Y%m%d-%H%M%S)/db-backup.dump

# Restaurer depuis backup
docker-compose -f docker-compose.production.yml exec -T postgres \
  pg_restore -U airiskmgr -d airiskmgr_db -c /path/to/backup.dump
```

---

## 🐛 Troubleshooting Rapide

### Problème: Service ne démarre pas

```bash
# Voir les logs détaillés
docker-compose -f docker-compose.production.yml logs <service-name>

# Vérifier la config
docker-compose -f docker-compose.production.yml config

# Redémarrer le service
docker-compose -f docker-compose.production.yml restart <service-name>
```

### Problème: Health check échoue

```bash
# Vérifier l'état du container
docker inspect <container-name>

# Tester le health check manuellement
docker-compose -f docker-compose.production.yml exec <service-name> curl -f http://localhost:3000/health

# Vérifier les ressources
docker stats
```

### Problème: Connexion base de données échoue

```bash
# Vérifier que PostgreSQL est UP
docker-compose -f docker-compose.production.yml exec postgres pg_isready -U airiskmgr

# Vérifier les logs PostgreSQL
docker-compose -f docker-compose.production.yml logs postgres

# Tester la connexion
docker-compose -f docker-compose.production.yml exec postgres psql -U airiskmgr -d airiskmgr_db -c "SELECT 1;"
```

### Problème: Webhook GitHub ne fonctionne pas

```bash
# Vérifier les logs du service
docker-compose -f docker-compose.production.yml logs -f github-sync

# Tester localement
PAYLOAD='{"ref":"refs/tags/v1.0.0","repository":{"full_name":"test/repo","clone_url":"https://github.com/test/repo.git"},"commits":[]}'
SECRET="your_webhook_secret"
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" | sed 's/^.* //')

curl -X POST http://localhost:3005/webhook \
  -H "Content-Type: application/json" \
  -H "X-Hub-Signature-256: sha256=$SIGNATURE" \
  -d "$PAYLOAD"
```

---

## 🔄 Rollback d'Urgence

Si un problème critique survient:

```bash
# 1. Arrêter les services
docker-compose -f docker-compose.production.yml down

# 2. Restaurer la base de données
docker-compose -f docker-compose.production.yml up -d postgres
docker-compose -f docker-compose.production.yml exec -T postgres \
  pg_restore -U airiskmgr -d airiskmgr_db -c /path/to/backup.dump

# 3. Redémarrer avec ancienne version
git checkout <previous-commit>
./scripts/deploy.sh

# 4. Vérifier
./check-health.sh
```

### Rollback d'un outil spécifique

```bash
# Rollback Promptfoo uniquement
curl -X POST http://localhost:3005/rollback/promptfoo \
  -H "Content-Type: application/json" \
  -d '{"tool":"promptfoo"}'

# Rollback Garak
curl -X POST http://localhost:3005/rollback/garak \
  -H "Content-Type: application/json" \
  -d '{"tool":"garak"}'

# Rollback Strix
curl -X POST http://localhost:3005/rollback/strix \
  -H "Content-Type: application/json" \
  -d '{"tool":"strix"}'
```

---

## 📈 Optimisation Production

### Augmenter les ressources pour un service

Éditer `docker-compose.production.yml`:

```yaml
services:
  api-gateway:
    deploy:
      resources:
        limits:
          cpus: '4'  # Augmenter de 2 à 4
          memory: 4G  # Augmenter de 2G à 4G
```

Puis redémarrer:
```bash
docker-compose -f docker-compose.production.yml up -d api-gateway
```

### Activer le scaling horizontal

```bash
# Scaler un service (ex: 3 instances de promptfoo)
docker-compose -f docker-compose.production.yml up -d --scale promptfoo-service=3
```

---

## 📞 Support

### Documentation Complète
- Architecture: `ENTERPRISE_ARCHITECTURE_PENTEST_PLATFORM.md`
- Implémentation: `IMPLEMENTATION_UNIFIED_PLATFORM.md`
- Checklist: `DEPLOYMENT_CHECKLIST.md`

### Commandes de Diagnostic

```bash
# Rapport complet
cat > diagnostic.sh << 'EOF'
#!/bin/bash
echo "=== DIAGNOSTIC REPORT ==="
echo "Date: $(date)"
echo ""
echo "=== DOCKER INFO ==="
docker --version
docker-compose --version
docker info | grep -E "CPUs|Total Memory|Server Version"
echo ""
echo "=== SERVICES STATUS ==="
docker-compose -f docker-compose.production.yml ps
echo ""
echo "=== DISK USAGE ==="
df -h | grep -E "Filesystem|/$"
echo ""
echo "=== CONTAINER STATS ==="
docker stats --no-stream
echo ""
echo "=== HEALTH CHECKS ==="
curl -sf http://localhost:3003/health && echo "API Gateway: ✅" || echo "API Gateway: ❌"
curl -sf http://localhost:3005/health && echo "GitHub Sync: ✅" || echo "GitHub Sync: ❌"
echo ""
echo "=== RECENT ERRORS (last 50 lines) ==="
docker-compose -f docker-compose.production.yml logs --tail=50 | grep -i error
EOF

chmod +x diagnostic.sh
./diagnostic.sh > diagnostic-report.txt
```

---

## ✅ Checklist Post-Déploiement

- [ ] Tous les services sont UP
- [ ] Health checks passent
- [ ] Grafana accessible et configuré
- [ ] Prometheus scrape les métriques
- [ ] Logs visibles dans Kibana
- [ ] Backup automatique configuré
- [ ] Webhooks GitHub configurés (optionnel)
- [ ] Alertes Slack/Email testées (optionnel)
- [ ] Documentation à jour
- [ ] Équipe formée

---

## 🎉 Félicitations !

Votre plateforme unifiée de pentest AI est maintenant en production !

**Prochaines étapes**:
1. Configurer les dashboards Grafana personnalisés
2. Créer des alertes PagerDuty pour les incidents critiques
3. Implémenter le frontend unifié (voir `IMPLEMENTATION_UNIFIED_PLATFORM.md`)
4. Tester l'auto-update en poussant des tags GitHub

---

**Generated by Claude Code - Enterprise AI Pentest Platform**
**Version**: 1.0.0
**Date**: 2025-11-05
