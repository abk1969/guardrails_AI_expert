# Architecture Technique - Simulateur de Test de Guardrails LLM

Ce document fournit une vue d'ensemble de l'architecture technique de l'application "LLM Guardrail Test Simulator".

## 1. Vue d'ensemble et Philosophie

L'application est une **Single-Page Application (SPA) 100% côté client**. Il n'y a **pas de backend serveur dédié**. Cette architecture a été choisie pour garantir la **confidentialité et la sécurité maximales** des données de l'utilisateur (clés API, configurations d'endpoint), qui ne quittent jamais son navigateur.

La philosophie est de fournir un environnement de simulation et de gouvernance robuste, où la logique de test est locale et contrôlée.

## 2. Technologies et Frameworks

- **Framework Frontend :** [React](https://react.dev/) (v19) avec [TypeScript](https://www.typescriptlang.org/) pour un typage statique robuste.
- **Build Tool :** [Vite](https://vitejs.dev/) pour un développement rapide et un build optimisé.
- **Styling :** [Tailwind CSS](https://tailwindcss.com/) pour un design basé sur des classes utilitaires, avec quelques fichiers CSS personnalisés pour des animations spécifiques.
- **Icônes :** [Lucide React](https://lucide.dev/) pour des icônes SVG légères et personnalisables.
- **SDK IA :** [`@google/genai`](https://github.com/google/generative-ai-js) pour la génération dynamique de prompts de test via l'API Gemini.

## 3. Architecture Frontend

L'application suit une architecture component-based classique avec React.

### 3.1. Structure des Dossiers

-   `/components` : Contient tous les composants React.
    -   `/ui` : Composants d'interface utilisateur réutilisables et génériques (Card, Button, Modal, etc.).
    -   `/wiki` : Composants spécifiques au module "Wiki Red Teamer".
    -   Autres composants : Chaque vue principale de l'application (Dashboard, Analytics, etc.).
-   `/contexts` : Contient les fournisseurs de contexte React pour la gestion de l'état global.
-   `/data` : Contient les données statiques structurées, comme le contenu du Wiki.
-   `/services` : Contient la logique métier découplée de l'interface utilisateur (appels API, simulation).

### 3.2. Gestion de l'État (State Management)

L'état est géré via l'**API Context de React**. Cette approche a été préférée à des bibliothèques plus lourdes (comme Redux) car l'état est bien compartimenté par domaine.

-   **`TestRunContext`**: Gère l'état d'une session de test active (en cours, terminée, résultats, progression). Cet état est **éphémère** et non persisté.
-   **`DatasetContext`**: Gère la bibliothèque de prompts d'attaque.
-   **`UseCaseContext`, `ThreatProfileContext`, etc.**: Chaque module de gouvernance possède son propre contexte pour gérer ses données.
-   **Persistance des Données**: Pour améliorer l'expérience utilisateur, les données de configuration (jeux de données, cibles, paramètres, etc.) sont persistées dans le **`localStorage`** du navigateur. Cela permet à l'utilisateur de retrouver son travail entre les sessions. Les résultats des tests historiques (`historicalRuns`) sont également stockés ici.

## 4. Logique Métier et Services

Le dossier `/services` est le cœur de la logique de l'application.

### 4.1. `geminiService.ts` - Génération de Données

-   **Rôle** : Ce service est responsable de la génération dynamique des prompts de test.
-   **Interaction IA** : C'est le **seul endroit** où un appel réseau réel est effectué vers une API d'IA externe (`Google GenAI API` avec le modèle `gemini-2.5-flash`).
-   **Processus** : Il envoie une requête structurée à Gemini, lui demandant de créer un certain volume de prompts d'attaque basés sur les catégories et complexités sélectionnées par l'utilisateur.
-   **Fallback** : En cas d'échec de l'API (simulé pour l'instant), il bascule sur une fonction `mock` qui génère des variations simples des prompts locaux pour assurer la continuité du test.

### 4.2. `testRunnerService.ts` - Le Moteur de Simulation

-   **Rôle** : Ce service **simule l'exécution des tests** contre la cible configurée par l'utilisateur.
-   **AUCUN APPEL RÉSEAU EXTERNE** : Pour des raisons de sécurité, ce service **n'effectue jamais d'appel réel** à l'URL de l'endpoint fournie par l'utilisateur. La clé API et l'URL ne sont utilisées que pour simuler une configuration réaliste.
-   **Logique de Simulation** :
    1.  Il itère sur chaque prompt généré.
    2.  Pour chaque prompt, il crée une **chaîne d'évaluation (`evaluationChain`)** qui simule les étapes d'un vrai guardrail (analyse d'entrée, appel LLM, analyse de sortie).
    3.  La décision `PASSED`/`FAILED` est déterminée de manière probabiliste en fonction de la **sensibilité** du guardrail (configurée par l'utilisateur) et de la **complexité** de l'attaque.
    4.  Il génère un score et une suggestion de remédiation en cas d'échec.

### 4.3. `sandboxService.ts` - Le Bac à Sable Local

-   **Rôle** : Gère la logique pour le mode de test "Bac à Sable Embarqué".
-   **Fonctionnement** : Au lieu d'une simulation probabiliste, il utilise une logique déterministe. Il compare les `attackTags` d'un `PromptTemplate` à une `VULNERABILITY_MAP` qui définit les types d'attaques auxquels un niveau de robustesse (`Simple`, `Moyenne`, `Complexe`) est vulnérable.
-   **Aucun Appel Réseau** : Ce mode est entièrement contenu dans le navigateur et n'a aucune dépendance externe.

## 5. Dépendances et Build

-   **Gestion des Dépendances** : L'application utilise une `importmap` dans `index.html`. Les dépendances (React, Lucide, etc.) sont chargées depuis un CDN (`aistudiocdn.com`). Cela simplifie l'environnement de build et le rend portable.
-   **Processus de Build** : `Vite` est utilisé pour transpiler le code TypeScript/TSX en JavaScript exécutable par le navigateur et pour servir l'application en développement avec rechargement à chaud.

## 6. Schéma d'Architecture de Données (Flux d'un Test)

1.  **Utilisateur (UI)**: Configure le test dans `TestConfiguration.tsx`.
2.  **`App.tsx` / `Dashboard.tsx`**: Déclenche `startTest` depuis `TestRunContext`.
3.  **`TestRunContext`**:
    -   Appelle `geminiService.generateTestPrompts()`.
    -   Reçoit la liste des `TestPrompt`.
    -   Initialise l'état des résultats (`results`) avec le statut `PENDING`.
    -   Lance `testRunnerService.mockTestRunner()`.
4.  **`testRunnerService`**:
    -   Itère sur les prompts.
    -   Pour chaque prompt, exécute la simulation.
    -   Appelle la callback `onProgress` avec le `TestResult` complet (incluant `evaluationChain`).
5.  **`TestRunContext`**:
    -   La callback met à jour l'état `results` avec le nouveau résultat.
    -   Met à jour la progression (`progress`).
6.  **React (UI)**:
    -   La mise à jour de l'état provoque un re-rendu des composants.
    -   `LiveTestView.tsx` affiche la progression, les statistiques et le dernier résultat.
7.  **Fin du Test**:
    -   `TestRunContext` met `isFinished` à `true`.
    -   Le `useEffect` dans le contexte sauvegarde le `HistoricalRun` dans `localStorage`.
    -   `Dashboard.tsx` affiche `RealTimeResults.tsx` avec le rapport final.