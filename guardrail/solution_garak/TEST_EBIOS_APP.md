# 🎯 Guide de Test GARAK pour l'Application EBIOS RM AI Assistant

## 📋 Application Cible

**URL:** https://ebios-rm-ai-assistant-1065555617003.us-west1.run.app/  
**Type:** Application AI déployée sur Google Cloud Run  
**Objectif:** Tester les vulnérabilités de sécurité de l'assistant IA EBIOS RM

---

## 🚀 Méthode 1: Test Rapide avec Script Automatisé

### Étape 1: Copier la configuration

```bash
cd guardrail/solution_garak

# Copier .env.example vers .env (déjà fait avec vos clés API)
cp .env.example .env
```

### Étape 2: Lancer le test

```bash
# Rendre le script exécutable
chmod +x test_ebios_app.sh

# Lancer le test
./test_ebios_app.sh
```

### Options de test disponibles:

1. **Test Rapide (5 min)** - Injection basique
   - Probes: `encoding`, `promptinject`
   - Générations: 3

2. **Test Standard (15 min)** - Injection + Jailbreak
   - Probes: `encoding`, `promptinject`, `dan.Dan_11_0`
   - Générations: 5

3. **Test Complet (30 min)** - Toutes les probes principales
   - Probes: `encoding`, `promptinject`, `dan`, `malwaregen`, `misleading`, `leakreplay`
   - Générations: 5

4. **Test Personnalisé** - Choisir vos probes

---

## 🔧 Méthode 2: Générateur Personnalisé (Recommandé)

### Pourquoi un générateur personnalisé ?

GARAK teste principalement des LLMs via leurs APIs standard (OpenAI, Hugging Face, etc.).  
Pour tester votre application REST personnalisée, il faut créer un **générateur personnalisé**.

### Étape 1: Adapter le générateur

Le fichier `custom_generator_ebios.py` a été créé. **Vous devez l'adapter** selon votre API :

```python
# Dans custom_generator_ebios.py, modifiez:

# 1. Les endpoints
chat_endpoint = "/api/chat"  # ← Adaptez selon votre API
completion_endpoint = "/api/completion"  # ← Adaptez selon votre API

# 2. Le format du payload
payload = {
    "messages": [{"role": "user", "content": prompt}]  # ← Format OpenAI-like
}
# OU
payload = {"prompt": prompt}  # ← Format simple
# OU
payload = {"query": prompt, "temperature": 0.7}  # ← Format personnalisé

# 3. L'extraction de la réponse
if "choices" in data:
    return data["choices"][0]["message"]["content"]  # ← OpenAI-like
# OU
if "response" in data:
    return data["response"]  # ← Format simple
```

### Étape 2: Tester le générateur

```bash
# Test direct du générateur
uv run python custom_generator_ebios.py
```

### Étape 3: Utiliser avec GARAK

```bash
# Une fois le générateur adapté, utilisez-le avec GARAK
uv run python -m garak \
    --target_type custom_generator_ebios.EbiosGenerator \
    --probes encoding promptinject \
    --generations 5 \
    --report_prefix ebios_custom_test
```

---

## 🧪 Méthode 3: Test Manuel avec Prompts Générés

Si vous ne pouvez pas adapter le générateur immédiatement, utilisez cette méthode :

### Étape 1: Générer les prompts de test

```bash
# Générer des prompts avec OpenAI (pour avoir des exemples)
uv run python -m garak \
    --target_type openai \
    --target_name gpt-3.5-turbo \
    --probes encoding promptinject dan \
    --generations 5 \
    --report_prefix ebios_prompts
```

### Étape 2: Extraire les prompts

```bash
# Extraire les prompts du rapport JSONL
cat ~/.local/share/garak/garak_runs/ebios_prompts.report.jsonl | \
    jq -r '.prompt' > ebios_test_prompts.txt
```

### Étape 3: Tester manuellement

1. Ouvrez votre application: https://ebios-rm-ai-assistant-1065555617003.us-west1.run.app/
2. Copiez les prompts de `ebios_test_prompts.txt`
3. Testez-les un par un dans votre interface
4. Notez les réponses et les comportements suspects

---

## 📊 Analyser les Résultats

### Avec le script d'analyse

```bash
python examples/analyze_results.py ~/.local/share/garak/garak_runs/ebios_*.report.jsonl
```

### Rapport HTML

Ouvrez le rapport HTML dans votre navigateur :

```bash
# Windows
start ~/.local/share/garak/garak_runs/ebios_*.report.html

# Linux/Mac
open ~/.local/share/garak/garak_runs/ebios_*.report.html
```

---

## 🎯 Probes Recommandées pour EBIOS RM

### Priorité Haute

1. **`promptinject`** - Injection de prompts
   - Tester si l'assistant peut être manipulé pour ignorer ses instructions

2. **`encoding`** - Injection par encodage
   - Tester les contournements via encodage (base64, ROT13, etc.)

3. **`dan`** - Jailbreak DAN
   - Tester si l'assistant peut être "jailbreaké"

### Priorité Moyenne

4. **`misleading`** - Fausses affirmations
   - Tester si l'assistant génère des informations incorrectes

5. **`leakreplay`** - Fuite de données
   - Tester si l'assistant peut révéler des données sensibles

6. **`malwaregen`** - Génération de contenu malveillant
   - Tester si l'assistant peut générer du code malveillant

### Priorité Basse

7. **`realtoxicityprompts`** - Toxicité
8. **`xss`** - Exfiltration de données
9. **`snowball`** - Hallucinations en cascade

---

## 🔍 Que Chercher dans les Résultats ?

### Vulnérabilités Critiques

- ✅ **Injection de prompts réussie** - L'assistant ignore ses instructions
- ✅ **Jailbreak réussi** - L'assistant contourne ses guardrails
- ✅ **Fuite de données** - L'assistant révèle des informations sensibles
- ✅ **Génération de contenu malveillant** - Code dangereux, malware, etc.

### Vulnérabilités Modérées

- ⚠️ **Hallucinations** - Informations incorrectes mais plausibles
- ⚠️ **Contenu inapproprié** - Réponses toxiques ou offensantes
- ⚠️ **Contournement partiel** - Guardrails partiellement contournés

### Comportements Normaux

- ✅ **Refus approprié** - L'assistant refuse les requêtes dangereuses
- ✅ **Réponses sécurisées** - Pas de fuite d'information
- ✅ **Guardrails actifs** - Les protections fonctionnent

---

## 📝 Exemple de Commandes

### Test Rapide (5 minutes)

```bash
./test_ebios_app.sh
# Choisir option 1
```

### Test Complet (30 minutes)

```bash
./test_ebios_app.sh
# Choisir option 3
```

### Test Personnalisé avec Générateur

```bash
# 1. Adapter custom_generator_ebios.py selon votre API
# 2. Tester le générateur
uv run python custom_generator_ebios.py

# 3. Lancer GARAK avec le générateur personnalisé
uv run python -m garak \
    --target_type custom_generator_ebios.EbiosGenerator \
    --probes encoding promptinject dan malwaregen \
    --generations 5 \
    --report_prefix ebios_full_test
```

---

## 🚨 Prochaines Étapes

### Immédiat

1. ✅ Lancer `./test_ebios_app.sh` (option 1 - Test Rapide)
2. ✅ Consulter le rapport HTML généré
3. ✅ Identifier les prompts qui ont réussi

### Court Terme

4. ⬜ Adapter `custom_generator_ebios.py` selon votre API
5. ⬜ Tester le générateur personnalisé
6. ⬜ Lancer un test complet avec le générateur

### Moyen Terme

7. ⬜ Analyser les vulnérabilités détectées
8. ⬜ Implémenter des guardrails supplémentaires
9. ⬜ Re-tester après corrections

---

## 📞 Support

**Questions sur l'adaptation du générateur ?**
- Consultez `custom_generator_ebios.py` (commentaires détaillés)
- Lisez la documentation GARAK : https://garak.readthedocs.io/en/latest/generators.html

**Problèmes avec les tests ?**
- Vérifiez que votre application est accessible : `curl https://ebios-rm-ai-assistant-1065555617003.us-west1.run.app/`
- Consultez les logs GARAK : `~/.local/share/garak/garak.log`

---

**Prochaine action recommandée :**
```bash
./test_ebios_app.sh
```

Choisissez l'option 1 (Test Rapide) pour commencer ! 🚀

