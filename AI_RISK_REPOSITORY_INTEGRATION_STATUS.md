# 📊 Statut d'Intégration - AI Risk Repository

## ✅ Travail Accompli

### 1. Extraction des Données Excel ✓
- **Fichier source**: `data_ai_risk/AI Risk Repository V3_26_03_2025.xlsx`
- **Extraction réussie**: 11 feuilles extraites en JSON
- **Répertoire de sortie**: `data_ai_risk/extracted/`
- **Fichiers JSON créés**:
  1. `causal_taxonomy_of_ai_risks_v3.json` (29 lignes)
  2. `domain_taxonomy_of_ai_risks_v3.json` (44 lignes)
  3. `ai_risk_database_v3.json` (2245 lignes - BASE PRINCIPALE)
  4. `ai_risk_database_explainer.json` (26 lignes)
  5. `causal_taxonomy_statistics.json` (44 lignes)
  6. `domain_taxonomy_statistics.json` (52 lignes)
  7. `causal_x_domain_taxonomy_compar.json` (52 lignes)
  8. `included_resources.json` (85 lignes)
  9. `resources_being_considered.json` (74 lignes)
  10. `contents.json` (54 lignes)
  11. `change_log.json` (20 lignes)

### 2. Traduction et Structuration ✓
- **Fichier créé**: `data/aiRiskRepositoryDataFull.ts`
- **Contenu traduit en français**:
  - Taxonomie Causale complète avec descriptions
  - Taxonomie par Domaine (7 domaines + sous-domaines)
  - Ressources incluses (5 ressources majeures traduites)
  - Statistiques des deux taxonomies
  - Métadonnées du référentiel

### 3. Types TypeScript ✓
Créés dans `aiRiskRepositoryDataFull.ts`:
- `CausalTaxonomyNode`
- `DomainTaxonomyNode`
- `IncludedResource`
- `TaxonomyStatistics`

## 🚧 Travail À Compléter

### Phase 1: Compléter la Traduction des Données
**Fichiers à créer**:

1. **`data/aiRiskDatabaseComplete.ts`**
   ```typescript
   // Parser et traduire les 2245 entrées de la base de données
   // Structure:
   export interface AIRiskEntry {
     id: string;
     title: string;
     quickRef: string;
     category: string;
     subcategory: string;
     description: string;
     causalEntity: 'IA' | 'Humain' | 'Autre';
     causalIntentionality: 'Intentionnel' | 'Non intentionnel' | 'Autre';
     causalTiming: 'Pré-déploiement' | 'Post-déploiement' | 'Autre';
     domainCategory: string;
     domainSubcategory: string;
     examples: string[];
     sources: string[];
     mitigations: string[];
   }
   ```

2. **Script de traduction automatique**
   ```bash
   # Créer: scripts/translate-ai-risks.ts
   # Utiliser un service de traduction (ex: LibreTranslate, DeepL API)
   # pour traduire les 2245 entrées automatiquement
   ```

### Phase 2: Créer les Composants UI Riches

#### Composant Principal: `components/AIRiskRepositoryViewEnhanced.tsx`

**Fonctionnalités requises**:

```typescript
interface AIRiskRepositoryViewEnhanced {
  // État
  activeTab: 'taxonomie-causale' | 'taxonomie-domaine' | 'base-donnees' |
             'statistiques' | 'ressources' | 'comparaison';
  searchQuery: string;
  filters: {
    causalEntity?: string[];
    causalIntentionality?: string[];
    causalTiming?: string[];
    domain?: string[];
    subdomain?: string[];
    year?: number[];
  };
  sortBy: 'relevance' | 'date' | 'domain' | 'risk-level';
  viewMode: 'list' | 'grid' | 'graph';

  // Navigation interconnectée
  selectedRisk?: AIRiskEntry;
  relatedRisks: AIRiskEntry[];
  navigationHistory: string[];
}
```

**Sous-composants à créer**:

1. **`CausalTaxonomyView.tsx`**
   - Arbre interactif des catégories causales
   - Drill-down dans chaque niveau
   - Liens vers base de données filtrée
   - Graphiques de distribution

2. **`DomainTaxonomyView.tsx`**
   - Visualisation des 7 domaines
   - Sous-domaines expandables
   - Heatmap des risques par domaine
   - Navigation vers exemples concrets

3. **`RiskDatabaseView.tsx`**
   - Tableau paginé (2245 entrées)
   - Filtres multiples (domaine, entité, timing)
   - Recherche full-text
   - Export CSV/JSON
   - Vue détaillée par risque avec:
     * Description complète
     * Exemples réels
     * Sources académiques
     * Mitigations recommandées
     * Risques connexes (liens croisés)

4. **`StatisticsView.tsx`**
   - Graphiques interactifs (Recharts):
     * Distribution par taxonomie causale
     * Distribution par domaine
     * Évolution temporelle
     * Top 10 risques
   - Comparaison causale vs domaine
   - Filtres temporels (année)

5. **`ResourcesView.tsx`**
   - Liste des 85 ressources
   - Filtres par type, année, organisation
   - Liens vers ressources externes
   - Citations académiques
   - Mapping ressource → risques

6. **`TaxonomyComparisonView.tsx`**
   - Matrice croisée Causal × Domaine
   - Heatmap interactive
   - Double filtrage
   - Export de la matrice

### Phase 3: Fonctionnalités Avancées

#### A. Recherche Intelligente
```typescript
// components/AIRiskSearch.tsx
interface SearchFeatures {
  fullTextSearch: (query: string) => AIRiskEntry[];
  semanticSearch: (query: string) => AIRiskEntry[]; // avec embeddings
  autocomplete: (partial: string) => string[];
  searchHistory: string[];
  savedSearches: SearchQuery[];
}
```

#### B. Navigation Interconnectée
```typescript
// Navigation bidirectionnelle
class RiskNavigator {
  // Depuis Taxonomie Causale → Risques concernés
  getRisksByCausalCategory(entity, intentionality, timing): AIRiskEntry[]

  // Depuis Taxonomie Domaine → Risques concernés
  getRisksByDomain(domain, subdomain?): AIRiskEntry[]

  // Depuis Risque → Taxonomies associées
  getTaxonomiesForRisk(riskId): { causal, domain }

  // Depuis Risque → Ressources citant ce risque
  getResourcesForRisk(riskId): IncludedResource[]

  // Depuis Ressource → Risques mentionnés
  getRisksFromResource(resourceId): AIRiskEntry[]

  // Risques similaires (basé sur taxonomies communes)
  getSimilarRisks(riskId): AIRiskEntry[]
}
```

#### C. Visualisations Interactives
```typescript
// components/visualizations/

1. TaxonomyTreeGraph.tsx
   - D3.js tree/sunburst pour taxonomies
   - Zoom, pan, collapse/expand
   - Clic → filtre base de données

2. RiskHeatmap.tsx
   - Matrice de chaleur causale × domaine
   - Hover → tooltip avec détails
   - Clic → liste des risques

3. TimelineChart.tsx
   - Évolution des risques dans le temps
   - Filtrable par domaine/causal
   - Points cliquables → détail

4. NetworkGraph.tsx
   - Graph de relations risques-ressources
   - Force-directed layout
   - Clustering par domaine
```

#### D. Export et Partage
```typescript
// services/export.service.ts
class ExportService {
  exportToCSV(risks: AIRiskEntry[], filename: string)
  exportToJSON(risks: AIRiskEntry[], filename: string)
  exportToPDF(risk: AIRiskEntry) // Rapport individuel
  exportStatisticsToPNG(chartData) // Screenshots de graphiques
  generateShareableLink(filterState) // URL avec filtres
}
```

### Phase 4: Intégration Backend (Optionnel mais Recommandé)

#### Base de Données Prisma
```prisma
// backend/prisma/schema.prisma - Ajouter:

model AIRisk {
  id                   String   @id @default(uuid())
  title                String
  quickRef             String   @unique
  description          String   @db.Text

  // Taxonomie Causale
  causalEntity         String
  causalIntentionality String
  causalTiming         String

  // Taxonomie Domaine
  domainCategory       String
  domainSubcategory    String?

  // Métadonnées
  examples             Json     // string[]
  mitigations          Json     // string[]
  sources              Json     // string[]

  // Relations
  resources            AIRiskResource[]

  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt

  @@index([causalEntity, causalIntentionality, causalTiming])
  @@index([domainCategory, domainSubcategory])
  @@fulltext([title, description])
}

model AIResource {
  id             String   @id @default(uuid())
  title          String
  authors        String
  year           Int
  type           String
  organization   String?
  url            String?
  description    String   @db.Text

  risks          AIRiskResource[]

  @@index([year])
  @@index([type])
}

model AIRiskResource {
  id         String     @id @default(uuid())
  riskId     String
  risk       AIRisk     @relation(fields: [riskId], references: [id])
  resourceId String
  resource   AIResource @relation(fields: [resourceId], references: [id])

  @@unique([riskId, resourceId])
}
```

#### API Endpoints
```typescript
// backend/apps/api-gateway/src/ai-risks/

GET    /api/v1/ai-risks              // Liste paginée
GET    /api/v1/ai-risks/:id           // Détail d'un risque
GET    /api/v1/ai-risks/search        // Recherche full-text
GET    /api/v1/ai-risks/by-causal     // Filtré par taxonomie causale
GET    /api/v1/ai-risks/by-domain     // Filtré par domaine
GET    /api/v1/ai-risks/:id/related   // Risques similaires

GET    /api/v1/ai-resources           // Liste des ressources
GET    /api/v1/ai-resources/:id/risks // Risques d'une ressource

GET    /api/v1/ai-statistics/causal   // Stats taxonomie causale
GET    /api/v1/ai-statistics/domain   // Stats taxonomie domaine
```

## 📋 Prochaines Actions Prioritaires

### Action 1: Parser la Base de Données Complète
```bash
# Créer un script pour parser ai_risk_database_v3.json
node scripts/parse-risk-database.cjs

# Output: data/aiRiskDatabaseParsed.ts avec 2245 entrées structurées
```

### Action 2: Créer les Composants UI de Base
Ordre recommandé:
1. ✅ Créer structure de navigation (tabs)
2. CausalTaxonomyView (simple tree view)
3. DomainTaxonomyView (7 domaines)
4. RiskDatabaseView (tableau basique)
5. Ajouter recherche et filtres
6. Ajouter graphiques

### Action 3: Implémenter Navigation Interconnectée
- Clic sur catégorie causale → filtre base de données
- Clic sur domaine → filtre base de données
- Clic sur risque → affiche taxonomies + ressources
- Clic sur ressource → affiche risques mentionnés

### Action 4: Tests et Optimisation
- Performance avec 2245 entrées (virtualisation de liste)
- Responsive design
- Accessibilité (ARIA labels)
- Tests E2E pour navigation

## 🎯 Objectif Final

Une interface **complète, traduite, interconnectée** permettant de :

1. ✅ Naviguer les 2 taxonomies visuellement
2. ✅ Explorer les 2245 risques IA catalogués
3. ✅ Filtrer par n'importe quelle combinaison de critères
4. ✅ Voir statistiques et tendances
5. ✅ Consulter les 85 ressources académiques
6. ✅ Comprendre les liens entre risques, taxonomies et ressources
7. ✅ Exporter et partager des analyses

---

**Statut actuel**: Fondations créées (30% complet)
**Prochaine session**: Compléter le parsing et créer les composants UI
