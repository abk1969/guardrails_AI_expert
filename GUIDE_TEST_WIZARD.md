# Guide de Test: Assistant Guidé Promptfoo

**Status**: ✅ Corrections appliquées - Prêt pour test
**Date**: 2025-11-01

## 🎯 Corrections Apportées

### Problème 1: Page Vide ✅ RÉSOLU
- **Cause**: Type `NavigationHistoryItem` manquant dans `NavigationContext.tsx`
- **Solution**: Interface ajoutée

### Problème 2: Erreur d'Exécution ✅ RÉSOLU
- **Cause**: Pas de vérification de disponibilité du backend
- **Solution**: Check backend + messages d'erreur clairs

## 📝 Instructions de Test

### Étape 1: Vérifier les Services
```powershell
# Dans PowerShell
docker-compose ps
```

**Résultat attendu**:
```
SERVICE                  STATUS
frontend                 Up (healthy)
api-gateway              Up (healthy)
postgres                 Up (healthy)
redis                    Up (healthy)
```

✅ **Tous les services doivent être "Up"**

---

### Étape 2: Accéder à l'Application

1. **Ouvrir le navigateur**: http://localhost:3004

2. **Rafraîchir la page** (Ctrl+F5) pour forcer le rechargement du JavaScript

3. **Vous devriez voir**: "AI RISK MANAGER" avec le menu latéral

---

### Étape 3: Tester l'Assistant Guidé

#### 3.1 Navigation vers le Wizard
1. Dans le menu de gauche, cliquer sur **"Tests de Sécurité"**
2. Cliquer sur **"🚀 Assistant Guidé (Débutant)"** (premier élément)

**✅ Résultat attendu**: Page avec en-tête "Assistant Guidé Promptfoo - Mode Débutant"

**❌ Si page vide**:
- Ouvrir la console (F12)
- Noter les erreurs en rouge
- Vérifier que le frontend a bien redémarré

#### 3.2 Étape 1: Configuration
**Champs à remplir**:

1. **Cible à Tester**:
   - Sélectionner: **"Gemini Flash 1.5 (Recommandé)"**

2. **Profondeur des Tests**:
   - Sélectionner: **"Standard - Équilibré (10-15 tests)"**

3. **Catégories de Risques**:
   - Cocher: **"Injection de Prompts"**
   - Cocher: **"Jailbreak"**
   - Cocher: **"Fuite d'Informations (PII)"**

4. **Cliquer sur "Continuer"**

**✅ Résultat attendu**: Passage à l'étape 2

---

#### 3.3 Étape 2: Validation

**Affichage attendu**:

```
📊 Estimation des Tests
─────────────────────────
Nombre de tests: ~12
Durée estimée: ~15 minutes
Coût estimé: ~$0.08 USD

⚠️  Garde-fous de Sécurité
─────────────────────────
✓ Mode simulation désactivé
✓ Backend disponible
✓ Dans les limites (25 tests max)
```

**Actions**:

1. **Lire les estimations**

2. **Cocher les 2 cases**:
   - ☑ J'ai lu et compris les estimations
   - ☑ J'accepte de lancer ces tests

3. **Cliquer sur "Continuer"**

**✅ Résultat attendu**:
- Dry-run automatique lancé (quelques secondes)
- Passage à l'étape 3

**❌ Si erreurs de validation**:
- Lire le message d'erreur
- Revenir à l'étape 1 si nécessaire
- Modifier la configuration

---

#### 3.4 Étape 3: Exécution

**Affichage attendu**:

```
🚀 Prêt à Lancer

Configuration:
• Cible: Gemini Flash 1.5
• Tests: 12 prompts
• Catégories: Injection, Jailbreak, PII

[Bouton: Lancer Tests Réels]
```

**Test A: Backend Actif (Scénario Normal)**

1. **Vérifier que Docker tourne**:
   ```powershell
   docker-compose ps | grep api-gateway
   ```
   Doit afficher: `Up`

2. **Cliquer sur "Lancer Tests Réels"**

**✅ Résultat attendu**:
```
Lancement des tests...
Connexion au backend et initialisation

[Après 2-3 secondes]

✓ Tests Lancés avec Succès !
Test Run ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

[Boutons]
[Suivre la Progression] [Voir les Résultats]
```

**✅ Puis redirection automatique** vers la page d'exécution après 2 secondes

---

**Test B: Backend Arrêté (Scénario d'Erreur)**

1. **Arrêter le backend**:
   ```powershell
   docker-compose stop api-gateway
   ```

2. **Rafraîchir la page du wizard**: F5

3. **Refaire les étapes 1-2-3** jusqu'au bouton "Lancer Tests Réels"

4. **Cliquer sur "Lancer Tests Réels"**

**✅ Résultat attendu**:
```
╔════════════════════════════════════════╗
║   Erreur lors de l'Exécution           ║
╚════════════════════════════════════════╝

Le backend n'est pas disponible.
Pour exécuter des tests réels, démarrez le backend avec Docker:

docker-compose up -d

Ou utilisez le mode "simulation" dans Configuration (Expert).

[Boutons]
[Réessayer] [Modifier la Configuration] [Mode Expert]
```

**✅ Message affiché sur fond rouge** avec formatage multiligne

5. **Redémarrer le backend**:
   ```powershell
   docker-compose up -d api-gateway
   # Attendre 30 secondes
   ```

6. **Cliquer sur "Réessayer"**

**✅ Résultat attendu**: Cette fois, l'exécution devrait réussir

---

## 🐛 Problèmes Connus et Solutions

### Problème: "Failed to fetch" ou "Network Error"

**Causes possibles**:
1. Backend pas encore complètement démarré
2. Problème CORS
3. Firewall bloque localhost:3003

**Solutions**:
```powershell
# 1. Vérifier que le backend répond
curl http://localhost:3003/api/v1/health

# 2. Redémarrer le backend
docker restart airiskmgr-api-gateway

# 3. Attendre 30 secondes et réessayer
```

### Problème: Page du Wizard Vide

**Causes possibles**:
1. NavigationContext non chargé
2. Erreur JavaScript non capturée
3. Cache navigateur

**Solutions**:
```powershell
# 1. Vider le cache Vite
docker exec airiskmgr-frontend rm -rf node_modules/.vite

# 2. Redémarrer le frontend
docker restart airiskmgr-frontend

# 3. Attendre 15 secondes

# 4. Dans le navigateur: Ctrl+Shift+Suppr
# Cocher "Images et fichiers en cache"
# Cliquer "Effacer les données"

# 5. Rafraîchir: Ctrl+F5
```

### Problème: "TypeError: Cannot read property 'setActiveNav'"

**Cause**: NavigationContext pas initialisé

**Solution**:
```powershell
# Vérifier que le fix est appliqué
grep -n "NavigationHistoryItem" contexts/NavigationContext.tsx

# Devrait afficher:
# 18:interface NavigationHistoryItem {
# 61:  const [navigationHistory, setNavigationHistory] = useState<NavigationHistoryItem[]>([]);

# Si la ligne 18 n'existe pas, le fix n'est pas appliqué
```

## ✅ Checklist de Test Complète

### Tests Fonctionnels
- [ ] Assistant Guidé s'affiche correctement
- [ ] Étape 1: Sélection des options fonctionne
- [ ] Étape 2: Estimation et validation fonctionnent
- [ ] Dry-run automatique s'exécute
- [ ] Étape 3: Interface d'exécution s'affiche
- [ ] Bouton "Lancer Tests Réels" cliquable
- [ ] Vérification backend fonctionnelle
- [ ] Exécution lance bien via le backend
- [ ] Redirection automatique après succès
- [ ] Test Run ID sauvegardé dans localStorage

### Tests d'Erreur
- [ ] Message d'erreur si backend arrêté
- [ ] Formatage multiligne des erreurs fonctionne
- [ ] Bouton "Réessayer" fonctionne
- [ ] Bouton "Modifier la Configuration" retourne à l'étape 1
- [ ] Bouton "Mode Expert" navigue vers promptfoo-config
- [ ] Erreur réseau affichée correctement

### Tests de Régression
- [ ] Navigation sidebar fonctionne
- [ ] Autres modules (Dashboard, Analytics) fonctionnent
- [ ] Mode Expert (Configuration) fonctionne
- [ ] Breadcrumbs affichés correctement
- [ ] Footer avec attribution OWASP affiché

## 📊 Critères de Succès

### ✅ Le test est réussi si:

1. **Navigation**: L'Assistant Guidé s'affiche sans page vide
2. **Workflow**: Les 3 étapes se suivent sans blocage
3. **Validation**: Le dry-run s'exécute automatiquement
4. **Exécution**:
   - Backend actif → Lancement réussi + redirection
   - Backend arrêté → Message d'erreur clair + 3 boutons
5. **UX**: Messages d'erreur formatés et lisibles
6. **Récupération**: Bouton "Réessayer" fonctionne

### ❌ Le test échoue si:

1. Page blanche ou erreur JavaScript console
2. Impossible de passer d'une étape à l'autre
3. Dry-run ne s'exécute pas
4. Aucun message d'erreur si backend arrêté
5. Erreurs illisibles ou tronquées
6. Impossible de récupérer après erreur

## 🚀 Commandes Rapides

```powershell
# Démarrer tous les services
docker-compose up -d

# Vérifier le statut
docker-compose ps

# Voir les logs frontend
docker-compose logs -f frontend

# Voir les logs backend
docker-compose logs -f api-gateway

# Redémarrer le frontend
docker restart airiskmgr-frontend

# Tester le backend
curl http://localhost:3003/api/v1/health

# Tester le frontend
curl http://localhost:3004

# Arrêter tout
docker-compose down
```

## 📝 Rapport de Test

Après avoir effectué tous les tests ci-dessus, remplir ce rapport:

```
Date du test: _______________
Testeur: _______________

✅ Tests Réussis: ___ / 10 fonctionnels + ___ / 6 erreurs = ___ / 16 total

❌ Tests Échoués:
- ________________________________
- ________________________________

Bugs trouvés:
- ________________________________
- ________________________________

Améliorations suggérées:
- ________________________________
- ________________________________

Commentaires:
_________________________________________
_________________________________________
```

---

**Pour toute question ou problème**: Consulter `PROMPTFOO_WIZARD_FIX_COMPLETE.md`
