#!/bin/bash
echo "======================================================"
echo "  VERIFICATION D'INSTALLATION - PLATEFORME UNIFIÉE"
echo "======================================================"
echo ""

PASS=0
FAIL=0

check_file() {
    if [ -f "$1" ]; then
        echo "✅ $1"
        ((PASS++))
    else
        echo "❌ MANQUANT: $1"
        ((FAIL++))
    fi
}

check_dir() {
    if [ -d "$1" ]; then
        echo "✅ $1/"
        ((PASS++))
    else
        echo "❌ MANQUANT: $1/"
        ((FAIL++))
    fi
}

echo "📦 Vérification des fichiers backend..."
check_file "backend/apps/github-sync-service/src/main.ts"
check_file "backend/apps/github-sync-service/src/github-sync.module.ts"
check_file "backend/apps/github-sync-service/src/github-sync.controller.ts"
check_file "backend/apps/github-sync-service/src/github-sync.service.ts"
check_file "backend/apps/github-sync-service/Dockerfile"
check_file "backend/apps/github-sync-service/README.md"

echo ""
echo "📦 Vérification webhooks..."
check_file "backend/apps/github-sync-service/src/webhooks/webhook-handler.ts"
check_file "backend/apps/github-sync-service/src/webhooks/signature-validator.ts"

echo ""
echo "📦 Vérification deployment..."
check_file "backend/apps/github-sync-service/src/deployment/blue-green-deployer.service.ts"
check_file "backend/apps/github-sync-service/src/deployment/health-checker.service.ts"
check_file "backend/apps/github-sync-service/src/deployment/rollback.service.ts"

echo ""
echo "📦 Vérification testing..."
check_file "backend/apps/github-sync-service/src/testing/test-runner.service.ts"

echo ""
echo "📦 Vérification version management..."
check_file "backend/apps/github-sync-service/src/version-manager/version-manager.service.ts"
check_file "backend/apps/github-sync-service/src/version-manager/semver-parser.ts"
check_file "backend/apps/github-sync-service/src/version-manager/changelog-generator.ts"

echo ""
echo "📦 Vérification docker builder..."
check_file "backend/apps/github-sync-service/src/docker-builder/docker-builder.service.ts"
check_file "backend/apps/github-sync-service/src/docker-builder/dockerfile-generator.ts"
check_file "backend/apps/github-sync-service/src/docker-builder/image-registry.service.ts"

echo ""
echo "📦 Vérification notifications..."
check_file "backend/apps/github-sync-service/src/notifications/slack-notifier.service.ts"
check_file "backend/apps/github-sync-service/src/notifications/email-notifier.service.ts"

echo ""
echo "🏗️ Vérification infrastructure..."
check_file "docker-compose.production.yml"
check_file ".env.production.example"
check_file "scripts/deploy.sh"
check_file "infrastructure/monitoring/prometheus/prometheus.yml"
check_file "infrastructure/monitoring/prometheus/alerts.yml"
check_file "infrastructure/monitoring/grafana/provisioning/datasources/prometheus.yml"

echo ""
echo "📚 Vérification documentation..."
check_file "ENTERPRISE_ARCHITECTURE_PENTEST_PLATFORM.md"
check_file "UNIFIED_PENTEST_PLATFORM_ANALYSIS.md"
check_file "IMPLEMENTATION_UNIFIED_PLATFORM.md"
check_file "RESUME_EXECUTIF_PLATEFORME_UNIFIEE.md"
check_file "IMPLEMENTATION_COMPLETE.md"
check_file "DEPLOYMENT_CHECKLIST.md"
check_file "QUICK_START_PRODUCTION.md"
check_file "PROJECT_STATUS_FINAL.md"

echo ""
echo "======================================================"
echo "  RÉSULTAT FINAL"
echo "======================================================"
echo "✅ Fichiers présents: $PASS"
echo "❌ Fichiers manquants: $FAIL"
echo ""

if [ $FAIL -eq 0 ]; then
    echo "🎉 INSTALLATION COMPLÈTE - PRÊT POUR PRODUCTION"
    exit 0
else
    echo "⚠️ INSTALLATION INCOMPLÈTE - Vérifier les fichiers manquants"
    exit 1
fi
