# Composants Frontend Unifiés

Interfaces React pour la plateforme unifiée de pentest AI (Promptfoo, Garak).

## Vue d'ensemble

Ces composants fournissent une interface utilisateur moderne et réactive pour interagir avec les outils de pentest:
- **UnifiedSecurityHub**: Tableau de bord central avec métriques globales
- **GarakScannerUI**: Interface de scanning pour Garak (vulnérabilités LLM)

## Composants

### 1. UnifiedSecurityHub

**Fichier**: `UnifiedSecurityHub.tsx`

**Description**: Centre de sécurité unifié avec vue d'ensemble de tous les outils.

**Fonctionnalités**:
- Métriques globales (tests, vulnérabilités, statut)
- Statut en temps réel des outils
- Activité récente avec historique
- Actions rapides pour lancer chaque outil
- Auto-refresh toutes les 10 secondes

**Props**: Aucune (autonome)

**API Endpoints**:
```
GET /api/v1/unified/metrics
Response: {
  totalTests: number,
  vulnerabilitiesFound: number,
  criticalFindings: number,
  lastScanTime: string,
  toolsStatus: {
    promptfoo: 'running' | 'idle' | 'error',
    garak: 'running' | 'idle' | 'error'
  },
  recentActivity: Array<Activity>
}
```

**Usage**:
```tsx
import UnifiedSecurityHub from '@/components/unified/UnifiedSecurityHub';

function App() {
  return <UnifiedSecurityHub />;
}
```

### 2. GarakScannerUI

**Fichier**: `GarakScannerUI.tsx`

**Description**: Interface complète pour le scanner Garak (vulnérabilités LLM).

**Fonctionnalités**:
- Configuration du scan (modèle, API key, probes)
- 8 types de probes disponibles (encoding, injection, toxicity, etc.)
- Exécution du scan avec feedback en temps réel
- Affichage des résultats avec statistiques
- Liste détaillée des vulnérabilités par sévérité
- Export des rapports (PDF, JSON)

**Props**: Aucune (autonome)

**API Endpoints**:
```
POST /api/v1/garak/scan
Body: {
  model: string,
  apiKey?: string,
  probes: string[],
  generators: string[],
  detectors: string[]
}
Response: ScanResult
```

**Types de Probes**:
- `all`: Tous les tests (scan complet)
- `encoding`: Vulnérabilités d'encodage
- `injection`: Prompt injection
- `toxicity`: Contenu toxique
- `jailbreak`: Tentatives de jailbreak
- `hallucination`: Détection d'hallucinations
- `leakage`: Fuite de données
- `malicious`: Utilisation malveillante

**Usage**:
```tsx
import GarakScannerUI from '@/components/unified/GarakScannerUI';

function ScannerPage() {
  return <GarakScannerUI />;
}
```

## Integration dans l'Application

### 1. Ajouter les Routes

Dans `App.tsx`, ajouter les routes pour les nouveaux composants:

```tsx
import UnifiedSecurityHub from './components/unified/UnifiedSecurityHub';
import GarakScannerUI from './components/unified/GarakScannerUI';

// Dans navItems:
const navItems = [
  // ... autres items
  {
    id: 'unified-hub',
    label: 'Centre de Sécurité',
    icon: <Shield />,
    content: <UnifiedSecurityHub />,
    section: 'Sécurité Unifiée'
  },
  {
    id: 'garak-scanner',
    label: 'Scanner Garak',
    icon: <AlertTriangle />,
    content: <GarakScannerUI />,
    section: 'Sécurité Unifiée'
  },
];
```

### 2. Configurer l'API Backend

Les composants attendent une API backend à `http://localhost:3003/api/v1/`.

Créer les endpoints suivants:

**Backend Controller** (`unified.controller.ts`):
```typescript
import { Controller, Get, Post, Body, Param } from '@nestjs/common';

@Controller('api/v1/unified')
export class UnifiedController {
  @Get('metrics')
  async getMetrics() {
    // Agrégation des métriques des outils
    return {
      totalTests: 150,
      vulnerabilitiesFound: 12,
      criticalFindings: 3,
      lastScanTime: new Date().toISOString(),
      toolsStatus: {
        promptfoo: 'idle',
        garak: 'running'
      },
      recentActivity: []
    };
  }
}

@Controller('api/v1/garak')
export class GarakController {
  @Post('scan')
  async startScan(@Body() config: ScanConfig) {
    // Lancer le scan Garak
    return { id: 'scan-123', status: 'running' };
  }
}
```

### 3. Variables d'Environnement

Ajouter à `.env`:
```bash
VITE_API_URL=http://localhost:3003/api/v1
VITE_UNIFIED_HUB_ENABLED=true
```

### 4. Types TypeScript

Les types sont déjà définis dans chaque composant. Pour partager entre composants:

**Créer** `src/types/unified.ts`:
```typescript
export interface UnifiedMetrics {
  totalTests: number;
  vulnerabilitiesFound: number;
  criticalFindings: number;
  lastScanTime: string;
  toolsStatus: Record<'promptfoo' | 'garak', 'running' | 'idle' | 'error'>;
  recentActivity: Activity[];
}

export interface ScanConfig {
  model: string;
  apiKey?: string;
  probes: string[];
  generators: string[];
  detectors: string[];
}
```

## Styling et Thème

Les composants utilisent le thème existant de l'application:

**Couleurs**:
- Fond: `bg-gray-900`, `bg-gray-800`, `bg-gray-700`
- Texte: `text-white`, `text-gray-400`, `text-gray-300`
- Accents:
  - Cyan: Actions principales (`bg-cyan-600`)
  - Orange: Garak (`bg-orange-600`)
  - Rouge: Erreurs critiques (`bg-red-600`)
  - Vert: Succès (`bg-green-600`)

**Composants Réutilisés**:
- `Card` component (import from `../ui/Card`)
- Lucide icons
- Tailwind CSS utilities

## Tests

### Tests Unitaires (à créer)

```tsx
// UnifiedSecurityHub.test.tsx
import { render, screen } from '@testing-library/react';
import UnifiedSecurityHub from './UnifiedSecurityHub';

test('renders security hub with metrics', async () => {
  render(<UnifiedSecurityHub />);
  expect(await screen.findByText(/Centre de Sécurité Unifié/i)).toBeInTheDocument();
});
```

### Tests d'Intégration (à créer)

```tsx
// GarakScannerUI.integration.test.tsx
test('starts scan and displays results', async () => {
  const { getByText, getByRole } = render(<GarakScannerUI />);

  // Configure scan
  const launchButton = getByText(/Lancer le Scan/i);
  fireEvent.click(launchButton);

  // Wait for results
  await waitFor(() => {
    expect(getByText(/Vulnérabilités Détectées/i)).toBeInTheDocument();
  });
});
```

## Performance

### Optimisations Implémentées

1. **Auto-refresh avec cleanup**: `useEffect` avec cleanup pour éviter les memory leaks
2. **Conditional rendering**: Affichage conditionnel basé sur l'état
3. **Debouncing**: À ajouter pour les inputs de recherche
4. **Lazy loading**: À implémenter pour les listes longues

### Recommandations

```tsx
// Utiliser React.memo pour les composants lourds
const MemoizedCard = React.memo(Card);

// Utiliser useMemo pour les calculs coûteux
const filteredResults = useMemo(() => {
  return results.filter(r => r.severity === 'critical');
}, [results]);

// Utiliser useCallback pour les callbacks
const handleScan = useCallback(() => {
  startScan(config);
}, [config]);
```

## Accessibilité

Les composants suivent les bonnes pratiques d'accessibilité:

- ✅ Labels pour tous les inputs
- ✅ Boutons avec texte descriptif
- ✅ Contraste suffisant (WCAG AA)
- ✅ Navigation au clavier
- ⚠️ À ajouter: ARIA labels pour les éléments dynamiques
- ⚠️ À ajouter: Focus management

## Troubleshooting

### Problème: Composants ne chargent pas

**Solution**: Vérifier que l'API backend est démarrée
```bash
curl http://localhost:3003/api/v1/unified/metrics
```

### Problème: CORS errors

**Solution**: Configurer CORS dans le backend
```typescript
// main.ts
app.enableCors({
  origin: 'http://localhost:3004',
  credentials: true
});
```

### Problème: Types TypeScript errors

**Solution**: S'assurer que tous les types sont définis
```bash
npm run type-check
```

## Roadmap

### Court Terme (Semaine 1-2)
- [ ] Implémenter les endpoints backend
- [ ] Tests unitaires pour les composants
- [ ] Documentation API complète
- [ ] Mode dark/light toggle

### Moyen Terme (Semaine 3-4)
- [ ] Notifications temps réel (WebSocket)
- [ ] Export PDF/JSON des rapports
- [ ] Historique des scans avec pagination
- [ ] Filtres avancés et recherche

### Long Terme (Mois 2-3)
- [ ] Dashboard personnalisable (widgets)
- [ ] Comparaison de scans
- [ ] Intégration CI/CD
- [ ] Multi-tenancy support

## Contribution

Pour contribuer aux composants unifiés:

1. Créer une branche: `git checkout -b feature/unified-component`
2. Développer et tester
3. Suivre les conventions de code (ESLint, Prettier)
4. Créer une PR avec description détaillée

## Ressources

- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Version**: 1.0.0
**Last Updated**: 2025-11-05
**Auteur**: Claude Code
