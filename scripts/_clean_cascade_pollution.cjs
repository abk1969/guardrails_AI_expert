#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const INPUT = path.join(__dirname, '..', 'data_ai_risk', 'extracted', 'pssi-ia-v3-enrichments.json');

const SUBSTITUTIONS = [
  [/cascade (non-conformité|incidents|frameworks|jurisprudence|by-design|sanctions|amendes|atteintes|réglementaire|réglementaires|certifications|ANSSI|conformité|compliance|tests|audit|audits|formation|formations|veille|risques)/gi, '$1'],
  [/Cascade (non-conformité|incidents|frameworks|jurisprudence|by-design|sanctions|amendes|atteintes|réglementaire|réglementaires|certifications|ANSSI|conformité|compliance|tests|audit|audits|formation|formations|veille|risques)/g, m => m.charAt(0) + m.slice(1).replace(/^Cascade /, '').replace(/^./, c => c.toUpperCase())],
  [/risque cascade absence/gi, "risque d'absence"],
  [/risque cascade /gi, "risque d'"],
  [/déclenche cascade /gi, 'déclenche '],
  [/déclenchent cascade /gi, 'déclenchent '],
  [/entraîne cascade /gi, 'entraîne '],
  [/entraînent cascade /gi, 'entraînent '],
  [/ une cascade /gi, ' une chaîne '],
  [/ la cascade /gi, ' la chaîne '],
  [/ en cascade /gi, ' '],
  [/([.!?]\s+|^|\n)Cascade /g, '$1Entraîne '],
  [/([,;]\s*)cascade /gi, '$1enchaîne '],
  [/\(cascade /gi, '(implique '],
  [/\bcascade,/gi, 'enchaînement,'],
  [/\bcascade\.\s/gi, 'enchaînement. '],
  [/\bCascade\s+/g, 'Entraîne '],
  [/\bcascade\s+/gi, ''],
  [/\s*\(cascade\)/gi, ' (effet d\'enchaînement)'],
  [/Questions cascade/gi, 'Questions en chaîne'],
  [/SIA-\d+ modules sensibles cascade/gi, m => m.replace(' cascade', '')],
  [/\(cascade /gi, '(effet '],
  [/\bcascade\b/gi, ''],
];

function clean(text) {
  if (typeof text !== 'string') return text;
  let out = text;
  for (const [pattern, replacement] of SUBSTITUTIONS) {
    out = out.replace(pattern, replacement);
  }
  return out;
}

function cleanScenario(s) {
  if (!s || typeof s !== 'object') return s;
  return {
    ...s,
    title: clean(s.title),
    description: clean(s.description),
    threatActor: clean(s.threatActor),
    attackVector: clean(s.attackVector),
    mitigation: clean(s.mitigation),
    impact: s.impact ? Object.fromEntries(Object.entries(s.impact).map(([k, v]) => [k, typeof v === 'string' ? clean(v) : v])) : s.impact,
    mappings: s.mappings ? Object.fromEntries(Object.entries(s.mappings).map(([k, v]) => [k, typeof v === 'string' ? clean(v) : v])) : s.mappings,
  };
}

function cleanEntry(e) {
  if (!e || typeof e !== 'object') return e;
  return {
    ...e,
    associatedThreat: typeof e.associatedThreat === 'string' ? clean(e.associatedThreat) : e.associatedThreat,
    associatedRisk: typeof e.associatedRisk === 'string' ? clean(e.associatedRisk) : e.associatedRisk,
    implementationGuide: typeof e.implementationGuide === 'string' ? clean(e.implementationGuide) : e.implementationGuide,
    testingGuide: typeof e.testingGuide === 'string' ? clean(e.testingGuide) : e.testingGuide,
    riskScenarios: Array.isArray(e.riskScenarios) ? e.riskScenarios.map(cleanScenario) : e.riskScenarios,
  };
}

function countCascade(obj) {
  const json = JSON.stringify(obj);
  return (json.match(/cascade/gi) || []).length;
}

const data = JSON.parse(fs.readFileSync(INPUT, 'utf8'));
const beforeCount = countCascade(data);

const newData = {};
for (const k of Object.keys(data)) {
  if (k === '_meta') {
    newData[k] = { ...data[k], lastUpdated: new Date().toISOString().split('T')[0] };
  } else {
    newData[k] = cleanEntry(data[k]);
  }
}

const afterCount = countCascade(newData);

fs.writeFileSync(INPUT, JSON.stringify(newData, null, 2) + '\n', 'utf8');

console.log(`Cascade occurrences before : ${beforeCount}`);
console.log(`Cascade occurrences after  : ${afterCount}`);
console.log(`Removed                    : ${beforeCount - afterCount}`);
console.log(`Reduction                  : ${((1 - afterCount / beforeCount) * 100).toFixed(1)}%`);
