# MCP (Model Context Protocol) Architecture

## Vue d'ensemble

L'application AI RISK MANAGER implémente une architecture MCP (Model Context Protocol) permettant au chatbot d'accéder et de requêter toutes les données de l'application pour fournir des réponses contextualisées et précises.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                         │
│                                                              │
│  ┌──────────────┐          ┌─────────────────────────────┐ │
│  │  ChatbotModern│          │   MCP Client Service        │ │
│  │  Component   │─────────▶│  (mcpClientService.ts)      │ │
│  └──────────────┘          │                             │ │
│                            │  - getRelevantContext()     │ │
│                            │  - searchPolicies()         │ │
│                            │  - getTestStatistics()      │ │
│                            │  - searchVulnerabilities()  │ │
│                            └─────────────┬───────────────┘ │
└────────────────────────────────────────────┼─────────────────┘
                                             │
                                             │ HTTP POST
                                             │ /api/v1/mcp/query
                                             ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend (NestJS)                          │
│                                                              │
│  ┌───────────────┐        ┌────────────────────────────┐   │
│  │ MCP Controller│───────▶│     MCP Service            │   │
│  │               │        │   (mcp.service.ts)         │   │
│  └───────────────┘        │                            │   │
│                           │  12 MCP Tools:             │   │
│                           │  - search_ai_policies      │   │
│                           │  - get_policy_by_reference │   │
│                           │  - search_test_results     │   │
│                           │  - get_test_statistics     │   │
│                           │  - search_use_cases        │   │
│                           │  - search_vulnerabilities  │   │
│                           │  - get_owasp_categories    │   │
│                           │  - search_prompt_templates │   │
│                           │  - get_test_targets        │   │
│                           │  - analyze_risk_trends     │   │
│                           └────────────┬───────────────┘   │
│                                        │                    │
│                                        ▼                    │
│                           ┌────────────────────────────┐   │
│                           │    Prisma ORM              │   │
│                           └────────────┬───────────────┘   │
└────────────────────────────────────────┼───────────────────┘
                                         │
                                         ▼
                            ┌──────────────────────┐
                            │   PostgreSQL DB      │
                            │                      │
                            │  - AIPolicy          │
                            │  - TestRun/Result    │
                            │  - UseCase           │
                            │  - ThreatProfile     │
                            │  - KnownVulnerability│
                            │  - PromptTemplate    │
                            └──────────────────────┘
```

## Flux de Données

### 1. Question Utilisateur → Contexte → Réponse

```
User: "Qu'est-ce que la règle SIA-01?"
   │
   ▼
ChatbotModern
   │
   ▼
geminiService.chat(message, mode)
   │
   ├─▶ mcpClient.getRelevantContext(message)
   │      │
   │      ├─▶ Détecte "SIA-01" → appelle get_policy_by_reference
   │      │
   │      └─▶ Retourne: { found: true, policy: {...} }
   │
   ├─▶ Construit prompt enrichi avec contexte
   │
   └─▶ Gemini API → Réponse contextualisée
```

## Outils MCP Disponibles

### 1. **search_ai_policies**
Recherche dans les politiques IA (22 règles SIA CLUSIF avec contenu GRC).

**Paramètres:**
- `query` (string, optional): Texte de recherche
- `reference` (string, optional): Référence spécifique (ex: "SIA-01")
- `status` (string, optional): Statut (IMPLEMENTED, IN_PROGRESS, PLANNED)
- `limit` (number, default: 50): Nombre max de résultats

**Retour:**
```typescript
{
  count: number,
  policies: Array<{
    reference: string,
    ruleText: string,
    status: string,
    associatedThreat: string,
    associatedRisk: string,
    implementationGuide: string,
    testingGuide: string,
    riskScenarios: object,
    notes: string
  }>
}
```

### 2. **get_policy_by_reference**
Obtient une politique spécifique par référence.

**Paramètres:**
- `reference` (string, required): Référence exacte (ex: "SIA-01")

**Retour:**
```typescript
{
  found: boolean,
  policy?: {
    reference: string,
    ruleText: string,
    status: string,
    associatedThreat: string,
    associatedRisk: string,
    implementationGuide: string,
    testingGuide: string,
    riskScenarios: object,
    notes: string,
    createdAt: Date,
    updatedAt: Date
  }
}
```

### 3. **search_test_results**
Recherche dans les résultats de tests guardrails.

**Paramètres:**
- `status` (string, optional): PASSED, FAILED, WARNING
- `category` (string, optional): SECURITY_PRIVACY, CONTENT_QUALITY, etc.
- `limit` (number, default: 100)

**Retour:**
```typescript
{
  count: number,
  results: Array<{
    id: string,
    promptText: string,
    category: string,
    complexity: string,
    status: string,
    score: number,
    responseText: string,
    evaluationSteps: object,
    remediation: object,
    testRun: object,
    createdAt: Date
  }>
}
```

### 4. **get_test_statistics**
Obtient les statistiques globales des tests.

**Paramètres:** Aucun

**Retour:**
```typescript
{
  total: number,
  passed: number,
  failed: number,
  passRate: string,
  byCategory: Array<{ category: string, count: number }>,
  recentRuns: Array<TestRun>
}
```

### 5. **search_use_cases**
Recherche dans les cas d'usage et évaluations de risques.

**Paramètres:**
- `query` (string, optional)
- `minRisk` (number, optional): Score de risque minimum
- `limit` (number, default: 50)

**Retour:**
```typescript
{
  count: number,
  useCases: Array<{
    id: string,
    useCase: string,
    impact: number,
    likelihood: number,
    riskScore: number,
    recommendation: string,
    associatedThreat: string,
    createdAt: Date
  }>
}
```

### 6. **search_vulnerabilities**
Recherche dans les vulnérabilités connues (CVE, OWASP).

**Paramètres:**
- `query` (string, optional)
- `owaspCategory` (string, optional): Ex: "LLM01"
- `minSeverity` (number, optional): Score minimum (0-5)
- `limit` (number, default: 50)

**Retour:**
```typescript
{
  count: number,
  vulnerabilities: Array<{
    id: string,
    organizationTool: string,
    cveIdentifier: string,
    descriptionSummary: string,
    originalSeverity: string,
    fivePointScore: number,
    owaspLlmCategory: string,
    owaspCategoryName: string,
    createdAt: Date
  }>
}
```

### 7-12. Autres Outils

- **get_owasp_categories**: Liste OWASP LLM Top 10 & Agentic AI
- **search_prompt_templates**: Templates de prompts d'attaque
- **get_test_targets**: Cibles de test configurées
- **analyze_risk_trends**: Tendances de risques
- **search_threat_profiles**: Profils de menaces
- **search_defenses**: Défenses et mitigations

## Routage Intelligent des Requêtes

Le service `mcpClient.getRelevantContext()` analyse automatiquement la question de l'utilisateur pour déterminer quels outils MCP appeler:

```typescript
// Exemple: "Qu'est-ce que SIA-01?"
if (question.includes('sia')) {
  const ref = extractSiaReference(question); // "SIA-01"
  const policy = await mcpClient.getPolicy(ref);
  context += formatPolicy(policy);
}

// Exemple: "Quels sont les résultats de tests?"
if (question.includes('test') || question.includes('résultat')) {
  const stats = await mcpClient.getTestStatistics();
  context += formatStats(stats);
}

// Exemple: "Montre-moi les vulnérabilités CVE"
if (question.includes('vulnérabilité') || question.includes('cve')) {
  const vulns = await mcpClient.searchVulnerabilities(keywords);
  context += formatVulnerabilities(vulns);
}
```

## Configuration

### Frontend (.env)

```env
# URL du serveur MCP backend
VITE_MCP_API_URL=http://localhost:3001/api/v1/mcp

# Mode mock (pour développement sans backend)
VITE_MCP_MOCK_MODE=false
```

### Backend (.env)

```env
DATABASE_URL="postgresql://user:password@localhost:5432/airiskmgr_db"
PORT=3001
API_PREFIX=api/v1
```

## Mode Mock (Développement)

Si le backend n'est pas disponible, le service MCP bascule automatiquement en mode mock:

```typescript
// mcpClientService.ts
if (USE_MOCK_MODE || fetchError) {
  return mockExecuteQuery(request);
}
```

Le mode mock retourne des données d'exemple pour permettre le développement frontend sans backend actif.

## Exemples d'Utilisation

### 1. Chatbot avec Contexte Automatique

```typescript
// L'utilisateur pose une question
const userMessage = "Explique-moi la règle SIA-03";

// Le chatbot récupère automatiquement le contexte
const response = await geminiService.chat(userMessage, 'normal');

// En interne:
// 1. mcpClient.getRelevantContext() détecte "SIA-03"
// 2. Appelle get_policy_by_reference({ reference: "SIA-03" })
// 3. Obtient la politique complète avec GRC
// 4. Construit prompt enrichi pour Gemini
// 5. Gemini répond avec contexte réel de l'application
```

### 2. Requête MCP Directe

```typescript
// Rechercher toutes les politiques sur l'injection de prompt
const policies = await mcpClient.searchPolicies('injection de prompt');

console.log(`Trouvé ${policies.count} politiques`);
policies.policies.forEach(p => {
  console.log(`${p.reference}: ${p.ruleText}`);
});
```

### 3. Statistiques de Tests

```typescript
const stats = await mcpClient.getTestStatistics();

console.log(`Total tests: ${stats.total}`);
console.log(`Taux de réussite: ${stats.passRate}%`);
console.log(`Par catégorie:`, stats.byCategory);
```

## Avantages de l'Architecture MCP

1. **Réponses Contextualisées**: Le chatbot accède aux données réelles de l'application
2. **Séparation des Préoccupations**: Frontend ↔ MCP Server ↔ Database
3. **Évolutivité**: Ajout facile de nouveaux outils MCP
4. **Mode Offline**: Fallback automatique vers mode mock
5. **Sécurité**: Authentification JWT sur toutes les requêtes MCP
6. **Performance**: Caching Redis pour requêtes fréquentes
7. **Auditabilité**: Toutes les requêtes MCP sont loggées

## Sécurité

- ✅ **Authentification JWT**: Toutes les routes MCP protégées
- ✅ **Isolation des Données**: Requêtes filtrées par `organizationId`
- ✅ **Rate Limiting**: Protection contre abus
- ✅ **Validation des Entrées**: DTOs avec class-validator
- ✅ **Logs d'Audit**: Traçabilité complète

## Prochaines Étapes

1. ✅ Backend: Module MCP avec 12 outils
2. ✅ Frontend: Service client MCP
3. ✅ Integration: Chatbot → MCP → Gemini
4. ⏳ Tests: Tests unitaires et d'intégration
5. ⏳ Documentation: Swagger pour API MCP
6. ⏳ Monitoring: Métriques Prometheus pour MCP
7. ⏳ Optimisation: Cache intelligent des contextes

## Support

Pour toute question sur l'architecture MCP:
- Consulter: `/api/v1/mcp/tools/list` pour liste des outils
- Logs backend: `backend/logs/`
- Logs frontend: Console navigateur (🔍 et 💬 emojis)
