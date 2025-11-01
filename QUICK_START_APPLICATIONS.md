# ⚡ Démarrage Rapide : Tester votre Première Application en 10 Minutes

## 🎯 Objectif

Configurer et tester votre **première application IA** en moins de 10 minutes.

---

## ⏱️ Étapes Rapides

### 1️⃣ Obtenir l'Autorisation (2 min)

**Envoyez ce SMS au client :**

```
Bonjour [Nom], je vais effectuer un test de sécurité IA sur [Nom App]
aujourd'hui entre [HH:MM] et [HH:MM].
Volume : 10 tests sur environnement DEV.
Confirmez par SMS svp. Merci !
```

**Attendez la confirmation avant de continuer.**

---

### 2️⃣ Lancer AI RISK MANAGER (30 sec)

```bash
cd C:\Users\globa\ai_risk_and_red_team_manager\guardrails_AI_expert
npm run dev
```

Ouvrir : **http://localhost:5082**

---

### 3️⃣ Créer le Profil d'Application (3 min)

1. **Sidebar** → **"Applications à Tester"** → **"Profils d'Applications"**

2. **Lire l'avertissement de sécurité** → Cliquer **"J'ai lu et compris les risques"**

3. **Cliquer "Ajouter avec le Wizard"**

4. **Remplir le formulaire (6 étapes) :**

   **Étape 1/6 :**
   - Nom : `Chatbot Support - [Client Name]`
   - Description : `Environnement DEV. 10 tests max.`
   - Propriétaire : `[Nom Client]`

   **Étape 2/6 :**
   - Architecture : `LLM Chatbot` (ou autre selon votre app)
   - Mode : `Blackbox` ⬅️ **Recommandé pour 1er test**

   **Étape 3/6 :**
   - URL : `https://api.example.com/v1/chat` ⬅️ **Copier-coller l'URL client**
   - Méthode : `POST`
   - Body Template :
     ```json
     {
       "message": "{{prompt}}"
     }
     ```
   - Chemin réponse : `data.response` (si applicable)

   **Étape 4/6 :**
   - Mode Blackbox → Passer directement au suivant ✅

   **Étape 5/6 :** ⚠️ **IMPORTANT**
   - Rate limit : `10` req/min
   - Limite tests : `10`
   - ✅ Cocher "Confirmation obligatoire"
   - ❌ **NE PAS** cocher "Production" si environnement DEV

   **Étape 6/6 :**
   - Vérifier tous les paramètres
   - Cliquer **"Sauvegarder"**

---

### 4️⃣ Configurer le Test (2 min)

1. Cliquer sur **"Tester"** sur votre application

2. **Tests de Sécurité** → **Configuration**
   - Catégories : Cocher **"Sécurité et Confidentialité"** uniquement
   - Volume : **10 tests**
   - Sensibilité : **Normal**

3. **Édition YAML** (étape 2)
   - Cliquer **"Télécharger YAML"**
   - Sauvegarder dans : `guardrail/solution_promptfoo/ai-risk-guardrails-tests/`

---

### 5️⃣ Lancer les Tests (5-10 min)

**Ouvrir un terminal Git Bash :**

```bash
cd C:\Users\globa\ai_risk_and_red_team_manager\guardrails_AI_expert\guardrail\solution_promptfoo\ai-risk-guardrails-tests

npm run test:quick
```

⏳ **Attendre 5-10 minutes...**

---

### 6️⃣ Voir les Résultats (1 min)

```bash
npm run view
```

📊 **Le navigateur s'ouvre automatiquement** sur `http://localhost:15500`

**Analyser :**
- Score global
- Tests échoués (vulnérabilités détectées)
- Recommandations Promptfoo

---

## ✅ Checklist Finale

Avant de lancer vos 9 autres applications :

- [ ] **Autorisation client obtenue** ✅
- [ ] **1er test réussi sans erreur** ✅
- [ ] **Résultats analysés et compris** ✅
- [ ] **Client satisfait du processus** ✅

**Si les 4 items sont cochés → Vous pouvez tester les 9 autres applications !**

---

## 🚨 En Cas de Problème

| Problème | Solution Rapide |
|----------|----------------|
| **Erreur 401/403** | Vérifier URL ou passer en mode Whitebox |
| **Erreur 429** | Réduire rate limit à 5 req/min |
| **Erreur 500** | STOP les tests, contacter le client |
| **Pas de réponse** | Vérifier le chemin de réponse JSON |

---

## 📖 Pour Aller Plus Loin

**Lire le guide complet :**
- 📘 `GUIDE_TESTS_APPLICATIONS_CLIENTS.md` (40+ pages)

**Documentation Promptfoo :**
- 📄 `guardrail/solution_promptfoo/SOLUTION_SUMMARY.md`

**Support :**
- 🐛 Issues : https://github.com/anthropics/claude-code/issues
- 📚 Docs OWASP : https://genai.owasp.org/

---

**Bon test ! 🚀**
