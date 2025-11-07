#!/bin/bash
# Exemple de test GARAK avec OpenAI
# Usage: ./test_openai.sh

# Configuration
export OPENAI_API_KEY="sk-..."  # Remplacez par votre clé API

# Test 1: Injection de prompts par encodage
echo "Test 1: Injection par encodage..."
uv run python -m garak \
    --target_type openai \
    --target_name gpt-3.5-turbo \
    --probes encoding \
    --generations 5 \
    --report_prefix test1_encoding

# Test 2: Jailbreak DAN
echo "Test 2: Jailbreak DAN..."
uv run python -m garak \
    --target_type openai \
    --target_name gpt-3.5-turbo \
    --probes dan.Dan_11_0 \
    --generations 5 \
    --report_prefix test2_dan

# Test 3: Génération de malware
echo "Test 3: Génération de malware..."
uv run python -m garak \
    --target_type openai \
    --target_name gpt-3.5-turbo \
    --probes malwaregen \
    --generations 3 \
    --report_prefix test3_malware

echo "Tests terminés! Consultez les rapports HTML générés."

