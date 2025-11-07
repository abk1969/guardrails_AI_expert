#!/bin/bash
# GARAK Quick Start Script
# Usage: ./quick_start.sh [test_type] [api_key]

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         GARAK - LLM Vulnerability Scanner v0.13.1          ║${NC}"
echo -e "${BLUE}║              Quick Start Script                            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Fonction d'aide
show_help() {
    echo -e "${YELLOW}Usage:${NC}"
    echo "  ./quick_start.sh [test_type] [api_key]"
    echo ""
    echo -e "${YELLOW}Test Types:${NC}"
    echo "  1. demo          - Test de démonstration (sans API key)"
    echo "  2. openai-basic  - Test basique OpenAI (injection)"
    echo "  3. openai-full   - Test complet OpenAI (toutes probes)"
    echo "  4. openai-dan    - Test jailbreak DAN"
    echo "  5. hf-local      - Test Hugging Face local (GPT-2)"
    echo "  6. list-probes   - Lister toutes les probes"
    echo "  7. list-gens     - Lister tous les générateurs"
    echo ""
    echo -e "${YELLOW}Exemples:${NC}"
    echo "  ./quick_start.sh demo"
    echo "  ./quick_start.sh openai-basic sk-..."
    echo "  ./quick_start.sh list-probes"
    exit 0
}

# Vérifier les arguments
if [ "$1" == "--help" ] || [ "$1" == "-h" ]; then
    show_help
fi

TEST_TYPE=${1:-demo}
API_KEY=$2

# Fonction pour exécuter GARAK
run_garak() {
    echo -e "${GREEN}▶ Exécution de GARAK...${NC}"
    uv run python -m garak "$@"
}

# Tests disponibles
case $TEST_TYPE in
    demo)
        echo -e "${YELLOW}🎯 Test de Démonstration (générateur de test)${NC}"
        echo "Ce test ne nécessite pas d'API key"
        echo ""
        run_garak --target_type test.Blank \
                  --probes dan.Dan_11_0 \
                  --report_prefix demo_test
        ;;
    
    openai-basic)
        if [ -z "$API_KEY" ]; then
            echo -e "${RED}❌ Erreur: API key OpenAI requise${NC}"
            echo "Usage: ./quick_start.sh openai-basic sk-..."
            exit 1
        fi
        echo -e "${YELLOW}🎯 Test OpenAI - Injection de Prompts${NC}"
        export OPENAI_API_KEY="$API_KEY"
        run_garak --target_type openai \
                  --target_name gpt-3.5-turbo \
                  --probes encoding promptinject \
                  --generations 5 \
                  --report_prefix openai_injection
        ;;
    
    openai-full)
        if [ -z "$API_KEY" ]; then
            echo -e "${RED}❌ Erreur: API key OpenAI requise${NC}"
            exit 1
        fi
        echo -e "${YELLOW}🎯 Test OpenAI - Scan Complet${NC}"
        echo -e "${RED}⚠️  Attention: Ce test peut prendre du temps et consommer des crédits${NC}"
        read -p "Continuer? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 0
        fi
        export OPENAI_API_KEY="$API_KEY"
        run_garak --target_type openai \
                  --target_name gpt-3.5-turbo \
                  --config fast \
                  --report_prefix openai_full
        ;;
    
    openai-dan)
        if [ -z "$API_KEY" ]; then
            echo -e "${RED}❌ Erreur: API key OpenAI requise${NC}"
            exit 1
        fi
        echo -e "${YELLOW}🎯 Test OpenAI - Jailbreak DAN${NC}"
        export OPENAI_API_KEY="$API_KEY"
        run_garak --target_type openai \
                  --target_name gpt-3.5-turbo \
                  --probes dan \
                  --generations 5 \
                  --report_prefix openai_dan
        ;;
    
    hf-local)
        echo -e "${YELLOW}🎯 Test Hugging Face - GPT-2 Local${NC}"
        echo "Téléchargement du modèle si nécessaire..."
        run_garak --target_type huggingface \
                  --target_name gpt2 \
                  --probes dan.Dan_11_0 continuation \
                  --generations 3 \
                  --report_prefix hf_gpt2
        ;;
    
    list-probes)
        echo -e "${YELLOW}📋 Liste des Probes Disponibles${NC}"
        run_garak --list_probes
        ;;
    
    list-gens)
        echo -e "${YELLOW}📋 Liste des Générateurs Disponibles${NC}"
        run_garak --list_generators
        ;;
    
    *)
        echo -e "${RED}❌ Type de test inconnu: $TEST_TYPE${NC}"
        show_help
        ;;
esac

# Afficher les résultats
if [ -f "garak.${TEST_TYPE}.report.html" ]; then
    echo ""
    echo -e "${GREEN}✅ Test terminé avec succès!${NC}"
    echo -e "${BLUE}📊 Résultats disponibles:${NC}"
    echo "  - Rapport HTML: garak.${TEST_TYPE}.report.html"
    echo "  - Rapport JSONL: garak.${TEST_TYPE}.report.jsonl"
    echo "  - Hit Log: garak.${TEST_TYPE}.hitlog.jsonl"
    echo ""
    echo -e "${YELLOW}💡 Ouvrez le rapport HTML dans votre navigateur pour voir les résultats détaillés${NC}"
fi

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}GARAK scan terminé!${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"

