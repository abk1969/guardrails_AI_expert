# 🔑 Guide Rapide - Configuration Clé API Gemini

## ✅ Fichier .env Créé

Le fichier `.env` a été créé à la racine du projet :
```
C:\Users\globa\ai_risk_and_red_team_manager\guardrails_AI_expert\.env
```

## 🚀 Configuration en 3 Étapes

### Étape 1: Obtenir une Clé API Gemini

1. **Ouvrir Google AI Studio** :
   - 🔗 https://aistudio.google.com/app/apikey

2. **Se connecter** avec votre compte Google

3. **Créer une clé API** :
   - Cliquer sur "Create API Key"
   - Sélectionner un projet existant ou créer un nouveau
   - Copier la clé générée (format: `AIza...`)

4. **Quota gratuit** :
   - ✅ 15 requêtes par minute
   - ✅ 1500 requêtes par jour
   - ✅ Modèle Gemini 2.5 Flash

### Étape 2: Configurer le Fichier .env

1. **Ouvrir le fichier `.env`** dans votre éditeur

2. **Remplacer** cette ligne :
   ```env
   VITE_GEMINI_API_KEY=votre-cle-gemini-ici
   ```

3. **Par votre vraie clé** :
   ```env
   VITE_GEMINI_API_KEY=AIzaSyC-votre-cle-complete-ici
   ```

4. **Sauvegarder** le fichier

### Étape 3: Redémarrer le Serveur

1. **Arrêter** le serveur actuel :
   - Appuyer sur `Ctrl + C` dans le terminal

2. **Redémarrer** :
   ```bash
   npm run dev
   ```

3. **Vérifier** la console au démarrage :
   ```
   ⚠️ ATTENTION: Clé API Gemini détectée côté client.
   ```

## ✅ Test du Chatbot

1. **Ouvrir** http://localhost:5085

2. **Cliquer** sur le chatbot (FAB en bas à droite)

3. **Poser une question** :
   ```
   "Analyse mes 22 politiques SIA et donne-moi des recommandations"
   ```

4. **Console navigateur (F12)** :
   ```
   💡 Récupération du contexte complet de l'application...
   💡 Utilisation de la clé API Gemini locale (mode développement)
   ```

5. **Réponse attendue** :
   - Analyse détaillée de vos politiques
   - Recommandations personnalisées
   - Références précises aux données

## 🔍 Vérification

### Avec Clé API Configurée

**Console navigateur** :
```javascript
💡 Utilisation de la clé API Gemini locale (mode développement)
```

**Réponse chatbot** :
```
D'après l'analyse de vos 22 politiques SIA, votre gouvernance IA est bien
structurée autour de 4 piliers principaux:

1. Gouvernance (SIA-01 à SIA-05): Vous avez défini des rôles clairs...
2. Sécurité (SIA-06 à SIA-10): Vos contrôles couvrent les aspects essentiels...
...
```

### Sans Clé API (Mode Actuel)

**Console navigateur** :
```javascript
💡 Mode fallback intelligent - génération de réponse à partir du contexte applicatif
📊 Contexte disponible: { policies: 22, tests: X, useCases: Y, ... }
```

**Réponse chatbot** :
```
📋 Politiques SIA disponibles (22 règles):

• SIA-01: Gouvernance de l'IA
• SIA-02: Stratégie IA
...

💡 Note: Pour des analyses détaillées, configurez une clé API Gemini.
```

## ⚠️ Sécurité

### ✅ Bonnes Pratiques

1. **Fichier .env protégé** :
   - ✅ Ajouté au `.gitignore`
   - ✅ Ne sera jamais commité dans git
   - ✅ Reste sur votre machine

2. **Clé API** :
   - ⚠️ Exposée côté client (mode développement)
   - ⚠️ Visible dans le code JavaScript du navigateur
   - ⚠️ Risque de vol si partagé publiquement

3. **Utilisation** :
   - ✅ OK pour développement local
   - ❌ Ne PAS déployer en production comme ça
   - ✅ Pour production : utiliser backend sécurisé

### 🔐 Mode Production

Pour la production, configurer le backend :

```env
# backend/.env (sécurisé)
GEMINI_API_KEY=AIza...votre-cle-ici
```

Le frontend appellera le backend qui appellera Gemini.

## 🧪 Exemples de Questions

### Questions Simples (Fallback)
```
"Combien de politiques SIA avons-nous ?"
"Montre-moi les résultats de tests"
"Quels cas d'usage avons-nous ?"
```

### Questions Complexes (Nécessite Gemini)
```
"Analyse mes politiques SIA et identifie les lacunes de sécurité"
"Compare mes résultats de tests avec les meilleures pratiques OWASP"
"Propose un plan d'action pour améliorer mon score de tests"
"Quels sont les risques principaux dans mes cas d'usage et comment les mitiger ?"
```

## 📊 Coûts

### Quota Gratuit
- **15 requêtes/minute** : Largement suffisant pour développement
- **1500 requêtes/jour** : ~60 questions/heure pendant 24h
- **Coût** : 0€ 🎉

### Si Dépassement (peu probable)
- **Prix** : ~0.000125$ par requête (modèle Flash)
- **Exemple** : 10 000 requêtes = ~1.25$

### Surveillance
- Dashboard : https://aistudio.google.com/app/apikey
- Voir usage en temps réel
- Alertes si quota dépassé

## 🐛 Dépannage

### Erreur: "API key not valid"

**Cause** : Clé incorrecte ou invalide

**Solution** :
1. Vérifier la clé dans `.env`
2. Vérifier qu'elle commence par `AIza`
3. Régénérer une nouvelle clé sur AI Studio

### Erreur: "⚠️ Erreur API Gemini: 429"

**Cause** : Quota dépassé (15 req/min)

**Solution** :
1. Attendre 1 minute
2. Réessayer
3. Activer la facturation pour quota plus élevé

### Erreur: "❌ Erreur dans agentic service"

**Cause** : Problème de réseau ou API

**Solution** :
1. Vérifier la connexion internet
2. Vérifier la console pour détails
3. Le mode fallback prendra le relais automatiquement

### Le chatbot n'utilise pas Gemini

**Vérifications** :
1. ✅ Fichier `.env` existe à la racine ?
2. ✅ Variable `VITE_GEMINI_API_KEY` présente ?
3. ✅ Serveur redémarré après modification ?
4. ✅ Console affiche "Clé API Gemini détectée" ?

## 📁 Structure des Fichiers

```
guardrails_AI_expert/
├── .env                    ← Créé (contient votre clé API)
├── .env.example            ← Template de référence
├── .gitignore              ← .env ajouté (sécurité)
├── SETUP_GEMINI_API.md     ← Ce guide
├── CHATBOT_CONFIGURATION.md ← Guide complet
└── services/
    └── agenticService.ts   ← Utilise VITE_GEMINI_API_KEY
```

## 🎯 État Actuel

- ✅ Fichier `.env` créé
- ✅ Ajouté au `.gitignore`
- ⏳ Clé API à configurer
- ✅ Chatbot fonctionne en mode fallback
- ⏳ Redémarrage nécessaire après config

## 🚀 Actions

1. **Maintenant** : Le chatbot fonctionne déjà (mode fallback)
2. **Optionnel** : Configurer Gemini API pour IA avancée
3. **Test** : Ouvrir http://localhost:5085 et essayer!

---

**Fichier .env créé** : ✅
**Emplacement** : `C:\Users\globa\ai_risk_and_red_team_manager\guardrails_AI_expert\.env`
**Prochaine étape** : Ajouter votre clé Gemini ou utiliser le mode fallback
