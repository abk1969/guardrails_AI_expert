#!/bin/bash
# Test GARAK pour l'application EBIOS RM AI Assistant
# URL: https://ebios-rm-ai-assistant-1065555617003.us-west1.run.app/

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     GARAK - Test de l'Application EBIOS RM AI Assistant   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

APP_URL="https://ebios-rm-ai-assistant-1065555617003.us-west1.run.app/"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT_PREFIX="ebios_app_${TIMESTAMP}"

echo -e "${YELLOW}🎯 Application cible:${NC} $APP_URL"
echo -e "${YELLOW}📊 Rapport:${NC} $REPORT_PREFIX"
echo ""

# Charger les variables d'environnement
if [ -f .env ]; then
    echo -e "${GREEN}✓ Chargement de .env${NC}"
    export $(cat .env | grep -v '^#' | xargs)
else
    echo -e "${YELLOW}⚠️  Fichier .env non trouvé, copie de .env.example${NC}"
    cp .env.example .env
    export $(cat .env | grep -v '^#' | xargs)
fi

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Sélectionnez le type de test:${NC}"
echo ""
echo "  1. Test Rapide (5 min) - Injection basique"
echo "  2. Test Standard (15 min) - Injection + Jailbreak"
echo "  3. Test Complet (30 min) - Toutes les probes principales"
echo "  4. Test Personnalisé - Choisir les probes"
echo ""
read -p "Votre choix (1-4): " choice

case $choice in
    1)
        echo -e "${GREEN}▶ Test Rapide - Injection basique${NC}"
        PROBES="encoding promptinject"
        GENERATIONS=3
        ;;
    2)
        echo -e "${GREEN}▶ Test Standard - Injection + Jailbreak${NC}"
        PROBES="encoding promptinject dan.Dan_11_0"
        GENERATIONS=5
        ;;
    3)
        echo -e "${GREEN}▶ Test Complet - Toutes les probes principales${NC}"
        PROBES="encoding promptinject dan malwaregen misleading leakreplay"
        GENERATIONS=5
        ;;
    4)
        echo -e "${GREEN}▶ Test Personnalisé${NC}"
        echo ""
        echo "Probes disponibles:"
        echo "  - encoding (injection par encodage)"
        echo "  - promptinject (injection de prompts)"
        echo "  - dan (jailbreak DAN)"
        echo "  - malwaregen (génération de malware)"
        echo "  - misleading (fausses affirmations)"
        echo "  - leakreplay (fuite de données)"
        echo "  - realtoxicityprompts (toxicité)"
        echo "  - xss (exfiltration)"
        echo ""
        read -p "Entrez les probes (séparées par des espaces): " PROBES
        read -p "Nombre de générations par prompt (défaut: 5): " GENERATIONS
        GENERATIONS=${GENERATIONS:-5}
        ;;
    *)
        echo -e "${RED}❌ Choix invalide${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Configuration du test:${NC}"
echo "  • URL: $APP_URL"
echo "  • Probes: $PROBES"
echo "  • Générations: $GENERATIONS"
echo "  • Rapport: $REPORT_PREFIX"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""

read -p "Continuer? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 0
fi

echo ""
echo -e "${GREEN}🚀 Démarrage du test GARAK...${NC}"
echo ""

# Note: GARAK ne supporte pas directement les endpoints REST personnalisés
# Il faut utiliser un générateur compatible (OpenAI, Hugging Face, etc.)
# Pour tester votre application, nous allons utiliser le générateur REST

echo -e "${YELLOW}⚠️  IMPORTANT:${NC}"
echo "GARAK teste principalement des LLMs via leurs APIs (OpenAI, HF, etc.)"
echo "Pour tester votre application REST personnalisée, vous avez 2 options:"
echo ""
echo "Option 1: Utiliser un générateur compatible si votre app expose une API compatible"
echo "Option 2: Créer un générateur personnalisé pour votre endpoint"
echo ""
echo "Pour l'instant, nous allons tester avec OpenAI comme proxy."
echo "Les prompts générés peuvent être utilisés manuellement sur votre app."
echo ""

# Exécuter GARAK avec OpenAI (pour générer les prompts de test)
uv run python -m garak \
    --target_type openai \
    --target_name gpt-3.5-turbo \
    --probes $PROBES \
    --generations $GENERATIONS \
    --report_prefix $REPORT_PREFIX

echo ""
echo -e "${GREEN}✅ Test GARAK terminé!${NC}"
echo ""
echo -e "${BLUE}📊 Résultats:${NC}"
echo "  • Rapport HTML: ~/.local/share/garak/garak_runs/${REPORT_PREFIX}.report.html"
echo "  • Rapport JSONL: ~/.local/share/garak/garak_runs/${REPORT_PREFIX}.report.jsonl"
echo "  • Hit Log: ~/.local/share/garak/garak_runs/${REPORT_PREFIX}.hitlog.jsonl"
echo ""

# Analyser les résultats
if [ -f ~/.local/share/garak/garak_runs/${REPORT_PREFIX}.report.jsonl ]; then
    echo -e "${YELLOW}📈 Analyse des résultats...${NC}"
    python examples/analyze_results.py ~/.local/share/garak/garak_runs/${REPORT_PREFIX}.report.jsonl
fi

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}💡 Prochaines étapes:${NC}"
echo ""
echo "1. Consultez le rapport HTML pour voir les prompts générés"
echo "2. Testez manuellement ces prompts sur votre application:"
echo "   $APP_URL"
echo "3. Créez un générateur personnalisé pour automatiser les tests"
echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"

