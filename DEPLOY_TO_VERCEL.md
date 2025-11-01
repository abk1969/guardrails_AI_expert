# 🚀 Déploiement Rapide sur Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/abk1969/guardrails_AI_expert)

---

## ⚡ Déploiement en 3 Minutes

### 1. Cliquer sur "Deploy to Vercel"

Cliquez sur le bouton ci-dessus ou allez sur : https://vercel.com/new/clone?repository-url=https://github.com/abk1969/guardrails_AI_expert

### 2. Configurer les Variables d'Environnement

**REQUIRED** (obligatoire) :
```
GEMINI_API_KEY=your_gemini_api_key_here
```

**OPTIONAL** (si vous déployez le backend) :
```
VITE_API_URL=https://your-backend.vercel.app/api/v1
VITE_MCP_API_URL=https://your-backend.vercel.app/api/v1/mcp
VITE_MCP_MOCK_MODE=false
```

**Mode Standalone** (frontend uniquement, sans backend) :
```
VITE_MCP_MOCK_MODE=true
```

### 3. Déployer

Cliquer sur "Deploy" et attendre 2-3 minutes.

---

## 🎯 URLs de Production

Après le déploiement, vous obtiendrez une URL comme :

```
https://guardrails-ai-expert.vercel.app
```

Ou

```
https://guardrails-ai-expert-xxx.vercel.app
```

---

## ✅ Vérification du Déploiement

1. **Accéder à l'URL** de production
2. **Vérifier** que la page se charge
3. **Tester** le Mode Débutant :
   - Aller dans "📋 Étape 0 : Applications à Tester"
   - Créer un profil d'application
   - Aller dans "🚀 Mode Débutant"
   - Lancer l'Assistant Guidé

---

## 🔧 Configuration Avancée

### Custom Domain

1. Aller dans **Settings** > **Domains**
2. Ajouter votre domaine (ex: `ai-risk.example.com`)
3. Configurer les DNS selon les instructions Vercel
4. Mettre à jour `CORS_ORIGIN` du backend si nécessaire

### Environment Variables par Environment

Vercel supporte 3 environments :
- **Production** : Branche `main`
- **Preview** : Pull Requests
- **Development** : Local

Vous pouvez configurer différentes variables pour chaque environment.

---

## 🔄 Continuous Deployment

Vercel déploie automatiquement :

### Push sur `main`
```bash
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push origin main
```
→ Déploiement automatique en production

### Pull Request
```bash
git checkout -b feature/new-feature
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push origin feature/new-feature
```
→ Créer une PR sur GitHub
→ Vercel crée un preview deployment avec URL unique

---

## 📊 Monitoring

### Build Logs

Voir les logs de build dans le dashboard Vercel :
- **Deployments** > Cliquer sur le déploiement
- **Build Logs** : Voir les logs de build
- **Function Logs** : Voir les logs d'exécution

### Analytics

Activer Vercel Analytics (gratuit) :
1. **Analytics** > **Enable Analytics**
2. Ajouter le snippet de code (déjà configuré)
3. Voir les métriques en temps réel

---

## 🐛 Dépannage

### Build Failed

**Erreur commune** : "Build failed with exit code 1"

**Solution** :
```bash
# Tester localement
npm run build

# Si ça échoue, vérifier les erreurs TypeScript
npx tsc --noEmit
```

### 404 on Page Reload

**Cause** : SPA routing non configuré

**Solution** : Vérifier que `vercel.json` contient :
```json
{
  "routes": [
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

### API Not Available

**Cause** : Backend non déployé ou URL incorrecte

**Solutions** :
1. **Mode Standalone** : Mettre `VITE_MCP_MOCK_MODE=true`
2. **Avec Backend** : Vérifier `VITE_API_URL` pointe vers le bon endpoint

---

## 📚 Documentation Complète

Pour plus de détails, consultez :
- [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) - Guide complet
- [QUICK_START.md](./QUICK_START.md) - Démarrage rapide
- [INSTALLATION.md](./INSTALLATION.md) - Installation locale

---

## 🎉 C'est Tout !

Votre application AI RISK MANAGER est maintenant déployée sur Vercel ! 🚀

**URL de Production** : Copier l'URL depuis le dashboard Vercel

**Next Steps** :
1. Configurer un domaine personnalisé
2. Activer Vercel Analytics
3. Configurer les alertes de monitoring
4. Déployer le backend (optionnel)

---

## 🆘 Support

**Questions ?** :
- GitHub Issues : https://github.com/abk1969/guardrails_AI_expert/issues
- Documentation : Voir les fichiers `.md` dans le repository
- Vercel Support : https://vercel.com/support

---

**Powered by** :
- ⚡ Vite
- ⚛️ React 19
- 🎨 Tailwind CSS
- 🔒 OWASP Security Standards
- 🚀 Vercel Edge Network
