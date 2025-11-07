#!/bin/bash

# ==============================================================================
# VAULT INITIALIZATION SCRIPT
# ==============================================================================
# This script initializes Vault and populates it with secrets from .env.production

set -e

echo "🔐 Initializing HashiCorp Vault..."

# Wait for Vault to be ready
echo "⏳ Waiting for Vault to be ready..."
until curl -s http://localhost:8200/v1/sys/health > /dev/null 2>&1; do
    echo "Waiting for Vault..."
    sleep 2
done

echo "✅ Vault is ready"

# Check if Vault is already initialized
VAULT_ADDR="http://localhost:8200"
export VAULT_ADDR

if curl -s $VAULT_ADDR/v1/sys/health | grep -q '"initialized":true'; then
    echo "✅ Vault is already initialized"

    # Check if token is provided
    if [ -z "$VAULT_TOKEN" ]; then
        echo "❌ VAULT_TOKEN environment variable not set"
        echo "Please provide the root token or an admin token"
        exit 1
    fi

    export VAULT_TOKEN
else
    echo "🔧 Initializing Vault for the first time..."

    # Initialize Vault
    INIT_OUTPUT=$(vault operator init -key-shares=5 -key-threshold=3 -format=json)

    # Save unseal keys and root token
    echo "$INIT_OUTPUT" > vault-keys.json
    chmod 600 vault-keys.json

    echo "✅ Vault initialized - Keys saved to vault-keys.json"
    echo "⚠️  IMPORTANT: Store vault-keys.json in a secure location!"

    # Extract root token
    ROOT_TOKEN=$(echo "$INIT_OUTPUT" | jq -r '.root_token')
    export VAULT_TOKEN=$ROOT_TOKEN

    # Unseal Vault
    echo "🔓 Unsealing Vault..."
    UNSEAL_KEY_1=$(echo "$INIT_OUTPUT" | jq -r '.unseal_keys_b64[0]')
    UNSEAL_KEY_2=$(echo "$INIT_OUTPUT" | jq -r '.unseal_keys_b64[1]')
    UNSEAL_KEY_3=$(echo "$INIT_OUTPUT" | jq -r '.unseal_keys_b64[2]')

    vault operator unseal $UNSEAL_KEY_1
    vault operator unseal $UNSEAL_KEY_2
    vault operator unseal $UNSEAL_KEY_3

    echo "✅ Vault unsealed"
fi

# Enable KV secrets engine v2
echo "🔧 Enabling KV secrets engine..."
vault secrets enable -version=2 -path=secret kv || echo "KV secrets engine already enabled"

# Load secrets from .env.production
if [ -f ".env.production" ]; then
    echo "📥 Loading secrets from .env.production..."

    # Source environment file
    export $(cat .env.production | grep -v '^#' | xargs)

    # Database credentials
    echo "  → database/credentials"
    vault kv put secret/database/credentials \
        url="$DATABASE_URL" \
        username="airiskmgr" \
        password="$POSTGRES_PASSWORD"

    # Redis credentials
    echo "  → redis/credentials"
    vault kv put secret/redis/credentials \
        url="$REDIS_URL" \
        password="$REDIS_PASSWORD"

    # JWT secrets
    echo "  → jwt/secrets"
    vault kv put secret/jwt/secrets \
        secret="$JWT_SECRET" \
        expiration="$JWT_EXPIRATION" \
        refreshExpiration="$JWT_REFRESH_EXPIRATION"

    # Encryption key
    echo "  → encryption/key"
    vault kv put secret/encryption/key \
        key="$ENCRYPTION_KEY"

    # API Keys
    echo "  → api-keys/gemini"
    vault kv put secret/api-keys/gemini key="$GEMINI_API_KEY"

    echo "  → api-keys/openai"
    vault kv put secret/api-keys/openai key="$OPENAI_API_KEY"

    echo "  → api-keys/groq"
    vault kv put secret/api-keys/groq key="$GROQ_API_KEY"

    echo "  → api-keys/cohere"
    vault kv put secret/api-keys/cohere key="$COHERE_API_KEY"

    # GitHub webhook secret
    echo "  → github/webhook-secret"
    vault kv put secret/github/webhook-secret \
        secret="$GITHUB_WEBHOOK_SECRET"

    # MinIO credentials
    echo "  → minio/credentials"
    vault kv put secret/minio/credentials \
        rootUser="$MINIO_ROOT_USER" \
        rootPassword="$MINIO_ROOT_PASSWORD"

    # Grafana credentials
    echo "  → grafana/credentials"
    vault kv put secret/grafana/credentials \
        password="$GRAFANA_PASSWORD"

    # Slack webhook (if configured)
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        echo "  → slack/webhook"
        vault kv put secret/slack/webhook \
            url="$SLACK_WEBHOOK_URL" \
            channel="$SLACK_CHANNEL"
    fi

    # SMTP credentials (if configured)
    if [ -n "$SMTP_HOST" ]; then
        echo "  → smtp/credentials"
        vault kv put secret/smtp/credentials \
            host="$SMTP_HOST" \
            port="$SMTP_PORT" \
            user="$SMTP_USER" \
            password="$SMTP_PASSWORD" \
            from="$EMAIL_FROM"
    fi

    echo "✅ All secrets loaded into Vault"
else
    echo "⚠️  .env.production not found - skipping secret loading"
fi

# Create policies
echo "🔧 Creating Vault policies..."

# Application policy
cat > app-policy.hcl << EOF
# Allow reading all secrets
path "secret/data/*" {
  capabilities = ["read"]
}

# Allow listing secrets
path "secret/metadata/*" {
  capabilities = ["list"]
}
EOF

vault policy write app-policy app-policy.hcl
echo "✅ Created app-policy"

# Admin policy
cat > admin-policy.hcl << EOF
# Full access to secrets
path "secret/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}

# Manage policies
path "sys/policies/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}

# Manage tokens
path "auth/token/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}
EOF

vault policy write admin-policy admin-policy.hcl
echo "✅ Created admin-policy"

# Create application token
echo "🔑 Creating application token..."
APP_TOKEN=$(vault token create -policy=app-policy -format=json | jq -r '.auth.client_token')

echo ""
echo "======================================================"
echo "  VAULT INITIALIZATION COMPLETE"
echo "======================================================"
echo ""
echo "✅ Vault is initialized and unsealed"
echo "✅ Secrets loaded from .env.production"
echo "✅ Policies created"
echo ""
echo "📋 Application Token (add to .env.production):"
echo "VAULT_TOKEN=$APP_TOKEN"
echo ""
echo "🔐 Root Token (save securely):"
echo "VAULT_ROOT_TOKEN=$VAULT_TOKEN"
echo ""
echo "⚠️  IMPORTANT:"
echo "1. Save vault-keys.json in a secure location (HSM, password manager)"
echo "2. Add VAULT_TOKEN to .env.production"
echo "3. Set VAULT_ENABLED=true in .env.production"
echo "4. Delete vault-keys.json from server after backing up"
echo ""
echo "🌐 Vault UI: http://localhost:8200/ui"
echo "   Login with root token: $VAULT_TOKEN"
echo ""

# Save app token to file
echo "VAULT_TOKEN=$APP_TOKEN" > .vault-token
chmod 600 .vault-token
echo "✅ Application token saved to .vault-token"
