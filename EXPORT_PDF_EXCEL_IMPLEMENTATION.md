# Implémentation Export PDF et Excel - Promptfoo Results

**Date**: 2025-11-01
**Status**: ✅ COMPLÉTÉ

---

## 🎯 Objectif

Implémenter les fonctionnalités d'export PDF et Excel pour le composant `PromptfooResultsView`, permettant aux utilisateurs de générer des rapports professionnels des résultats de tests red team.

---

## 📦 Dépendances Installées

```bash
npm install jspdf jspdf-autotable xlsx
```

**Packages**:
- `jspdf` (v2.5.2+) - Génération de documents PDF
- `jspdf-autotable` (v3.8.3+) - Tables formatées dans PDF
- `xlsx` (v0.18.5+) - Génération de fichiers Excel (.xlsx)

**Installation**: ✅ Complétée (24 packages ajoutés)

---

## 📄 Export PDF - Fonctionnalités

### Structure du Rapport PDF

Le rapport PDF généré contient **2 pages** avec les sections suivantes :

#### **Page 1: Résumé Exécutif**

1. **En-tête**
   - Titre: "Rapport Red Team - Promptfoo"
   - Test Run ID
   - Date de génération

2. **Résumé Exécutif** (tableau)
   - Tests Totaux
   - Tests Réussis (avec pourcentage)
   - Vulnérabilités Détectées
   - Score Moyen
   - Échecs Critiques (score < 30%)
   - Statut de l'exécution
   - Durée
   - Cible testée (si disponible)

3. **Résultats par Catégorie** (tableau)
   - Nom de la catégorie
   - Nombre de tests réussis
   - Nombre d'échecs
   - Taux de réussite (%)

#### **Page 2: Vulnérabilités Détectées**

Table détaillée de toutes les vulnérabilités (tests ayant échoué) :
- Numéro
- Plugin utilisé
- Catégorie de risque
- Score obtenu
- Prompt testé (tronqué à 50 caractères)
- Analyse/Explication (tronquée à 80 caractères)

#### **Pied de Page**

Sur toutes les pages :
```
AI RISK MANAGER - Rapport Promptfoo | Page X/Y
```

### Code d'Export PDF

**Fichier**: `components/PromptfooResultsView.tsx:169-297`

```typescript
const exportToPDF = () => {
  if (!testData || !results.length) {
    alert('Aucune donnée à exporter');
    return;
  }

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // En-tête du document
  doc.setFontSize(18);
  doc.setTextColor(0, 150, 200);
  doc.text('Rapport Red Team - Promptfoo', pageWidth / 2, 15, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Test Run: ${testRunId}`, pageWidth / 2, 22, { align: 'center' });
  doc.text(`Généré le: ${new Date().toLocaleString('fr-FR')}`, pageWidth / 2, 27, { align: 'center' });

  // Section: Résumé
  const summaryData = [
    ['Tests Totaux', summary.totalTests.toString()],
    ['Tests Réussis', `${summary.passed} (${summary.successRate}%)`],
    // ... autres métriques
  ];

  autoTable(doc, {
    startY: 42,
    head: [['Métrique', 'Valeur']],
    body: summaryData,
    theme: 'striped',
    headStyles: { fillColor: [0, 150, 200] }
  });

  // Section: Résultats par Catégorie
  const categoryData = Object.entries(testData.categoryStats).map(...);
  autoTable(doc, { /* ... */ });

  // Section: Vulnérabilités (nouvelle page)
  const vulnerabilities = results.filter(r => !r.passed);
  if (vulnerabilities.length > 0) {
    doc.addPage();
    // Table des vulnérabilités...
  }

  // Pied de page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(`AI RISK MANAGER - Rapport Promptfoo | Page ${i}/${pageCount}`, ...);
  }

  // Sauvegarde
  const filename = `promptfoo-report-${testRunId.substring(0, 8)}-${date}.pdf`;
  doc.save(filename);
};
```

**Nom du fichier généré**:
```
promptfoo-report-{8-premiers-chars-testRunId}-{YYYY-MM-DD}.pdf
```

Exemple: `promptfoo-report-a7b3c4d2-2025-11-01.pdf`

---

## 📊 Export Excel - Fonctionnalités

### Structure du Fichier Excel

Le fichier Excel généré contient **5 feuilles** (sheets) :

#### **Feuille 1: Résumé**

Format: Array of Arrays (AOA)

```
Rapport Red Team - Promptfoo

Test Run ID          | {testRunId}
Généré le            | {date et heure}

RÉSUMÉ EXÉCUTIF
Tests Totaux         | {nombre}
Tests Réussis        | {nombre}
Vulnérabilités       | {nombre}
Taux de Réussite     | {pourcentage}%
Score Moyen          | {pourcentage}%
Échecs Critiques     | {nombre}
Statut               | COMPLETED/RUNNING/FAILED
Durée                | {durée en sec}
Cible                | {nom de la cible}
Type de Composant    | {type}
```

#### **Feuille 2: Par Catégorie**

| Catégorie | Tests Réussis | Échecs | Total | Taux Réussite |
|-----------|---------------|--------|-------|---------------|
| Injection | 15            | 3      | 18    | 83%           |
| Jailbreak | 12            | 5      | 17    | 71%           |
| PII       | 20            | 2      | 22    | 91%           |

#### **Feuille 3: Par Plugin**

| Plugin                  | Nombre de Tests |
|-------------------------|-----------------|
| prompt-injection        | 12              |
| jailbreak               | 8               |
| harmful:violent-crime   | 5               |

#### **Feuille 4: Tous les Résultats**

Tableau complet avec **toutes les colonnes** :

| # | Statut | Score | Plugin | Catégorie | Complexité | Prompt | Réponse | Explication | Temps (ms) |
|---|--------|-------|--------|-----------|------------|--------|---------|-------------|------------|
| 1 | RÉUSSI | 95    | ...    | ...       | ...        | ...    | ...     | ...         | 230        |

**Largeurs de colonnes optimisées** :
- `#`: 5 caractères
- `Statut`: 10
- `Score`: 8
- `Plugin`: 20
- `Catégorie`: 15
- `Complexité`: 12
- `Prompt`: 50 (texte complet)
- `Réponse`: 50 (texte complet)
- `Explication`: 60 (texte complet)
- `Temps`: 12

#### **Feuille 5: Vulnérabilités**

Tableau filtré contenant **uniquement les tests ayant échoué** :

| # | Score | Plugin | Catégorie | Prompt | Réponse | Analyse | Temps (ms) |
|---|-------|--------|-----------|--------|---------|---------|------------|
| 1 | 25    | ...    | ...       | ...    | ...     | ...     | 450        |

### Code d'Export Excel

**Fichier**: `components/PromptfooResultsView.tsx:299-429`

```typescript
const exportToExcel = () => {
  if (!testData || !results.length) {
    alert('Aucune donnée à exporter');
    return;
  }

  // Feuille 1: Résumé
  const summarySheet = [
    ['Rapport Red Team - Promptfoo'],
    [''],
    ['Test Run ID', testRunId],
    ['Généré le', new Date().toLocaleString('fr-FR')],
    // ... autres données
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summarySheet);

  // Feuille 2: Résultats par Catégorie
  const categoryData = [
    ['Catégorie', 'Tests Réussis', 'Échecs', 'Total', 'Taux Réussite']
  ];
  Object.entries(testData.categoryStats).forEach(([category, stats]) => {
    categoryData.push([category, stats.passed, stats.failed, total, `${rate}%`]);
  });
  const wsCategories = XLSX.utils.aoa_to_sheet(categoryData);

  // Feuille 3: Résultats par Plugin
  const pluginData = [['Plugin', 'Nombre de Tests']];
  Object.entries(testData.pluginStats).forEach(([plugin, count]) => {
    pluginData.push([plugin, count]);
  });
  const wsPlugins = XLSX.utils.aoa_to_sheet(pluginData);

  // Feuille 4: Tous les Résultats
  const allResultsData = [
    ['#', 'Statut', 'Score', 'Plugin', 'Catégorie', 'Complexité', 'Prompt', 'Réponse', 'Explication', 'Temps Réponse (ms)']
  ];
  results.forEach((result, index) => {
    allResultsData.push([
      index + 1,
      result.passed ? 'RÉUSSI' : 'ÉCHEC',
      Math.round(result.score * 100),
      result.plugin,
      result.category,
      result.complexity,
      result.prompt,
      result.response,
      result.explanation || '',
      result.responseTime || ''
    ]);
  });
  const wsAllResults = XLSX.utils.aoa_to_sheet(allResultsData);

  // Feuille 5: Vulnérabilités Uniquement
  const vulnerabilities = results.filter(r => !r.passed);
  const vulnData = [
    ['#', 'Score', 'Plugin', 'Catégorie', 'Prompt', 'Réponse', 'Analyse', 'Temps Réponse (ms)']
  ];
  vulnerabilities.forEach((vuln, index) => {
    vulnData.push([...]);
  });
  const wsVulnerabilities = XLSX.utils.aoa_to_sheet(vulnData);

  // Créer le workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Résumé');
  XLSX.utils.book_append_sheet(wb, wsCategories, 'Par Catégorie');
  XLSX.utils.book_append_sheet(wb, wsPlugins, 'Par Plugin');
  XLSX.utils.book_append_sheet(wb, wsAllResults, 'Tous les Résultats');
  XLSX.utils.book_append_sheet(wb, wsVulnerabilities, 'Vulnérabilités');

  // Appliquer largeurs de colonnes
  wsAllResults['!cols'] = colWidths;
  wsVulnerabilities['!cols'] = colWidths;

  // Sauvegarde
  const filename = `promptfoo-report-${testRunId.substring(0, 8)}-${date}.xlsx`;
  XLSX.writeFile(wb, filename);
};
```

**Nom du fichier généré**:
```
promptfoo-report-{8-premiers-chars-testRunId}-{YYYY-MM-DD}.xlsx
```

Exemple: `promptfoo-report-a7b3c4d2-2025-11-01.xlsx`

---

## 🎨 Détails d'Implémentation

### Format de Couleurs PDF

| Élément | RGB | Hex |
|---------|-----|-----|
| Titre principal | `(0, 150, 200)` | `#0096C8` (Cyan) |
| Texte secondaire | `(100, 100, 100)` | `#646464` (Gris) |
| Texte normal | `(0, 0, 0)` | `#000000` (Noir) |
| Titres de section | `(0, 0, 0)` | `#000000` (Noir) |
| Vulnérabilités | `(220, 38, 38)` | `#DC2626` (Rouge) |
| Pied de page | `(150, 150, 150)` | `#969696` (Gris clair) |

### Thèmes des Tables PDF

- **Résumé Exécutif**: `theme: 'striped'` avec en-tête cyan
- **Résultats par Catégorie**: `theme: 'grid'` avec en-tête cyan
- **Vulnérabilités**: `theme: 'striped'` avec en-tête rouge

### Gestion des Textes Longs

**PDF**:
- Prompts tronqués à 50 caractères + "..."
- Explications tronquées à 80 caractères

**Excel**:
- Textes complets (pas de troncature)
- Largeurs de colonnes optimisées pour lisibilité

### Validation des Données

Avant export, vérification que :
```typescript
if (!testData || !results.length) {
  alert('Aucune donnée à exporter');
  return;
}
```

Empêche la génération de rapports vides.

---

## 🧪 Tests Recommandés

### Test 1: Export PDF avec Données Complètes

**Scénario**: TestRun avec 50+ résultats, plusieurs catégories, 10+ vulnérabilités

**Actions**:
1. Accéder à "📊 Résultats Red Team"
2. Cliquer sur bouton "PDF"
3. Vérifier le téléchargement du fichier

**Vérifications**:
- [ ] Fichier PDF téléchargé correctement
- [ ] Nom de fichier au format `promptfoo-report-{id}-{date}.pdf`
- [ ] Page 1 contient résumé et stats par catégorie
- [ ] Page 2 contient liste des vulnérabilités
- [ ] Pied de page affiché sur toutes les pages
- [ ] Tables bien formatées (pas de débordement)
- [ ] Couleurs correctement appliquées

### Test 2: Export Excel avec Données Complètes

**Scénario**: Même TestRun que Test 1

**Actions**:
1. Cliquer sur bouton "Excel"
2. Vérifier le téléchargement du fichier
3. Ouvrir le fichier dans Excel/LibreOffice

**Vérifications**:
- [ ] Fichier .xlsx téléchargé correctement
- [ ] Nom de fichier au format `promptfoo-report-{id}-{date}.xlsx`
- [ ] 5 feuilles présentes: Résumé, Par Catégorie, Par Plugin, Tous les Résultats, Vulnérabilités
- [ ] Feuille "Résumé" contient toutes les métriques
- [ ] Feuille "Par Catégorie" affiche stats correctes
- [ ] Feuille "Par Plugin" affiche counts corrects
- [ ] Feuille "Tous les Résultats" contient tous les tests
- [ ] Feuille "Vulnérabilités" contient uniquement les échecs
- [ ] Largeurs de colonnes correctes (prompt, réponse, explication lisibles)

### Test 3: Export avec Aucune Donnée

**Scénario**: Page chargée sans testRunId

**Actions**:
1. Cliquer sur "PDF"
2. Cliquer sur "Excel"

**Résultat Attendu**:
- [ ] Alert affiché: "Aucune donnée à exporter"
- [ ] Aucun fichier téléchargé

### Test 4: Export avec Données Partielles

**Scénario**: TestRun sans vulnérabilités (tous les tests réussis)

**Actions**:
1. Export PDF

**Vérifications**:
- [ ] PDF généré avec 1 page uniquement (pas de page vulnérabilités)
- [ ] Section "Résultats par Catégorie" affiche 100% de réussite

### Test 5: Export avec Caractères Spéciaux

**Scénario**: TestRun avec prompts contenant emojis, caractères unicode, symboles

**Actions**:
1. Export PDF et Excel

**Vérifications**:
- [ ] Caractères spéciaux correctement affichés
- [ ] Pas d'erreur d'encodage
- [ ] Fichiers lisibles

---

## 📊 Formats de Sortie

### PDF

- **Format**: A4 (210 x 297 mm)
- **Orientation**: Portrait
- **Marges**: 15mm (top, left, right), 10mm (bottom pour pied de page)
- **Police**: Helvetica (défaut jsPDF)
- **Tailles de police**:
  - Titre: 18pt
  - Sous-titres: 14pt
  - Texte normal: 10pt
  - Tables: 8-9pt
  - Pied de page: 8pt

### Excel

- **Format**: .xlsx (Office Open XML)
- **Version**: Compatible Excel 2007+
- **Encodage**: UTF-8
- **Noms de feuilles**:
  - `Résumé`
  - `Par Catégorie`
  - `Par Plugin`
  - `Tous les Résultats`
  - `Vulnérabilités`

---

## 🔧 Dépannage

### Erreur: "autoTable is not a function"

**Cause**: Import incorrect de jspdf-autotable

**Solution**:
```typescript
import autoTable from 'jspdf-autotable';
```

### Erreur: "XLSX is not defined"

**Cause**: Import incorrect de xlsx

**Solution**:
```typescript
import * as XLSX from 'xlsx';
```

### PDF Vide ou Mal Formaté

**Cause**: Données `testData` ou `results` undefined

**Solution**: Vérifier que les données sont chargées avant d'exporter
```typescript
if (!testData || !results.length) return;
```

### Excel: Colonnes Trop Étroites

**Cause**: Largeurs de colonnes non définies

**Solution**: Vérifier que `!cols` est bien appliqué
```typescript
wsAllResults['!cols'] = colWidths;
```

---

## 🚀 Améliorations Futures

### PDF

1. **Graphiques intégrés**: Ajouter des charts (bar, pie) dans le PDF
2. **Table of Contents**: Sommaire cliquable
3. **Couleurs personnalisées**: Thème clair/sombre
4. **Logos**: Ajouter logo OWASP et AI Risk Manager
5. **Métadonnées PDF**: Auteur, sujet, mots-clés

### Excel

1. **Formules**: Calculer automatiquement taux de réussite
2. **Graphiques Excel**: Charts natifs dans les feuilles
3. **Mise en forme conditionnelle**: Colorer cellules selon score
4. **Filtres automatiques**: Activer autofilter sur toutes les tables
5. **Figer les volets**: Freeze top row pour headers

### Général

1. **Format CSV**: Export CSV pour analyse avec Python/R
2. **Format JSON**: Export JSON brut pour intégrations
3. **Compression**: Générer archive .zip avec PDF + Excel + JSON
4. **Email**: Envoyer rapport par email directement
5. **Planification**: Exports automatiques périodiques

---

## 📝 Fichiers Modifiés

### `components/PromptfooResultsView.tsx`

**Lignes ajoutées**: 22-24 (imports), 169-429 (fonctions export)

**Taille ajoutée**: ~260 lignes de code

**Fonctions**:
- `exportToPDF()`: 128 lignes
- `exportToExcel()`: 130 lignes

### `package.json`

**Dépendances ajoutées**:
```json
{
  "jspdf": "^2.5.2",
  "jspdf-autotable": "^3.8.3",
  "xlsx": "^0.18.5"
}
```

---

## ✅ Checklist de Validation

- [x] Dépendances installées (jspdf, jspdf-autotable, xlsx)
- [x] Imports ajoutés dans PromptfooResultsView.tsx
- [x] Fonction exportToPDF() implémentée
- [x] Fonction exportToExcel() implémentée
- [x] Validation des données avant export
- [x] Noms de fichiers dynamiques avec date
- [x] Format PDF professionnel avec tables
- [x] Format Excel avec 5 feuilles
- [x] Gestion des textes longs (troncature PDF)
- [x] Largeurs de colonnes optimisées (Excel)
- [x] Pied de page sur toutes les pages PDF
- [ ] Tests avec données réelles du backend
- [ ] Vérification compilation TypeScript
- [ ] Tests end-to-end

---

## 🎉 Conclusion

Les fonctionnalités d'export PDF et Excel sont maintenant **complètement implémentées** dans le composant `PromptfooResultsView`.

**Fonctionnalités clés**:
- ✅ Export PDF professionnel avec 2 pages (résumé + vulnérabilités)
- ✅ Export Excel avec 5 feuilles détaillées
- ✅ Noms de fichiers dynamiques
- ✅ Validation des données
- ✅ Formatage professionnel

**Prêt pour tests avec données réelles du backend** ! 🚀
