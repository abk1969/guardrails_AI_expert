const fs = require('fs');
const path = require('path');

// ============================================================================
// COMPASS Relationship Linking Script
// ============================================================================
// Purpose: Parse Excel data and link COMPASS use cases to:
//   - Vulnerabilities (CVEs)
//   - Incidents (real-world AI incidents)
//   - Defenses (mitigation strategies)
//   - Questions (third-party vendor questions)
// ============================================================================

const dataPath = path.join(__dirname, '..', 'data_ai_risk', 'owasp-compass-analysis.json');
const useCasesPath = path.join(__dirname, '..', 'data', 'compassContent.ts');

console.log('🔗 COMPASS Relationship Linking Script');
console.log('=' .repeat(80));

// Load Excel data
const excelData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Load existing use cases
const useCasesContent = fs.readFileSync(useCasesPath, 'utf8');
const useCasesMatch = useCasesContent.match(/export const compassUseCases: CompassUseCase\[\] = (\[[\s\S]*?\n\]);/);
if (!useCasesMatch) {
  console.error('❌ Could not parse existing use cases');
  process.exit(1);
}

// Parse use cases (JSON format)
const useCasesText = useCasesMatch[1];
let useCasesArray;
try {
  // Clean up TypeScript syntax to make it valid JSON
  // NOTE: Apostrophes (') are valid in JSON strings and don't need escaping
  let jsonText = useCasesText
    .replace(/–/g, '-') // Replace en-dash (U+2013) with regular dash
    .replace(/—/g, '-') // Replace em-dash (U+2014) with regular dash
    .replace(/[\u2018\u2019]/g, "'") // Replace smart single quotes (U+2018, U+2019) with apostrophe
    .replace(/[\u201C\u201D]/g, '"') // Replace smart double quotes (U+201C, U+201D) with regular quotes
    .replace(/,(\s*[\]}])/g, '$1'); // Remove trailing commas

  useCasesArray = JSON.parse(jsonText);

  // Initialize missing relatedSheets fields for backward compatibility and future-proofing
  console.log('✅ Checking and initializing relatedSheets fields...');
  useCasesArray.forEach(uc => {
    if (!uc.relatedSheets) {
      uc.relatedSheets = {};
    }
    // Ensure all 10 fields exist (4 original + 6 new) - robust for future additions
    if (!uc.relatedSheets.vulnerabilities) uc.relatedSheets.vulnerabilities = [];
    if (!uc.relatedSheets.incidents) uc.relatedSheets.incidents = [];
    if (!uc.relatedSheets.defenses) uc.relatedSheets.defenses = [];
    if (!uc.relatedSheets.questions) uc.relatedSheets.questions = [];
    if (!uc.relatedSheets.threatProfiles) uc.relatedSheets.threatProfiles = [];
    if (!uc.relatedSheets.attackSurfaces) uc.relatedSheets.attackSurfaces = [];
    if (!uc.relatedSheets.incidentReadiness) uc.relatedSheets.incidentReadiness = [];
    if (!uc.relatedSheets.redTeamSecurity) uc.relatedSheets.redTeamSecurity = [];
    if (!uc.relatedSheets.redTeamResults) uc.relatedSheets.redTeamResults = [];
    if (!uc.relatedSheets.useCases) uc.relatedSheets.useCases = [];
  });
  console.log('✅ All relatedSheets fields initialized successfully');
} catch (e) {
  console.error('❌ Could not parse use cases JSON:', e.message);
  process.exit(1);
}

const useCases = useCasesArray.map(uc => ({
  id: uc.id,
  title: uc.title.en || uc.title.fr,
  threat: uc.associatedThreat.en || uc.associatedThreat.fr,
  mitre: uc.attackMapping.mitre || '',
  atlas: uc.attackMapping.atlas || ''
}));

console.log(`\n✅ Loaded ${useCases.length} use cases\n`);

// ============================================================================
// Helper Functions
// ============================================================================

function normalizeText(text) {
  return text.toLowerCase().trim();
}

function containsKeyword(text, keywords) {
  const normalized = normalizeText(text);
  return keywords.some(kw => normalized.includes(normalizeText(kw)));
}

function extractOwaspCategory(text) {
  // Extract OWASP categories like LLM01, LLM02, T1, T15, etc.
  const matches = text.match(/LLM\d{2}|T\d{1,2}(?!\d)/g);
  return matches || [];
}

// ============================================================================
// Vulnerability Linking
// ============================================================================

function linkVulnerabilities(useCase) {
  const vulnSheet = excelData['3a Orient Known AI Vulnerabilit'];
  const vulnerabilities = vulnSheet.data.slice(10); // Skip header/instruction rows

  const linkedCVEs = [];

  vulnerabilities.forEach(row => {
    if (!row[0] || !row[1]) return; // Skip empty rows

    const cve = row[1]; // CVE Identifier
    const description = row[3] || '';
    const owaspCategory = row[6] || ''; // OWASP LLM Category
    const owaspAgentic = row[8] || ''; // OWASP Agentic
    const attackType = row[9] || ''; // Attack Type

    let score = 0;

    // Strategy 1: OWASP Category matching
    const useCaseCategories = extractOwaspCategory(useCase.threat + ' ' + useCase.atlas);
    const vulnCategories = extractOwaspCategory(owaspCategory + ' ' + owaspAgentic);

    if (useCaseCategories.some(cat => vulnCategories.includes(cat))) {
      score += 3;
    }

    // Strategy 2: Attack type keyword matching
    const attackKeywords = {
      'jailbreak': ['prompt injection', 'bypass', 'jailbreak', 'XSS', 'injection'],
      'prompt injection': ['prompt injection', 'injection', 'XSS', 'code injection', 'command'],
      'data poisoning': ['poisoning', 'training data', 'data manipulation', 'backdoor'],
      'data leakage': ['leakage', 'disclosure', 'PII', 'data leak', 'privacy', 'sensitive'],
      'model theft': ['theft', 'extraction', 'stealing', 'intellectual property'],
      'denial of service': ['DoS', 'denial', 'resource', 'overload', 'infinite loop', 'consumption'],
      'supply chain': ['supply chain', 'dependency', 'third party', 'vendor'],
      'hallucination': ['hallucination', 'accuracy', 'misinformation'],
      'fraud': ['fraud', 'fake', 'synthetic', 'manipulation'],
      'security': ['security', 'vulnerability', 'exploit', 'attack', 'breach'],
      'ai': ['AI', 'LLM', 'model', 'GenAI', 'language model'],
    };

    for (const [key, keywords] of Object.entries(attackKeywords)) {
      if (containsKeyword(useCase.threat + ' ' + useCase.title, [key])) {
        if (containsKeyword(description + ' ' + attackType, keywords)) {
          score += 2;
        }
      }
    }

    // Strategy 3: MITRE/ATLAS technique matching (looser match)
    if (useCase.mitre && description.includes(useCase.mitre.substring(0, 5))) {
      score += 1;
    }

    // Link if score >= 1 (be more generous to increase coverage)
    if (score >= 1 && cve) {
      linkedCVEs.push(cve);
    }
  });

  return linkedCVEs.slice(0, 8); // Limit to top 8 to avoid clutter
}

// ============================================================================
// Incident Linking
// ============================================================================

function linkIncidents(useCase) {
  const incidentSheet = excelData['3b Orient Known AI Incidents'];
  const incidents = incidentSheet.data.slice(5); // Skip header rows

  const linkedIncidents = [];

  incidents.forEach(row => {
    if (!row[0]) return; // Skip empty rows

    const incidentName = row[0];
    const owaspCategory = row[1] || '';

    let score = 0;

    // Strategy 1: OWASP Category matching
    const useCaseCategories = extractOwaspCategory(useCase.threat + ' ' + useCase.atlas);
    const incidentCategories = extractOwaspCategory(owaspCategory);

    if (useCaseCategories.some(cat => incidentCategories.includes(cat))) {
      score += 3;
    }

    // Strategy 2: Incident type keyword matching
    const incidentKeywords = {
      'jailbreak': ['jailbreak', 'inference', 'bypass', 'GPT', 'attack'],
      'deepfake': ['deepfake', 'deep fake', 'fake', 'synthetic', 'clone', 'impersonation'],
      'prompt injection': ['injection', 'prompt', 'XSS'],
      'data breach': ['breach', 'leak', 'disclosure', 'exposure'],
      'bias': ['bias', 'discrimination', 'fairness', 'inequality', 'disparat'],
      'fraud': ['fraud', 'scam', 'fake', 'malicious'],
      'privacy': ['privacy', 'PII', 'data', 'personal'],
      'security': ['security', 'vulnerability', 'exploit', 'attack'],
      'hallucination': ['hallucination', 'misinformation', 'incorrect', 'false'],
      'ai': ['AI', 'LLM', 'model', 'ML', 'machine learning'],
    };

    for (const [key, keywords] of Object.entries(incidentKeywords)) {
      if (containsKeyword(useCase.threat + ' ' + useCase.title, [key])) {
        if (containsKeyword(incidentName, keywords)) {
          score += 2;
        }
      }
    }

    // Link if score >= 1 (be more generous)
    if (score >= 1 && incidentName) {
      linkedIncidents.push(incidentName);
    }
  });

  return linkedIncidents.slice(0, 5); // Limit to top 5
}

// ============================================================================
// Defense Linking
// ============================================================================

function linkDefenses(useCase) {
  const defenseSheet = excelData['6a Reference Defenses & Mitigat'];
  const defenses = defenseSheet.data.slice(2, 12); // Main defense rows (skip headers, limit to core rows)

  const linkedDefenseIndices = [];

  defenses.forEach((row, index) => {
    if (!row[0]) return;

    const controlStrategies = row[0] || '';
    const detectionMechanisms = row[1] || '';
    const fullText = controlStrategies + ' ' + detectionMechanisms;

    let score = 0;

    // Defense keyword mapping
    const defenseKeywords = {
      'prompt injection': ['input validation', 'sanitization', 'prompt', 'context separation', 'parsing', 'injection'],
      'jailbreak': ['input validation', 'sanitization', 'filtering', 'policy', 'control'],
      'data poisoning': ['data validation', 'outlier detection', 'provenance', 'training data', 'data sourcing'],
      'model theft': ['rate limiting', 'watermarking', 'access control', 'differential privacy', 'query'],
      'data leakage': ['differential privacy', 'anonymization', 'access control', 'filtering', 'privacy', 'data'],
      'denial of service': ['rate limiting', 'resource quota', 'throttling', 'monitoring', 'DoS', 'resource'],
      'supply chain': ['vendor risk', 'SBOM', 'scanning', 'integrity', 'trusted', 'supply chain', 'third party'],
      'harmful content': ['filtering', 'monitoring', 'toxicity', 'acceptable use', 'policy', 'content'],
      'security': ['security', 'monitoring', 'detection', 'control', 'validation'],
      'model': ['model', 'training', 'validation', 'testing', 'behavior'],
      'ai': ['AI', 'model', 'monitoring', 'validation', 'security'],
    };

    for (const [key, keywords] of Object.entries(defenseKeywords)) {
      if (containsKeyword(useCase.threat + ' ' + useCase.title, [key])) {
        if (containsKeyword(fullText, keywords)) {
          score += 2;
        }
      }
    }

    // Link if score >= 1 (be more generous)
    if (score >= 1) {
      linkedDefenseIndices.push(index);
    }
  });

  return linkedDefenseIndices.slice(0, 4); // Limit to top 4
}

// ============================================================================
// Third Party Questions Linking
// ============================================================================

function linkQuestions(useCase) {
  const questionsSheet = excelData['6c Reference Third Party Questi'];
  const questions = questionsSheet.data.slice(2); // Skip header rows

  const linkedQuestionIds = [];

  questions.forEach((row, index) => {
    if (!row[0] || !row[1]) return; // Skip empty rows

    const category = row[0];
    const question = row[1];

    let score = 0;

    // Category theme matching
    const categoryKeywords = {
      'AI Use Transparency': ['transparency', 'disclosure', 'awareness', 'communication', 'explainability'],
      'Bias & Fairness': ['bias', 'fairness', 'discrimination', 'equity', 'disparate', 'discriminatory'],
      'Data Access & Security': ['privacy', 'data', 'PII', 'security', 'access', 'breach', 'leakage', 'sensitive', 'credential'],
      'Model Security': ['model', 'security', 'adversarial', 'robustness', 'attack', 'vulnerability'],
      'Incident Response': ['incident', 'response', 'breach', 'monitoring', 'detection'],
      'Training Data': ['training', 'data', 'dataset', 'poisoning', 'model'],
      'Governance': ['governance', 'policy', 'compliance', 'oversight', 'risk'],
      'Third Party': ['third party', 'vendor', 'supply chain', 'provider'],
    };

    for (const [catKey, keywords] of Object.entries(categoryKeywords)) {
      if (containsKeyword(category, [catKey])) {
        if (containsKeyword(useCase.threat + ' ' + useCase.title, keywords)) {
          score += 2;
        }
      }
    }

    // Question keyword matching
    const questionKeywords = {
      'privacy': ['privacy', 'PII', 'personal', 'data protection', 'sensitive', 'confidential'],
      'security': ['security', 'vulnerability', 'attack', 'breach', 'threat', 'risk'],
      'bias': ['bias', 'fairness', 'discrimination', 'disparate', 'equity'],
      'transparency': ['transparency', 'disclosure', 'explainability', 'awareness'],
      'model': ['model', 'AI', 'ML', 'training', 'LLM', 'GenAI'],
      'data': ['data', 'training', 'dataset', 'information'],
      'vendor': ['vendor', 'third party', 'provider', 'supplier'],
    };

    for (const [key, keywords] of Object.entries(questionKeywords)) {
      if (containsKeyword(useCase.threat + ' ' + useCase.title, [key])) {
        if (containsKeyword(question, keywords)) {
          score += 1;
        }
      }
    }

    // Link if score >= 1 (be more generous to increase coverage)
    if (score >= 1) {
      linkedQuestionIds.push(index);
    }
  });

  return linkedQuestionIds.slice(0, 10); // Limit to top 10
}

// ============================================================================
// Threat Profile Linking
// ============================================================================

function linkThreatProfiles(useCase) {
  const threatSheet = excelData[' 2a Observe Objective Threat Pr']; // Note: leading space!
  if (!threatSheet) {
    console.warn(`⚠️  Threat Profiles sheet not found`);
    return [];
  }
  const threats = threatSheet.data.slice(5); // Skip header rows

  const linkedThreats = [];

  threats.forEach((row, index) => {
    if (!row[0]) return;

    const threatName = row[0] || '';
    const threatDescription = row[1] || '';
    const fullText = threatName + ' ' + threatDescription;

    let score = 0;

    // Threat keyword mapping
    const threatKeywords = {
      'jailbreak': ['jailbreak', 'prompt injection', 'bypass', 'manipulation', 'adversarial'],
      'data poisoning': ['poisoning', 'contamination', 'training data', 'backdoor'],
      'privacy': ['privacy', 'PII', 'data leak', 'disclosure', 'sensitive'],
      'model theft': ['theft', 'extraction', 'stealing', 'intellectual property'],
      'denial of service': ['DoS', 'denial', 'resource', 'availability'],
      'deepfake': ['deepfake', 'fake', 'synthetic', 'impersonation', 'clone'],
      'bias': ['bias', 'fairness', 'discrimination', 'disparate'],
      'fraud': ['fraud', 'scam', 'malicious', 'deception'],
      'security': ['security', 'vulnerability', 'attack', 'threat'],
      'ai': ['AI', 'LLM', 'model', 'ML', 'GenAI'],
    };

    for (const [key, keywords] of Object.entries(threatKeywords)) {
      if (containsKeyword(useCase.threat + ' ' + useCase.title, [key])) {
        if (containsKeyword(fullText, keywords)) {
          score += 2;
        }
      }
    }

    if (score >= 1) {
      linkedThreats.push(index);
    }
  });

  return linkedThreats.slice(0, 6);
}

// ============================================================================
// Attack Surface Linking
// ============================================================================

function linkAttackSurfaces(useCase) {
  const surfaceSheet = excelData['2b Observe Attack Surface Analy'];
  if (!surfaceSheet) {
    console.warn(`⚠️  Attack Surface sheet not found`);
    return [];
  }
  const surfaces = surfaceSheet.data.slice(5); // Skip header rows

  const linkedSurfaces = [];

  surfaces.forEach((row, index) => {
    if (!row[0]) return;

    const componentName = row[0] || '';
    const vulnerabilities = row[1] || '';
    const fullText = componentName + ' ' + vulnerabilities;

    let score = 0;

    // Attack surface keyword mapping
    const surfaceKeywords = {
      'prompt': ['prompt', 'input', 'user input', 'query'],
      'data': ['data', 'training data', 'dataset', 'storage'],
      'model': ['model', 'weights', 'parameters', 'inference'],
      'api': ['API', 'endpoint', 'interface', 'integration'],
      'supply chain': ['supply chain', 'dependency', 'third party', 'vendor'],
      'deployment': ['deployment', 'infrastructure', 'cloud', 'server'],
      'output': ['output', 'response', 'generation', 'result'],
      'security': ['security', 'authentication', 'authorization', 'access control'],
      'monitoring': ['monitoring', 'logging', 'audit', 'detection'],
    };

    for (const [key, keywords] of Object.entries(surfaceKeywords)) {
      if (containsKeyword(useCase.threat + ' ' + useCase.title, [key])) {
        if (containsKeyword(fullText, keywords)) {
          score += 2;
        }
      }
    }

    if (score >= 1) {
      linkedSurfaces.push(index);
    }
  });

  return linkedSurfaces.slice(0, 6);
}

// ============================================================================
// Incident Readiness Linking
// ============================================================================

function linkIncidentReadiness(useCase) {
  const readinessSheet = excelData['3c Orient AI Incident Response '];
  if (!readinessSheet) {
    console.warn(`⚠️  Incident Readiness sheet not found`);
    return [];
  }
  const readiness = readinessSheet.data.slice(5); // Skip header rows

  const linkedReadiness = [];

  readiness.forEach((row, index) => {
    if (!row[0]) return;

    const phase = row[0] || '';
    const actions = row[1] || '';
    const fullText = phase + ' ' + actions;

    let score = 0;

    // Incident response keyword mapping
    const incidentKeywords = {
      'detection': ['detection', 'monitoring', 'alert', 'identify', 'discover'],
      'containment': ['containment', 'isolation', 'quarantine', 'limit'],
      'investigation': ['investigation', 'analysis', 'forensics', 'root cause'],
      'remediation': ['remediation', 'fix', 'patch', 'mitigation', 'recovery'],
      'communication': ['communication', 'notification', 'disclosure', 'reporting'],
      'data breach': ['breach', 'leak', 'exposure', 'disclosure'],
      'model': ['model', 'AI', 'LLM', 'ML'],
      'security': ['security', 'incident', 'attack', 'threat'],
    };

    for (const [key, keywords] of Object.entries(incidentKeywords)) {
      if (containsKeyword(useCase.threat + ' ' + useCase.title, [key])) {
        if (containsKeyword(fullText, keywords)) {
          score += 2;
        }
      }
    }

    if (score >= 1) {
      linkedReadiness.push(index);
    }
  });

  return linkedReadiness.slice(0, 6);
}

// ============================================================================
// Red Team Security Review Linking
// ============================================================================

function linkRedTeamSecurity(useCase) {
  const redTeamSheet = excelData['3d Orient Red Team Security Rev'];
  if (!redTeamSheet) {
    console.warn(`⚠️  Red Team Security sheet not found`);
    return [];
  }
  const reviews = redTeamSheet.data.slice(5); // Skip header rows

  const linkedReviews = [];

  reviews.forEach((row, index) => {
    if (!row[0]) return;

    const testArea = row[0] || '';
    const testMethod = row[1] || '';
    const fullText = testArea + ' ' + testMethod;

    let score = 0;

    // Red team keyword mapping
    const redTeamKeywords = {
      'prompt injection': ['prompt injection', 'injection', 'bypass', 'jailbreak'],
      'data poisoning': ['poisoning', 'training data', 'backdoor'],
      'model theft': ['extraction', 'theft', 'stealing'],
      'privacy': ['privacy', 'PII', 'data leak', 'sensitive'],
      'adversarial': ['adversarial', 'attack', 'malicious', 'exploit'],
      'security': ['security', 'vulnerability', 'penetration', 'testing'],
      'model': ['model', 'AI', 'LLM', 'behavior'],
      'validation': ['validation', 'verification', 'testing', 'assessment'],
    };

    for (const [key, keywords] of Object.entries(redTeamKeywords)) {
      if (containsKeyword(useCase.threat + ' ' + useCase.title, [key])) {
        if (containsKeyword(fullText, keywords)) {
          score += 2;
        }
      }
    }

    if (score >= 1) {
      linkedReviews.push(index);
    }
  });

  return linkedReviews.slice(0, 6);
}

// ============================================================================
// Red Team Results Linking
// ============================================================================

function linkRedTeamResults(useCase) {
  const resultsSheet = excelData['3e Orient AI Red Team Results'];
  if (!resultsSheet) {
    console.warn(`⚠️  Red Team Results sheet not found`);
    return [];
  }
  const results = resultsSheet.data.slice(5); // Skip header rows

  const linkedResults = [];

  results.forEach((row, index) => {
    if (!row[0]) return;

    const finding = row[0] || '';
    const severity = row[1] || '';
    const fullText = finding + ' ' + severity;

    let score = 0;

    // Results keyword mapping (similar to vulnerabilities)
    const resultsKeywords = {
      'jailbreak': ['jailbreak', 'prompt injection', 'bypass'],
      'data leakage': ['leak', 'disclosure', 'exposure', 'PII'],
      'model': ['model', 'AI', 'LLM', 'behavior'],
      'security': ['security', 'vulnerability', 'exploit', 'weakness'],
      'privacy': ['privacy', 'data', 'sensitive', 'confidential'],
      'attack': ['attack', 'adversarial', 'malicious'],
    };

    for (const [key, keywords] of Object.entries(resultsKeywords)) {
      if (containsKeyword(useCase.threat + ' ' + useCase.title, [key])) {
        if (containsKeyword(fullText, keywords)) {
          score += 2;
        }
      }
    }

    if (score >= 1) {
      linkedResults.push(index);
    }
  });

  return linkedResults.slice(0, 5);
}

// ============================================================================
// Use Cases Linking (cross-linking between use cases)
// ============================================================================
// NOTE: This links COMPASS use cases to the "1 Observe Business Context & Us" sheet
// which contains business context use cases (different from COMPASS threat scenarios)

function linkUseCases(useCase) {
  // This sheet contains business context use cases, not COMPASS threat scenarios
  const useCasesSheet = excelData['1 Observe Business Context & Us'];
  if (!useCasesSheet) {
    // Sheet not found - this is expected as sheet names may vary
    // Return empty array gracefully
    return [];
  }

  const businessUseCases = useCasesSheet.data.slice(5); // Skip header rows
  const linkedUseCases = [];

  businessUseCases.forEach((row, index) => {
    if (!row[0]) return;

    const businessContext = row[0] || '';
    const description = row[1] || '';
    const fullText = businessContext + ' ' + description;

    let score = 0;

    // Business context keyword mapping
    const contextKeywords = {
      'customer': ['customer', 'client', 'user', 'end-user'],
      'automation': ['automation', 'automated', 'workflow', 'process'],
      'chatbot': ['chatbot', 'conversational', 'dialogue', 'chat'],
      'content': ['content', 'generation', 'creation', 'synthesis'],
      'analysis': ['analysis', 'analytics', 'insights', 'intelligence'],
      'recommendation': ['recommendation', 'suggest', 'personalization'],
      'security': ['security', 'fraud', 'threat', 'risk'],
    };

    for (const [key, keywords] of Object.entries(contextKeywords)) {
      if (containsKeyword(useCase.threat + ' ' + useCase.title, [key])) {
        if (containsKeyword(fullText, keywords)) {
          score += 2;
        }
      }
    }

    if (score >= 1) {
      linkedUseCases.push(index);
    }
  });

  return linkedUseCases.slice(0, 5);
}

// ============================================================================
// Main Processing
// ============================================================================

console.log('Processing use case relationships...\n');

const relationships = useCases.map(useCase => {
  const vulns = linkVulnerabilities(useCase);
  const incidents = linkIncidents(useCase);
  const defenses = linkDefenses(useCase);
  const questions = linkQuestions(useCase);
  const threatProfiles = linkThreatProfiles(useCase);
  const attackSurfaces = linkAttackSurfaces(useCase);
  const incidentReadiness = linkIncidentReadiness(useCase);
  const redTeamSecurity = linkRedTeamSecurity(useCase);
  const redTeamResults = linkRedTeamResults(useCase);
  const relatedUseCases = linkUseCases(useCase);

  console.log(`${useCase.id}: ${useCase.title}`);
  console.log(`  └─ ${vulns.length} vuln, ${incidents.length} inc, ${defenses.length} def, ${questions.length} q`);
  console.log(`     ${threatProfiles.length} threat, ${attackSurfaces.length} surf, ${incidentReadiness.length} ready, ${redTeamSecurity.length} sec, ${redTeamResults.length} res, ${relatedUseCases.length} uc`);

  return {
    id: useCase.id,
    vulnerabilities: vulns,
    incidents: incidents,
    defenses: defenses,
    questions: questions,
    threatProfiles: threatProfiles,
    attackSurfaces: attackSurfaces,
    incidentReadiness: incidentReadiness,
    redTeamSecurity: redTeamSecurity,
    redTeamResults: redTeamResults,
    useCases: relatedUseCases
  };
});

// ============================================================================
// Statistics
// ============================================================================

console.log('\n' + '='.repeat(80));
console.log('📊 LINKAGE STATISTICS');
console.log('='.repeat(80));

const totalVulns = relationships.reduce((sum, r) => sum + r.vulnerabilities.length, 0);
const totalIncidents = relationships.reduce((sum, r) => sum + r.incidents.length, 0);
const totalDefenses = relationships.reduce((sum, r) => sum + r.defenses.length, 0);
const totalQuestions = relationships.reduce((sum, r) => sum + r.questions.length, 0);
const totalThreats = relationships.reduce((sum, r) => sum + r.threatProfiles.length, 0);
const totalSurfaces = relationships.reduce((sum, r) => sum + r.attackSurfaces.length, 0);
const totalReadiness = relationships.reduce((sum, r) => sum + r.incidentReadiness.length, 0);
const totalSecurity = relationships.reduce((sum, r) => sum + r.redTeamSecurity.length, 0);
const totalResults = relationships.reduce((sum, r) => sum + r.redTeamResults.length, 0);
const totalUseCases = relationships.reduce((sum, r) => sum + r.useCases.length, 0);

const useCasesWithVulns = relationships.filter(r => r.vulnerabilities.length > 0).length;
const useCasesWithIncidents = relationships.filter(r => r.incidents.length > 0).length;
const useCasesWithDefenses = relationships.filter(r => r.defenses.length > 0).length;
const useCasesWithQuestions = relationships.filter(r => r.questions.length > 0).length;
const useCasesWithThreats = relationships.filter(r => r.threatProfiles.length > 0).length;
const useCasesWithSurfaces = relationships.filter(r => r.attackSurfaces.length > 0).length;
const useCasesWithReadiness = relationships.filter(r => r.incidentReadiness.length > 0).length;
const useCasesWithSecurity = relationships.filter(r => r.redTeamSecurity.length > 0).length;
const useCasesWithResults = relationships.filter(r => r.redTeamResults.length > 0).length;
const useCasesWithRelatedUC = relationships.filter(r => r.useCases.length > 0).length;

const grandTotal = totalVulns + totalIncidents + totalDefenses + totalQuestions + totalThreats + totalSurfaces + totalReadiness + totalSecurity + totalResults + totalUseCases;

console.log(`\n✅ Total Links Created: ${grandTotal}`);
console.log(`\n📦 Original 4 Modules:`);
console.log(`   - Vulnerabilities: ${totalVulns} links (${useCasesWithVulns}/${useCases.length} use cases = ${Math.round(useCasesWithVulns / useCases.length * 100)}%)`);
console.log(`   - Incidents: ${totalIncidents} links (${useCasesWithIncidents}/${useCases.length} use cases = ${Math.round(useCasesWithIncidents / useCases.length * 100)}%)`);
console.log(`   - Defenses: ${totalDefenses} links (${useCasesWithDefenses}/${useCases.length} use cases = ${Math.round(useCasesWithDefenses / useCases.length * 100)}%)`);
console.log(`   - Questions: ${totalQuestions} links (${useCasesWithQuestions}/${useCases.length} use cases = ${Math.round(useCasesWithQuestions / useCases.length * 100)}%)`);

console.log(`\n🆕 New 6 Modules:`);
console.log(`   - Threat Profiles: ${totalThreats} links (${useCasesWithThreats}/${useCases.length} use cases = ${Math.round(useCasesWithThreats / useCases.length * 100)}%)`);
console.log(`   - Attack Surfaces: ${totalSurfaces} links (${useCasesWithSurfaces}/${useCases.length} use cases = ${Math.round(useCasesWithSurfaces / useCases.length * 100)}%)`);
console.log(`   - Incident Readiness: ${totalReadiness} links (${useCasesWithReadiness}/${useCases.length} use cases = ${Math.round(useCasesWithReadiness / useCases.length * 100)}%)`);
console.log(`   - Red Team Security: ${totalSecurity} links (${useCasesWithSecurity}/${useCases.length} use cases = ${Math.round(useCasesWithSecurity / useCases.length * 100)}%)`);
console.log(`   - Red Team Results: ${totalResults} links (${useCasesWithResults}/${useCases.length} use cases = ${Math.round(useCasesWithResults / useCases.length * 100)}%)`);
console.log(`   - Related Use Cases: ${totalUseCases} links (${useCasesWithRelatedUC}/${useCases.length} use cases = ${Math.round(useCasesWithRelatedUC / useCases.length * 100)}%)`);

// Identify use cases with no links
const useCasesWithNoLinks = relationships.filter(r =>
  r.vulnerabilities.length === 0 &&
  r.incidents.length === 0 &&
  r.defenses.length === 0 &&
  r.questions.length === 0 &&
  r.threatProfiles.length === 0 &&
  r.attackSurfaces.length === 0 &&
  r.incidentReadiness.length === 0 &&
  r.redTeamSecurity.length === 0 &&
  r.redTeamResults.length === 0 &&
  r.useCases.length === 0
);

if (useCasesWithNoLinks.length > 0) {
  console.log(`\n⚠️  Use cases with NO links (may need manual review):`);
  useCasesWithNoLinks.forEach(r => {
    const uc = useCases.find(u => u.id === r.id);
    console.log(`   - ${r.id}: ${uc.title}`);
  });
}

// ============================================================================
// Output JSON for use in next script
// ============================================================================

const outputPath = path.join(__dirname, '..', 'data_ai_risk', 'compass-relationships.json');
fs.writeFileSync(outputPath, JSON.stringify(relationships, null, 2));

console.log(`\n✅ Relationships saved to: ${outputPath}`);
console.log('\n✅ STEP 1 Complete! Run STEP 2 to update compassContent.ts\n');
