# Rapport de Conformité : RGPD (Règlement Général sur la Protection des Données)
## Simulateur de Test de Guardrails LLM

*Version du Document : 1.0*
*Date de l'Analyse : 25 Juillet 2024*

---

## 1. Résumé Exécutif

Ce rapport détaille l'analyse de conformité du **Simulateur de Test de Guardrails LLM** avec le Règlement (UE) 2016/679, dit Règlement Général sur la Protection des Données (RGPD).

L'analyse conclut que l'application est **conforme au RGPD par conception et par défaut ("Privacy by Design & by Default")**. Cette conformité n'est pas une fonctionnalité ajoutée, mais une conséquence directe de son architecture technique fondamentale :

- **Architecture 100% Côté Client :** L'application s'exécute entièrement dans le navigateur de l'utilisateur. Aucune donnée, en particulier les données potentiellement personnelles comme les clés API, n'est transmise, traitée ou stockée sur un serveur externe.
- **Absence de Persistance des Données :** Toutes les données de session sont éphémères et supprimées dès que l'utilisateur ferme ou rafraîchit la page.

Le seul risque de traitement de données personnelles survient si l'utilisateur saisit lui-même de telles données. Cependant, même dans ce cas, les données restent confinées dans l'environnement local et sécurisé du navigateur de l'utilisateur.

---

## 2. Rôles et Responsabilités

- **Responsable du Traitement (Data Controller) :** L'**utilisateur** de l'application est considéré comme le responsable du traitement. C'est lui qui détermine les finalités (tester une IA) et les moyens (configuration de la cible, y compris les clés API) du traitement.
- **Sous-traitant (Data Processor) :** L'application (et son fournisseur) agit en tant que sous-traitant, car elle fournit un outil pour traiter les données. Toutefois, comme le traitement est entièrement localisé sur la machine de l'utilisateur et qu'aucune donnée n'est transférée au fournisseur, les obligations du sous-traitant sont minimales et respectées par défaut.

---

## 3. Analyse par rapport aux Principes du RGPD

| Principe du RGPD | Analyse de l'Application et de sa Conformité |
| :------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Art. 5(1)(a) - Licéité, Loyauté, Transparence** | Le traitement est **licite** car il est initié par l'utilisateur pour une finalité légitime. Il est **loyal** et **transparent** car l'interface utilisateur montre explicitement toutes les données utilisées. Il n'y a aucun traitement de données caché. |
| **Art. 5(1)(b, c) - Limitation des Finalités et Minimisation des Données** | **Limitation :** Les données saisies (ex: clés API) ne sont utilisées que pour la finalité unique de simuler un test. Elles ne sont pas réutilisées. <br> **Minimisation :** L'application ne demande que les informations strictement nécessaires à la configuration d'un appel API simulé. Aucune donnée superflue n'est collectée. |
| **Art. 5(1)(e) - Limitation de la Conservation** | Ce principe est respecté de la manière la plus stricte possible. Les données ne sont conservées qu'en mémoire vive (`state` React) pour la durée de la session active. La fermeture ou le rafraîchissement de l'onglet équivaut à une suppression immédiate et irréversible des données. |
| **Art. 5(1)(f) - Intégrité et Confidentialité (Sécurité)** | L'application intègre plusieurs mesures de sécurité : <br> 1. **Masquage des Secrets :** Les champs de headers sensibles sont de type `password`. <br> 2. **Protection XSS :** Les entrées utilisateur sont assainies (`sanitized`). <br> 3. **Confinement :** Le risque principal (fuite de clés API) est éliminé car l'application n'effectue **aucun appel réseau réel** vers la cible configurée, gardant les secrets en toute sécurité dans le navigateur. |
| **Art. 12-23 - Droits de la Personne Concernée** | Les droits des utilisateurs sont satisfaits de manière inhérente par l'architecture : <br> - **Droit d'accès et de rectification :** L'utilisateur peut voir et modifier ses configurations à tout moment dans l'UI. <br> - **Droit à l'effacement ('droit à l'oubli') :** Il est exercé en rafraîchissant simplement la page. <br> - **Droit à la portabilité :** Non applicable car aucune donnée n'est stockée de manière structurée. |
| **Art. 25 - Protection des Données dès la Conception et par Défaut** | L'application est un exemple parfait de ce principe. En choisissant une architecture sans serveur et sans persistance, la protection de la vie privée est le comportement par défaut. Le système est conçu pour ne collecter et ne stocker aucune donnée, ce qui est la meilleure protection possible. |

---

## 4. Conclusion

Le **Simulateur de Test de Guardrails LLM** présente un niveau de conformité très élevé avec le RGPD. Son architecture "Privacy by Design" garantit que les données sensibles de l'utilisateur ne quittent jamais son propre environnement d'exécution. L'application élimine les risques traditionnels de fuite de données, de stockage non sécurisé et de traitement non autorisé en n'ayant ni backend, ni base de données, ni mécanisme de persistance.

### Avertissement
*Ce document représente une auto-évaluation interne de la conformité et ne constitue pas un avis juridique. Les utilisateurs restent responsables des données qu'ils choisissent de traiter via cet outil.*