// ============================================================
// OWASP COMPASS Data - Auto-generated (Bilingual FR/EN)
// Generated: 2025-10-27T16:06:51.221Z
// Source: Copy of ⭕ OWASP GenAI COMPASS v. 1.xlsx
// Note: Original data was in English
// ============================================================

import {
  CompassUseCase,
  OWASPSheet,
  OODAPhase,
  RiskLevel,
  BilingualText
} from '../types';

// ============================================================
// USE CASES (31 threat scenarios with risk scores - BILINGUAL)
// ============================================================

export const compassUseCases: CompassUseCase[] = [
  {
    "id": "COMPASS-UC-0001",
    "title": {
      "fr": "Jailbreak of internal chatbot",
      "en": "Jailbreak of internal chatbot"
    },
    "description": {
      "fr": "Model control bypass via prompt manipulation",
      "en": "Model control bypass via prompt manipulation"
    },
    "impact": 4,
    "likelihood": 5,
    "riskScore": 20,
    "riskLevel": "critical",
    "recommendation": {
      "fr": "Immediate mitigation and executive review required.",
      "en": "Immediate mitigation and executive review required."
    },
    "associatedThreat": {
      "fr": "Model control bypass via prompt manipulation",
      "en": "Model control bypass via prompt manipulation"
    },
    "attackMapping": {
      "mitre": "T1566.001",
      "atlas": "T1566.001 - Spear Phishing via Service / T1647 - Prompt Injection (ATLAS)",
      "description": {
        "fr": "T1566.001 - Spear Phishing via Service / T1647 - Prompt Injection (ATLAS)",
        "en": "T1566.001 - Spear Phishing via Service / T1647 - Prompt Injection (ATLAS)"
      }
    },
    "relatedSheets": {
      "vulnerabilities": [
        "CVE-2024-10835",
        "CVE-2024-9000",
        "CVE-2024-11301",
        "CVE-2024-10273",
        "CVE-2024-10109",
        "CVE-2024-10954",
        "CVE-2024-10950",
        "CVE-2025-2450"
      ],
      "incidents": [
        "Chat GPT Inference Attack",
        "McDonald sued for use of AI which collected voice print biometrics",
        "SoundCloud discreetly changed its terms of service, adding a clause that many interpreted as giving the company the right to use users' music and audio uploads to train AI models - including generative AI capable of replicating or synthesising artists' voices, music, or likeness. ",
        "In early 2024, T-Mobile revealed that hackers used an AI-equipped application programming interface (API) to gain unauthorized access to sensitive customer information, including full names, contact numbers, and PINs of its customers. ",
        "Air Canada Chatbot customer who was misled into paying for full-price flight tickets by a contact center chatbot."
      ],
      "defenses": [
        0,
        1,
        2,
        3
      ],
      "questions": [
        0,
        1,
        2,
        3,
        4,
        7,
        9,
        10,
        12,
        14
      ],
      "threatProfiles": [
        5,
        30
      ],
      "attackSurfaces": [],
      "incidentReadiness": [
        0,
        1,
        2,
        3,
        4,
        7
      ],
      "redTeamSecurity": [
        2,
        3,
        12,
        13,
        14,
        15
      ],
      "redTeamResults": [
        4,
        5,
        6,
        7,
        8
      ],
      "useCases": []
    },
    "oodaPhase": "observe",
    "createdAt": "2025-10-27T15:57:27.727Z",
    "updatedAt": "2025-10-27T15:57:27.728Z"
  },
  {
    "id": "COMPASS-UC-0002",
    "title": {
      "fr": "Deepfake targeting executive",
      "en": "Deepfake targeting executive"
    },
    "description": {
      "fr": "Executive impersonation and reputational harm",
      "en": "Executive impersonation and reputational harm"
    },
    "impact": 5,
    "likelihood": 3,
    "riskScore": 15,
    "riskLevel": "high",
    "recommendation": {
      "fr": "High priority: plan mitigations and monitor closely.",
      "en": "High priority: plan mitigations and monitor closely."
    },
    "associatedThreat": {
      "fr": "Executive impersonation and reputational harm",
      "en": "Executive impersonation and reputational harm"
    },
    "attackMapping": {
      "mitre": "T1586.002",
      "description": {
        "fr": "T1586.002 - Identity Theft: Executive Impersonation",
        "en": "T1586.002 - Identity Theft: Executive Impersonation"
      }
    },
    "relatedSheets": {
      "vulnerabilities": [],
      "incidents": [
        "Deep Fake Fraud"
      ],
      "defenses": [],
      "questions": [],
      "threatProfiles": [],
      "attackSurfaces": [],
      "incidentReadiness": [],
      "redTeamSecurity": [],
      "redTeamResults": [],
      "useCases": []
    },
    "oodaPhase": "observe",
    "createdAt": "2025-10-27T15:57:27.728Z",
    "updatedAt": "2025-10-27T15:57:27.728Z"
  },
  {
    "id": "COMPASS-UC-0003",
    "title": {
      "fr": "Prompt injection via public API",
      "en": "Prompt injection via public API"
    },
    "description": {
      "fr": "Remote code execution or command injection",
      "en": "Remote code execution or command injection"
    },
    "impact": 4,
    "likelihood": 5,
    "riskScore": 20,
    "riskLevel": "critical",
    "recommendation": {
      "fr": "Immediate mitigation and executive review required.",
      "en": "Immediate mitigation and executive review required."
    },
    "associatedThreat": {
      "fr": "Remote code execution or command injection",
      "en": "Remote code execution or command injection"
    },
    "attackMapping": {
      "mitre": "T1203",
      "atlas": "T1203 - Exploitation for Client Execution / T1647 - Prompt Injection (ATLAS)",
      "description": {
        "fr": "T1203 - Exploitation for Client Execution / T1647 - Prompt Injection (ATLAS)",
        "en": "T1203 - Exploitation for Client Execution / T1647 - Prompt Injection (ATLAS)"
      }
    },
    "relatedSheets": {
      "vulnerabilities": [
        "CVE-2024-10835",
        "CVE-2024-10954",
        "CVE-2024-10950"
      ],
      "incidents": [
        "Financial Transaction Hijacking with M365 Copilot as an Insider. The attack abused the fact that Copilot ingests received emails into a retrieval augmented generation (RAG) database. The researchers sent an email that contained content designed to be retrieved by a user query as well as a prompt injection to manipulate the behavior of Copilot. The retrieval content targeted a user searching for banking information needed to complete a wire transfer, but contained the attacker's banking information instead."
      ],
      "defenses": [
        0,
        1,
        4,
        6
      ],
      "questions": [],
      "threatProfiles": [],
      "attackSurfaces": [],
      "incidentReadiness": [],
      "redTeamSecurity": [
        7,
        44
      ],
      "redTeamResults": [],
      "useCases": []
    },
    "oodaPhase": "observe",
    "createdAt": "2025-10-27T15:57:27.728Z",
    "updatedAt": "2025-10-27T15:57:27.728Z"
  },
  {
    "id": "COMPASS-UC-0004",
    "title": {
      "fr": "LLM auto-response leaks PII",
      "en": "LLM auto-response leaks PII"
    },
    "description": {
      "fr": "Unauthorized disclosure of sensitive personal data",
      "en": "Unauthorized disclosure of sensitive personal data"
    },
    "impact": 5,
    "likelihood": 4,
    "riskScore": 20,
    "riskLevel": "critical",
    "recommendation": {
      "fr": "Immediate mitigation and executive review required.",
      "en": "Immediate mitigation and executive review required."
    },
    "associatedThreat": {
      "fr": "Unauthorized disclosure of sensitive personal data",
      "en": "Unauthorized disclosure of sensitive personal data"
    },
    "attackMapping": {
      "mitre": "T1005",
      "atlas": "T1005 - Data from Local System / T1644 - Data Leakage (ATLAS)",
      "description": {
        "fr": "T1005 - Data from Local System / T1644 - Data Leakage (ATLAS)",
        "en": "T1005 - Data from Local System / T1644 - Data Leakage (ATLAS)"
      }
    },
    "relatedSheets": {
      "vulnerabilities": [],
      "incidents": [],
      "defenses": [],
      "questions": [
        0,
        1,
        4,
        5,
        6,
        7,
        8,
        9,
        12,
        13
      ],
      "threatProfiles": [],
      "attackSurfaces": [],
      "incidentReadiness": [],
      "redTeamSecurity": [],
      "redTeamResults": [],
      "useCases": []
    },
    "oodaPhase": "observe",
    "createdAt": "2025-10-27T15:57:27.728Z",
    "updatedAt": "2025-10-27T15:57:27.728Z"
  },
  {
    "id": "COMPASS-UC-0005",
    "title": {
      "fr": "Model used to generate ransomware code",
      "en": "Model used to generate ransomware code"
    },
    "description": {
      "fr": "Weaponization of GenAI for malware development",
      "en": "Weaponization of GenAI for malware development"
    },
    "impact": 5,
    "likelihood": 2,
    "riskScore": 10,
    "riskLevel": "moderate",
    "recommendation": {
      "fr": "Moderate risk: assign to engineering/security backlog.",
      "en": "Moderate risk: assign to engineering/security backlog."
    },
    "associatedThreat": {
      "fr": "Weaponization of GenAI for malware development",
      "en": "Weaponization of GenAI for malware development"
    },
    "attackMapping": {
      "mitre": "T1587.001",
      "atlas": "T1587.001 - Malware Development / T1657 - Model Misuse (ATLAS)",
      "description": {
        "fr": "T1587.001 - Malware Development / T1657 - Model Misuse (ATLAS)",
        "en": "T1587.001 - Malware Development / T1657 - Model Misuse (ATLAS)"
      }
    },
    "relatedSheets": {
      "vulnerabilities": [
        "CVE-2024-11301",
        "CVE-2024-10273",
        "CVE-2024-10109",
        "CVE-2025-2450",
        "CVE-2024-10940",
        "CVE-2025-2867"
      ],
      "incidents": [
        "McDonald sued for use of AI which collected voice print biometrics",
        "SoundCloud discreetly changed its terms of service, adding a clause that many interpreted as giving the company the right to use users' music and audio uploads to train AI models - including generative AI capable of replicating or synthesising artists' voices, music, or likeness. ",
        "In early 2024, T-Mobile revealed that hackers used an AI-equipped application programming interface (API) to gain unauthorized access to sensitive customer information, including full names, contact numbers, and PINs of its customers. ",
        "Air Canada Chatbot customer who was misled into paying for full-price flight tickets by a contact center chatbot.",
        "Serviceaide, a provider of agentic artificial intelligence-based IT management and workflow software,Agentic AI Tech Firm Says Health Data Leak Affects 483,000. certain information within its Catholic Health Elasticsearch database was inadvertently made publicly available."
      ],
      "defenses": [
        0,
        1,
        2,
        3
      ],
      "questions": [
        0,
        1,
        2,
        3,
        4,
        7,
        9,
        10,
        12,
        14
      ],
      "threatProfiles": [
        5,
        30
      ],
      "attackSurfaces": [],
      "incidentReadiness": [
        0,
        1,
        2,
        3,
        4,
        7
      ],
      "redTeamSecurity": [
        2,
        3,
        12,
        13,
        14,
        15
      ],
      "redTeamResults": [
        4,
        5,
        6,
        7,
        8
      ],
      "useCases": []
    },
    "oodaPhase": "observe",
    "createdAt": "2025-10-27T15:57:27.728Z",
    "updatedAt": "2025-10-27T15:57:27.728Z"
  },
  {
    "id": "COMPASS-UC-0006",
    "title": {
      "fr": "Unauthorized fine-tuning with sensitive data",
      "en": "Unauthorized fine-tuning with sensitive data"
    },
    "description": {
      "fr": "Data exfiltration through unapproved model updates",
      "en": "Data exfiltration through unapproved model updates"
    },
    "impact": 5,
    "likelihood": 4,
    "riskScore": 20,
    "riskLevel": "critical",
    "recommendation": {
      "fr": "Immediate mitigation and executive review required.",
      "en": "Immediate mitigation and executive review required."
    },
    "associatedThreat": {
      "fr": "Data exfiltration through unapproved model updates",
      "en": "Data exfiltration through unapproved model updates"
    },
    "attackMapping": {
      "mitre": "T1531",
      "atlas": "T1531 - Account Access Removal / T1642 - Data Poisoning (ATLAS)",
      "description": {
        "fr": "T1531 - Account Access Removal / T1642 - Data Poisoning (ATLAS)",
        "en": "T1531 - Account Access Removal / T1642 - Data Poisoning (ATLAS)"
      }
    },
    "relatedSheets": {
      "vulnerabilities": [],
      "incidents": [],
      "defenses": [
        0,
        1,
        2,
        3
      ],
      "questions": [
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9
      ],
      "threatProfiles": [],
      "attackSurfaces": [],
      "incidentReadiness": [
        0,
        1,
        2,
        3,
        4,
        7
      ],
      "redTeamSecurity": [
        2,
        3,
        12,
        13,
        14,
        15
      ],
      "redTeamResults": [
        4,
        5,
        6,
        7,
        8
      ],
      "useCases": []
    },
    "oodaPhase": "observe",
    "createdAt": "2025-10-27T15:57:27.728Z",
    "updatedAt": "2025-10-27T15:57:27.728Z"
  },
  {
    "id": "COMPASS-UC-0007",
    "title": {
      "fr": "AI hallucination misguides customer support",
      "en": "AI hallucination misguides customer support"
    },
    "description": {
      "fr": "User misdirection due to fabricated answers",
      "en": "User misdirection due to fabricated answers"
    },
    "impact": 3,
    "likelihood": 4,
    "riskScore": 12,
    "riskLevel": "moderate",
    "recommendation": {
      "fr": "Moderate risk: assign to engineering/security backlog.",
      "en": "Moderate risk: assign to engineering/security backlog."
    },
    "associatedThreat": {
      "fr": "User misdirection due to fabricated answers",
      "en": "User misdirection due to fabricated answers"
    },
    "attackMapping": {
      "mitre": "T1609",
      "atlas": "T1609 - Container Administration Command / T1643 - Hallucination (ATLAS)",
      "description": {
        "fr": "T1609 - Container Administration Command / T1643 - Hallucination (ATLAS)",
        "en": "T1609 - Container Administration Command / T1643 - Hallucination (ATLAS)"
      }
    },
    "relatedSheets": {
      "vulnerabilities": [
        "CVE-2024-11301",
        "CVE-2024-10273",
        "CVE-2024-10109",
        "CVE-2025-2450",
        "CVE-2024-10940",
        "CVE-2025-2867"
      ],
      "incidents": [
        "McDonald sued for use of AI which collected voice print biometrics",
        "SoundCloud discreetly changed its terms of service, adding a clause that many interpreted as giving the company the right to use users' music and audio uploads to train AI models - including generative AI capable of replicating or synthesising artists' voices, music, or likeness. ",
        "In early 2024, T-Mobile revealed that hackers used an AI-equipped application programming interface (API) to gain unauthorized access to sensitive customer information, including full names, contact numbers, and PINs of its customers. ",
        "Air Canada Chatbot customer who was misled into paying for full-price flight tickets by a contact center chatbot.",
        "Serviceaide, a provider of agentic artificial intelligence-based IT management and workflow software,Agentic AI Tech Firm Says Health Data Leak Affects 483,000. certain information within its Catholic Health Elasticsearch database was inadvertently made publicly available."
      ],
      "defenses": [
        0,
        1,
        2,
        3
      ],
      "questions": [],
      "threatProfiles": [
        5,
        30
      ],
      "attackSurfaces": [],
      "incidentReadiness": [],
      "redTeamSecurity": [],
      "redTeamResults": [],
      "useCases": []
    },
    "oodaPhase": "observe",
    "createdAt": "2025-10-27T15:57:27.728Z",
    "updatedAt": "2025-10-27T15:57:27.728Z"
  },
  {
    "id": "COMPASS-UC-0008",
    "title": {
      "fr": "Synthetic review fraud in ecommerce",
      "en": "Synthetic review fraud in ecommerce"
    },
    "description": {
      "fr": "Consumer deception and trust erosion",
      "en": "Consumer deception and trust erosion"
    },
    "impact": 3,
    "likelihood": 3,
    "riskScore": 9,
    "riskLevel": "low",
    "recommendation": {
      "fr": "Low risk: document and monitor.",
      "en": "Low risk: document and monitor."
    },
    "associatedThreat": {
      "fr": "Consumer deception and trust erosion",
      "en": "Consumer deception and trust erosion"
    },
    "attackMapping": {
      "mitre": "T1585.002",
      "atlas": "T1585.002 - Fraudulent Reviews / T1645 - Synthetic Identity Fraud (ATLAS)",
      "description": {
        "fr": "T1585.002 - Fraudulent Reviews / T1645 - Synthetic Identity Fraud (ATLAS)",
        "en": "T1585.002 - Fraudulent Reviews / T1645 - Synthetic Identity Fraud (ATLAS)"
      }
    },
    "relatedSheets": {
      "vulnerabilities": [
        "CVE-2024-10834"
      ],
      "incidents": [
        "France welfare fraud detection algorithm accused of exacerbating inequality",
        "Deep Fake Fraud",
        "Detecting and Countering Malicious Uses of Claude: March 2025"
      ],
      "defenses": [],
      "questions": [],
      "threatProfiles": [],
      "attackSurfaces": [],
      "incidentReadiness": [],
      "redTeamSecurity": [],
      "redTeamResults": [],
      "useCases": []
    },
    "oodaPhase": "observe",
    "createdAt": "2025-10-27T15:57:27.728Z",
    "updatedAt": "2025-10-27T15:57:27.728Z"
  },
  {
    "id": "COMPASS-UC-0009",
    "title": {
      "fr": "Supply chain AI model poisoning",
      "en": "Supply chain AI model poisoning"
    },
    "description": {
      "fr": "Model poisoning in training pipelines",
      "en": "Model poisoning in training pipelines"
    },
    "impact": 4,
    "likelihood": 3,
    "riskScore": 12,
    "riskLevel": "moderate",
    "recommendation": {
      "fr": "Moderate risk: assign to engineering/security backlog.",
      "en": "Moderate risk: assign to engineering/security backlog."
    },
    "associatedThreat": {
      "fr": "Model poisoning in training pipelines",
      "en": "Model poisoning in training pipelines"
    },
    "attackMapping": {
      "mitre": "T1565.001",
      "atlas": "T1565.001 - Stored Data Manipulation / T1638 - Model Poisoning (ATLAS)",
      "description": {
        "fr": "T1565.001 - Stored Data Manipulation / T1638 - Model Poisoning (ATLAS)",
        "en": "T1565.001 - Stored Data Manipulation / T1638 - Model Poisoning (ATLAS)"
      }
    },
    "relatedSheets": {
      "vulnerabilities": [
        "CVE-2024-11301",
        "CVE-2024-10273",
        "CVE-2024-10109",
        "CVE-2025-2450",
        "CVE-2024-10940",
        "CVE-2025-2867"
      ],
      "incidents": [
        "McDonald sued for use of AI which collected voice print biometrics",
        "SoundCloud discreetly changed its terms of service, adding a clause that many interpreted as giving the company the right to use users' music and audio uploads to train AI models - including generative AI capable of replicating or synthesising artists' voices, music, or likeness. ",
        "In early 2024, T-Mobile revealed that hackers used an AI-equipped application programming interface (API) to gain unauthorized access to sensitive customer information, including full names, contact numbers, and PINs of its customers. ",
        "Air Canada Chatbot customer who was misled into paying for full-price flight tickets by a contact center chatbot.",
        "Serviceaide, a provider of agentic artificial intelligence-based IT management and workflow software,Agentic AI Tech Firm Says Health Data Leak Affects 483,000. certain information within its Catholic Health Elasticsearch database was inadvertently made publicly available."
      ],
      "defenses": [
        0,
        1,
        2,
        3
      ],
      "questions": [
        0,
        1,
        2,
        3,
        4,
        7,
        9,
        10,
        12,
        14
      ],
      "threatProfiles": [
        5,
        30
      ],
      "attackSurfaces": [],
      "incidentReadiness": [
        0,
        1,
        2,
        3,
        4,
        7
      ],
      "redTeamSecurity": [
        2,
        3,
        12,
        13,
        14,
        15
      ],
      "redTeamResults": [
        4,
        5,
        6,
        7,
        8
      ],
      "useCases": []
    },
    "oodaPhase": "observe",
    "createdAt": "2025-10-27T15:57:27.728Z",
    "updatedAt": "2025-10-27T15:57:27.728Z"
  },
  {
    "id": "COMPASS-UC-0010",
    "title": {
      "fr": "Voice cloning used in phishing attack",
      "en": "Voice cloning used in phishing attack"
    },
    "description": {
      "fr": "Real-time audio social engineering",
      "en": "Real-time audio social engineering"
    },
    "impact": 5,
    "likelihood": 4,
    "riskScore": 20,
    "riskLevel": "critical",
    "recommendation": {
      "fr": "Immediate mitigation and executive review required.",
      "en": "Immediate mitigation and executive review required."
    },
    "associatedThreat": {
      "fr": "Real-time audio social engineering",
      "en": "Real-time audio social engineering"
    },
    "attackMapping": {
      "mitre": "T1059.003",
      "atlas": "T1059.003 - Command and Scripting Interpreter: PowerShell / T1655 - Voice Cloning (ATLAS)",
      "description": {
        "fr": "T1059.003 - Command and Scripting Interpreter: PowerShell / T1655 - Voice Cloning (ATLAS)",
        "en": "T1059.003 - Command and Scripting Interpreter: PowerShell / T1655 - Voice Cloning (ATLAS)"
      }
    },
    "relatedSheets": {
      "vulnerabilities": [],
      "incidents": [],
      "defenses": [],
      "questions": [],
      "threatProfiles": [],
      "attackSurfaces": [],
      "incidentReadiness": [],
      "redTeamSecurity": [],
      "redTeamResults": [
        19
      ],
      "useCases": []
    },
    "oodaPhase": "observe",
    "createdAt": "2025-10-27T15:57:27.728Z",
    "updatedAt": "2025-10-27T15:57:27.728Z"
  },
  {
    "id": "COMPASS-UC-0011",
    "title": {
      "fr": "AI model generates discriminatory outputs",
      "en": "AI model generates discriminatory outputs"
    },
    "description": {
      "fr": "Regulatory violations due to bias and harm",
      "en": "Regulatory violations due to bias and harm"
    },
    "impact": 4,
    "likelihood": 3,
    "riskScore": 12,
    "riskLevel": "moderate",
    "recommendation": {
      "fr": "Moderate risk: assign to engineering/security backlog.",
      "en": "Moderate risk: assign to engineering/security backlog."
    },
    "associatedThreat": {
      "fr": "Regulatory violations due to bias and harm",
      "en": "Regulatory violations due to bias and harm"
    },
    "attackMapping": {
      "mitre": "T1481.001",
      "atlas": "T1481.001 - Web Service: Offensive Content / T1649 - Toxic Outputs (ATLAS)",
      "description": {
        "fr": "T1481.001 - Web Service: Offensive Content / T1649 - Toxic Outputs (ATLAS)",
        "en": "T1481.001 - Web Service: Offensive Content / T1649 - Toxic Outputs (ATLAS)"
      }
    },
    "relatedSheets": {
      "vulnerabilities": [
        "CVE-2024-11301",
        "CVE-2024-10273",
        "CVE-2024-10109",
        "CVE-2025-2450",
        "CVE-2024-10940",
        "CVE-2025-2867"
      ],
      "incidents": [
        "France welfare fraud detection algorithm accused of exacerbating inequality",
        "McDonald sued for use of AI which collected voice print biometrics",
        "SoundCloud discreetly changed its terms of service, adding a clause that many interpreted as giving the company the right to use users' music and audio uploads to train AI models - including generative AI capable of replicating or synthesising artists' voices, music, or likeness. ",
        "In early 2024, T-Mobile revealed that hackers used an AI-equipped application programming interface (API) to gain unauthorized access to sensitive customer information, including full names, contact numbers, and PINs of its customers. ",
        "Air Canada Chatbot customer who was misled into paying for full-price flight tickets by a contact center chatbot."
      ],
      "defenses": [
        0,
        1,
        2,
        3
      ],
      "questions": [
        0,
        1,
        2,
        3,
        4,
        7,
        9,
        10,
        12,
        14
      ],
      "threatProfiles": [
        5,
        30
      ],
      "attackSurfaces": [],
      "incidentReadiness": [
        0,
        1,
        2,
        3,
        4,
        7
      ],
      "redTeamSecurity": [
        2,
        3,
        12,
        13,
        14,
        15
      ],
      "redTeamResults": [
        4,
        5,
        6,
        7,
        8
      ],
      "useCases": []
    },
    "oodaPhase": "observe",
    "createdAt": "2025-10-27T15:57:27.728Z",
    "updatedAt": "2025-10-27T15:57:27.728Z"
  },
  {
    "id": "COMPASS-UC-0012",
    "title": {
      "fr": "AI Red Team identifies unfiltered NSFW output",
      "en": "AI Red Team identifies unfiltered NSFW output"
    },
    "description": {
      "fr": "Inappropriate or noncompliant content generation",
      "en": "Inappropriate or noncompliant content generation"
    },
    "impact": 3,
    "likelihood": 5,
    "riskScore": 15,
    "riskLevel": "high",
    "recommendation": {
      "fr": "High priority: plan mitigations and monitor closely.",
      "en": "High priority: plan mitigations and monitor closely."
    },
    "associatedThreat": {
      "fr": "Inappropriate or noncompliant content generation",
      "en": "Inappropriate or noncompliant content generation"
    },
    "attackMapping": {
      "mitre": "T1491",
      "atlas": "T1491 - Defacement / T1646 - Unfiltered Output (ATLAS)",
      "description": {
        "fr": "T1491 - Defacement / T1646 - Unfiltered Output (ATLAS)",
        "en": "T1491 - Defacement / T1646 - Unfiltered Output (ATLAS)"
      }
    },
    "relatedSheets": {
      "vulnerabilities": [
        "CVE-2024-11301",
        "CVE-2024-10273",
        "CVE-2024-10109",
        "CVE-2025-2450",
        "CVE-2024-10940",
        "CVE-2025-2867"
      ],
      "incidents": [
        "McDonald sued for use of AI which collected voice print biometrics",
        "SoundCloud discreetly changed its terms of service, adding a clause that many interpreted as giving the company the right to use users' music and audio uploads to train AI models - including generative AI capable of replicating or synthesising artists' voices, music, or likeness. ",
        "In early 2024, T-Mobile revealed that hackers used an AI-equipped application programming interface (API) to gain unauthorized access to sensitive customer information, including full names, contact numbers, and PINs of its customers. ",
        "Air Canada Chatbot customer who was misled into paying for full-price flight tickets by a contact center chatbot.",
        "Serviceaide, a provider of agentic artificial intelligence-based IT management and workflow software,Agentic AI Tech Firm Says Health Data Leak Affects 483,000. certain information within its Catholic Health Elasticsearch database was inadvertently made publicly available."
      ],
      "defenses": [
        0,
        1,
        2,
        3
      ],
      "questions": [],
      "threatProfiles": [
        5,
        30
      ],
      "attackSurfaces": [],
      "incidentReadiness": [],
      "redTeamSecurity": [],
      "redTeamResults": [],
      "useCases": []
    },
    "oodaPhase": "observe",
    "createdAt": "2025-10-27T15:57:27.728Z",
    "updatedAt": "2025-10-27T15:57:27.728Z"
  },
  {
    "id": "COMPASS-UC-0013",
    "title": {
      "fr": "Fake legal advice generated by AI assistant",
      "en": "Fake legal advice generated by AI assistant"
    },
    "description": {
      "fr": "Misuse of AI for legal misinformation",
      "en": "Misuse of AI for legal misinformation"
    },
    "impact": 4,
    "likelihood": 4,
    "riskScore": 16,
    "riskLevel": "high",
    "recommendation": {
      "fr": "High priority: plan mitigations and monitor closely.",
      "en": "High priority: plan mitigations and monitor closely."
    },
    "associatedThreat": {
      "fr": "Misuse of AI for legal misinformation",
      "en": "Misuse of AI for legal misinformation"
    },
    "attackMapping": {
      "mitre": "T1565",
      "atlas": "T1565 - Data Manipulation / T1654 - Legal Misinformation (ATLAS)",
      "description": {
        "fr": "T1565 - Data Manipulation / T1654 - Legal Misinformation (ATLAS)",
        "en": "T1565 - Data Manipulation / T1654 - Legal Misinformation (ATLAS)"
      }
    },
    "relatedSheets": {
      "vulnerabilities": [
        "CVE-2024-11301",
        "CVE-2024-10273",
        "CVE-2024-10109",
        "CVE-2025-2450",
        "CVE-2024-10940",
        "CVE-2025-2867"
      ],
      "incidents": [
        "McDonald sued for use of AI which collected voice print biometrics",
        "SoundCloud discreetly changed its terms of service, adding a clause that many interpreted as giving the company the right to use users' music and audio uploads to train AI models - including generative AI capable of replicating or synthesising artists' voices, music, or likeness. ",
        "In early 2024, T-Mobile revealed that hackers used an AI-equipped application programming interface (API) to gain unauthorized access to sensitive customer information, including full names, contact numbers, and PINs of its customers. ",
        "Air Canada Chatbot customer who was misled into paying for full-price flight tickets by a contact center chatbot.",
        "Serviceaide, a provider of agentic artificial intelligence-based IT management and workflow software,Agentic AI Tech Firm Says Health Data Leak Affects 483,000. certain information within its Catholic Health Elasticsearch database was inadvertently made publicly available."
      ],
      "defenses": [
        0,
        1,
        2,
        3
      ],
      "questions": [],
      "threatProfiles": [
        5,
        30
      ],
      "attackSurfaces": [],
      "incidentReadiness": [],
      "redTeamSecurity": [],
      "redTeamResults": [],
      "useCases": []
    },
    "oodaPhase": "observe",
    "createdAt": "2025-10-27T15:57:27.728Z",
    "updatedAt": "2025-10-27T15:57:27.728Z"
  },
  {
    "id": "COMPASS-UC-0014",
    "title": {
      "fr": "Model exposes training data fragments",
      "en": "Model exposes training data fragments"
    },
    "description": {
      "fr": "Exposure of proprietary or confidential training data",
      "en": "Exposure of proprietary or confidential training data"
    },
    "impact": 5,
    "likelihood": 3,
    "riskScore": 15,
    "riskLevel": "high",
    "recommendation": {
      "fr": "High priority: plan mitigations and monitor closely.",
      "en": "High priority: plan mitigations and monitor closely."
    },
    "associatedThreat": {
      "fr": "Exposure of proprietary or confidential training data",
      "en": "Exposure of proprietary or confidential training data"
    },
    "attackMapping": {
      "mitre": "T1005",
      "atlas": "T1005 - Data from Local System / T1644 - Training Data Leakage (ATLAS)",
      "description": {
        "fr": "T1005 - Data from Local System / T1644 - Training Data Leakage (ATLAS)",
        "en": "T1005 - Data from Local System / T1644 - Training Data Leakage (ATLAS)"
      }
    },
    "relatedSheets": {
      "vulnerabilities": [
        "CVE-2024-11301",
        "CVE-2024-10273",
        "CVE-2024-10109",
        "CVE-2025-2450",
        "CVE-2024-10940",
        "CVE-2025-2867"
      ],
      "incidents": [
        "McDonald sued for use of AI which collected voice print biometrics",
        "SoundCloud discreetly changed its terms of service, adding a clause that many interpreted as giving the company the right to use users' music and audio uploads to train AI models - including generative AI capable of replicating or synthesising artists' voices, music, or likeness. ",
        "In early 2024, T-Mobile revealed that hackers used an AI-equipped application programming interface (API) to gain unauthorized access to sensitive customer information, including full names, contact numbers, and PINs of its customers. ",
        "Air Canada Chatbot customer who was misled into paying for full-price flight tickets by a contact center chatbot.",
        "Serviceaide, a provider of agentic artificial intelligence-based IT management and workflow software,Agentic AI Tech Firm Says Health Data Leak Affects 483,000. certain information within its Catholic Health Elasticsearch database was inadvertently made publicly available."
      ],
      "defenses": [
        0,
        1,
        2,
        3
      ],
      "questions": [
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9
      ],
      "threatProfiles": [
        5,
        30
      ],
      "attackSurfaces": [],
      "incidentReadiness": [
        0,
        1,
        2,
        3,
        4,
        7
      ],
      "redTeamSecurity": [
        2,
        3,
        12,
        13,
        14,
        15
      ],
      "redTeamResults": [
        4,
        5,
        6,
        7,
        8
      ],
      "useCases": []
    },
    "oodaPhase": "observe",
    "createdAt": "2025-10-27T15:57:27.728Z",
    "updatedAt": "2025-10-27T15:57:27.728Z"
  },
  {
    "id": "COMPASS-UC-0015",
    "title": {
      "fr": "Credential leakage in model weights",
      "en": "Credential leakage in model weights"
    },
    "description": {
      "fr": "Leaking of credentials embedded in model artifacts",
      "en": "Leaking of credentials embedded in model artifacts"
    },
    "impact": 5,
    "likelihood": 2,
    "riskScore": 10,
    "riskLevel": "moderate",
    "recommendation": {
      "fr": "Moderate risk: assign to engineering/security backlog.",
      "en": "Moderate risk: assign to engineering/security backlog."
    },
    "associatedThreat": {
      "fr": "Leaking of credentials embedded in model artifacts",
      "en": "Leaking of credentials embedded in model artifacts"
    },
    "attackMapping": {
      "mitre": "T1555.003",
      "atlas": "T1555.003 - Credentials from Password Stores / T1641 - Model Artifact Leakage (ATLAS)",
      "description": {
        "fr": "T1555.003 - Credentials from Password Stores / T1641 - Model Artifact Leakage (ATLAS)",
        "en": "T1555.003 - Credentials from Password Stores / T1641 - Model Artifact Leakage (ATLAS)"
      }
    },
    "relatedSheets": {
      "vulnerabilities": [],
      "incidents": [],
      "defenses": [
        0,
        1,
        2,
        3
      ],
      "questions": [
        0,
        1,
        2,
        3,
        4,
        5,
        7,
        9,
        10,
        12
      ],
      "threatProfiles": [],
      "attackSurfaces": [],
      "incidentReadiness": [
        0,
        1,
        2,
        3,
        4,
        7
      ],
      "redTeamSecurity": [
        2,
        3,
        12,
        13,
        14,
        15
      ],
      "redTeamResults": [
        4,
        5,
        6,
        7,
        8
      ],
      "useCases": []
    },
    "oodaPhase": "observe",
    "createdAt": "2025-10-27T15:57:27.728Z",
    "updatedAt": "2025-10-27T15:57:27.728Z"
  },
  {
    "id": "COMPASS-UC-0016",
    "title": {
      "fr": "Use of non-compliant open weights",
      "en": "Use of non-compliant open weights"
    },
    "description": {
      "fr": "Use of unvetted models with license risks",
      "en": "Use of unvetted models with license risks"
    },
    "impact": 4,
    "likelihood": 3,
    "riskScore": 12,
    "riskLevel": "moderate",
    "recommendation": {
      "fr": "Moderate risk: assign to engineering/security backlog.",
      "en": "Moderate risk: assign to engineering/security backlog."
    },
    "associatedThreat": {
      "fr": "Use of unvetted models with license risks",
      "en": "Use of unvetted models with license risks"
    },
    "attackMapping": {
      "mitre": "T1608.001",
      "atlas": "T1608.001 - Upload Malware / T1640 - Use of Untrusted Models (ATLAS)",
      "description": {
        "fr": "T1608.001 - Upload Malware / T1640 - Use of Untrusted Models (ATLAS)",
        "en": "T1608.001 - Upload Malware / T1640 - Use of Untrusted Models (ATLAS)"
      }
    },
    "relatedSheets": {
      "vulnerabilities": [],
      "incidents": [],
      "defenses": [
        0,
        1,
        2,
        3
      ],
      "questions": [
        0,
        1,
        2,
        3,
        4,
        7,
        9,
        10,
        12,
        14
      ],
      "threatProfiles": [],
      "attackSurfaces": [],
      "incidentReadiness": [
        0,
        1,
        2,
        3,
        4,
        7
      ],
      "redTeamSecurity": [
        2,
        3,
        12,
        13,
        14,
        15
      ],
      "redTeamResults": [
        4,
        5,
        6,
        7,
        8
      ],
      "useCases": []
    },
    "oodaPhase": "observe",
    "createdAt": "2025-10-27T15:57:27.728Z",
    "updatedAt": "2025-10-27T15:57:27.728Z"
  },
  {
    "id": "COMPASS-UC-0017",
    "title": {
      "fr": "GenAI use violates copyright at scale",
      "en": "GenAI use violates copyright at scale"
    },
    "description": {
      "fr": "Mass-scale IP violations and legal exposure",
      "en": "Mass-scale IP violations and legal exposure"
    },
    "impact": 4,
    "likelihood": 4,
    "riskScore": 16,
    "riskLevel": "high",
    "recommendation": {
      "fr": "High priority: plan mitigations and monitor closely.",
      "en": "High priority: plan mitigations and monitor closely."
    },
    "associatedThreat": {
      "fr": "Mass-scale IP violations and legal exposure",
      "en": "Mass-scale IP violations and legal exposure"
    },
    "attackMapping": {
      "mitre": "T1496",
      "atlas": "T1496 - Resource Hijacking / T1651 - Copyright Abuse (ATLAS)",
      "description": {
        "fr": "T1496 - Resource Hijacking / T1651 - Copyright Abuse (ATLAS)",
        "en": "T1496 - Resource Hijacking / T1651 - Copyright Abuse (ATLAS)"
      }
    },
    "relatedSheets": {
      "vulnerabilities": [
        "CVE-2024-11301",
        "CVE-2024-10273",
        "CVE-2024-10109",
        "CVE-2025-2450",
        "CVE-2024-10940",
        "CVE-2025-2867"
      ],
      "incidents": [
        "McDonald sued for use of AI which collected voice print biometrics",
        "SoundCloud discreetly changed its terms of service, adding a clause that many interpreted as giving the company the right to use users' music and audio uploads to train AI models - including generative AI capable of replicating or synthesising artists' voices, music, or likeness. ",
        "In early 2024, T-Mobile revealed that hackers used an AI-equipped application programming interface (API) to gain unauthorized access to sensitive customer information, including full names, contact numbers, and PINs of its customers. ",
        "Air Canada Chatbot customer who was misled into paying for full-price flight tickets by a contact center chatbot.",
        "Serviceaide, a provider of agentic artificial intelligence-based IT management and workflow software,Agentic AI Tech Firm Says Health Data Leak Affects 483,000. certain information within its Catholic Health Elasticsearch database was inadvertently made publicly available."
      ],
      "defenses": [
        0,
        1,
        2,
        3
      ],
      "questions": [],
      "threatProfiles": [
        5,
        30
      ],
      "attackSurfaces": [],
      "incidentReadiness": [],
      "redTeamSecurity": [],
      "redTeamResults": [],
      "useCases": []
    },
    "oodaPhase": "observe",
    "createdAt": "2025-10-27T15:57:27.728Z",
    "updatedAt": "2025-10-27T15:57:27.728Z"
  },
  {
    "id": "COMPASS-UC-0018",
    "title": {
      "fr": "Compromised AI DevOps pipeline",
      "en": "Compromised AI DevOps pipeline"
    },
    "description": {
      "fr": "Tampering with CI/CD for AI components",
      "en": "Tampering with CI/CD for AI components"
    },
    "impact": 5,
    "likelihood": 3,
    "riskScore": 15,
    "riskLevel": "high",
    "recommendation": {
      "fr": "High priority: plan mitigations and monitor closely.",
      "en": "High priority: plan mitigations and monitor closely."
    },
    "associatedThreat": {
      "fr": "Tampering with CI/CD for AI components",
      "en": "Tampering with CI/CD for AI components"
    },
    "attackMapping": {
      "mitre": "T1608.002",
      "atlas": "T1608.002 - Code Signing / T1637 - AI Supply Chain Compromise (ATLAS)",
      "description": {
        "fr": "T1608.002 - Code Signing / T1637 - AI Supply Chain Compromise (ATLAS)",
        "en": "T1608.002 - Code Signing / T1637 - AI Supply Chain Compromise (ATLAS)"
      }
    },
    "relatedSheets": {
      "vulnerabilities": [
        "CVE-2024-11301",
        "CVE-2024-10273",
        "CVE-2024-10109",
        "CVE-2025-2450",
        "CVE-2024-10940",
        "CVE-2025-2867"
      ],
      "incidents": [
        "McDonald sued for use of AI which collected voice print biometrics",
        "SoundCloud discreetly changed its terms of service, adding a clause that many interpreted as giving the company the right to use users' music and audio uploads to train AI models - including generative AI capable of replicating or synthesising artists' voices, music, or likeness. ",
        "In early 2024, T-Mobile revealed that hackers used an AI-equipped application programming interface (API) to gain unauthorized access to sensitive customer information, including full names, contact numbers, and PINs of its customers. ",
        "Air Canada Chatbot customer who was misled into paying for full-price flight tickets by a contact center chatbot.",
        "Serviceaide, a provider of agentic artificial intelligence-based IT management and workflow software,Agentic AI Tech Firm Says Health Data Leak Affects 483,000. certain information within its Catholic Health Elasticsearch database was inadvertently made publicly available."
      ],
      "defenses": [
        0,
        1,
        2,
        3
      ],
      "questions": [],
      "threatProfiles": [
        5,
        30
      ],
      "attackSurfaces": [],
      "incidentReadiness": [],
      "redTeamSecurity": [],
      "redTeamResults": [],
      "useCases": []
    },
    "oodaPhase": "observe",
    "createdAt": "2025-10-27T15:57:27.728Z",
    "updatedAt": "2025-10-27T15:57:27.728Z"
  },
  {
    "id": "COMPASS-UC-0019",
    "title": {
      "fr": "Malicious plugin extends LLM functions",
      "en": "Malicious plugin extends LLM functions"
    },
    "description": {
      "fr": "Backdoor capability injection via plugins",
      "en": "Backdoor capability injection via plugins"
    },
    "impact": 5,
    "likelihood": 4,
    "riskScore": 20,
    "riskLevel": "critical",
    "recommendation": {
      "fr": "Immediate mitigation and executive review required.",
      "en": "Immediate mitigation and executive review required."
    },
    "associatedThreat": {
      "fr": "Backdoor capability injection via plugins",
      "en": "Backdoor capability injection via plugins"
    },
    "attackMapping": {
      "mitre": "T1055",
      "atlas": "T1055 - Process Injection / T1653 - Plugin Abuse (ATLAS)",
      "description": {
        "fr": "T1055 - Process Injection / T1653 - Plugin Abuse (ATLAS)",
        "en": "T1055 - Process Injection / T1653 - Plugin Abuse (ATLAS)"
      }
    },
    "relatedSheets": {
      "vulnerabilities": [],
      "incidents": [],
      "defenses": [],
      "questions": [],
      "threatProfiles": [],
      "attackSurfaces": [],
      "incidentReadiness": [],
      "redTeamSecurity": [],
      "redTeamResults": [],
      "useCases": []
    },
    "oodaPhase": "observe",
    "createdAt": "2025-10-27T15:57:27.728Z",
    "updatedAt": "2025-10-27T15:57:27.728Z"
  },
  {
    "id": "COMPASS-UC-0020",
    "title": {
      "fr": "Business logic bypass using LLM",
      "en": "Business logic bypass using LLM"
    },
    "description": {
      "fr": "Bypassing rule-based business logic via LLM reasoning",
      "en": "Bypassing rule-based business logic via LLM reasoning"
    },
    "impact": 4,
    "likelihood": 4,
    "riskScore": 16,
    "riskLevel": "high",
    "recommendation": {
      "fr": "High priority: plan mitigations and monitor closely.",
      "en": "High priority: plan mitigations and monitor closely."
    },
    "associatedThreat": {
      "fr": "Bypassing rule-based business logic via LLM reasoning",
      "en": "Bypassing rule-based business logic via LLM reasoning"
    },
    "attackMapping": {
      "mitre": "T1565.002",
      "atlas": "T1565.002 - Stored Business Logic Bypass / T1656 - Reasoning Exploits (ATLAS)",
      "description": {
        "fr": "T1565.002 - Stored Business Logic Bypass / T1656 - Reasoning Exploits (ATLAS)",
        "en": "T1565.002 - Stored Business Logic Bypass / T1656 - Reasoning Exploits (ATLAS)"
      }
    },
    "relatedSheets": {
      "vulnerabilities": [],
      "incidents": [],
      "defenses": [],
      "questions": [],
      "threatProfiles": [],
      "attackSurfaces": [],
      "incidentReadiness": [],
      "redTeamSecurity": [],
      "redTeamResults": [],
      "useCases": []
    },
    "oodaPhase": "observe",
    "createdAt": "2025-10-27T15:57:27.728Z",
    "updatedAt": "2025-10-27T15:57:27.728Z"
  },
  {
    "id": "COMPASS-UC-0021",
    "title": {
      "fr": "LLM-generated spear phishing emails",
      "en": "LLM-generated spear phishing emails"
    },
    "description": {
      "fr": "Highly targeted phishing campaigns facilitated by AI.",
      "en": "Highly targeted phishing campaigns facilitated by AI."
    },
    "impact": 5,
    "likelihood": 4,
    "riskScore": 20,
    "riskLevel": "critical",
    "recommendation": {
      "fr": "Immediate mitigation and executive review required.",
      "en": "Immediate mitigation and executive review required."
    },
    "associatedThreat": {
      "fr": "Highly targeted phishing campaigns facilitated by AI.",
      "en": "Highly targeted phishing campaigns facilitated by AI."
    },
    "attackMapping": {
      "mitre": "T1566",
      "description": {
        "fr": "T1566 - Phishing: Spear Phishing",
        "en": "T1566 - Phishing: Spear Phishing"
      }
    },
    "relatedSheets": {
      "vulnerabilities": [
        "CVE-2024-11301",
        "CVE-2024-10273",
        "CVE-2024-10109",
        "CVE-2025-2450",
        "CVE-2024-10940",
        "CVE-2025-2867"
      ],
      "incidents": [
        "McDonald sued for use of AI which collected voice print biometrics",
        "SoundCloud discreetly changed its terms of service, adding a clause that many interpreted as giving the company the right to use users' music and audio uploads to train AI models - including generative AI capable of replicating or synthesising artists' voices, music, or likeness. ",
        "In early 2024, T-Mobile revealed that hackers used an AI-equipped application programming interface (API) to gain unauthorized access to sensitive customer information, including full names, contact numbers, and PINs of its customers. ",
        "Air Canada Chatbot customer who was misled into paying for full-price flight tickets by a contact center chatbot.",
        "Serviceaide, a provider of agentic artificial intelligence-based IT management and workflow software,Agentic AI Tech Firm Says Health Data Leak Affects 483,000. certain information within its Catholic Health Elasticsearch database was inadvertently made publicly available."
      ],
      "defenses": [
        0,
        1,
        2,
        3
      ],
      "questions": [],
      "threatProfiles": [
        5,
        30
      ],
      "attackSurfaces": [],
      "incidentReadiness": [],
      "redTeamSecurity": [],
      "redTeamResults": [],
      "useCases": []
    },
    "oodaPhase": "observe",
    "createdAt": "2025-10-27T15:57:27.728Z",
    "updatedAt": "2025-10-27T15:57:27.728Z"
  },
  {
    "id": "COMPASS-UC-0022",
    "title": {
      "fr": "AI-driven election disinformation campaign",
      "en": "AI-driven election disinformation campaign"
    },
    "description": {
      "fr": "Rapid, large-scale misinformation to influence public opinion.",
      "en": "Rapid, large-scale misinformation to influence public opinion."
    },
    "impact": 5,
    "likelihood": 3,
    "riskScore": 15,
    "riskLevel": "high",
    "recommendation": {
      "fr": "High priority: plan mitigations and monitor closely.",
      "en": "High priority: plan mitigations and monitor closely."
    },
    "associatedThreat": {
      "fr": "Rapid, large-scale misinformation to influence public opinion.",
      "en": "Rapid, large-scale misinformation to influence public opinion."
    },
    "attackMapping": {
      "mitre": "T1648",
      "description": {
        "fr": "T1648 - Disinformation Generation",
        "en": "T1648 - Disinformation Generation"
      }
    },
    "relatedSheets": {
      "vulnerabilities": [
        "CVE-2024-11301",
        "CVE-2024-10273",
        "CVE-2024-10109",
        "CVE-2025-2450",
        "CVE-2024-10940",
        "CVE-2025-2867"
      ],
      "incidents": [
        "McDonald sued for use of AI which collected voice print biometrics",
        "SoundCloud discreetly changed its terms of service, adding a clause that many interpreted as giving the company the right to use users' music and audio uploads to train AI models - including generative AI capable of replicating or synthesising artists' voices, music, or likeness. ",
        "In early 2024, T-Mobile revealed that hackers used an AI-equipped application programming interface (API) to gain unauthorized access to sensitive customer information, including full names, contact numbers, and PINs of its customers. ",
        "Air Canada Chatbot customer who was misled into paying for full-price flight tickets by a contact center chatbot.",
        "Serviceaide, a provider of agentic artificial intelligence-based IT management and workflow software,Agentic AI Tech Firm Says Health Data Leak Affects 483,000. certain information within its Catholic Health Elasticsearch database was inadvertently made publicly available."
      ],
      "defenses": [
        0,
        1,
        2,
        3
      ],
      "questions": [],
      "threatProfiles": [
        5,
        30
      ],
      "attackSurfaces": [],
      "incidentReadiness": [],
      "redTeamSecurity": [],
      "redTeamResults": [],
      "useCases": []
    },
    "oodaPhase": "observe",
    "createdAt": "2025-10-27T15:57:27.728Z",
    "updatedAt": "2025-10-27T15:57:27.728Z"
  },
  {
    "id": "COMPASS-UC-0023",
    "title": {
      "fr": "Side-channel model extraction via API timing",
      "en": "Side-channel model extraction via API timing"
    },
    "description": {
      "fr": "Attacker infers model parameters by measuring response times.",
      "en": "Attacker infers model parameters by measuring response times."
    },
    "impact": 4,
    "likelihood": 2,
    "riskScore": 8,
    "riskLevel": "low",
    "recommendation": {
      "fr": "Moderate risk: assign to engineering/security backlog.",
      "en": "Moderate risk: assign to engineering/security backlog."
    },
    "associatedThreat": {
      "fr": "Attacker infers model parameters by measuring response times.",
      "en": "Attacker infers model parameters by measuring response times."
    },
    "attackMapping": {
      "mitre": "T1658",
      "description": {
        "fr": "T1658 - Side-Channel Model Extraction",
        "en": "T1658 - Side-Channel Model Extraction"
      }
    },
    "relatedSheets": {
      "vulnerabilities": [],
      "incidents": [],
      "defenses": [
        0,
        1,
        2,
        3
      ],
      "questions": [
        0,
        1,
        2,
        3,
        4,
        7,
        9,
        10,
        12,
        14
      ],
      "threatProfiles": [],
      "attackSurfaces": [],
      "incidentReadiness": [
        0,
        1,
        2,
        3,
        4,
        7
      ],
      "redTeamSecurity": [
        2,
        3,
        12,
        13,
        14,
        15
      ],
      "redTeamResults": [
        4,
        5,
        6,
        7,
        8
      ],
      "useCases": []
    },
    "oodaPhase": "observe",
    "createdAt": "2025-10-27T15:57:27.728Z",
    "updatedAt": "2025-10-27T15:57:27.728Z"
  },
  {
    "id": "COMPASS-UC-0024",
    "title": {
      "fr": "Unauthorized AI-powered vulnerability scanning",
      "en": "Unauthorized AI-powered vulnerability scanning"
    },
    "description": {
      "fr": "Automated scanning of internal systems using AI to discover weaknesses.",
      "en": "Automated scanning of internal systems using AI to discover weaknesses."
    },
    "impact": 4,
    "likelihood": 3,
    "riskScore": 12,
    "riskLevel": "moderate",
    "recommendation": {
      "fr": "Moderate risk: assign to engineering/security backlog.",
      "en": "Moderate risk: assign to engineering/security backlog."
    },
    "associatedThreat": {
      "fr": "Automated scanning of internal systems using AI to discover weaknesses.",
      "en": "Automated scanning of internal systems using AI to discover weaknesses."
    },
    "attackMapping": {
      "mitre": "T1595",
      "description": {
        "fr": "T1595 - Active Scanning / T1652 - Automated Reconnaissance",
        "en": "T1595 - Active Scanning / T1652 - Automated Reconnaissance"
      }
    },
    "relatedSheets": {
      "vulnerabilities": [
        "CVE-2024-11301",
        "CVE-2024-10273",
        "CVE-2024-10109",
        "CVE-2025-2450",
        "CVE-2024-10940",
        "CVE-2025-2867"
      ],
      "incidents": [
        "McDonald sued for use of AI which collected voice print biometrics",
        "SoundCloud discreetly changed its terms of service, adding a clause that many interpreted as giving the company the right to use users' music and audio uploads to train AI models - including generative AI capable of replicating or synthesising artists' voices, music, or likeness. ",
        "In early 2024, T-Mobile revealed that hackers used an AI-equipped application programming interface (API) to gain unauthorized access to sensitive customer information, including full names, contact numbers, and PINs of its customers. ",
        "Air Canada Chatbot customer who was misled into paying for full-price flight tickets by a contact center chatbot.",
        "Serviceaide, a provider of agentic artificial intelligence-based IT management and workflow software,Agentic AI Tech Firm Says Health Data Leak Affects 483,000. certain information within its Catholic Health Elasticsearch database was inadvertently made publicly available."
      ],
      "defenses": [
        0,
        1,
        2,
        3
      ],
      "questions": [],
      "threatProfiles": [
        5,
        30
      ],
      "attackSurfaces": [],
      "incidentReadiness": [],
      "redTeamSecurity": [],
      "redTeamResults": [],
      "useCases": []
    },
    "oodaPhase": "observe",
    "createdAt": "2025-10-27T15:57:27.728Z",
    "updatedAt": "2025-10-27T15:57:27.728Z"
  },
  {
    "id": "COMPASS-UC-0025",
    "title": {
      "fr": "Adversarial example attack at inference",
      "en": "Adversarial example attack at inference"
    },
    "description": {
      "fr": "Subtle perturbations in input to force misclassification",
      "en": "Subtle perturbations in input to force misclassification"
    },
    "impact": 4,
    "likelihood": 4,
    "riskScore": 16,
    "riskLevel": "high",
    "recommendation": {
      "fr": "High priority: plan mitigations and monitor closely.",
      "en": "High priority: plan mitigations and monitor closely."
    },
    "associatedThreat": {
      "fr": "Subtle perturbations in input to force misclassification",
      "en": "Subtle perturbations in input to force misclassification"
    },
    "attackMapping": {
      "mitre": "T1620",
      "atlas": "T1620 - Adversarial Example Generation / T1647 - Prompt Injection (ATLAS)",
      "description": {
        "fr": "T1620 - Adversarial Example Generation / T1647 - Prompt Injection (ATLAS)",
        "en": "T1620 - Adversarial Example Generation / T1647 - Prompt Injection (ATLAS)"
      }
    },
    "relatedSheets": {
      "vulnerabilities": [],
      "incidents": [],
      "defenses": [],
      "questions": [],
      "threatProfiles": [],
      "attackSurfaces": [],
      "incidentReadiness": [],
      "redTeamSecurity": [
        41,
        47,
        48,
        51,
        52,
        54
      ],
      "redTeamResults": [
        19
      ],
      "useCases": []
    },
    "oodaPhase": "observe",
    "createdAt": "2025-10-27T15:57:27.728Z",
    "updatedAt": "2025-10-27T15:57:27.728Z"
  },
  {
    "id": "COMPASS-UC-0026",
    "title": {
      "fr": "Insider uses AI to craft targeted internal spear phishing",
      "en": "Insider uses AI to craft targeted internal spear phishing"
    },
    "description": {
      "fr": "AI-driven social engineering exploiting internal context",
      "en": "AI-driven social engineering exploiting internal context"
    },
    "impact": 5,
    "likelihood": 3,
    "riskScore": 15,
    "riskLevel": "high",
    "recommendation": {
      "fr": "High priority: plan mitigations and monitor closely.",
      "en": "High priority: plan mitigations and monitor closely."
    },
    "associatedThreat": {
      "fr": "AI-driven social engineering exploiting internal context",
      "en": "AI-driven social engineering exploiting internal context"
    },
    "attackMapping": {
      "mitre": "T1566",
      "description": {
        "fr": "T1566 - Spear Phishing: Internal",
        "en": "T1566 - Spear Phishing: Internal"
      }
    },
    "relatedSheets": {
      "vulnerabilities": [
        "CVE-2024-11301",
        "CVE-2024-10273",
        "CVE-2024-10109",
        "CVE-2025-2450",
        "CVE-2024-10940",
        "CVE-2025-2867"
      ],
      "incidents": [
        "McDonald sued for use of AI which collected voice print biometrics",
        "SoundCloud discreetly changed its terms of service, adding a clause that many interpreted as giving the company the right to use users' music and audio uploads to train AI models - including generative AI capable of replicating or synthesising artists' voices, music, or likeness. ",
        "In early 2024, T-Mobile revealed that hackers used an AI-equipped application programming interface (API) to gain unauthorized access to sensitive customer information, including full names, contact numbers, and PINs of its customers. ",
        "Air Canada Chatbot customer who was misled into paying for full-price flight tickets by a contact center chatbot.",
        "Serviceaide, a provider of agentic artificial intelligence-based IT management and workflow software,Agentic AI Tech Firm Says Health Data Leak Affects 483,000. certain information within its Catholic Health Elasticsearch database was inadvertently made publicly available."
      ],
      "defenses": [
        0,
        1,
        2,
        3
      ],
      "questions": [],
      "threatProfiles": [
        5,
        30
      ],
      "attackSurfaces": [],
      "incidentReadiness": [],
      "redTeamSecurity": [],
      "redTeamResults": [],
      "useCases": []
    },
    "oodaPhase": "observe",
    "createdAt": "2025-10-27T15:57:27.728Z",
    "updatedAt": "2025-10-27T15:57:27.728Z"
  },
  {
    "id": "COMPASS-UC-0027",
    "title": {
      "fr": "Data drift in a safety-critical AI system",
      "en": "Data drift in a safety-critical AI system"
    },
    "description": {
      "fr": "Model performance degradation over time leading to unsafe decisions",
      "en": "Model performance degradation over time leading to unsafe decisions"
    },
    "impact": 4,
    "likelihood": 4,
    "riskScore": 16,
    "riskLevel": "high",
    "recommendation": {
      "fr": "High priority: plan mitigations and monitor closely.",
      "en": "High priority: plan mitigations and monitor closely."
    },
    "associatedThreat": {
      "fr": "Model performance degradation over time leading to unsafe decisions",
      "en": "Model performance degradation over time leading to unsafe decisions"
    },
    "attackMapping": {
      "mitre": "T1622",
      "atlas": "T1622 - Data Drift Detection / T1643 - Hallucination (ATLAS)",
      "description": {
        "fr": "T1622 - Data Drift Detection / T1643 - Hallucination (ATLAS)",
        "en": "T1622 - Data Drift Detection / T1643 - Hallucination (ATLAS)"
      }
    },
    "relatedSheets": {
      "vulnerabilities": [
        "CVE-2024-11301",
        "CVE-2024-10273",
        "CVE-2024-10109",
        "CVE-2025-2450",
        "CVE-2024-10940",
        "CVE-2025-2867"
      ],
      "incidents": [
        "McDonald sued for use of AI which collected voice print biometrics",
        "SoundCloud discreetly changed its terms of service, adding a clause that many interpreted as giving the company the right to use users' music and audio uploads to train AI models - including generative AI capable of replicating or synthesising artists' voices, music, or likeness. ",
        "In early 2024, T-Mobile revealed that hackers used an AI-equipped application programming interface (API) to gain unauthorized access to sensitive customer information, including full names, contact numbers, and PINs of its customers. ",
        "Air Canada Chatbot customer who was misled into paying for full-price flight tickets by a contact center chatbot.",
        "Serviceaide, a provider of agentic artificial intelligence-based IT management and workflow software,Agentic AI Tech Firm Says Health Data Leak Affects 483,000. certain information within its Catholic Health Elasticsearch database was inadvertently made publicly available."
      ],
      "defenses": [
        0,
        1,
        2,
        3
      ],
      "questions": [
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9
      ],
      "threatProfiles": [
        5,
        30
      ],
      "attackSurfaces": [],
      "incidentReadiness": [
        0,
        1,
        2,
        3,
        4,
        7
      ],
      "redTeamSecurity": [
        2,
        3,
        12,
        13,
        14,
        15
      ],
      "redTeamResults": [
        4,
        5,
        6,
        7,
        8
      ],
      "useCases": []
    },
    "oodaPhase": "observe",
    "createdAt": "2025-10-27T15:57:27.728Z",
    "updatedAt": "2025-10-27T15:57:27.728Z"
  },
  {
    "id": "COMPASS-UC-0028",
    "title": {
      "fr": "AI-enabled automated credential stuffing",
      "en": "AI-enabled automated credential stuffing"
    },
    "description": {
      "fr": "Automated attacks leveraging AI to guess or validate large credential lists",
      "en": "Automated attacks leveraging AI to guess or validate large credential lists"
    },
    "impact": 4,
    "likelihood": 3,
    "riskScore": 12,
    "riskLevel": "moderate",
    "recommendation": {
      "fr": "Moderate risk: assign to engineering/security backlog.",
      "en": "Moderate risk: assign to engineering/security backlog."
    },
    "associatedThreat": {
      "fr": "Automated attacks leveraging AI to guess or validate large credential lists",
      "en": "Automated attacks leveraging AI to guess or validate large credential lists"
    },
    "attackMapping": {
      "mitre": "T1110.003",
      "atlas": "T1110.003 - Brute Force: Credential Stuffing / T1652 - Automated Reconnaissance (ATLAS)",
      "description": {
        "fr": "T1110.003 - Brute Force: Credential Stuffing / T1652 - Automated Reconnaissance (ATLAS)",
        "en": "T1110.003 - Brute Force: Credential Stuffing / T1652 - Automated Reconnaissance (ATLAS)"
      }
    },
    "relatedSheets": {
      "vulnerabilities": [
        "CVE-2024-11301",
        "CVE-2024-10273",
        "CVE-2024-10109",
        "CVE-2025-2450",
        "CVE-2024-10940",
        "CVE-2025-2867"
      ],
      "incidents": [
        "McDonald sued for use of AI which collected voice print biometrics",
        "SoundCloud discreetly changed its terms of service, adding a clause that many interpreted as giving the company the right to use users' music and audio uploads to train AI models - including generative AI capable of replicating or synthesising artists' voices, music, or likeness. ",
        "In early 2024, T-Mobile revealed that hackers used an AI-equipped application programming interface (API) to gain unauthorized access to sensitive customer information, including full names, contact numbers, and PINs of its customers. ",
        "Air Canada Chatbot customer who was misled into paying for full-price flight tickets by a contact center chatbot.",
        "Serviceaide, a provider of agentic artificial intelligence-based IT management and workflow software,Agentic AI Tech Firm Says Health Data Leak Affects 483,000. certain information within its Catholic Health Elasticsearch database was inadvertently made publicly available."
      ],
      "defenses": [
        0,
        1,
        2,
        3
      ],
      "questions": [
        4,
        5
      ],
      "threatProfiles": [
        5,
        30
      ],
      "attackSurfaces": [],
      "incidentReadiness": [],
      "redTeamSecurity": [],
      "redTeamResults": [
        19
      ],
      "useCases": []
    },
    "oodaPhase": "observe",
    "createdAt": "2025-10-27T15:57:27.728Z",
    "updatedAt": "2025-10-27T15:57:27.728Z"
  },
  {
    "id": "COMPASS-UC-0029",
    "title": {
      "fr": "Hyperparameter inference via black-box queries",
      "en": "Hyperparameter inference via black-box queries"
    },
    "description": {
      "fr": "Inferring model hyperparameters to replicate or fine-tune an approximation",
      "en": "Inferring model hyperparameters to replicate or fine-tune an approximation"
    },
    "impact": 3,
    "likelihood": 2,
    "riskScore": 6,
    "riskLevel": "low",
    "recommendation": {
      "fr": "Low risk: document and monitor.",
      "en": "Low risk: document and monitor."
    },
    "associatedThreat": {
      "fr": "Inferring model hyperparameters to replicate or fine-tune an approximation",
      "en": "Inferring model hyperparameters to replicate or fine-tune an approximation"
    },
    "attackMapping": {
      "mitre": "T1658",
      "atlas": "T1658 - Side-Channel Model Extraction / T1638 - Model Poisoning (ATLAS)",
      "description": {
        "fr": "T1658 - Side-Channel Model Extraction / T1638 - Model Poisoning (ATLAS)",
        "en": "T1658 - Side-Channel Model Extraction / T1638 - Model Poisoning (ATLAS)"
      }
    },
    "relatedSheets": {
      "vulnerabilities": [],
      "incidents": [],
      "defenses": [
        0,
        1,
        2,
        3
      ],
      "questions": [
        0,
        1,
        2,
        3,
        4,
        7,
        9,
        10,
        12,
        14
      ],
      "threatProfiles": [],
      "attackSurfaces": [],
      "incidentReadiness": [
        0,
        1,
        2,
        3,
        4,
        7
      ],
      "redTeamSecurity": [
        2,
        3,
        12,
        13,
        14,
        15
      ],
      "redTeamResults": [
        4,
        5,
        6,
        7,
        8
      ],
      "useCases": []
    },
    "oodaPhase": "observe",
    "createdAt": "2025-10-27T15:57:27.728Z",
    "updatedAt": "2025-10-27T15:57:27.728Z"
  },
  {
    "id": "COMPASS-UC-0030",
    "title": {
      "fr": "Unauthorized access to model training logs or metadata",
      "en": "Unauthorized access to model training logs or metadata"
    },
    "description": {
      "fr": "Leakage of sensitive training details (e.g., data sources, labeling schema)",
      "en": "Leakage of sensitive training details (e.g., data sources, labeling schema)"
    },
    "impact": 4,
    "likelihood": 3,
    "riskScore": 12,
    "riskLevel": "moderate",
    "recommendation": {
      "fr": "Moderate risk: assign to engineering/security backlog.",
      "en": "Moderate risk: assign to engineering/security backlog."
    },
    "associatedThreat": {
      "fr": "Leakage of sensitive training details (e.g., data sources, labeling schema)",
      "en": "Leakage of sensitive training details (e.g., data sources, labeling schema)"
    },
    "attackMapping": {
      "mitre": "T1082",
      "atlas": "T1082 - System Information Discovery / T1644 - Training Data Leakage (ATLAS)",
      "description": {
        "fr": "T1082 - System Information Discovery / T1644 - Training Data Leakage (ATLAS)",
        "en": "T1082 - System Information Discovery / T1644 - Training Data Leakage (ATLAS)"
      }
    },
    "relatedSheets": {
      "vulnerabilities": [
        "CVE-2024-11301",
        "CVE-2024-10273",
        "CVE-2024-10109",
        "CVE-2025-2450",
        "CVE-2024-10940",
        "CVE-2025-2867"
      ],
      "incidents": [
        "McDonald sued for use of AI which collected voice print biometrics",
        "SoundCloud discreetly changed its terms of service, adding a clause that many interpreted as giving the company the right to use users' music and audio uploads to train AI models - including generative AI capable of replicating or synthesising artists' voices, music, or likeness. ",
        "In early 2024, T-Mobile revealed that hackers used an AI-equipped application programming interface (API) to gain unauthorized access to sensitive customer information, including full names, contact numbers, and PINs of its customers. ",
        "Air Canada Chatbot customer who was misled into paying for full-price flight tickets by a contact center chatbot.",
        "Serviceaide, a provider of agentic artificial intelligence-based IT management and workflow software,Agentic AI Tech Firm Says Health Data Leak Affects 483,000. certain information within its Catholic Health Elasticsearch database was inadvertently made publicly available."
      ],
      "defenses": [
        0,
        1,
        2,
        3
      ],
      "questions": [
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9
      ],
      "threatProfiles": [
        5,
        30
      ],
      "attackSurfaces": [],
      "incidentReadiness": [
        0,
        1,
        2,
        3,
        4,
        7
      ],
      "redTeamSecurity": [
        2,
        3,
        12,
        13,
        14,
        15
      ],
      "redTeamResults": [
        4,
        5,
        6,
        7,
        8
      ],
      "useCases": []
    },
    "oodaPhase": "observe",
    "createdAt": "2025-10-27T15:57:27.728Z",
    "updatedAt": "2025-10-27T15:57:27.728Z"
  },
  {
    "id": "COMPASS-UC-0031",
    "title": {
      "fr": "Threat of AI Dependency",
      "en": "Threat of AI Dependency"
    },
    "description": {
      "fr": "",
      "en": ""
    },
    "impact": 1,
    "likelihood": 1,
    "riskScore": 1,
    "riskLevel": "low",
    "recommendation": {
      "fr": "",
      "en": ""
    },
    "associatedThreat": {
      "fr": "",
      "en": ""
    },
    "attackMapping": {
      "description": {
        "fr": "",
        "en": ""
      }
    },
    "relatedSheets": {
      "vulnerabilities": [
        "CVE-2024-11301",
        "CVE-2024-10273",
        "CVE-2024-10109",
        "CVE-2025-2450",
        "CVE-2024-10940",
        "CVE-2025-2867"
      ],
      "incidents": [
        "McDonald sued for use of AI which collected voice print biometrics",
        "SoundCloud discreetly changed its terms of service, adding a clause that many interpreted as giving the company the right to use users' music and audio uploads to train AI models - including generative AI capable of replicating or synthesising artists' voices, music, or likeness. ",
        "In early 2024, T-Mobile revealed that hackers used an AI-equipped application programming interface (API) to gain unauthorized access to sensitive customer information, including full names, contact numbers, and PINs of its customers. ",
        "Air Canada Chatbot customer who was misled into paying for full-price flight tickets by a contact center chatbot.",
        "Serviceaide, a provider of agentic artificial intelligence-based IT management and workflow software,Agentic AI Tech Firm Says Health Data Leak Affects 483,000. certain information within its Catholic Health Elasticsearch database was inadvertently made publicly available."
      ],
      "defenses": [
        0,
        1,
        2,
        3
      ],
      "questions": [],
      "threatProfiles": [
        5,
        30
      ],
      "attackSurfaces": [],
      "incidentReadiness": [],
      "redTeamSecurity": [],
      "redTeamResults": [],
      "useCases": []
    },
    "oodaPhase": "observe",
    "createdAt": "2025-10-27T15:57:27.728Z",
    "updatedAt": "2025-10-27T15:57:27.728Z"
  }
];

// ============================================================
// SHEETS METADATA (19 Excel tabs - BILINGUAL)
// ============================================================

export const owaspSheets: OWASPSheet[] = [
  {
    "id": "compass-getting-started",
    "name": "0 Getting The Compass",
    "title": {
      "fr": "Démarrage",
      "en": "Getting Started"
    },
    "description": {
      "fr": "Guide de démarrage rapide",
      "en": "Quick start guide"
    },
    "oodaPhase": null,
    "icon": "BookOpen",
    "color": "blue",
    "order": 0
  },
  {
    "id": "compass-about",
    "name": "1 About",
    "title": {
      "fr": "À propos",
      "en": "About"
    },
    "description": {
      "fr": "Introduction au framework COMPASS",
      "en": "Introduction to COMPASS framework"
    },
    "oodaPhase": null,
    "icon": "Info",
    "color": "blue",
    "order": 1
  },
  {
    "id": "compass-faq",
    "name": "1 FAQ",
    "title": {
      "fr": "FAQ",
      "en": "FAQ"
    },
    "description": {
      "fr": "Questions fréquemment posées",
      "en": "Frequently Asked Questions"
    },
    "oodaPhase": null,
    "icon": "HelpCircle",
    "color": "blue",
    "order": 2
  },
  {
    "id": "compass-observe-dashboard",
    "name": "2 Observe Objective Dashboard",
    "title": {
      "fr": "Tableau de bord Observe",
      "en": "Observe Dashboard"
    },
    "description": {
      "fr": "Vue d'ensemble des objectifs et menaces",
      "en": "Overview of objectives and threats"
    },
    "oodaPhase": "observe",
    "icon": "Eye",
    "color": "purple",
    "order": 3
  },
  {
    "id": "compass-threat-profile",
    "name": "2a Observe Objective Threat Pr",
    "title": {
      "fr": "Profil de menace",
      "en": "Threat Profile"
    },
    "description": {
      "fr": "Définition du profil de menace de votre système",
      "en": "Define your system threat profile"
    },
    "oodaPhase": "observe",
    "icon": "Target",
    "color": "purple",
    "order": 4
  },
  {
    "id": "compass-attack-surface",
    "name": "2b Observe Attack Surface Analy",
    "title": {
      "fr": "Surface d'attaque",
      "en": "Attack Surface"
    },
    "description": {
      "fr": "Analyse de la surface d'attaque",
      "en": "Attack surface analysis"
    },
    "oodaPhase": "observe",
    "icon": "Shield",
    "color": "purple",
    "order": 5
  },
  {
    "id": "compass-orient-summary",
    "name": "3 Orient Summary",
    "title": {
      "fr": "Résumé Orient",
      "en": "Orient Summary"
    },
    "description": {
      "fr": "Synthèse de l'orientation stratégique",
      "en": "Strategic orientation summary"
    },
    "oodaPhase": "orient",
    "icon": "Compass",
    "color": "cyan",
    "order": 6
  },
  {
    "id": "compass-vulnerabilities",
    "name": "3a Orient Known AI Vulnerabilit",
    "title": {
      "fr": "Vulnérabilités connues",
      "en": "Known Vulnerabilities"
    },
    "description": {
      "fr": "Base de données des vulnérabilités IA connues",
      "en": "Known AI vulnerabilities database"
    },
    "oodaPhase": "orient",
    "icon": "AlertTriangle",
    "color": "cyan",
    "order": 7
  },
  {
    "id": "compass-incidents",
    "name": "3b Orient Known AI Incidents",
    "title": {
      "fr": "Incidents connus",
      "en": "Known Incidents"
    },
    "description": {
      "fr": "Historique des incidents IA",
      "en": "AI incidents history"
    },
    "oodaPhase": "orient",
    "icon": "Flame",
    "color": "cyan",
    "order": 8
  },
  {
    "id": "compass-incident-response",
    "name": "3c Orient AI Incident Response ",
    "title": {
      "fr": "Réponse aux incidents",
      "en": "Incident Response"
    },
    "description": {
      "fr": "Procédures de réponse aux incidents IA",
      "en": "AI incident response procedures"
    },
    "oodaPhase": "orient",
    "icon": "Siren",
    "color": "cyan",
    "order": 9
  },
  {
    "id": "compass-red-team-review",
    "name": "3d Orient Red Team Security Rev",
    "title": {
      "fr": "Revue Red Team",
      "en": "Red Team Review"
    },
    "description": {
      "fr": "Revue de sécurité Red Team",
      "en": "Red Team security review"
    },
    "oodaPhase": "orient",
    "icon": "Users",
    "color": "cyan",
    "order": 10
  },
  {
    "id": "compass-red-team-results",
    "name": "3e Orient AI Red Team Results",
    "title": {
      "fr": "Résultats Red Team",
      "en": "Red Team Results"
    },
    "description": {
      "fr": "Résultats des tests adversaires",
      "en": "Adversarial testing results"
    },
    "oodaPhase": "orient",
    "icon": "FileText",
    "color": "cyan",
    "order": 11
  },
  {
    "id": "compass-decide-prioritization",
    "name": "4 Decide Red Team or Vuln vs Mi",
    "title": {
      "fr": "Décision et priorisation",
      "en": "Decision & Prioritization"
    },
    "description": {
      "fr": "Priorisation des vulnérabilités et mitigations",
      "en": "Vulnerabilities and mitigations prioritization"
    },
    "oodaPhase": "decide",
    "icon": "CheckSquare",
    "color": "green",
    "order": 12
  },
  {
    "id": "compass-act-strategy",
    "name": "5 Act Strategy & Roadmap",
    "title": {
      "fr": "Stratégie et feuille de route",
      "en": "Strategy & Roadmap"
    },
    "description": {
      "fr": "Plan d'action et feuille de route",
      "en": "Action plan and roadmap"
    },
    "oodaPhase": "act",
    "icon": "Map",
    "color": "orange",
    "order": 13
  },
  {
    "id": "compass-security-matrix",
    "name": "6 Reference AI Security Matrix",
    "title": {
      "fr": "Matrice de sécurité IA",
      "en": "AI Security Matrix"
    },
    "description": {
      "fr": "Matrice de référence de sécurité IA",
      "en": "AI security reference matrix"
    },
    "oodaPhase": null,
    "icon": "Grid",
    "color": "gray",
    "order": 14
  },
  {
    "id": "compass-defenses",
    "name": "6a Reference Defenses & Mitigat",
    "title": {
      "fr": "Défenses et mitigations",
      "en": "Defenses & Mitigations"
    },
    "description": {
      "fr": "Catalogue des défenses et mitigations",
      "en": "Defenses and mitigations catalog"
    },
    "oodaPhase": null,
    "icon": "ShieldCheck",
    "color": "gray",
    "order": 15
  },
  {
    "id": "compass-monitoring",
    "name": "6b Reference Incident Monitorin",
    "title": {
      "fr": "Surveillance des incidents",
      "en": "Incident Monitoring"
    },
    "description": {
      "fr": "Outils et techniques de surveillance",
      "en": "Monitoring tools and techniques"
    },
    "oodaPhase": null,
    "icon": "Activity",
    "color": "gray",
    "order": 16
  },
  {
    "id": "compass-third-party",
    "name": "6c Reference Third Party Questi",
    "title": {
      "fr": "Questions tiers",
      "en": "Third Party Questions"
    },
    "description": {
      "fr": "Questions pour fournisseurs IA tiers",
      "en": "Questions for third-party AI vendors"
    },
    "oodaPhase": null,
    "icon": "MessageSquare",
    "color": "gray",
    "order": 17
  },
  {
    "id": "compass-use-cases",
    "name": "Notes Uses Cases",
    "title": {
      "fr": "Cas d'usage",
      "en": "Use Cases"
    },
    "description": {
      "fr": "30 scénarios de menaces avec scores de risque",
      "en": "30 threat scenarios with risk scores"
    },
    "oodaPhase": null,
    "icon": "List",
    "color": "indigo",
    "order": 18
  }
];

// ============================================================
// STATISTICS
// ============================================================

export const compassStatistics = {
  "totalUseCases": 31,
  "byRiskLevel": {
    "critical": 7,
    "high": 11,
    "moderate": 9,
    "low": 4
  },
  "byOODAPhase": {
    "observe": 31,
    "orient": 0,
    "decide": 0,
    "act": 0
  },
  "avgRiskScore": "14.13",
  "avgImpact": "4.16",
  "avgLikelihood": "3.35"
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

export function getUseCaseById(id: string): CompassUseCase | undefined {
  return compassUseCases.find(uc => uc.id === id);
}

export function getUseCasesByRiskLevel(level: RiskLevel): CompassUseCase[] {
  return compassUseCases.filter(uc => uc.riskLevel === level);
}

export function getUseCasesByOODAPhase(phase: OODAPhase): CompassUseCase[] {
  return compassUseCases.filter(uc => uc.oodaPhase === phase);
}

export function getSheetById(id: string): OWASPSheet | undefined {
  return owaspSheets.find(sheet => sheet.id === id);
}

export function getSheetsByOODAPhase(phase: OODAPhase): OWASPSheet[] {
  return owaspSheets.filter(sheet => sheet.oodaPhase === phase);
}

export function getReferenceSheets(): OWASPSheet[] {
  return owaspSheets.filter(sheet => sheet.oodaPhase === null);
}
