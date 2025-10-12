# Simulateur de Test de Guardrails LLM

## 1. Vision et Objectifs de Gouvernance

Ce document détaille l'architecture, le fonctionnement et les processus du **Simulateur de Test de Guardrails LLM**. Cet outil n'est pas seulement une application de test, mais une plateforme de gouvernance conçue pour fournir une assurance quantifiable sur la robustesse, la sécurité et la conformité des systèmes basés sur les grands modèles de langage (LLM).

L'objectif principal est de permettre aux équipes techniques, de sécurité, de risque et de conformité de :
- **Valider** systématiquement les politiques de sécurité (guardrails).
- **Tracer** de bout en bout le cycle de vie d'une requête de test.
- **Auditer** les résultats avec des preuves détaillées pour chaque décision.
- **Mesurer** l'amélioration continue de la posture de sécurité de l'IA.

Chaque fonctionnalité décrite ci-dessous a été conçue avec les principes de **transparence, de répétabilité et d'auditabilité** à l'esprit.

---

## 2. Le Cycle de Vie d'un Test : de la Configuration à l'Action

Le processus de test est un pipeline séquentiel et traçable. Voici la description détaillée de chaque phase.

### Phase 1 : Configuration du Test (`TestConfiguration.tsx`)

Tout commence sur le **Tableau de bord**. L'utilisateur configure une nouvelle campagne de test en définissant quatre piliers essentiels.

#### 2.1. Sélection des Catégories de Risque
L'utilisateur sélectionne les catégories de guardrails à évaluer parmi les cinq domaines de risque prédéfinis :
- **Sécurité et Confidentialité**
- **Pertinence et Réponse**
- **Qualité Linguistique**
- **Validation de Contenu**
- **Validation Logique**

**Processus sous-jacent :**
- L'état `selectedCategories` est mis à jour dans le composant.
- Cette sélection agit comme un filtre pour la phase de génération des prompts. Seuls les modèles de prompts (`PromptTemplate`) appartenant aux catégories choisies seront utilisés comme exemples pour le LLM générateur.

#### 2.2. Configuration du Jeu de Données
L'utilisateur affine la nature des tests à effectuer :
- **Complexité des Prompts :** Sélectionne un ou plusieurs niveaux (`Simple`, `Moyen`, `Sophistiqué`). Ceci permet de simuler différents types d'attaques, des plus naïves aux plus élaborées.
- **Volume de Prompts :** Un curseur définit le nombre total de tests à générer et à exécuter (de 10 à 1000).

**Processus sous-jacent :**
- Les états `complexities` et `volume` sont enregistrés.
- Ces paramètres sont des arguments directs pour le service de génération de prompts. Ils contrôlent la quantité et la nature du jeu de données qui sera créé dynamiquement pour cette session de test.

#### 2.3. Définition de la Cible (`TestTargetConfigurationModal.tsx`)
C'est une étape cruciale pour la gouvernance. L'utilisateur doit définir précisément le système d'IA qui sera testé.
- **Création/Sélection :** L'utilisateur peut choisir une cible existante ou en créer une nouvelle.
- **Configuration Détaillée :** La modale de configuration impose de fournir des informations précises :
    - **Nom de la Configuration :** Un identifiant unique et lisible (ex: `Agent de Support v1.2 - Production`).
    - **Type de Composant IA :** Sélectionner une architecture (ex: `Modèle de fondation`, `Système RAG`) pré-remplit les champs avec des modèles pour guider l'utilisateur.
    - **Endpoint URL :** L'URL exacte de l'API à appeler.
    - **Headers :** Les en-têtes HTTP requis (ex: `Content-Type`, `api-key`). Une validation s'assure qu'aucun champ n'est vide.
    - **Modèle de Corps de Requête (JSON) :** Le corps exact de la requête API. **Ceci est un point de contrôle capital.** Le placeholder `{{prompt}}` doit être présent pour indiquer où le simulateur doit injecter le prompt de test.
    - **Chemin d'Extraction de la Réponse :** Un chemin (ex: `choices[0].message.content`) qui indique au simulateur où trouver la réponse textuelle du LLM dans le JSON de réponse de l'API.

**Processus sous-jacent :**
- L'ensemble de ces informations est stocké dans un objet `TestTarget`.
- Ce "jumeau numérique" de la configuration de l'API garantit que les tests sont exécutés dans des conditions identiques à celles de la production, assurant ainsi la pertinence des résultats.

Une fois ces trois sections remplies, le bouton **"Lancer le Test"** devient actif.

### Phase 2 : Génération Dynamique du Jeu de Données (`geminiService.ts`)

Au clic sur "Lancer le Test", le flux d'exécution n'attaque pas immédiatement la cible. Il prépare d'abord un jeu de données unique et adapté.

**Processus sous-jacent :**
1.  La fonction `startTest` du contexte `TestRunContext` est appelée avec l'objet de configuration complet.
2.  Elle appelle à son tour la fonction `generateTestPrompts` du service `geminiService.ts`.
3.  **Appel à l'API Gemini :** Une requête est envoyée au modèle `gemini-2.5-flash`. Le prompt envoyé à Gemini est structuré pour lui demander de générer un nombre spécifique de prompts de test, pour les catégories et les complexités sélectionnées par l'utilisateur. Pour garantir une haute qualité, des exemples tirés de `INITIAL_PROMPT_TEMPLATES` sont inclus dans le prompt.
4.  **Réponse Structurée :** La requête spécifie un `responseSchema` pour forcer Gemini à retourner une réponse au format JSON (`{ "prompts": ["...", "...", ...] }`). Cela évite les erreurs de parsing et garantit la fiabilité du processus.
5.  **Gestion des Erreurs :** Si l'appel à l'API Gemini échoue (limite de quota, panne, etc.), le système bascule sur un **mode dégradé**. Il génère des variations simples des prompts stockés localement (`INITIAL_PROMPT_TEMPLATES`) pour ne pas interrompre le test. Ce fallback est une mesure de résilience.
6.  Le service retourne un tableau d'objets `TestPrompt`, qui constitue le jeu de données sur mesure pour cette session de test.

### Phase 3 : Exécution et Évaluation Simulées (`testRunnerService.ts`)

Avec le jeu de données en main, le `mockTestRunner` est lancé. Ce service **simule** l'interaction avec la cible et l'évaluation par les guardrails. C'est une simulation à haute fidélité qui produit un audit trail détaillé pour chaque prompt.

**Processus pour un seul prompt :**
Pour chaque prompt du jeu de données, la séquence suivante est exécutée :

1.  **Étape 1 : Mise en File d'Attente (`Prompt Queued`)**
    - Une première entrée est ajoutée à la `evaluationChain`. Elle certifie que le prompt a été accepté pour le test.
    - **Statut :** `INFO`.

2.  **Étape 2 : Analyse Pré-LLM (`Pre-LLM Analysis`)**
    - Simule une première couche de guardrails qui analyse le prompt de l'utilisateur avant qu'il n'atteigne le LLM (ex: détection d'injection de prompt, PII).
    - Dans la simulation actuelle, cette étape passe toujours.
    - **Statut :** `PASSED`.

3.  **Étape 3 : Appel API (`LLM API Call`)**
    - Enregistre l'intention d'envoyer le prompt à l'endpoint cible configuré.
    - **Statut :** `INFO`.

4.  **Étape 4 : Réception de la Réponse (`LLM Response Received`)**
    - Confirme qu'une réponse a été (simultanément) reçue.
    - **Statut :** `INFO`.

5.  **Étape 5 : Analyse Post-LLM (`Post-LLM Analysis`) - Le Cœur de la Logique**
    - C'est l'étape la plus critique. Elle simule les guardrails qui analysent la réponse générée par le LLM.
    - **Logique de Décision :**
        - Un `failureChance` (probabilité d'échec) est calculé en fonction de la `Sensitivity` configurée pour la catégorie du prompt (`Tolérant`, `Normal`, `Strict`). Un niveau "Strict" augmente significativement la probabilité de détecter une violation.
        - Un `Math.random()` détermine si le test est `FAILED` ou `PASSED`.
        - Un `score` est généré : bas (0-40) en cas d'échec, élevé (60-100) en cas de succès.
    - Une entrée est ajoutée à la `evaluationChain` avec le verdict.
    - **Statut :** `FAILED` ou `PASSED`.

6.  **Étape 6 : Décision Finale (`Final Decision`)**
    - L'étape finale enregistre l'action qui aurait été prise (bloquer la réponse ou l'approuver).
    - Si le test a échoué, une **suggestion de remédiation** est sélectionnée depuis `REMEDIATION_SUGGESTIONS` en fonction de la catégorie du prompt.
    - **Statut :** `FAILED` ou `PASSED`.

À chaque fois qu'un prompt termine ce cycle, le service `mockTestRunner` appelle la fonction `onProgress`, qui met à jour l'état global de l'application via `setResults`.

### Phase 4 : Visualisation en Temps Réel (`LiveTestView.tsx`)

Pendant que le `mockTestRunner` s'exécute en arrière-plan, l'interface utilisateur passe à la vue `LiveTestView`.

- **Barre de Progression :** Se remplit en fonction du nombre de résultats reçus par rapport au volume total.
- **Statistiques en Direct :** Les compteurs `Passés`, `Échoués`, `En Attente` sont mis à jour à chaque résultat reçu.
- **Chaîne de Traitement Animée :** Le dernier prompt complété est affiché avec son statut (`PASSED`/`FAILED`) et traverse une animation de pipeline. Cela donne une représentation visuelle et immédiate du processus de test en cours.

### Phase 5 : Analyse des Résultats et Remédiation

Une fois tous les tests terminés (`progress === 100`), l'interface affiche le composant `RealTimeResults.tsx`, qui est le rapport final de la campagne.

#### 5.1. Vue Synthétique (`RealTimeResults.tsx`)
- **Résumé Statistique :** Un tableau de bord affiche les métriques clés : Cible testée, Total des prompts, Passés, Échoués et le **Score Global** (moyenne de tous les scores individuels).
- **Tableau des Résultats :** Une liste complète et triable de tous les tests. Par défaut, les échecs (`FAILED`) sont affichés en premier pour attirer l'attention. Chaque ligne est cliquable.

#### 5.2. Analyse Détaillée (`ResultDetailModal.tsx`)
Cliquer sur une ligne du tableau ouvre une fenêtre modale qui constitue le **rapport d'audit final pour un test unique**. C'est la preuve ultime pour la conformité.

- **Prompt et Réponse :** Affiche le prompt exact qui a été envoyé et la réponse (simulée) reçue.
- **Résumé du Verdict :** Un encadré clair indique si le test a `Passé` ou `Échoué`, avec le score et l'explication.
- **Actions Correctives Recommandées :** **Pour les tests échoués uniquement**, cette section est la plus importante. Elle affiche la suggestion de remédiation générée à la phase 3.6. Cela transforme le rapport d'un simple constat en un plan d'action.
- **Chaîne d'Évaluation :** C'est le **journal d'audit immuable**. Il affiche chaque étape du processus (de 3.1 à 3.6) avec :
    - Le nom de l'étape.
    - Son statut (`INFO`, `PASSED`, `FAILED`).
    - Des détails contextuels.
    - Un **timestamp** précis.

Cette chaîne est la preuve technique qui répond à la question "Comment en êtes-vous arrivé à cette conclusion ?".

#### 5.3. Analyse de Tendance (`Analytics.tsx`)
Cette vue offre une perspective macroscopique, essentielle pour le reporting de gouvernance.
- **Score de Conformité Global :** Affiche le score de la dernière simulation.
- **Évolution du Score :** Un graphique linéaire montre la tendance du score global dans le temps, permettant de mesurer l'efficacité des actions de remédiation.
- **Scores par Catégorie :** Un graphique à barres met en évidence les points forts et les faiblesses, permettant de prioriser les efforts (ex: "Nous sommes faibles en Validation de Contenu").
- **Distribution des Résultats :** Un diagramme circulaire montre la proportion de tests passés/échoués.

---

## 3. Gouvernance des Données et Conformité RGPD

La protection des données est une priorité fondamentale de cette application. Elle a été conçue selon les principes de **"Privacy by Design"** et **"Privacy by Default"**.

- **Traitement 100% Côté Client :** Toute l'application s'exécute **exclusivement dans votre navigateur**. Aucune information de configuration (clés API, URLs, headers) ou résultat de test n'est jamais envoyé ou stocké sur un serveur externe. Le traitement des données est entièrement local sur votre machine.

- **Données Éphémères :** Toutes les informations de la session de test sont stockées en mémoire et sont **immédiatement et définitivement effacées** lorsque vous fermez ou rafraîchissez l'onglet du navigateur. Il n'y a aucune persistance des données (pas de cookies de suivi, pas de `localStorage`, pas de base de données).

- **Minimisation des Données :** L'application ne collecte aucune donnée personnelle. Les seuls champs sensibles (clés API) sont gérés par vous et ne quittent jamais votre navigateur.

- **Sécurité Intégrée :**
    - Les champs de headers contenant des mots-clés comme "key" ou "token" sont automatiquement masqués (type `password`).
    - Une protection contre les attaques XSS est en place pour les prompts que vous ajoutez manuellement.
    - L'application est un **simulateur** et n'effectue **aucun appel réseau réel** vers l'endpoint que vous configurez, éliminant tout risque de fuite de vos identifiants.

**Avertissement :** Bien que l'application soit sécurisée, nous vous recommandons de ne jamais utiliser de données personnelles ou de production réelles dans les prompts de test personnalisés. Utilisez des données synthétiques ou anonymisées.

---

Ce cycle complet, de la configuration granulaire à l'analyse exploitable, garantit que chaque test est significatif, traçable et contribue directement à l'amélioration de la posture de sécurité et de conformité du système d'IA évalué.