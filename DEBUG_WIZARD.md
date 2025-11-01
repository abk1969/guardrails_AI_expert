# Diagnostic: Page Vide dans l'Assistant Guidé

## Problème Observé
L'utilisateur accède à "Assistant Guidé (Débutant)" mais obtient une page vide.

## Vérifications Effectuées

### ✅ Fichiers Présents
- types/promptfoo.ts: ✓
- services/promptfooAutomationService.ts: ✓
- components/PromptfooWizard.tsx: ✓
- components/ui/Button.tsx: ✓

### ✅ Serveurs Fonctionnels
- Frontend: http://localhost:3004 - OK
- Backend: http://localhost:3003/api/v1/health - OK
- Pas d'erreurs dans les logs Docker

### ✅ Build Frontend
- Compilation réussie sans erreurs

## Causes Possibles

### 1. Erreur JavaScript Non Capturée (Plus Probable)
Le composant peut planter au rendu sans que l'erreur remonte aux logs serveur.

**Test à effectuer dans la console du navigateur (F12):**
```
Ouvrir http://localhost:3004
Cliquer sur Assistant Guidé (Débutant)
Ouvrir la Console (F12)
Vérifier les erreurs en rouge
```

### 2. Dépendances Manquantes dans le Conteneur
Bien que socket.io-client soit installé sur l'hôte, il pourrait manquer dans le conteneur.

**Solution:**
```powershell
docker exec airiskmgr-frontend npm install
docker restart airiskmgr-frontend
```

### 3. Problème de Contexte React
Le composant utilise `useNavigation()` qui peut échouer si le contexte n'est pas disponible.

## Actions Correctives Recommandées

### Étape 1: Vérifier la Console Navigateur
1. Ouvrir http://localhost:3004 dans le navigateur
2. Ouvrir les Outils de Développement (F12)
3. Aller dans l'onglet "Console"
4. Cliquer sur "Assistant Guidé (Débutant)"
5. Noter toutes les erreurs affichées en rouge

### Étape 2: Réinstaller les Dépendances Frontend (Docker)
```powershell
# Copier package.json et package-lock.json mis à jour
docker cp package.json airiskmgr-frontend:/app/
docker cp package-lock.json airiskmgr-frontend:/app/

# Installer les dépendances
docker exec airiskmgr-frontend npm install

# Redémarrer le conteneur
docker restart airiskmgr-frontend

# Attendre 30 secondes et tester
Start-Sleep -Seconds 30
curl http://localhost:3004
```

### Étape 3: Vider le Cache Vite
```powershell
docker exec airiskmgr-frontend rm -rf node_modules/.vite
docker restart airiskmgr-frontend
```

### Étape 4: Vérifier les Imports TypeScript
Le problème peut venir d'un import manquant ou incorrect.

**Imports requis dans PromptfooWizard.tsx:**
- Card (default export) ✓
- Button ✓
- Types de promptfoo.ts ✓
- useNavigation() de NavigationContext ✓

## Solution Rapide: Composant de Test

Si le problème persiste, créer un composant minimal pour tester:

```typescript
// components/PromptfooWizardTest.tsx
import React from 'react';
import Card from './ui/Card';

const PromptfooWizardTest: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-xl font-bold text-white">Test Assistant Guidé</h2>
        <p className="text-gray-300 mt-2">
          Si vous voyez ce message, le problème vient du composant PromptfooWizard original.
        </p>
      </Card>
    </div>
  );
};

export default PromptfooWizardTest;
```

Puis remplacer temporairement dans App.tsx:
```typescript
// Import temporaire
import PromptfooWizardTest from './components/PromptfooWizardTest';

// Dans navSections
{
  id: 'promptfoo-wizard',
  label: '🚀 Assistant Guidé (Débutant)',
  icon: <Zap size={18} />,
  content: <PromptfooWizardTest />,  // ← Test
  // ...
}
```

## Vérifications Supplémentaires

### Vérifier NavigationContext
```powershell
grep -n "NavigationHistoryItem" contexts/NavigationContext.tsx
```

Si le type `NavigationHistoryItem` n'est pas défini, cela causera une erreur TypeScript.

### Vérifier les Logs en Temps Réel
```powershell
# Terminal 1: Frontend
docker-compose logs -f frontend

# Terminal 2: Backend
docker-compose logs -f api-gateway

# Puis tester l'application dans le navigateur
```

## Prochaines Étapes

**PRIORITÉ 1:** Ouvrir la console du navigateur (F12) et noter les erreurs JavaScript

**PRIORITÉ 2:** Réinstaller les dépendances dans le conteneur frontend

**PRIORITÉ 3:** Si le problème persiste, utiliser le composant de test minimal
