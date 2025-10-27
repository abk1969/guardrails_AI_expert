/**
 * Analyses GRC & Cybersécurité COMPLÈTES pour les 22 règles PSSI IA (CLUSIF 2025)
 *
 * Ce fichier contient toutes les analyses détaillées qui doivent être intégrées
 * dans aiPolicyContentNew.ts pour chaque règle SIA-01 à SIA-22
 */

export const COMPLETE_GRC_CONTENT = `
Pour chaque règle SIA, le contenu suivant doit être ajouté dans la structure de règle:

===========================================
SIA-01 : Formation des collaborateurs
===========================================

## Analyse GRC & Cybersécurité

### Menace Associée
- **MITRE ATLAS (AML.T0051)**: Mauvaise utilisation par l'humain dans la boucle
- **OWASP LLM Top 10**: L'ensemble des 10 menaces, car une équipe non formée est susceptible d'introduire n'importe laquelle de ces vulnérabilités par méconnaissance

### Risque Associé
- Introduction non intentionnelle de vulnérabilités dans le cycle de vie de l'IA (conception, développement, déploiement)
- Incapacité à détecter ou à répondre correctement à un incident de sécurité lié à l'IA, augmentant ainsi l'impact (financier, réputationnel, légal)

### Guide d'Implémentation
1. Développer un programme de formation obligatoire basé sur les modules de cette application : 'Profil de Menace', 'Vuln IA Connues', et 'Référence: Défenses'
2. Utiliser le module 'Wiki Red Teamer' comme support de formation interactif
3. Établir une veille technique sur les menaces (MITRE ATLAS, OWASP) et la partager via des sessions régulières
4. Créer des parcours de certification interne sur la sécurité IA
5. Mettre en place des ateliers pratiques de red teaming
6. Organiser des exercices de simulation d'incidents réguliers

### Guide de Test
1. **Audit des Formations**: Vérifier les registres de présence et de complétion des modules de formation
2. **Questionnaires**: Évaluer les connaissances via des quiz basés sur les scénarios des modules 'Cas d'Usage' et 'Scénarios avancés'
3. **Simulation d'Incident**: Utiliser le module 'Préparation Incidents IA' pour mener un exercice de simulation (tabletop exercise) et évaluer la réactivité et la pertinence des actions de l'équipe face à un incident simulé (ex: une injection de prompt critique)
4. **Revue de Code Ciblée**: Analyser les contributions de code des nouveaux collaborateurs pour identifier d'éventuelles incompréhensions des principes de sécurité IA, en se concentrant sur les zones à risque comme la gestion des entrées utilisateur et l'appel d'outils

### Scénarios de Risques Associés (3)

#### 1. Fuite de Données par Inadvertance lors du Débogage

Un développeur junior, non formé aux risques spécifiques des LLM, doit déboguer un problème de performance. Pour accélérer, il copie-colle un prompt incluant des données client sensibles dans un outil en ligne public (ex: 'LLM prompt checker' non officiel) pour l'analyser.

**Acteur de la Menace**: Collaborateur interne (bienveillant mais non formé)

**Vecteur d'Attaque / Vulnérabilité**: Manque de sensibilisation à la confidentialité des prompts et des données. Utilisation d'outils tiers non validés.

**Mitigation Technique Recommandée**: Implémenter une solution de prévention de perte de données (DLP) sur les postes de travail pour détecter et bloquer la copie de données sensibles (PII, prompts système) vers des sites web non autorisés. Maintenir une liste blanche (allow-list) d'outils de débogage et d'analyse validés par la sécurité.

**Impacts Potentiels**:
- **Confidentialité**: Fuite de propriété intellectuelle (prompt système) et de données personnelles (PII), entraînant une violation du RGPD
- **Financier/Stratégique**: Perte d'avantage concurrentiel, car le prompt système peut être découvert par des compétiteurs

**Mappings Référentiels**:
- LLM-02: Sensitive Information Disclosure
- AML.T0044: Training Data Leakage

#### 2. Introduction d'une Dépendance Malveillante (Supply Chain)

Une équipe MLOps, pressée de livrer, intègre une bibliothèque open-source populaire sur GitHub pour faciliter l'orchestration d'un agent IA, sans l'analyser en profondeur. La bibliothèque contient une backdoor qui exfiltre les données traitées vers un serveur contrôlé par l'attaquant.

**Acteur de la Menace**: Attaquant externe (via une bibliothèque compromise)

**Vecteur d'Attaque / Vulnérabilité**: Manque de formation sur la validation de sécurité des dépendances IA. Processus de validation de code insuffisant.

**Mitigation Technique Recommandée**: Intégrer un outil d'analyse de la composition logicielle (SCA) dans la pipeline CI/CD pour scanner automatiquement les dépendances et les bibliothèques open-source contre les vulnérabilités connues (CVEs). Instaurer un processus de validation de sécurité formel pour toute nouvelle dépendance avant son intégration.

**Impacts Potentiels**:
- **Intégrité**: Compromission du serveur d'inférence, vol de données traitées par l'agent, et potentiellement vol du modèle lui-même

**Mappings Référentiels**:
- LLM-03: Supply Chain Vulnerabilities
- T11: Unexpected RCE and Code Attacks
- AML.T0002: AI Supply Chain Compromise

#### 3. Mauvaise Configuration menant au 'Déni de Portefeuille'

Un data scientist, non formé aux risques financiers des LLM, déploie un endpoint d'API sans limite sur la longueur des prompts ou le nombre de tokens de sortie. Un attaquant l'utilise pour soumettre des requêtes extrêmement longues, consommant de manière exponentielle les crédits d'API.

**Acteur de la Menace**: Attaquant externe (opportuniste)

**Vecteur d'Attaque / Vulnérabilité**: Absence de contrôles de ressources due à une méconnaissance des risques de consommation non bornée.

**Mitigation Technique Recommandée**: Mettre en place des contrôles stricts au niveau de la passerelle d'API (API Gateway) : limitation du nombre de requêtes (rate limiting), validation de la taille des requêtes entrantes, et définition d'un quota de tokens de sortie maximal (max_tokens). Configurer des alertes de budget sur le compte cloud pour détecter toute consommation anormale.

**Impacts Potentiels**:
- **Disponibilité**: Déni de service pour les utilisateurs légitimes
- **Financier/Stratégique**: Facturation cloud exorbitante (Denial of Wallet) et interruption de service

**Mappings Référentiels**:
- LLM-10: Unbounded Consumption
- AML.T0029: Denial of Service

===========================================
SIA-02 : Sensibilisation des utilisateurs
===========================================

[Le même format détaillé pour SIA-02 avec 3 scénarios complets]

... [Continuer pour toutes les 22 règles SIA]

`;

// Note: Ce fichier est un template. Le contenu complet doit être extrait
// et structuré depuis le PDF CLUSIF original pour les 22 règles.
// Chaque règle doit suivre exactement le même format que SIA-01.
