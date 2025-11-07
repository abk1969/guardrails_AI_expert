# HashiCorp Vault Integration

Gestion sécurisée des secrets pour la plateforme unifiée de pentest AI.

## Vue d'ensemble

Cette intégration Vault permet de:
- Stocker tous les secrets de manière centralisée et sécurisée
- Rotation automatique des secrets
- Audit complet des accès aux secrets
- Contrôle d'accès granulaire via policies
- Chiffrement des secrets au repos et en transit

## Architecture

```
┌─────────────────────┐
│   Applications      │
│  (API Gateway,      │
│   GitHub Sync,      │
│   etc.)             │
└──────────┬──────────┘
           │ VAULT_TOKEN
           │ (app-policy)
           ▼
┌─────────────────────┐
│   Vault Service     │
│  (NestJS Module)    │
└──────────┬──────────┘
           │ HTTP API
           │ (port 8200)
           ▼
┌─────────────────────┐
│  HashiCorp Vault    │
│  (Docker Container) │
│                     │
│  - KV Secrets v2    │
│  - Policies         │
│  - Audit Log        │
└─────────────────────┘
```

## Installation

### 1. Démarrer Vault

```bash
# Avec docker-compose.production.yml
docker-compose -f docker-compose.production.yml \
               -f infrastructure/vault/docker-compose.vault.yml \
               up -d vault

# Vérifier que Vault est démarré
docker logs vault
```

### 2. Initialiser Vault

```bash
# Depuis la racine du projet
cd infrastructure/vault
chmod +x init-vault.sh
./init-vault.sh
```

Le script va:
1. Initialiser Vault (génération de 5 unseal keys)
2. Unseal Vault avec 3 clés
3. Créer le secrets engine KV v2
4. Charger tous les secrets depuis `.env.production`
5. Créer les policies (app-policy, admin-policy)
6. Générer un token application

### 3. Sauvegarder les clés

**CRITIQUE** : Le fichier `vault-keys.json` contient:
- 5 unseal keys
- Root token

**Actions requises**:
```bash
# 1. Copier vault-keys.json dans un endroit sécurisé
cp vault-keys.json /path/to/secure/storage/

# 2. Supprimer du serveur
rm vault-keys.json

# 3. Stocker dans:
# - HSM (Hardware Security Module)
# - Password manager (1Password, Bitwarden)
# - Encrypted backup
```

### 4. Configuration Application

Ajouter à `.env.production`:

```bash
# HashiCorp Vault
VAULT_ENABLED=true
VAULT_ADDR=http://vault:8200
VAULT_TOKEN=<app-token-from-init-script>
VAULT_MOUNT_PATH=secret
VAULT_NAMESPACE=  # Optionnel pour Vault Enterprise
```

### 5. Mettre à jour le code

Dans `api-gateway/src/app.module.ts`:

```typescript
import { VaultModule } from '@app/vault-integration';

@Module({
  imports: [
    VaultModule,  // Add this
    // ... autres modules
  ],
})
export class AppModule {}
```

## Utilisation

### Dans les Services NestJS

```typescript
import { Injectable } from '@nestjs/common';
import { VaultService } from '@app/vault-integration';

@Injectable()
export class MyService {
  constructor(private readonly vaultService: VaultService) {}

  async doSomething() {
    // Get database credentials
    const dbCreds = await this.vaultService.getDatabaseCredentials();

    // Get API key
    const openaiKey = await this.vaultService.getApiKey('openai');

    // Get custom secret
    const mySecret = await this.vaultService.getSecret('my-app/config', 'apiKey');
  }
}
```

### Méthodes Disponibles

#### Credentials Prédéfinies

```typescript
// Database
await vaultService.getDatabaseCredentials();
// Returns: { url, username, password }

// API Keys
await vaultService.getApiKey('openai');
await vaultService.getApiKey('gemini');
await vaultService.getApiKey('groq');

// JWT
await vaultService.getJwtSecrets();
// Returns: { secret, expiration, refreshExpiration }

// Encryption
await vaultService.getEncryptionKey();

// GitHub Webhook
await vaultService.getGitHubWebhookSecret();
```

#### Opérations Génériques

```typescript
// Read secret
await vaultService.getSecret('path/to/secret');
await vaultService.getSecret('path/to/secret', 'key');

// Write secret
await vaultService.setSecret('path/to/secret', {
  key1: 'value1',
  key2: 'value2'
});

// Delete secret
await vaultService.deleteSecret('path/to/secret');

// List secrets
await vaultService.listSecrets('path/');
```

#### Health Check

```typescript
const health = await vaultService.healthCheck();
// Returns: { healthy: boolean, message: string }
```

## Secrets Stockés

### Structure

```
secret/
├── database/
│   └── credentials
│       ├── url
│       ├── username
│       └── password
├── redis/
│   └── credentials
│       ├── url
│       └── password
├── jwt/
│   └── secrets
│       ├── secret
│       ├── expiration
│       └── refreshExpiration
├── encryption/
│   └── key
│       └── key
├── api-keys/
│   ├── gemini
│   │   └── key
│   ├── openai
│   │   └── key
│   ├── groq
│   │   └── key
│   └── cohere
│       └── key
├── github/
│   └── webhook-secret
│       └── secret
├── minio/
│   └── credentials
│       ├── rootUser
│       └── rootPassword
├── grafana/
│   └── credentials
│       └── password
├── slack/
│   └── webhook
│       ├── url
│       └── channel
└── smtp/
    └── credentials
        ├── host
        ├── port
        ├── user
        ├── password
        └── from
```

## Policies

### app-policy (Application)

Permissions:
- ✅ Read all secrets
- ✅ List secrets
- ❌ Write secrets
- ❌ Delete secrets

Usage: Token pour les applications (API Gateway, GitHub Sync, etc.)

### admin-policy (Administration)

Permissions:
- ✅ Full access to secrets (CRUD)
- ✅ Manage policies
- ✅ Manage tokens
- ✅ System configuration

Usage: Token pour les administrateurs

## Rotation des Secrets

### Manuelle via CLI

```bash
# Se connecter à Vault
export VAULT_ADDR=http://localhost:8200
export VAULT_TOKEN=<admin-token>

# Générer nouveau secret
NEW_SECRET=$(openssl rand -base64 32)

# Mettre à jour
vault kv put secret/jwt/secrets secret="$NEW_SECRET"

# Redémarrer les applications
docker-compose restart api-gateway
```

### Automatique via API

```typescript
// Générer et stocker nouveau secret
const newSecret = crypto.randomBytes(32).toString('base64');
await vaultService.setSecret('jwt/secrets', {
  secret: newSecret,
  rotatedAt: new Date().toISOString()
});

// Notifier les applications (via event ou restart)
```

### Scheduled Rotation (Cron)

```bash
# Ajouter au crontab
0 2 * * 0 /path/to/rotate-secrets.sh  # Every Sunday at 2 AM
```

## Backup & Recovery

### Backup

```bash
# 1. Backup Vault data
docker exec vault tar czf /tmp/vault-backup.tar.gz /vault/data

# 2. Copy to host
docker cp vault:/tmp/vault-backup.tar.gz ./backups/vault-$(date +%Y%m%d).tar.gz

# 3. Encrypt backup
gpg --encrypt --recipient admin@example.com backups/vault-$(date +%Y%m%d).tar.gz
```

### Recovery

```bash
# 1. Stop Vault
docker-compose stop vault

# 2. Restore data
docker cp backups/vault-20250101.tar.gz vault:/tmp/
docker exec vault tar xzf /tmp/vault-20250101.tar.gz -C /

# 3. Start Vault
docker-compose start vault

# 4. Unseal with 3 keys
vault operator unseal <key1>
vault operator unseal <key2>
vault operator unseal <key3>
```

## Monitoring

### Prometheus Metrics

Vault expose des métriques Prometheus sur `/v1/sys/metrics`:

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'vault'
    static_configs:
      - targets: ['vault:8200']
    metrics_path: '/v1/sys/metrics'
    params:
      format: ['prometheus']
```

Métriques clés:
- `vault_core_unsealed` - Vault unsealed status
- `vault_runtime_total_gc_pause_ns` - GC pause time
- `vault_token_count_by_policy` - Tokens par policy
- `vault_secret_kv_count` - Nombre de secrets

### Audit Log

Activer l'audit logging:

```bash
vault audit enable file file_path=/vault/logs/audit.log
```

Format:
```json
{
  "time": "2025-01-01T12:00:00Z",
  "type": "request",
  "auth": {
    "client_token": "hmac-sha256:...",
    "accessor": "hmac-sha256:...",
    "policies": ["app-policy"]
  },
  "request": {
    "operation": "read",
    "path": "secret/data/api-keys/openai"
  }
}
```

## Sécurité

### Transport Security (TLS)

Pour production, activer TLS dans `vault-config.hcl`:

```hcl
listener "tcp" {
  address       = "0.0.0.0:8200"
  tls_disable   = 0  # Enable TLS
  tls_cert_file = "/vault/tls/tls.crt"
  tls_key_file  = "/vault/tls/tls.key"
}
```

### Network Isolation

Vault est dans `backend-network` (internal: true):
- ❌ Pas d'accès internet direct
- ✅ Accessible uniquement par les services backend
- ✅ Isolation complète des outils de sécurité

### Token Lifecycle

```bash
# Créer token avec TTL
vault token create -policy=app-policy -ttl=24h

# Renouveler token
vault token renew <token>

# Révoquer token
vault token revoke <token>
```

## Troubleshooting

### Vault est sealed

```bash
# Check status
docker exec vault vault status

# Unseal (requires 3 of 5 keys)
docker exec -it vault vault operator unseal
# Enter key 1
docker exec -it vault vault operator unseal
# Enter key 2
docker exec -it vault vault operator unseal
# Enter key 3
```

### Cannot connect to Vault

```bash
# Check container is running
docker ps | grep vault

# Check logs
docker logs vault

# Check network
docker network inspect backend-network
```

### Secret not found

```bash
# List secrets
vault kv list secret/

# Read secret metadata
vault kv metadata get secret/database/credentials

# Check permissions
vault token capabilities secret/database/credentials
```

### Application fallback

Si Vault est down, l'application utilise automatiquement les variables d'environnement:

```typescript
// VaultService automatically falls back
const apiKey = await vaultService.getApiKey('openai');
// Returns process.env.OPENAI_API_KEY if Vault unavailable
```

## Production Checklist

- [ ] Vault initialisé et unsealed
- [ ] Unseal keys sauvegardées dans HSM/password manager
- [ ] Root token sauvegardé de manière sécurisée
- [ ] TLS activé pour communication chiffrée
- [ ] Audit logging activé
- [ ] Backup automatique configuré (quotidien)
- [ ] Monitoring Prometheus configuré
- [ ] Alertes pour sealed/unhealthy configurées
- [ ] Token rotation policy définie
- [ ] Secret rotation schedule définie
- [ ] Recovery procedure documentée et testée

## Ressources

- [Vault Documentation](https://www.vaultproject.io/docs)
- [KV Secrets Engine](https://www.vaultproject.io/docs/secrets/kv)
- [Policies](https://www.vaultproject.io/docs/concepts/policies)
- [Audit Devices](https://www.vaultproject.io/docs/audit)

---

**Version**: 1.0.0
**Last Updated**: 2025-11-05
