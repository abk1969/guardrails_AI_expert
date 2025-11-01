# ✅ Checklist de Vérification - Tests de Guardrails

Utilisez cette checklist pour vérifier que tout est prêt avant de lancer vos tests.

## 📋 Prérequis (Avant de Commencer)

### 1. Environnement Node.js
```bash
node --version
# ✅ Devrait afficher v20.x.x ou supérieur
# ❌ Si < v20, installer Node.js 20+ depuis https://nodejs.org
```

### 2. Promptfoo Installé
```bash
cd ../promptfoo
ls node_modules/ | wc -l
# ✅ Devrait afficher ~2800+ (environ 2863 packages)
# ❌ Si 0 ou beaucoup moins: run `npm install`
```

### 3. Promptfoo Buildé
```bash
cd ../promptfoo
ls -lh dist/src/main.js
# ✅ Devrait afficher le fichier avec taille > 0
# ❌ Si "No such file": run `npm run build`
```

### 4. Clés API Configurées
```bash
cd ../ai-risk-guardrails-tests
cat .env | grep -E "GOOGLE_API_KEY|OPENAI_API_KEY"
# ✅ Devrait afficher au moins une clé (pas "your_xxx_key_here")
# ❌ Si fichier n'existe pas: `cp .env.example .env` puis éditer
```

## 🚀 Test de Santé (Quick Check)

### Étape 1: Vérifier la Configuration
```bash
# Devrait afficher la config sans erreur
node ../promptfoo/dist/src/main.js eval --dry-run
```
**✅ Succès:** Affiche "Configuration loaded successfully" ou similaire
**❌ Échec:** Erreurs de syntaxe YAML - vérifier `promptfooconfig.yaml`

### Étape 2: Test Minimal (1 seul prompt)
```bash
# Test ultra-rapide pour vérifier que l'API fonctionne
node ../promptfoo/dist/src/main.js eval --filter-first-n 1 --max-concurrency 1
```
**✅ Succès:** Test se lance, appelle l'API, retourne un résultat
**❌ Échec:** Vérifier les erreurs ci-dessous

## 🔍 Diagnostic des Problèmes Courants

### Erreur: "API key not found" ou "Unauthorized"
**Causes possibles:**
- [ ] Fichier `.env` n'existe pas → `cp .env.example .env`
- [ ] Clé API non définie dans `.env` → Éditer et ajouter clé
- [ ] Clé API invalide → Régénérer sur platform provider
- [ ] Variable d'environnement mal formatée → Pas d'espaces, pas de quotes

**Test:**
```bash
# Vérifier que la variable est bien définie
echo $GOOGLE_API_KEY  # Devrait afficher votre clé
# OU sous Windows Git Bash
cat .env | grep GOOGLE_API_KEY
```

### Erreur: "Module not found" ou "Cannot find module"
**Causes possibles:**
- [ ] Promptfoo pas buildé → `cd ../promptfoo && npm run build`
- [ ] node_modules manquant → `cd ../promptfoo && npm install`
- [ ] Mauvais répertoire courant → `pwd` devrait montrer .../ai-risk-guardrails-tests

**Test:**
```bash
# Vérifier que dist/ existe
ls ../promptfoo/dist/src/main.js
```

### Erreur: "Rate limit exceeded" ou "429 Too Many Requests"
**Causes possibles:**
- [ ] Trop de requêtes simultanées → Réduire concurrence
- [ ] Quota API dépassé → Vérifier dashboard provider
- [ ] Tests trop rapprochés → Attendre quelques minutes

**Solution:**
```bash
# Réduire la concurrence
npm run test:quick -- --max-concurrency 1

# ET/OU limiter le nombre de tests
npm run test:quick -- --filter-first-n 3
```

### Erreur: "Timeout" ou tests qui ne se terminent jamais
**Causes possibles:**
- [ ] Réseau lent → Augmenter timeout
- [ ] Provider en panne → Vérifier status.openai.com ou status.google.com
- [ ] Trop de tests en parallèle → Réduire concurrence

**Solution:**
```bash
# Dans .env, ajouter:
TEST_TIMEOUT=120000  # 2 minutes au lieu de 30s

# Et réduire concurrence:
npm run test:quick -- --max-concurrency 1
```

## 📊 Vérification des Résultats

### Après un Test Réussi

**Console devrait afficher:**
```
✓ Generating test cases... (X seconds)
✓ Running Y tests against Z providers... (XX seconds)

┌─────────────────────────┬──────────┬──────────┐
│ Plugin                  │ Pass     │ Score    │
├─────────────────────────┼──────────┼──────────┤
│ prompt-injection        │ X/Y      │ 0.XX     │
│ ...                     │ ...      │ ...      │
└─────────────────────────┴──────────┴──────────┘

Overall Pass Rate: XX%
```

**Fichiers créés:**
- [ ] `results/latest.json` existe
- [ ] Taille > 0 bytes
- [ ] Contient JSON valide

```bash
# Vérifier
ls -lh results/latest.json
cat results/latest.json | jq . | head -20  # Si jq installé
```

### Interface Web Fonctionne

```bash
# Démarrer l'UI
npm run view

# Devrait afficher:
# View server running at http://localhost:15500
# Opening in browser...
```

**Checklist UI:**
- [ ] Navigateur s'ouvre automatiquement
- [ ] Page charge sans erreur
- [ ] Tableau de bord affiche des résultats
- [ ] Peut cliquer sur les tests pour voir détails
- [ ] Graphiques/charts s'affichent

## ✨ Tout Fonctionne!

Si tous les checks passent:
- ✅ Environnement configuré correctement
- ✅ Promptfoo opérationnel
- ✅ API keys valides
- ✅ Tests peuvent être lancés
- ✅ Résultats consultables

**Vous êtes prêt pour les vrais tests!**

```bash
# Lancer une suite complète
npm run test:full

# Ou test spécialisé
node ../promptfoo/dist/src/main.js eval -c configs/prompt-injection-only.yaml
```

## 🆘 Support

Si problèmes persistent:

1. **Vérifier les logs détaillés:**
   ```bash
   npm run test:quick -- --verbose
   ```

2. **Consulter la documentation:**
   - `README.md` - Documentation complète
   - `GETTING_STARTED.md` - Guide détaillé
   - `SOLUTION_SUMMARY.md` - Vue d'ensemble

3. **Documentation Promptfoo:**
   - https://promptfoo.dev/docs/
   - https://promptfoo.dev/docs/red-team/

4. **Vérifier les issues GitHub:**
   - https://github.com/promptfoo/promptfoo/issues

---

**Dernière vérification rapide:**
```bash
# Un seul test pour confirmer que tout marche
cd ai-risk-guardrails-tests
npm run test:quick -- --filter-first-n 1 && echo "✅ TOUT FONCTIONNE!"
```
