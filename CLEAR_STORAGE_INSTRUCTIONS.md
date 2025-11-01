# 🔧 Instructions pour vider le localStorage et restaurer les données

## Problème
Les modules de l'application affichent des données vides car le localStorage contient des données corrompues ou vides.

## Solution Rapide (3 étapes)

### Étape 1: Ouvrir la Console du navigateur
1. Ouvrez http://localhost:5080 dans votre navigateur
2. Appuyez sur `F12` pour ouvrir les Developer Tools
3. Cliquez sur l'onglet **Console**

### Étape 2: Copier-coller ce code dans la console

```javascript
// Script de nettoyage du localStorage
const keys = Object.keys(localStorage);
const aiRiskKeys = keys.filter(key =>
    key.startsWith('llmGuardrail') ||
    key.startsWith('compass-') ||
    key.startsWith('aiPolicy') ||
    key.startsWith('aiRisk')
);

console.log('🔍 Keys found:', aiRiskKeys);

let deletedCount = 0;
aiRiskKeys.forEach(key => {
    console.log('🗑️ Deleting:', key);
    localStorage.removeItem(key);
    deletedCount++;
});

console.log(`✅ ${deletedCount} keys deleted successfully!`);
console.log('🔄 Reloading page...');

// Recharger la page
setTimeout(() => location.reload(), 1000);
```

### Étape 3: Appuyer sur Entrée
Le code va:
1. Afficher toutes les clés AI RISK dans le localStorage
2. Les supprimer une par une
3. Recharger automatiquement la page après 1 seconde

## Vérification
Après le rechargement, vérifiez ces modules:
- ✅ **Analyse de Surface d'Attaque** - doit afficher des données
- ✅ **Incidents IA Connus** - doit afficher la liste des incidents
- ✅ **Préparation Incidents IA** - doit afficher les questions
- ✅ **Résultats Red Team** - doit afficher les profils
- ✅ **Revue Sécurité Red Team** - doit afficher les questions
- ✅ **Référence: Défenses** - doit afficher les tableaux OWASP

## Alternative: Vider TOUT le localStorage

Si la solution ci-dessus ne fonctionne pas, utilisez ce code plus radical:

```javascript
// Vider TOUT le localStorage
localStorage.clear();
console.log('✅ All localStorage cleared!');
setTimeout(() => location.reload(), 1000);
```

## Données restaurées automatiquement

Les données suivantes seront rechargées depuis `constants.ts`:
- 33 vulnérabilités connues
- Incidents IA documentés
- 265+ défenses et mitigations
- Questions Red Team
- Profils de menace
- Vecteurs d'attaque
- Et bien plus...

---

**Note**: Ces données sont stockées dans `constants.ts` (152KB) et seront automatiquement rechargées dans le localStorage une fois vidé.
