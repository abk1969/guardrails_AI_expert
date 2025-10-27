# 🤖 Configuration du Chatbot AI RISK MANAGER

## 📊 État Actuel

Le chatbot fonctionne actuellement en **mode fallback intelligent** qui :
- ✅ Utilise TOUTES les données de l'application (politiques, tests, cas d'usage, vulnérabilités)
- ✅ Génère des réponses pertinentes basées sur votre contexte
- ✅ Affiche des statistiques réelles
- ❌ Ne génère pas de réponses avec IA générative (Gemini)

## 🎯 Deux Modes de Fonctionnement

### Mode 1: Fallback Intelligent (ACTUEL - Fonctionne immédiatement)

**Fonctionnalités** :
- Réponses basées sur vos données réelles
- Extraction intelligente du contexte
- Statistiques en temps réel
- Aucune configuration nécessaire

**Limitations** :
- Réponses structurées mais pas générées par IA
- Pas d'analyse approfondie
- Réponses basées sur templates + keyword matching

**Exemple de réponse** :
```
📋 Politiques SIA disponibles (22 règles):

• SIA-01: Gouvernance de l'IA
• SIA-02: Stratégie IA
• SIA-03: Responsabilités
...

💡 Note: Pour des analyses détaillées, configurez une clé API Gemini.
```

### Mode 2: IA Générative avec Gemini (RECOMMANDÉ)

**Fonctionnalités** :
- Réponses générées par IA avancée (Gemini 2.5 Flash)
- Analyse approfondie de vos données
- Recommandations personnalisées
- Réponses en langage naturel
- Références précises aux données

**Configuration requise** :
- Clé API Google Gemini
- Configuration dans fichier `.env`

**Exemple de réponse** :
```
D'après l'analyse de vos 22 politiques SIA, votre gouvernance IA est bien structurée
autour de 4 piliers principaux:

1. **Gouvernance (SIA-01 à SIA-05)**: Vous avez défini des rôles clairs avec un
   comité IA et des responsabilités assignées. Cependant, je remarque que...

2. **Sécurité (SIA-06 à SIA-10)**: Vos contrôles de sécurité couvrent les aspects
   essentiels, notamment la protection des données (SIA-07) et la gestion des accès
   (SIA-08). Je recommande de renforcer...

[Analyse détaillée avec références précises]
```

## ⚙️ Configuration du Mode IA Générative

### Étape 1: Obtenir une Clé API Gemini

1. Aller sur [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Se connecter avec un compte Google
3. Cliquer sur "Create API Key"
4. Copier la clé générée (format: `AI...`)

### Étape 2: Configurer la Clé API

Créer ou éditer le fichier `.env` à la racine du projet :

```bash
# .env
VITE_GEMINI_API_KEY=AIza...votre-cle-ici
```

**⚠️ IMPORTANT - SÉCURITÉ** :
- Cette configuration est pour **développement local uniquement**
- La clé API est exposée côté client (risque de sécurité)
- Pour la production, utilisez le backend sécurisé (voir section ci-dessous)

### Étape 3: Redémarrer le Serveur

```bash
# Arrêter le serveur (Ctrl+C)
# Relancer
npm run dev
```

### Étape 4: Vérifier la Configuration

1. Ouvrir la console navigateur (F12)
2. Actualiser la page
3. Vous devriez voir :
   ```
   ⚠️ ATTENTION: Clé API Gemini détectée côté client. Ceci est un risque de sécurité!
   ```

4. Ouvrir le chatbot et poser une question
5. Dans la console, vous devriez voir :
   ```
   💡 Récupération du contexte complet de l'application...
   💡 Utilisation de la clé API Gemini locale (mode développement)
   ```

## 🔐 Configuration Sécurisée pour Production

Pour un environnement de production, la clé API **NE DOIT JAMAIS** être exposée côté client.

### Architecture Sécurisée (Backend Requis)

```
Frontend (http://localhost:5085)
    ↓
    POST /api/v1/chat/agentic
    (envoie uniquement la question + contexte)
    ↓
Backend (http://localhost:3001)
    ↓
    Utilise GEMINI_API_KEY côté serveur
    (clé protégée, jamais exposée)
    ↓
    Appelle Gemini API
    ↓
    Retourne la réponse au frontend
```

### Configuration Backend

1. **Créer `backend/.env`** :
```env
GEMINI_API_KEY=AIza...votre-cle-ici
DATABASE_URL=postgresql://...
JWT_SECRET=...
PORT=3001
```

2. **Démarrer le backend** :
```bash
cd backend
npm install
npm run start:dev
```

3. **Le frontend utilisera automatiquement le backend** si disponible

## 📊 Comparaison des Modes

| Aspect | Mode Fallback | Mode Gemini (Dev) | Mode Backend (Prod) |
|--------|---------------|-------------------|---------------------|
| **Configuration** | Aucune | `.env` frontend | `.env` backend |
| **Sécurité** | ✅ Aucun risque | ⚠️ Clé exposée | ✅ Sécurisé |
| **Qualité réponses** | Basique | ✅ Excellente | ✅ Excellente |
| **Rapidité** | ⚡ Instantané | 🐌 1-3 secondes | 🐌 1-3 secondes |
| **Coût** | Gratuit | Quota Gemini | Quota Gemini |
| **Contexte** | ✅ Toutes les données | ✅ Toutes les données | ✅ Toutes les données |
| **Recommandation** | ✅ Développement rapide | ⚠️ Test uniquement | ✅ Production |

## 🎯 Flux de Décision du Chatbot

Le chatbot utilise cette logique en cascade :

```
Question utilisée
    ↓
1. Clé API Gemini configurée ?
   ├─ OUI → Appel Gemini avec contexte complet ✅
   │         Réponse IA avancée
   │
   └─ NON → Mode Fallback Intelligent ✅
             Réponse basée sur contexte applicatif
```

## 🧪 Test des Différents Modes

### Test Mode Fallback (Actuel)

Poser ces questions au chatbot :

1. **"Combien de politiques SIA avons-nous ?"**
   - Réponse attendue: Liste des 22 politiques avec références

2. **"Montre-moi les résultats de tests"**
   - Réponse attendue: Statistiques réelles des tests exécutés

3. **"Quels cas d'usage avons-nous ?"**
   - Réponse attendue: Liste des cas d'usage avec niveaux de risque

### Test Mode Gemini (Après configuration)

Mêmes questions, mais réponses attendues :

1. **"Combien de politiques SIA avons-nous ?"**
   - Analyse détaillée de la gouvernance
   - Recommandations personnalisées
   - Références précises aux politiques

2. **"Montre-moi les résultats de tests"**
   - Analyse des tendances
   - Identification des points faibles
   - Suggestions d'amélioration concrètes

3. **"Quels cas d'usage avons-nous ?"**
   - Évaluation des risques par cas d'usage
   - Priorisation des actions
   - Cartographie des menaces

## 🔍 Débogage

### Console Navigateur (F12)

**Mode Fallback** :
```
💡 Récupération du contexte complet de l'application...
💡 Mode fallback intelligent - génération de réponse à partir du contexte applicatif
📊 Contexte disponible: { policies: 22, tests: 250, useCases: 15, vulnerabilities: 45 }
```

**Mode Gemini** :
```
💡 Récupération du contexte complet de l'application...
💡 Utilisation de la clé API Gemini locale (mode développement)
[Pas d'erreur, réponse IA générée]
```

**Erreurs communes** :

1. **"⚠️ Erreur API Gemini: API key not valid"**
   - Vérifier la clé dans `.env`
   - Vérifier qu'elle commence par `AIza`
   - Régénérer une clé sur AI Studio

2. **"❌ Erreur dans agentic service"**
   - Vérifier la console pour détails
   - Vérifier que le contexte est bien passé

3. **Erreur CORS (backend)**
   - Normal si backend pas démarré
   - Le mode fallback prend le relais automatiquement

## 📝 Notes Importantes

1. **Coût Gemini API** :
   - Quota gratuit : 15 requêtes/minute, 1500 requêtes/jour
   - Au-delà : facturation selon usage
   - Surveiller sur [AI Studio](https://aistudio.google.com/app/apikey)

2. **Taille du Contexte** :
   - Le chatbot envoie TOUTES les données à Gemini
   - Peut être volumineux (plusieurs MB de JSON)
   - Gemini 2.5 Flash : contexte jusqu'à 1M tokens

3. **Performance** :
   - Mode Fallback : < 100ms (instantané)
   - Mode Gemini : 1-3 secondes (appel API)
   - Prévoir un indicateur de chargement (déjà implémenté)

4. **Données Sensibles** :
   - Le contexte contient toutes vos données applicatives
   - Envoyé à Google si mode Gemini activé
   - Pour données sensibles : utiliser backend sécurisé + chiffrement

## 🚀 Recommandations

### Pour Développement Local
✅ Utiliser le mode fallback (aucune config)
✅ Tester les différentes fonctionnalités
✅ Valider l'UX et les flux

### Pour Tests Avancés
✅ Configurer clé API Gemini dans `.env` frontend
✅ Tester les réponses IA
✅ Affiner les prompts système
⚠️ Surveiller le quota API

### Pour Production
✅ Configurer le backend NestJS
✅ Clé API uniquement dans `backend/.env`
✅ Jamais exposer la clé côté client
✅ Implémenter rate limiting
✅ Logger les requêtes pour audit

## 📚 Ressources

- [Google AI Studio](https://aistudio.google.com/app/apikey)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Pricing Gemini API](https://ai.google.dev/pricing)
- [Backend Setup Guide](./QUICK_START_MCP.md)
- [Security Best Practices](./SECURITY_FIX_GEMINI.md)

---

**État actuel** : ✅ Mode Fallback Intelligent actif (http://localhost:5085)
**Prêt à tester** : ✅ Oui, sans configuration!
**Pour IA avancée** : Suivre "Configuration du Mode IA Générative" ci-dessus
