import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'fr' | 'en';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translations dictionary
const translations: Record<string, Record<Language, string>> = {
    // Navigation
    'nav.contents': { fr: 'Contenus', en: 'Contents' },
    'nav.causal_taxonomy': { fr: 'Taxonomie Causale', en: 'Causal Taxonomy' },
    'nav.domain_taxonomy': { fr: 'Taxonomie par Domaine', en: 'Domain Taxonomy' },
    'nav.database': { fr: 'Base de Données des Risques', en: 'Risk Database' },
    'nav.explainer': { fr: 'Explication de la Base', en: 'Database Explainer' },
    'nav.causal_stats': { fr: 'Statistiques (Causale)', en: 'Statistics (Causal)' },
    'nav.domain_stats': { fr: 'Statistiques (Domaine)', en: 'Statistics (Domain)' },
    'nav.comparison': { fr: 'Comparaison Taxonomies', en: 'Taxonomy Comparison' },
    'nav.resources': { fr: 'Ressources Incluses', en: 'Included Resources' },

    // Common
    'common.filters': { fr: 'Filtres', en: 'Filters' },
    'common.filter': { fr: 'Filtrer', en: 'Filter' },
    'common.export_csv': { fr: 'Export CSV', en: 'Export CSV' },
    'common.reset': { fr: 'Réinitialiser', en: 'Reset' },
    'common.search': { fr: 'Rechercher', en: 'Search' },
    'common.close': { fr: 'Fermer', en: 'Close' },
    'common.details': { fr: 'Détails', en: 'Details' },
    'common.page': { fr: 'Page', en: 'Page' },
    'common.of': { fr: 'sur', en: 'of' },
    'common.risks': { fr: 'risques', en: 'risks' },
    'common.total_risks': { fr: 'Total Risques', en: 'Total Risks' },
    'common.displayed': { fr: 'Affichés', en: 'Displayed' },
    'common.domains': { fr: 'Domaines', en: 'Domains' },
    'common.version': { fr: 'Version', en: 'Version' },

    // Risk Database
    'db.title': { fr: 'Base de Données des Risques IA v3', en: 'AI Risk Database v3' },
    'db.subtitle': { fr: 'Explorez {count} risques IA catalogués. Utilisez la recherche et les filtres pour affiner les résultats.', en: 'Explore {count} catalogued AI risks. Use search and filters to refine results.' },
    'db.search_placeholder': { fr: 'Rechercher dans titre, description, catégorie...', en: 'Search in title, description, category...' },
    'db.no_results': { fr: 'Aucun risque ne correspond à vos critères', en: 'No risks match your criteria' },
    'db.no_results_hint': { fr: 'Essayez de modifier votre recherche ou vos filtres', en: 'Try modifying your search or filters' },

    // Filters
    'filter.entity': { fr: 'Entité', en: 'Entity' },
    'filter.intentionality': { fr: 'Intentionnalité', en: 'Intentionality' },
    'filter.timing': { fr: 'Temporalité', en: 'Timing' },
    'filter.domain': { fr: 'Domaine', en: 'Domain' },

    // Entity values
    'entity.ai': { fr: 'IA', en: 'AI' },
    'entity.human': { fr: 'Humain', en: 'Human' },
    'entity.other': { fr: 'Autre', en: 'Other' },

    // Intentionality values
    'intent.intentional': { fr: 'Intentionnel', en: 'Intentional' },
    'intent.unintentional': { fr: 'Non intentionnel', en: 'Unintentional' },
    'intent.other': { fr: 'Autre', en: 'Other' },

    // Timing values
    'timing.pre': { fr: 'Pré-déploiement', en: 'Pre-deployment' },
    'timing.post': { fr: 'Post-déploiement', en: 'Post-deployment' },
    'timing.other': { fr: 'Autre', en: 'Other' },

    // Risk Detail Modal
    'modal.description': { fr: 'Description', en: 'Description' },
    'modal.taxonomic_classification': { fr: 'Classification Taxonomique', en: 'Taxonomic Classification' },
    'modal.causal_taxonomy': { fr: 'Taxonomie Causale', en: 'Causal Taxonomy' },
    'modal.domain_taxonomy': { fr: 'Taxonomie par Domaine', en: 'Domain Taxonomy' },
    'modal.causal_entity': { fr: 'Entité Causale', en: 'Causal Entity' },
    'modal.intentionality': { fr: 'Intentionnalité', en: 'Intentionality' },
    'modal.timing': { fr: 'Temporalité', en: 'Timing' },
    'modal.category': { fr: 'Catégorie', en: 'Category' },
    'modal.subcategory': { fr: 'Sous-catégorie', en: 'Subcategory' },
    'modal.additional_evidence': { fr: 'Preuves Additionnelles', en: 'Additional Evidence' },
    'modal.complete_data': { fr: 'Données Complètes', en: 'Complete Data' },
    'modal.related_risks': { fr: 'Risques Connexes', en: 'Related Risks' },
    'modal.source': { fr: 'Source', en: 'Source' },
    'modal.category_level': { fr: 'Niveau de Catégorie', en: 'Category Level' },
    'modal.license': { fr: 'Source: MIT AI Risk Repository V3 (CC BY 4.0) | Contenu original en anglais', en: 'Source: MIT AI Risk Repository V3 (CC BY 4.0) | Original content in English' },

    // Causal Taxonomy
    'causal.title': { fr: 'Feuille 1 : Taxonomie Causale des Risques IA v3', en: 'Sheet 1: Causal Taxonomy of AI Risks v3' },
    'causal.updated': { fr: 'Mis à jour le : 26 Mars 2025', en: 'Updated: March 26, 2025' },
    'causal.description_title': { fr: 'Description de la Taxonomie', en: 'Taxonomy Description' },
    'causal.description': { fr: 'La Taxonomie Causale des Risques IA, adaptée de Yampolskiy (2016), classifie les risques selon leurs facteurs de causalité :', en: 'The Causal Taxonomy of AI Risks, adapted from Yampolskiy (2016), classifies risks according to their causal factors:' },
    'causal.how_to_use': { fr: 'Comment Utiliser', en: 'How to Use' },
    'causal.how_to_use_text': { fr: 'La taxonomie de haut niveau permet d\'utiliser notre base de données pour, par exemple, identifier toutes les mentions de risques qui se présentent comme survenant en pré-déploiement ou post-déploiement, de manière intentionnelle ou non, et causés par l\'IA ou par des humains, ou toute combinaison de ces facteurs.', en: 'The high-level taxonomy allows you to use our database to, for example, identify all mentions of risks that occur pre-deployment or post-deployment, intentionally or unintentionally, and caused by AI or by humans, or any combination of these factors.' },
    'causal.structure': { fr: 'Structure de la Taxonomie', en: 'Taxonomy Structure' },
    'causal.structure_hint': { fr: 'Cliquez sur les éléments pour déplier et voir les détails. Survolez une sous-catégorie avec un compteur pour voir le bouton "Filtrer" qui vous redirigera vers la base de données filtrée.', en: 'Click on items to expand and see details. Hover over a subcategory with a counter to see the "Filter" button that will redirect you to the filtered database.' },

    // Domain Taxonomy
    'domain.title': { fr: 'Feuille 3 : Taxonomie par Domaine des Risques IA v3', en: 'Sheet 3: Domain Taxonomy of AI Risks v3' },
    'domain.description': { fr: 'Cette taxonomie a pour but de définir et de catégoriser les dangers liés au contenu. Les catégories sont divisées en trois groupes : physiques, non-physiques et contextuels. Ces regroupements ne reflètent pas une hiérarchie de gravité.', en: 'This taxonomy aims to define and categorize content-related hazards. Categories are divided into three groups: physical, non-physical, and contextual. These groupings do not reflect a hierarchy of severity.' },
    'domain.categories_title': { fr: 'Catégories de Dangers de Contenu', en: 'Content Hazard Categories' },
    'domain.categories_hint': { fr: 'Cliquez sur les éléments pour déplier et voir les détails. Survolez une catégorie avec un compteur pour voir le bouton "Filtrer" qui vous redirigera vers la base de données filtrée.', en: 'Click on items to expand and see details. Hover over a category with a counter to see the "Filter" button that will redirect you to the filtered database.' },

    // Explainer
    'explainer.title': { fr: 'Explication de la Base de Données des Risques IA', en: 'AI Risk Database Explainer' },
    'explainer.updated': { fr: 'Mis à jour', en: 'Updated' },
    'explainer.mobile_warning': { fr: 'Cette page n\'est pas optimisée pour mobile ; veuillez y accéder sur un ordinateur si possible.', en: 'This page is not mobile-friendly; please access on a computer if you can.' },
    'explainer.description_title': { fr: 'Description de la Taxonomie', en: 'Description of Taxonomy' },
    'explainer.description': { fr: 'Un explicatif pour notre base de données de 1421 risques extraits de 65 cadres, catégorisés avec deux taxonomies (Facteurs Causaux et Domaines de Risques). Vous pouvez accéder au fichier complet de la base de données ici.', en: 'An explainer for our database of 1421 risks extracted from 65 frameworks, categorised with two taxonomies (Causal Factors and Domains of Risks). You can access the full database file here.' },
    'explainer.how_to_use': { fr: 'Comment Utiliser', en: 'How to Use' },
    'explainer.how_to_use_text': { fr: 'Regardez la vidéo ou consultez le contenu explicatif ci-dessous. Voir la base de données ici. Pour plus de détails, veuillez consulter notre rapport.', en: 'Watch the video or review the explanatory content below. See database here. For more see detail please our report.' },
    'explainer.structure_title': { fr: 'Structure de la Base de Données', en: 'Database Structure' },
    'explainer.extracted': { fr: 'Ce que nous avons extrait', en: 'What we extracted' },
    'explainer.field_categories': { fr: 'Catégories des Champs', en: 'Field Categories' },
    'explainer.field': { fr: 'Champ', en: 'Field' },
    'explainer.description_label': { fr: 'Description', en: 'Description' },
    'explainer.example_rows': { fr: 'Exemples de Lignes', en: 'Example Rows' },
    'explainer.example': { fr: 'Exemple', en: 'Example' },
    'explainer.more_info': { fr: 'Plus d\'Informations', en: 'More Information' },
    'explainer.feedback': { fr: 'Commentaires / Contact', en: 'Feedback/Contact us' },
    'explainer.citation': { fr: 'Citation', en: 'Cite as' },
    'explainer.license': { fr: 'Ce travail est sous licence CC BY 4.0', en: 'This work is licensed under CC BY 4.0' },

    // Repository
    'repo.title': { fr: 'Référentiel des Risques IA', en: 'AI Risk Repository' },
    'repo.subtitle': { fr: 'Explorez un référentiel complet de risques liés à l\'intelligence artificielle, basé sur des taxonomies et une base de données d\'incidents.', en: 'Explore a comprehensive repository of artificial intelligence risks, based on taxonomies and an incident database.' },

    // AI Policy Module
    'policy.title': { fr: 'Politique de Sécurité de l\'IA (PSSI-IA)', en: 'AI Security Policy (ISSP-AI)' },
    'policy.subtitle': { fr: 'Gérez, adaptez et suivez la mise en œuvre de votre politique de sécurité pour l\'intelligence artificielle, basée sur le modèle CLUSIF.', en: 'Manage, adapt and track the implementation of your AI security policy, based on the CLUSIF model.' },
    'policy.source': { fr: 'Source: CLUSIF - Modèle de PSSI IA - Février 2025', en: 'Source: CLUSIF - AI ISSP Model - February 2025' },
    'policy.chapter': { fr: 'Chapitre', en: 'Chapter' },
    'policy.section': { fr: 'Section', en: 'Section' },
    'policy.rule': { fr: 'Règle', en: 'Rule' },
    'policy.reference': { fr: 'Référence', en: 'Reference' },
    'policy.status': { fr: 'Statut', en: 'Status' },
    'policy.implementation': { fr: 'Détails de mise en œuvre', en: 'Implementation Details' },
    'policy.navigate': { fr: 'Navigation', en: 'Navigate' },
    'policy.statistics': { fr: 'Statistiques', en: 'Statistics' },
    'policy.total_rules': { fr: 'Règles totales', en: 'Total Rules' },
    'policy.implemented': { fr: 'Implémentées', en: 'Implemented' },
    'policy.in_progress': { fr: 'En cours', en: 'In Progress' },
    'policy.not_implemented': { fr: 'Non implémentées', en: 'Not Implemented' },
    'policy.compliance_rate': { fr: 'Taux de conformité', en: 'Compliance Rate' },
    'policy.mark_implemented': { fr: 'Marquer comme implémentée', en: 'Mark as Implemented' },
    'policy.mark_in_progress': { fr: 'Marquer en cours', en: 'Mark In Progress' },
    'policy.mark_not_implemented': { fr: 'Marquer non implémentée', en: 'Mark Not Implemented' },
    'policy.view_in_risk_repo': { fr: 'Voir dans le référentiel des risques', en: 'View in Risk Repository' },
    'policy.mitre_atlas': { fr: 'MITRE ATLAS', en: 'MITRE ATLAS' },
    'policy.nist_framework': { fr: 'Framework NIST AI RMF', en: 'NIST AI RMF Framework' },
    'policy.ai_act': { fr: 'AI Act (UE)', en: 'AI Act (EU)' },
    'policy.clusif_ref': { fr: 'Référence CLUSIF', en: 'CLUSIF Reference' },
    'policy.search_placeholder': { fr: 'Rechercher une règle, une section ou un mot-clé...', en: 'Search for a rule, section or keyword...' },
    'policy.export': { fr: 'Exporter', en: 'Export' },
    'policy.import': { fr: 'Importer', en: 'Import' },
    'policy.import_success': { fr: 'Importation de la politique réussie !', en: 'Policy import successful!' },
    'policy.import_error': { fr: 'Échec de l\'importation. Le fichier est invalide ou corrompu.', en: 'Import failed. The file is invalid or corrupt.' },
    'policy.no_results': { fr: 'Aucun résultat trouvé pour', en: 'No results found for' },
    'policy.lifecycle_phase': { fr: 'Phase du cycle de vie', en: 'Lifecycle Phase' },
    'policy.design': { fr: 'Conception', en: 'Design' },
    'policy.development': { fr: 'Développement', en: 'Development' },
    'policy.deployment': { fr: 'Déploiement', en: 'Deployment' },
    'policy.operation': { fr: 'Exploitation & Maintenance', en: 'Operation & Maintenance' },
    'policy.risk_function': { fr: 'Fonction de gestion des risques', en: 'Risk Management Function' },
    'policy.govern': { fr: 'Gouverner', en: 'Govern' },
    'policy.map': { fr: 'Cartographier', en: 'Map' },
    'policy.measure': { fr: 'Mesurer', en: 'Measure' },
    'policy.manage': { fr: 'Gérer', en: 'Manage' },
    'policy.chapter_1': { fr: 'Définitions', en: 'Definitions' },
    'policy.chapter_2': { fr: 'Périmètre et Objet', en: 'Scope and Purpose' },
    'policy.chapter_3': { fr: 'Cybersécurité du Développement', en: 'Cybersecurity of Development' },
    'policy.chapter_4': { fr: 'Gestion du Risque lié à l\'IA', en: 'AI Risk Management' },
    'policy.chapter_5': { fr: 'Cas Particulier des IA Génératives', en: 'Special Case of Generative AI' },
    'policy.expand_all': { fr: 'Tout déplier', en: 'Expand All' },
    'policy.collapse_all': { fr: 'Tout replier', en: 'Collapse All' },
    'policy.print': { fr: 'Imprimer', en: 'Print' },
    'policy.last_updated': { fr: 'Dernière mise à jour', en: 'Last Updated' },
    'policy.version': { fr: 'Version', en: 'Version' },
    'policy.download_pdf': { fr: 'Télécharger le PDF de référence', en: 'Download Reference PDF' },
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('fr');

    const t = (key: string): string => {
        const translation = translations[key];
        if (!translation) {
            console.warn(`Translation key not found: ${key}`);
            return key;
        }
        return translation[language] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
