# Guide de Test Rapide - Export PDF/Excel

**Date**: 2025-11-01

---

## 🎯 Test avec Données Réelles du Backend

### Prérequis

1. **Backend démarré**:
   ```bash
   docker-compose up -d
   ```

2. **Vérifier que l'API répond**:
   ```bash
   curl http://localhost:3003/api/v1/health
   ```

3. **Au moins un TestRun en base de données**

---

## 📋 Scénario de Test Complet

### Étape 1: Créer un TestRun

**Option A: Via le Wizard (Recommandé)**

1. Accéder à http://localhost:3004
2. Menu: **Tests de Sécurité** > **🚀 Assistant Guidé (Débutant)**
3. **Étape 1 - Configuration**:
   - Cible: "Gemini Flash 1.5 (Recommandé)"
   - Profondeur: "Standard - Équilibré (10-15 tests)"
   - Catégories: Cocher "Injection de Prompts", "Jailbreak", "PII"
   - Cliquer "Continuer"

4. **Étape 2 - Validation**:
   - Lire les estimations
   - Cocher les 2 cases de confirmation
   - Cliquer "Continuer"
   - Le dry-run s'exécute automatiquement

5. **Étape 3 - Exécution**:
   - Vérifier que Docker tourne: `docker-compose ps | grep api-gateway`
   - Cliquer "Lancer Tests Réels"
   - Attendre message de succès avec testRunId
   - Redirection automatique vers page d'exécution

**Option B: Via la Base de Données (Si TestRun existe déjà)**

```bash
# Vérifier les TestRuns existants
docker exec -it airiskmgr-postgres psql -U airiskmgr -d airiskmgr_db -c "
  SELECT id, status, \"totalTests\", \"passedTests\", \"failedTests\", \"createdAt\"
  FROM \"TestRun\"
  WHERE status = 'COMPLETED'
  ORDER BY \"createdAt\" DESC
  LIMIT 5;
"
```

**Copier un `id` (testRunId)** pour les tests.

---

### Étape 2: Accéder aux Résultats

1. Menu: **Tests de Sécurité** > **📊 Résultats Red Team**

2. **Le composant charge automatiquement** le dernier testRunId depuis `localStorage`

3. **Vérifications Visuelles**:
   - [ ] Stats grid affiche les nombres corrects
   - [ ] Timeline affiche statut + durée
   - [ ] Graphiques (bar chart, pie chart) s'affichent
   - [ ] Liste des résultats est visible
   - [ ] Boutons "PDF" et "Excel" sont présents

---

### Étape 3: Tester Export PDF

1. **Cliquer sur le bouton "PDF"**

2. **Vérifications**:
   - [ ] Fichier téléchargé dans `~/Downloads/`
   - [ ] Nom: `promptfoo-report-{8chars}-{date}.pdf`
   - [ ] Taille: > 10 KB (selon nombre de résultats)

3. **Ouvrir le PDF**:
   - [ ] **Page 1** affiche:
     - Titre "Rapport Red Team - Promptfoo"
     - Test Run ID
     - Date de génération
     - Table "Résumé Exécutif" avec 7-8 lignes
     - Table "Résultats par Catégorie"
   - [ ] **Page 2** (si vulnérabilités détectées):
     - Titre "⚠️ Vulnérabilités Détectées (X)"
     - Table avec colonnes: #, Plugin, Catégorie, Score, Prompt, Analyse
   - [ ] **Pied de page** sur toutes les pages:
     - "AI RISK MANAGER - Rapport Promptfoo | Page X/Y"

4. **Vérifications Qualité**:
   - [ ] Tables bien alignées (pas de débordement)
   - [ ] Texte lisible (pas trop petit)
   - [ ] Couleurs correctes (cyan pour titres, rouge pour vulnérabilités)

---

### Étape 4: Tester Export Excel

1. **Cliquer sur le bouton "Excel"**

2. **Vérifications**:
   - [ ] Fichier téléchargé: `promptfoo-report-{8chars}-{date}.xlsx`
   - [ ] Taille: > 15 KB

3. **Ouvrir le fichier Excel** (Excel, LibreOffice, Google Sheets)

4. **Vérifier Feuille 1: "Résumé"**:
   - [ ] Titre "Rapport Red Team - Promptfoo"
   - [ ] Test Run ID et date
   - [ ] Métriques: Tests Totaux, Réussis, Vulnérabilités, Taux, Score Moyen, etc.
   - [ ] Si cible définie: Nom de la cible et type de composant

5. **Vérifier Feuille 2: "Par Catégorie"**:
   - [ ] En-tête: Catégorie, Tests Réussis, Échecs, Total, Taux Réussite
   - [ ] Lignes de données pour chaque catégorie testée
   - [ ] Calculs corrects (Total = Réussis + Échecs)

6. **Vérifier Feuille 3: "Par Plugin"**:
   - [ ] En-tête: Plugin, Nombre de Tests
   - [ ] Liste de tous les plugins utilisés
   - [ ] Counts corrects

7. **Vérifier Feuille 4: "Tous les Résultats"**:
   - [ ] En-tête: #, Statut, Score, Plugin, Catégorie, Complexité, Prompt, Réponse, Explication, Temps
   - [ ] Une ligne par test exécuté
   - [ ] Colonnes "Prompt", "Réponse", "Explication" bien lisibles (largeur 50-60 chars)
   - [ ] Statuts corrects: "RÉUSSI" ou "ÉCHEC"

8. **Vérifier Feuille 5: "Vulnérabilités"**:
   - [ ] Contient **uniquement** les tests ayant échoué
   - [ ] Si tous réussis: Feuille vide ou avec juste en-tête
   - [ ] Colonnes: #, Score, Plugin, Catégorie, Prompt, Réponse, Analyse, Temps

---

### Étape 5: Tester Cas Limites

#### Test 5.1: Aucune Donnée

1. **Ouvrir la console navigateur** (F12)
2. **Exécuter**:
   ```javascript
   localStorage.removeItem('promptfoo_last_test_run_id');
   ```
3. **Rafraîchir la page**: F5
4. **Cliquer sur "PDF"**:
   - [ ] Alert affiché: "Aucune donnée à exporter"
   - [ ] Aucun téléchargement
5. **Cliquer sur "Excel"**:
   - [ ] Alert affiché: "Aucune donnée à exporter"
   - [ ] Aucun téléchargement

#### Test 5.2: Tous Tests Réussis

**Si vous avez un TestRun avec 100% de réussite**:

1. **Export PDF**:
   - [ ] 1 page uniquement (pas de page vulnérabilités)
   - [ ] Table "Résultats par Catégorie" affiche 0 échecs

2. **Export Excel**:
   - [ ] Feuille "Vulnérabilités" vide ou avec juste en-tête

#### Test 5.3: Caractères Spéciaux

**Si prompts contiennent emojis, accents, symboles**:

1. **Exports PDF et Excel**:
   - [ ] Caractères correctement affichés
   - [ ] Pas de "?" ou caractères bizarres
   - [ ] Accents français OK

---

## 🔍 Vérification de la Console

Pendant les exports, **aucune erreur** ne doit apparaître dans la console navigateur (F12):

**Erreurs à surveiller**:
- ❌ `autoTable is not a function`
- ❌ `XLSX is not defined`
- ❌ `Cannot read property 'summary' of undefined`
- ❌ `TypeError: ...`

**Console attendue**:
- ✅ Silencieuse (pas d'erreur)
- ✅ Ou messages de debug normaux (si logs activés)

---

## 📊 Exemple de Commande cURL pour Tester l'API

Si vous voulez tester l'API directement:

```bash
# Récupérer un testRunId existant
TEST_RUN_ID=$(docker exec -it airiskmgr-postgres psql -U airiskmgr -d airiskmgr_db -t -c "SELECT id FROM \"TestRun\" WHERE status = 'COMPLETED' LIMIT 1;" | tr -d ' \n')

echo "Test Run ID: $TEST_RUN_ID"

# Appeler l'API /results
curl -X GET "http://localhost:3003/api/v1/promptfoo/results/$TEST_RUN_ID" \
  -H "Content-Type: application/json" | jq .
```

**Résultat attendu**: JSON avec structure:
```json
{
  "testRunId": "...",
  "status": "COMPLETED",
  "target": { "name": "...", "componentType": "..." },
  "duration": "320 sec",
  "summary": {
    "totalTests": 25,
    "passed": 18,
    "failed": 7,
    "successRate": 72,
    "averageScore": 0.75,
    "criticalFailures": 2
  },
  "categoryStats": { ... },
  "pluginStats": { ... },
  "results": [ ... ]
}
```

---

## ✅ Checklist de Validation Complète

### Exports Fonctionnels

- [ ] Export PDF télécharge un fichier
- [ ] Export Excel télécharge un fichier
- [ ] Noms de fichiers corrects (format `promptfoo-report-{id}-{date}`)
- [ ] Pas d'erreurs console navigateur

### Contenu PDF

- [ ] Page 1: Résumé exécutif
- [ ] Page 1: Résultats par catégorie
- [ ] Page 2: Vulnérabilités (si échecs)
- [ ] Pied de page sur toutes les pages
- [ ] Tables bien formatées

### Contenu Excel

- [ ] Feuille "Résumé" complète
- [ ] Feuille "Par Catégorie" avec calculs corrects
- [ ] Feuille "Par Plugin" avec counts
- [ ] Feuille "Tous les Résultats" avec toutes les lignes
- [ ] Feuille "Vulnérabilités" filtrée correctement
- [ ] Largeurs de colonnes optimisées

### Cas Limites

- [ ] Aucune donnée → Alert affiché
- [ ] 100% réussite → Pas de page vulnérabilités PDF
- [ ] Caractères spéciaux → Affichage correct

---

## 🐛 Si Problème

### PDF Vide ou Mal Formaté

**Diagnostic**:
```javascript
// Dans la console navigateur, après avoir cliqué sur "Résultats Red Team"
console.log('testData:', window.testData);  // Devrait afficher l'objet
console.log('results:', window.results);    // Devrait afficher le tableau
```

Si `undefined`:
- Vérifier que le backend est démarré
- Vérifier qu'un testRunId existe en localStorage
- Vérifier la réponse de l'API avec cURL

### Excel: Colonnes Trop Étroites

**Cause**: Largeurs non appliquées

**Solution**: Vérifier dans le code que:
```typescript
wsAllResults['!cols'] = colWidths;
wsVulnerabilities['!cols'] = colWidths;
```

### Téléchargement Bloqué par le Navigateur

**Cause**: Paramètres de sécurité

**Solution**: Autoriser les téléchargements automatiques pour localhost

---

## 🎉 Test Réussi Si...

✅ Les 3 exports fonctionnent:
1. Export PDF avec données complètes
2. Export Excel avec 5 feuilles
3. Alert correcte si aucune donnée

✅ Contenu correct:
- Toutes les métriques présentes
- Calculs exacts
- Formatage professionnel

✅ Aucune erreur console

**Le composant est production-ready** ! 🚀
