# 🔗 Guide d'Intégration GARAK avec AI Risk Manager

## 📋 Table des Matières
- [Vue d'Ensemble](#vue-densemble)
- [Architecture Proposée](#architecture-proposée)
- [Option 1: Service Backend NestJS](#option-1-service-backend-nestjs)
- [Option 2: API REST Python](#option-2-api-rest-python)
- [Option 3: Import Direct](#option-3-import-direct)
- [Mapping des Concepts](#mapping-des-concepts)
- [Exemples de Code](#exemples-de-code)

---

## 🎯 Vue d'Ensemble

GARAK peut être intégré à AI Risk Manager de plusieurs façons pour remplacer ou compléter le système de test actuel (`testRunnerService.ts`).

### Avantages de l'Intégration

✅ **30+ familles de probes** prêtes à l'emploi  
✅ **Détecteurs ML avancés** (toxicité, hallucinations, etc.)  
✅ **Attack Generation** adaptatif  
✅ **Rapports standardisés** (JSONL, HTML)  
✅ **Support multi-LLM** (OpenAI, HF, Cohere, etc.)  
✅ **Communauté active** et mises à jour régulières  

---

## 🏗️ Architecture Proposée

```
┌─────────────────────────────────────────────────────────────┐
│                    AI Risk Manager Frontend                  │
│                     (React + TypeScript)                     │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/WebSocket
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend API Gateway (NestJS)                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         GARAK Integration Service                     │  │
│  │  • Queue management (Bull)                            │  │
│  │  • Job scheduling                                     │  │
│  │  • Results parsing                                    │  │
│  │  • WebSocket notifications                            │  │
│  └──────────────────────┬───────────────────────────────┘  │
└─────────────────────────┼──────────────────────────────────┘
                          │ Python subprocess / HTTP
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    GARAK Service                             │
│  • Python 3.11 + uv                                          │
│  • 162 packages installés                                    │
│  • Probes, Detectors, Generators                             │
└──────────────────────────┬──────────────────────────────────┘
                           │ API Calls
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    LLM Cible                                 │
│  (OpenAI, Hugging Face, Cohere, etc.)                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Option 1: Service Backend NestJS

### 1.1 Créer le Module GARAK

```bash
cd backend/apps/api-gateway
nest g module garak
nest g service garak
nest g controller garak
```

### 1.2 Service GARAK (NestJS)

```typescript
// backend/apps/api-gateway/src/garak/garak.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile } from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

export interface GarakScanConfig {
  targetType: string;
  targetName: string;
  probes: string[];
  apiKey?: string;
  generations?: number;
  reportPrefix: string;
}

export interface GarakResults {
  scanId: string;
  totalAttempts: number;
  vulnerabilitiesFound: number;
  byProbe: Record<string, { total: number; hits: number }>;
  hitExamples: any[];
  reportPath: string;
}

@Injectable()
export class GarakService {
  private readonly logger = new Logger(GarakService.name);
  private readonly garakPath = path.join(
    process.cwd(),
    '../../guardrail/solution_garak'
  );

  async runScan(config: GarakScanConfig): Promise<GarakResults> {
    this.logger.log(`Starting GARAK scan: ${config.reportPrefix}`);

    // Construire la commande
    const command = this.buildCommand(config);

    // Exécuter GARAK
    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd: this.garakPath,
        env: {
          ...process.env,
          ...(config.apiKey && { OPENAI_API_KEY: config.apiKey }),
        },
        maxBuffer: 10 * 1024 * 1024, // 10MB
      });

      this.logger.log(`GARAK scan completed: ${config.reportPrefix}`);
      this.logger.debug(stdout);

      // Parser les résultats
      return await this.parseResults(config.reportPrefix);
    } catch (error) {
      this.logger.error(`GARAK scan failed: ${error.message}`);
      throw error;
    }
  }

  private buildCommand(config: GarakScanConfig): string {
    const parts = [
      'uv run python -m garak',
      `--target_type ${config.targetType}`,
      `--target_name ${config.targetName}`,
      `--probes ${config.probes.join(' ')}`,
      `--report_prefix ${config.reportPrefix}`,
    ];

    if (config.generations) {
      parts.push(`--generations ${config.generations}`);
    }

    return parts.join(' ');
  }

  private async parseResults(reportPrefix: string): Promise<GarakResults> {
    const reportFile = path.join(
      this.garakPath,
      `garak.${reportPrefix}.report.jsonl`
    );

    const content = await readFile(reportFile, 'utf-8');
    const lines = content.split('\n').filter((l) => l.trim());

    const stats: GarakResults = {
      scanId: reportPrefix,
      totalAttempts: 0,
      vulnerabilitiesFound: 0,
      byProbe: {},
      hitExamples: [],
      reportPath: reportFile,
    };

    for (const line of lines) {
      try {
        const entry = JSON.parse(line);
        stats.totalAttempts++;

        const probe = entry.probe || 'unknown';
        const score = entry.score || 0;

        if (!stats.byProbe[probe]) {
          stats.byProbe[probe] = { total: 0, hits: 0 };
        }

        stats.byProbe[probe].total++;

        if (score > 0) {
          stats.byProbe[probe].hits++;
          stats.vulnerabilitiesFound++;

          if (stats.hitExamples.length < 10) {
            stats.hitExamples.push({
              probe: entry.probe,
              detector: entry.detector,
              prompt: entry.prompt?.substring(0, 200),
              output: entry.output?.substring(0, 200),
              score: entry.score,
            });
          }
        }
      } catch (e) {
        // Ignorer les lignes invalides
      }
    }

    return stats;
  }
}
```

### 1.3 Controller GARAK

```typescript
// backend/apps/api-gateway/src/garak/garak.controller.ts
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { GarakService, GarakScanConfig } from './garak.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('garak')
@UseGuards(JwtAuthGuard)
export class GarakController {
  constructor(private readonly garakService: GarakService) {}

  @Post('scan')
  async runScan(@Body() config: GarakScanConfig) {
    return await this.garakService.runScan(config);
  }
}
```

### 1.4 Utilisation depuis le Frontend

```typescript
// src/services/garakService.ts
import { backendApiService } from './backendApiService';

export interface GarakScanRequest {
  targetType: string;
  targetName: string;
  probes: string[];
  apiKey?: string;
  generations?: number;
}

export const garakService = {
  async runScan(config: GarakScanRequest) {
    const reportPrefix = `scan_${Date.now()}`;
    
    const response = await backendApiService.post('/garak/scan', {
      ...config,
      reportPrefix,
    });

    return response.data;
  },
};
```

---

## 🐍 Option 2: API REST Python (FastAPI)

### 2.1 Créer l'API Server

```python
# guardrail/solution_garak/api_server.py
from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import subprocess
import json
import uuid
from pathlib import Path
from typing import List, Optional

app = FastAPI(title="GARAK API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3004", "http://localhost:5080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modèles
class ScanRequest(BaseModel):
    target_type: str
    target_name: str
    probes: List[str]
    api_key: Optional[str] = None
    generations: int = 5

class ScanResponse(BaseModel):
    scan_id: str
    status: str
    message: str

class ScanResults(BaseModel):
    scan_id: str
    total_attempts: int
    vulnerabilities_found: int
    by_probe: dict
    hit_examples: list

# Storage
scans = {}

@app.post("/scan", response_model=ScanResponse)
async def create_scan(request: ScanRequest, background_tasks: BackgroundTasks):
    scan_id = str(uuid.uuid4())
    scans[scan_id] = {"status": "running", "results": None}
    
    background_tasks.add_task(execute_garak, request, scan_id)
    
    return ScanResponse(
        scan_id=scan_id,
        status="started",
        message=f"Scan {scan_id} started"
    )

@app.get("/scan/{scan_id}", response_model=ScanResults)
async def get_scan_results(scan_id: str):
    if scan_id not in scans:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    scan = scans[scan_id]
    if scan["status"] == "running":
        raise HTTPException(status_code=202, detail="Scan still running")
    
    return scan["results"]

def execute_garak(request: ScanRequest, scan_id: str):
    """Exécute GARAK en arrière-plan"""
    try:
        cmd = [
            "uv", "run", "python", "-m", "garak",
            "--target_type", request.target_type,
            "--target_name", request.target_name,
            "--probes", *request.probes,
            "--generations", str(request.generations),
            "--report_prefix", scan_id
        ]
        
        env = {}
        if request.api_key:
            env["OPENAI_API_KEY"] = request.api_key
        
        subprocess.run(cmd, env=env, check=True)
        
        # Parser les résultats
        results = parse_results(scan_id)
        scans[scan_id] = {"status": "completed", "results": results}
        
    except Exception as e:
        scans[scan_id] = {"status": "failed", "error": str(e)}

def parse_results(scan_id: str) -> ScanResults:
    """Parse le fichier JSONL de résultats"""
    report_file = Path(f"garak.{scan_id}.report.jsonl")
    
    stats = {
        "scan_id": scan_id,
        "total_attempts": 0,
        "vulnerabilities_found": 0,
        "by_probe": {},
        "hit_examples": []
    }
    
    with open(report_file) as f:
        for line in f:
            if not line.strip():
                continue
            
            entry = json.loads(line)
            stats["total_attempts"] += 1
            
            probe = entry.get("probe", "unknown")
            score = entry.get("score", 0)
            
            if probe not in stats["by_probe"]:
                stats["by_probe"][probe] = {"total": 0, "hits": 0}
            
            stats["by_probe"][probe]["total"] += 1
            
            if score > 0:
                stats["by_probe"][probe]["hits"] += 1
                stats["vulnerabilities_found"] += 1
                
                if len(stats["hit_examples"]) < 10:
                    stats["hit_examples"].append({
                        "probe": entry.get("probe"),
                        "detector": entry.get("detector"),
                        "prompt": entry.get("prompt", "")[:200],
                        "output": entry.get("output", "")[:200],
                        "score": score
                    })
    
    return ScanResults(**stats)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### 2.2 Lancer l'API

```bash
cd guardrail/solution_garak
uv run python api_server.py
```

### 2.3 Utilisation depuis le Frontend

```typescript
// src/services/garakApiService.ts
const GARAK_API_URL = 'http://localhost:8000';

export const garakApiService = {
  async startScan(config: GarakScanRequest) {
    const response = await fetch(`${GARAK_API_URL}/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    return await response.json();
  },

  async getScanResults(scanId: string) {
    const response = await fetch(`${GARAK_API_URL}/scan/${scanId}`);
    if (response.status === 202) {
      throw new Error('Scan still running');
    }
    return await response.json();
  },
};
```

---

## 📊 Mapping des Concepts

| AI Risk Manager | GARAK | Notes |
|-----------------|-------|-------|
| `GuardrailCategory` | Probe families | `encoding`, `dan`, `malwaregen`, etc. |
| `AttackFamily` | Probe types | Injection, Jailbreak, etc. |
| `TestConfiguration` | `GarakScanConfig` | Configuration du scan |
| `TestResult` | JSONL entry | Résultat d'une tentative |
| `EvaluationStep` | Detector output | Chaîne d'évaluation |
| `testRunnerService` | GARAK CLI | Exécution des tests |
| `geminiService` | Generator | LLM cible |

---

## 🎯 Prochaines Étapes

1. ✅ **Installation complétée** - GARAK v0.13.1 installé
2. 📝 **Tester les exemples** - Exécuter `quick_start.sh`
3. 🔧 **Choisir l'option d'intégration** - Backend NestJS ou API Python
4. 🎨 **Adapter le Frontend** - Modifier `TestConfiguration.tsx`
5. 🚀 **Déployer** - Intégrer dans le pipeline CI/CD

---

**GARAK est prêt à être intégré ! 🎉**

