# 🔧 Correction de l'Exécution de Garak

## 🐛 Problème Identifié

### Symptôme
```
ERROR [GarakService] Command failed: garak --model-type openai --model-name "openai/gpt-4" ...
/bin/sh: 1: garak: not found
```

### Cause Racine

Le problème n'est PAS que Garak n'est pas installé (il l'est), mais que la commande construite est incorrecte.

**Commande construite** :
```bash
docker exec -e OPENAI_API_KEY=xxx airiskmgr-garak-runner garak --model-type openai --model-name "openai/gpt-4" --probes all --detectors default --generators default --report_dir "/app/output" --output_format jsonl
```

**Problème** : Les guillemets autour de `"openai/gpt-4"` et `"/app/output"` ne sont pas échappés correctement quand la commande est passée à `child_process.exec()`.

### Analyse Détaillée

1. **Construction de la commande** (`garak.service.ts` ligne 45-100) :
   ```typescript
   const dockerArgs: string[] = ['docker', 'exec'];
   dockerArgs.push('--model-name', config.model);  // config.model = "openai/gpt-4"
   const command = dockerArgs.join(' ');  // Résultat : "... --model-name openai/gpt-4 ..."
   ```

2. **Exécution** (ligne 169) :
   ```typescript
   const { stdout, stderr } = await execAsync(command, { ... });
   ```

3. **Interprétation par le shell** :
   - Le shell voit : `docker exec ... garak --model-name openai/gpt-4`
   - Il interprète `openai/gpt-4` comme un chemin de fichier
   - Le `/` est interprété comme un séparateur de répertoire
   - Résultat : erreur de parsing

---

## ✅ Solutions

### Solution 1 : Utiliser `execFile` au lieu de `exec` (RECOMMANDÉ)

`execFile` ne passe pas par le shell, donc pas de problème d'échappement.

```typescript
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

// Dans buildGarakCommand, retourner un tableau au lieu d'une string
private buildGarakCommand(config: ScanConfigDto, outputDir: string): string[] {
  const dockerArgs: string[] = ['docker', 'exec'];
  
  // ... (reste du code identique)
  
  // Retourner le tableau au lieu de le joindre
  return dockerArgs;
}

// Dans runGarakAsync
const commandArgs = this.buildGarakCommand(config, outputPath);
this.logger.debug(`Built Garak Docker command: ${commandArgs.join(' ')}`);

const { stdout, stderr } = await execFileAsync(commandArgs[0], commandArgs.slice(1), {
  timeout: 3600000,
  maxBuffer: 10 * 1024 * 1024,
});
```

### Solution 2 : Échapper correctement les arguments

Si on veut garder `exec`, il faut échapper les arguments :

```typescript
import { spawn } from 'child_process';

// Utiliser spawn qui gère mieux les arguments
private async runGarakAsync(...) {
  const dockerArgs = this.buildGarakCommand(config, outputPath);
  
  return new Promise((resolve, reject) => {
    const process = spawn('docker', dockerArgs.slice(1), {
      timeout: 3600000,
    });
    
    let stdout = '';
    let stderr = '';
    
    process.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    process.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`Process exited with code ${code}`));
      }
    });
  });
}
```

### Solution 3 : Supprimer les guillemets inutiles

Les guillemets ne sont pas nécessaires dans un tableau d'arguments :

```typescript
// ❌ MAUVAIS
dockerArgs.push('--model-name', `"${config.model}"`);

// ✅ BON
dockerArgs.push('--model-name', config.model);
```

---

## 🔨 Implémentation Recommandée

### Étape 1 : Modifier `garak.service.ts`

```typescript
import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { execFile } from 'child_process';  // ✅ Changement ici
import { promisify } from 'util';
import { promises as fs } from 'fs';
import { join } from 'path';
import { ScanConfigDto } from './dto/scan-config.dto';
import { ScanResultDto, VulnerabilityDto } from './dto/scan-result.dto';
import { GarakGateway } from './garak.gateway';

const execFileAsync = promisify(execFile);  // ✅ Changement ici

@Injectable()
export class GarakService {
  // ... (reste du code)

  /**
   * Build Garak CLI command for Docker execution
   * @returns Array of command arguments (not a string)
   */
  private buildGarakCommand(config: ScanConfigDto, outputDir: string): string[] {  // ✅ Retourne string[]
    const dockerArgs: string[] = [];  // ✅ Ne pas inclure 'docker' ici

    // Pass environment variables for API keys if provided
    if (config.apiKey) {
      const modelType = config.modelType || 'openai';
      if (modelType === 'openai') {
        dockerArgs.push('-e', `OPENAI_API_KEY=${config.apiKey}`);
      } else if (modelType === 'google' || modelType === 'gemini') {
        dockerArgs.push('-e', `GEMINI_API_KEY=${config.apiKey}`);
      } else if (modelType === 'anthropic') {
        dockerArgs.push('-e', `ANTHROPIC_API_KEY=${config.apiKey}`);
      } else {
        dockerArgs.push('-e', `API_KEY=${config.apiKey}`);
      }
    }

    // Container name
    dockerArgs.push('airiskmgr-garak-runner');

    // Garak command
    dockerArgs.push('garak');

    // Model configuration
    const modelType = config.modelType || 'openai';
    dockerArgs.push('--model-type', modelType);
    dockerArgs.push('--model-name', config.model);  // ✅ Pas de guillemets

    // Probes
    if (config.probes.includes('all')) {
      dockerArgs.push('--probes', 'all');
    } else {
      dockerArgs.push('--probes', config.probes.join(','));
    }

    // Detectors (optional)
    if (config.detectors && config.detectors.length > 0) {
      if (config.detectors.includes('all')) {
        dockerArgs.push('--detectors', 'all');
      } else {
        dockerArgs.push('--detectors', config.detectors.join(','));
      }
    }

    // Generators (optional)
    if (config.generators && config.generators.length > 0) {
      dockerArgs.push('--generators', config.generators.join(','));
    }

    // Output configuration
    dockerArgs.push('--report_dir', '/app/output');  // ✅ Pas de guillemets
    dockerArgs.push('--output_format', 'jsonl');

    this.logger.debug(`Built Garak Docker args: docker exec ${dockerArgs.join(' ')}`);
    return dockerArgs;  // ✅ Retourne le tableau
  }

  /**
   * Run Garak CLI asynchronously in Docker container
   */
  private async runGarakAsync(
    scanId: string,
    config: ScanConfigDto,
    outputPath: string,
  ): Promise<void> {
    this.logger.log(`🚀 Launching Garak CLI in Docker (scan ID: ${scanId})...`);

    try {
      // Build command arguments
      const commandArgs = this.buildGarakCommand(config, outputPath);  // ✅ Tableau
      this.gateway.emitLog(scanId, `Executing: docker exec ${commandArgs.join(' ')}`);
      this.gateway.emitProgress(scanId, 10, 'Initializing Garak scanner...');

      // Update status to RUNNING
      await this.prisma.testRun.update({
        where: { id: scanId },
        data: { status: 'RUNNING' },
      });

      // Execute Garak CLI in Docker container using execFile
      this.gateway.emitProgress(scanId, 20, 'Running Garak probes...');

      const { stdout, stderr } = await execFileAsync('docker', ['exec', ...commandArgs], {  // ✅ execFile
        timeout: 3600000, // 1 hour
        maxBuffer: 10 * 1024 * 1024, // 10MB
      });

      this.logger.log(`✅ Garak scan completed (${scanId})`);
      this.logger.debug(`STDOUT: ${stdout.substring(0, 500)}...`);

      // ... (reste du code identique)
    } catch (error) {
      this.logger.error(`❌ Garak scan failed (${scanId}):`, error);
      // ... (reste du code identique)
    }
  }

  // ... (reste du code identique)
}
```

---

## 🧪 Test de Validation

### Test 1 : Commande Simple

```bash
# Test direct dans l'API Gateway
docker exec airiskmgr-api-gateway node -e "
const { execFile } = require('child_process');
const { promisify } = require('util');
const execFileAsync = promisify(execFile);

(async () => {
  try {
    const { stdout } = await execFileAsync('docker', [
      'exec',
      'airiskmgr-garak-runner',
      'garak',
      '--help'
    ]);
    console.log('✅ SUCCESS');
    console.log(stdout.substring(0, 200));
  } catch (error) {
    console.error('❌ FAILED:', error.message);
  }
})();
"
```

### Test 2 : Scan Complet

Après avoir appliqué les corrections, tester via l'API :

```bash
curl -X POST http://localhost:3003/api/garak/scan \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini/gemini-2.5-flash",
    "modelType": "gemini",
    "apiKey": "<REVOKED_2026_05_11>",
    "probes": ["all"],
    "detectors": ["default"],
    "generators": ["default"]
  }'
```

---

## 📋 Checklist de Correction

- [ ] Modifier `garak.service.ts` pour utiliser `execFile` au lieu de `exec`
- [ ] Changer `buildGarakCommand` pour retourner `string[]` au lieu de `string`
- [ ] Supprimer les guillemets inutiles autour des arguments
- [ ] Tester la commande avec `docker exec` directement
- [ ] Redémarrer l'API Gateway : `docker-compose restart api-gateway`
- [ ] Tester un scan Garak via l'API
- [ ] Vérifier les logs : `docker logs -f airiskmgr-api-gateway`
- [ ] Vérifier les résultats dans `/app/garak-outputs`

---

## 🎯 Résultat Attendu

Après correction, les logs devraient montrer :

```
[GarakService] Starting REAL Garak scan
[GarakService] Built Garak Docker args: docker exec airiskmgr-garak-runner garak --model-type gemini --model-name gemini/gemini-2.5-flash --probes all ...
[GarakService] ✅ Garak scan completed
[GarakService] Parsing 150 result lines from Garak...
[GarakService] ✅ Garak results saved: 120 passed, 30 failed, 30 vulnerabilities
```

---

**Prochaine étape** : Appliquer la correction au code.
