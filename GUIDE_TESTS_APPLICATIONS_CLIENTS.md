# 📘 Guide Complet : Tester des Applications Clientes en Toute Sécurité

## 🎯 Objectif de ce Guide

Ce guide vous explique **pas à pas** comment utiliser AI RISK MANAGER pour tester des applications IA clientes (chatbots, RAG, multimodal, etc.) **sans commettre d'erreurs** et **sans risque de pénalité professionnelle**.

---

## ⚠️ AVERTISSEMENTS CRITIQUES - À LIRE IMPÉRATIVEMENT

### Risques Professionnels Majeurs

Lorsque vous testez des applications clientes, vous êtes exposé à plusieurs risques :

| Risque | Description | Impact Potentiel | Prévention |
|--------|-------------|------------------|------------|
| **Coûts imprévus** | Les tests consomment des crédits API (OpenAI, Anthropic, AWS Bedrock, etc.) | Facture de centaines/milliers d'euros | Limiter le volume, obtenir budget client |
| **Surcharge serveur** | Volume élevé de requêtes simultanées | Ralentissement ou crash de l'app cliente | Configurer rate limit strict (10 req/min max) |
| **Données sensibles** | Prompts de test contiennent du contenu potentiellement offensant | Violation de politique d'usage, logs compromettants | Utiliser environnement de dev, jamais prod |
| **Rate limiting** | Dépasser les limites API du client | Blocage temporaire ou permanent de l'API | Respecter les limites, commencer petit (5-10 tests) |
| **Audit trail** | Vos tests apparaissent dans les logs du client | Confusion, questions sur activité suspecte | Prévenir le client AVANT les tests |
| **Perte de confiance** | Erreur de configuration cause des dommages | Perte du contrat client | Utiliser le mode guidé, toujours valider config |

### Règles d'Or (à respecter SYSTÉMATIQUEMENT)

✅ **1. Autorisation Écrite Obligatoire**
- Obtenir un email du client autorisant explicitement les tests de sécurité
- Préciser : date, heure, volume de tests, environnement (dev/staging/prod)
- Conserver cette autorisation pour votre protection légale

✅ **2. Environnement de Test Prioritaire**
- **TOUJOURS** tester sur DEV ou STAGING en premier
- **JAMAIS** sur PROD sans autorisation explicite ET tests dev réussis
- Si pas de dev disponible : réduire drastiquement le volume (5 tests max)

✅ **3. Volume Progressif**
- Commencer avec 5-10 tests MAXIMUM
- Valider que tout fonctionne correctement
- Augmenter progressivement si résultats OK

✅ **4. Communication Proactive**
- Prévenir le client 24h avant les tests (email avec détails)
- Notifier le début des tests (SMS ou call)
- Envoyer un rapport immédiatement après

✅ **5. Mode Blackbox par Défaut**
- Ne demander les credentials (mode whitebox) que si absolument nécessaire
- Moins de risques de compromission
- Plus rapide à configurer

✅ **6. Sauvegarde Systématique**
- Sauvegarder TOUTES les configurations
- Logger TOUTES les actions
- Conserver les résultats pour audit

---

## 🗂️ Architecture Multi-Applications Supportées

AI RISK MANAGER peut tester **10 types d'architectures différentes** :

### Applications Textuelles (Compatible Promptfoo Directement)

| Type | Description | Durée Test | Exemples |
|------|-------------|------------|----------|
| **LLM Chatbot** | Chatbot conversationnel simple | 5-30 min | Support client, assistant virtuel |
| **RAG** | Retrieval Augmented Generation | 10-45 min | Chatbot sur documentation, Q&A knowledge base |
| **Agentic RAG** | RAG avec agents autonomes | 15-60 min | Assistant avec actions (API calls, tool use) |
| **Code Generation** | Génération de code | 10-40 min | GitHub Copilot-like, code completion |
| **Pipeline Complexe** | Bedrock + LangFuse + LiteLLM Gateway + MCP + A2A | 20-90 min | Architecture multi-composants |

### Applications Multimodales (Tests Custom Requis)

| Type | Description | Test Disponible | Exemples |
|------|-------------|-----------------|----------|
| **Text-to-Speech** | Conversion texte → audio | ⚠️ Semi-auto (validation manuelle) | Synthèse vocale |
| **Text-to-Video** | Conversion texte → vidéo | ⚠️ Semi-auto (validation manuelle) | Création vidéo IA |
| **Video-to-Text** | Transcription vidéo → texte | ⚠️ Semi-auto | Sous-titrage auto |
| **Speech-to-Text** | Reconnaissance vocale | ⚠️ Semi-auto | Transcription audio |
| **Autre** | Architectures custom | ⚠️ Manuel | Image generation, etc. |

---

## 📋 Workflow Complet : Tester vos 10 Applications

### Phase 1 : Préparation (AVANT tout test)

#### Étape 1.1 : Obtenir les Autorisations

**Action :** Envoyer un email au client avec ce template :

```
Objet : Demande d'autorisation - Tests de Sécurité IA

Bonjour [Nom Client],

Dans le cadre de notre mission d'audit de sécurité IA, nous souhaitons effectuer
des tests de sécurité sur votre application [Nom Application].

DÉTAILS DES TESTS :
- Date prévue : [JJ/MM/AAAA] entre [HH:MM] et [HH:MM]
- Volume : [X] tests (environ [Y] requêtes API)
- Environnement : [DEV / STAGING / PRODUCTION]
- Type de tests : Red teaming automatisé (prompt injection, jailbreak, PII, etc.)
- Durée estimée : [X] minutes

IMPACT ATTENDU :
- Consommation API estimée : [X] tokens / [Y]€ de crédits
- Logs générés : Environ [X] entrées dans vos systèmes
- Aucun impact utilisateur final (si environnement de dev)

Merci de confirmer votre autorisation par retour d'email.

Cordialement,
[Votre Nom]
```

**Conserver la réponse du client comme preuve.**

#### Étape 1.2 : Collecter les Informations

Pour chaque application à tester, rassemblez :

**Mode Blackbox (Minimum requis) :**
- ✅ URL de l'endpoint API
- ✅ Méthode HTTP (généralement POST)
- ✅ Format du body de requête (exemple de payload)
- ✅ Chemin de réponse dans le JSON (ex: `data.response`)

**Mode Whitebox (Si accès complet) :**
- ✅ API Key ou Token d'authentification
- ✅ Headers personnalisés (si nécessaire)
- ✅ Rate limits de l'API
- ✅ Budget/quota disponible

**Informations Contextuelles :**
- ✅ Nom du client/propriétaire
- ✅ Type d'architecture (chatbot, RAG, etc.)
- ✅ Environnement (dev/staging/prod)
- ✅ Plugins Promptfoo à ÉVITER (harmful-* pour prod)

#### Étape 1.3 : Organiser vos 10 Applications

Créez un tableau Excel/Google Sheets :

| # | Nom Application | Client | Architecture | Env | Mode | URL | Status Auth | Notes |
|---|----------------|--------|--------------|-----|------|-----|-------------|-------|
| 1 | Chatbot Support | Acme Corp | LLM Chatbot | DEV | Blackbox | https://... | ✅ | Pas de limite |
| 2 | RAG Docs Tech | Beta Inc | RAG | STAGING | Whitebox | https://... | ⚠️ Demander token | Rate 10/min |
| 3 | Video Transcription | Gamma LLC | Video-to-Text | PROD | Blackbox | https://... | ✅ | 5 tests max |
| ... | ... | ... | ... | ... | ... | ... | ... | ... |

---

### Phase 2 : Configuration dans AI RISK MANAGER

#### Étape 2.1 : Ouvrir le Gestionnaire d'Applications

1. Lancer AI RISK MANAGER : `npm run dev`
2. Naviguer vers **"Applications à Tester"** > **"Profils d'Applications"** dans la sidebar
3. Lire attentivement l'avertissement de sécurité qui s'affiche
4. Cliquer sur **"J'ai lu et compris les risques"**

#### Étape 2.2 : Créer un Profil pour chaque Application

**Pour chaque application dans votre liste de 10 :**

1. **Cliquer sur "Ajouter avec le Wizard"** (mode guidé recommandé)

2. **Étape 1/6 : Informations de Base**
   - **Nom :** Utilisez un nom descriptif incluant le client
     - ✅ Bon : "Chatbot Support Client - Acme Corp"
     - ❌ Mauvais : "Chatbot1"
   - **Description :** Détaillez l'usage et l'environnement
     - Exemple : "Chatbot de support client avec RAG sur documentation technique. Environnement: STAGING. Budget: 100€."
   - **Propriétaire/Client :** Nom du client (important pour rapports)
   - ➡️ Cliquer **"Suivant"**

3. **Étape 2/6 : Architecture et Testabilité**
   - **Type d'Architecture :** Sélectionner dans la liste déroulante
     - Le système détecte automatiquement la compatibilité Promptfoo
     - ✅ Vert = Compatible Promptfoo (tests auto)
     - ⚠️ Orange = Tests custom requis
   - **Mode de Test :**
     - **Blackbox** : Recommandé pour commencer (pas de credentials requis)
     - **Whitebox** : Seulement si vous avez API key/token
   - ⚠️ Si Whitebox : Lire attentivement les précautions affichées
   - ➡️ Cliquer **"Suivant"**

4. **Étape 3/6 : Configuration de l'Endpoint**
   - **URL de l'Endpoint :** Copier-coller l'URL fournie par le client
     - ⚠️ Vérifier 2 fois qu'il n'y a pas de typo !
     - Exemple : `https://api.acmecorp.com/v1/chat`
   - **Méthode HTTP :** Généralement POST
   - **Template du Body :** (Optionnel mais recommandé)
     - Utiliser `{{prompt}}` comme placeholder
     - Exemple :
       ```json
       {
         "message": "{{prompt}}",
         "model": "gpt-4",
         "stream": false
       }
       ```
   - **Chemin de la Réponse :** (Si la réponse est dans un objet JSON)
     - Exemple : `data.response` ou `choices[0].message.content`
   - ➡️ Cliquer **"Suivant"**

5. **Étape 4/6 : Authentication (si Whitebox)**
   - **Si Blackbox :** Passer directement au suivant ✅
   - **Si Whitebox :**
     - Sélectionner le type : API Key / Bearer Token / Basic Auth / OAuth / Custom
     - Entrer les credentials fournis par le client
     - ⚠️ Cliquer sur l'œil pour vérifier que vous avez bien copié (pas de typo)
     - 🔒 **IMPORTANT :** Les credentials sont stockés en localStorage (non chiffré par défaut)
       - Ne PAS utiliser sur un ordinateur partagé
       - Supprimer les credentials après les tests si non réutilisables
   - ➡️ Cliquer **"Suivant"**

6. **Étape 5/6 : Configuration de Sécurité** (⚠️ ÉTAPE CRITIQUE)
   - **Rate Limit (req/min) :**
     - **Production :** 5-10 req/min MAX
     - **Staging :** 10-20 req/min
     - **Dev :** 20-30 req/min
     - ⚠️ Ne JAMAIS dépasser 100 req/min
   - **Limite de tests par session :**
     - **1er test :** 10 tests max (validation)
     - **Tests suivants :** 50-100 tests
     - **Audit complet :** 200-500 tests (avec autorisation)
   - **Cocher les options :**
     - ✅ **Confirmation obligatoire** : Recommandé pour apps clientes
     - ⚠️ **Application en Production** : Active des protections supplémentaires
       - Désactive automatiquement les plugins dangereux (harmful-*)
       - Force la confirmation
       - Active l'audit trail complet
   - ➡️ Cliquer **"Suivant"**

7. **Étape 6/6 : Preview et Confirmation**
   - **Vérifier ATTENTIVEMENT tous les paramètres affichés**
   - Checklist de validation :
     - ☐ Le nom est correct et descriptif
     - ☐ L'URL est exacte (pas de typo)
     - ☐ Le mode Blackbox/Whitebox est approprié
     - ☐ Le rate limit est raisonnable (10 req/min pour prod)
     - ☐ La limite de tests est conservative (10-50 pour 1er test)
     - ☐ Le flag Production est correctement défini
   - **Lire la dernière vérification** avec les 4 confirmations
   - ✅ Cliquer **"Sauvegarder la Configuration"**

8. **Répéter pour vos 9 autres applications**

---

### Phase 3 : Exécution des Tests

#### Étape 3.1 : Sélectionner une Application à Tester

1. Dans le gestionnaire d'applications, vous voyez vos 10 applications en grille
2. **Commencer par une application DEV non-critique**
3. Cliquer sur le bouton **"Tester"** de l'application choisie

#### Étape 3.2 : Configurer le Test Promptfoo

1. Le système vous redirige vers **"Tests de Sécurité"** > **"Configuration"**
2. **Sélectionner les catégories de test :**
   - **Pour 1er test (validation) :**
     - Choisir 1-2 catégories seulement (ex: "Sécurité et Confidentialité")
   - **Pour audit complet :**
     - Sélectionner toutes les catégories pertinentes
3. **Volume de tests :**
   - 1er test : 5-10 tests
   - Validation : 20-50 tests
   - Audit complet : 100-500 tests
4. **Sensibilité :**
   - Commencer avec "Normal"
   - Passer à "Strict" si peu d'échecs détectés

#### Étape 3.3 : Générer la Configuration YAML

1. Naviguer vers **"Édition YAML"** (étape 2)
2. Le système génère automatiquement le `promptfooconfig.yaml`
3. **Vérifier le YAML généré :**
   - L'URL target est correcte
   - Le nombre de tests (`numTests`) est raisonnable
   - Les plugins sélectionnés sont appropriés
4. **Télécharger le YAML** (bouton "Télécharger")
5. Passer à l'étape suivante

#### Étape 3.4 : Exécuter Promptfoo

**Le système détecte automatiquement si le backend est disponible :**

**Scénario A : Backend Disponible (Mode Auto)**
- Le système affiche : "✅ Backend disponible - Mode automatique activé"
- Cliquer sur **"Lancer les Tests"**
- Suivre la progression en temps réel
- Attendre la fin (5-30 minutes selon volume)

**Scénario B : Backend Indisponible (Mode Manuel)** ⬅️ VOTRE CAS ACTUEL
- Le système affiche : "⚠️ Backend non disponible - Mode manuel activé"
- **Suivre les 4 étapes affichées :**

  **Étape 1 : Télécharger le YAML**
  - Cliquer sur le bouton "Télécharger YAML"
  - Sauvegarder dans : `C:\Users\globa\ai_risk_and_red_team_manager\guardrails_AI_expert\guardrail\solution_promptfoo\ai-risk-guardrails-tests\`

  **Étape 2 : Ouvrir un Terminal**
  - Ouvrir Git Bash ou PowerShell
  - Copier la commande affichée (bouton "Copier") :
    ```bash
    cd C:\Users\globa\ai_risk_and_red_team_manager\guardrails_AI_expert\guardrail\solution_promptfoo\ai-risk-guardrails-tests
    ```
  - Coller dans le terminal et valider

  **Étape 3 : Lancer les Tests**
  - **Pour test rapide (5-10 min) :**
    - Copier la commande : `npm run test:quick`
    - Coller et valider
  - **Pour test complet (30-60 min) :**
    - Copier la commande : `npm run test`
    - Coller et valider
  - ⏳ Attendre la fin de l'exécution
  - Les résultats sont sauvegardés dans : `./output/`

  **Étape 4 : Visualiser les Résultats**
  - Copier la commande : `npm run view`
  - Coller et valider
  - Le navigateur s'ouvre automatiquement sur : `http://localhost:15500`
  - Analyser les résultats dans l'interface Promptfoo

#### Étape 3.5 : Analyser les Résultats

**Dans l'interface Promptfoo (localhost:15500) :**

1. **Vue d'ensemble :**
   - Score global (0-100)
   - Nombre de tests passés/échoués
   - Plugins avec le plus d'échecs

2. **Analyse par Plugin :**
   - Cliquer sur chaque plugin pour voir les détails
   - Identifier les prompts qui ont réussi à contourner les guardrails
   - Noter les patterns d'attaque efficaces

3. **Recommandations :**
   - Promptfoo suggère des mitigations pour chaque échec
   - Prioriser selon la criticité (Critical > High > Medium > Low)

4. **Export :**
   - Télécharger le rapport JSON complet
   - Faire des screenshots des résultats importants
   - Sauvegarder pour le rapport client

---

### Phase 4 : Rapport et Suivi

#### Étape 4.1 : Créer un Rapport Client

**Structure recommandée :**

```markdown
# Rapport d'Audit de Sécurité IA
## Application : [Nom Application]
## Client : [Nom Client]
## Date : [JJ/MM/AAAA]

### 1. Résumé Exécutif
- Score global : X/100
- Nombre de tests : X
- Vulnérabilités critiques : X
- Recommandations prioritaires : X

### 2. Méthodologie
- Outil utilisé : Promptfoo via AI RISK MANAGER
- Plugins testés : [Liste]
- Volume de tests : X requêtes
- Durée : X minutes

### 3. Résultats Détaillés
#### 3.1 Vulnérabilités Critiques
[Détails avec captures d'écran]

#### 3.2 Vulnérabilités High
[Détails]

#### 3.3 Vulnérabilités Medium/Low
[Résumé]

### 4. Recommandations
1. [Action prioritaire 1]
2. [Action prioritaire 2]
...

### 5. Annexes
- Configuration des tests (YAML)
- Rapport JSON complet
- Logs d'exécution
```

#### Étape 4.2 : Envoyer au Client

**Email de clôture :**

```
Objet : Rapport d'Audit de Sécurité IA - [Nom Application]

Bonjour [Nom Client],

Veuillez trouver ci-joint le rapport d'audit de sécurité IA pour votre application
[Nom Application], réalisé le [Date].

RÉSUMÉ :
- Tests effectués : [X] requêtes sur [Y] minutes
- Score global : [X]/100
- Vulnérabilités critiques détectées : [X]

RECOMMANDATIONS PRIORITAIRES :
1. [Action 1]
2. [Action 2]

Le rapport complet est en pièce jointe. Je reste à votre disposition pour toute question.

Cordialement,
[Votre Nom]
```

**Pièces jointes :**
- Rapport PDF
- Fichier JSON Promptfoo (en ZIP)
- Configuration YAML utilisée (pour reproductibilité)

#### Étape 4.3 : Nettoyer et Archiver

**Après envoi du rapport :**

1. **Sauvegarder localement :**
   - Créer un dossier : `clients/[Nom Client]/[Date]_audit_[App Name]/`
   - Y copier : rapport, JSON, YAML, screenshots

2. **Nettoyer les credentials (si mode whitebox) :**
   - Aller dans ApplicationProfileManager
   - Éditer l'application
   - Supprimer les credentials de l'étape 4
   - Ou supprimer complètement le profil si non réutilisable

3. **Mettre à jour votre tableau Excel :**
   - Marquer l'application comme "Testée"
   - Noter la date et le score
   - Ajouter le lien vers le dossier archive

---

## 🔥 Situations d'Urgence et Troubleshooting

### Problème 1 : Tests Bloqués par Rate Limit

**Symptômes :**
- Erreurs 429 (Too Many Requests)
- Tests très lents ou qui timeout

**Solution :**
1. **STOP immédiatement** les tests (Ctrl+C dans le terminal)
2. Attendre 5-10 minutes
3. Réduire le rate limit dans la config de sécurité
4. Relancer avec un volume réduit

### Problème 2 : Budget API Dépassé

**Symptômes :**
- Erreurs 402 (Payment Required)
- Notification de dépassement de quota

**Solution :**
1. **STOP immédiatement** les tests
2. Contacter le client pour valider le dépassement
3. Si budget atteint : arrêter définitivement les tests
4. Documenter le nombre de tests réussis avant arrêt

### Problème 3 : Application Cliente en Erreur

**Symptômes :**
- Erreurs 500 (Internal Server Error)
- Timeouts répétés
- Réponses incohérentes

**Solution :**
1. **STOP immédiatement** les tests
2. Contacter le client IMMÉDIATEMENT (call ou SMS)
3. Documenter l'erreur avec logs complets
4. Attendre validation client avant de relancer

### Problème 4 : Credentials Invalides

**Symptômes :**
- Erreurs 401 (Unauthorized)
- Erreurs 403 (Forbidden)

**Solution :**
1. Vérifier que les credentials sont corrects (copier-coller sans espace)
2. Vérifier la date d'expiration du token
3. Demander de nouveaux credentials au client
4. Passer en mode Blackbox si possible

---

## 📊 Métriques de Succès

**Pour chaque projet client, suivez ces KPIs :**

| Métrique | Objectif | Comment Mesurer |
|----------|----------|-----------------|
| Autorisation obtenue | 100% | Email de confirmation avant tests |
| Tests sans incident | >95% | Nombre de tests sans erreur bloquante |
| Respect du budget | 100% | Coût réel ≤ Budget autorisé |
| Délai de livraison | ≤ 48h | Temps entre fin tests et envoi rapport |
| Satisfaction client | ≥ 4/5 | Feedback post-audit |

---

## 🎓 Checklist Finale Avant CHAQUE Test

Avant de lancer un test, **TOUJOURS** valider cette checklist :

- [ ] **Autorisation écrite du client obtenue et sauvegardée**
- [ ] **Client prévenu de la date/heure exacte des tests**
- [ ] **Profil d'application créé avec toutes les infos correctes**
- [ ] **URL validée (copier-coller vérifié 2 fois)**
- [ ] **Rate limit configuré de manière conservative**
- [ ] **Volume de tests raisonnable (5-10 pour 1er test)**
- [ ] **Mode Blackbox/Whitebox approprié**
- [ ] **Flag Production correctement défini**
- [ ] **Environnement de test (DEV/STAGING) privilégié**
- [ ] **YAML généré et téléchargé**
- [ ] **Budget API vérifié avec le client**
- [ ] **Plan B en cas de problème (contact client direct)**

**Si UN SEUL item n'est pas coché → NE PAS LANCER LES TESTS**

---

## 📞 Support et Questions

**Problème technique avec AI RISK MANAGER :**
- Consulter : `QUICK_START.md`, `INSTALLATION.md`
- Issues GitHub : https://github.com/anthropics/claude-code/issues

**Question sur Promptfoo :**
- Documentation : https://promptfoo.dev/docs
- Référence plugins : `guardrail/solution_promptfoo/SOLUTION_SUMMARY.md`

**Question méthodologique sur tests de sécurité :**
- OWASP LLM Top 10 : https://genai.owasp.org/
- OWASP Agentic AI Top 15 : https://owasp.org/www-project-agentic-ai-top-15/

---

## 🏆 Bonnes Pratiques Récapitulatives

1. **Toujours commencer petit** : 5-10 tests pour validation
2. **Toujours utiliser DEV d'abord** : Sauf impossibilité absolue
3. **Toujours obtenir autorisation écrite** : Protection légale
4. **Toujours prévenir le client** : Communication proactive
5. **Toujours sauvegarder** : Config, résultats, logs
6. **Toujours documenter** : Rapport détaillé et professionnel
7. **Toujours nettoyer** : Supprimer credentials après usage
8. **Toujours suivre** : Demander feedback client

---

**Dernière mise à jour :** 2025-01-31

**Auteur :** AI RISK MANAGER Team

**Licence :** Documentation interne - Ne pas redistribuer
