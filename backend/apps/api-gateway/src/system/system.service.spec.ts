import { Test, TestingModule } from '@nestjs/testing';
import { SystemService } from './system.service';

describe('SystemService (Integration Tests - No Mocks)', () => {
  let service: SystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SystemService],
    }).compile();

    service = module.get<SystemService>(SystemService);

    // Clear cache before each test
    (service as any).healthCache = null;
    (service as any).cacheTimestamp = 0;
  });

  describe('getSystemHealth', () => {
    it('should return actual system health status', async () => {
      const result = await service.getSystemHealth();

      // Basic structure checks
      expect(result).toBeDefined();
      expect(result.status).toMatch(/^(healthy|degraded|unhealthy)$/);
      expect(result.timestamp).toBeDefined();
      expect(new Date(result.timestamp).getTime()).toBeGreaterThan(Date.now() - 5000);

      // Check all tools are present
      expect(result.python).toBeDefined();
      expect(result.pipx).toBeDefined();
      expect(result.garak).toBeDefined();
      expect(result.strix).toBeDefined();
      expect(result.node).toBeDefined();
      expect(result.promptfoo).toBeDefined();
      expect(result.docker).toBeDefined();

      // Each tool should have required properties
      [result.python, result.pipx, result.garak, result.strix, result.node, result.promptfoo, result.docker].forEach(tool => {
        expect(tool.version).toBeDefined();
        expect(typeof tool.ok).toBe('boolean');
        expect(tool.required).toBe(true);
      });

      // If any tool is missing, should have missingDependencies array
      if (result.status !== 'healthy') {
        expect(result.missingDependencies).toBeDefined();
        expect(Array.isArray(result.missingDependencies)).toBe(true);
        expect(result.recommendations).toBeDefined();
      }
    });

    it('should detect Node.js (always available in test environment)', async () => {
      const result = await service.getSystemHealth();

      // Node.js should always be available since we're running tests in Node
      expect(result.node.ok).toBe(true);
      expect(result.node.version).toMatch(/^\d+\.\d+\.\d+$/);
      expect(result.node.error).toBeUndefined();
    });

    it('should mark Docker as required', async () => {
      const result = await service.getSystemHealth();

      // Docker is marked as REQUIRED
      expect(result.docker.required).toBe(true);

      // If Docker is missing, system should be unhealthy
      if (!result.docker.ok) {
        expect(result.status).toBe('unhealthy');
        expect(result.missingDependencies).toContain('docker');
      }
    });
  });

  describe('Health Check Caching', () => {
    it('should cache results for 30 seconds', async () => {
      // First call
      const result1 = await service.getSystemHealth();
      const timestamp1 = result1.timestamp;

      // Immediate second call - should return cached result
      const result2 = await service.getSystemHealth();
      const timestamp2 = result2.timestamp;

      // Timestamps should be identical (cached)
      expect(timestamp1).toBe(timestamp2);
      expect(result1.status).toBe(result2.status);
      expect(result1).toEqual(result2);
    });

    it('should refresh cache after expiration', async () => {
      // First call
      const result1 = await service.getSystemHealth();
      const timestamp1 = result1.timestamp;

      // Manually expire cache
      (service as any).cacheTimestamp = Date.now() - 31000;

      // Second call - should refresh
      const result2 = await service.getSystemHealth();
      const timestamp2 = result2.timestamp;

      // Timestamps should be different (refreshed)
      expect(timestamp2).not.toBe(timestamp1);
      expect(new Date(timestamp2).getTime()).toBeGreaterThan(new Date(timestamp1).getTime());
    });

    it('should return cached result even after multiple rapid calls', async () => {
      // First call
      const result1 = await service.getSystemHealth();

      // Multiple rapid calls
      const results = await Promise.all([
        service.getSystemHealth(),
        service.getSystemHealth(),
        service.getSystemHealth(),
      ]);

      // All should return the same cached result
      results.forEach(result => {
        expect(result.timestamp).toBe(result1.timestamp);
        expect(result).toEqual(result1);
      });
    });
  });

  describe('Status Logic', () => {
    it('should return healthy when all tools are available', async () => {
      const result = await service.getSystemHealth();

      // If all tools are ok, status should be healthy
      const allOk = [
        result.python.ok,
        result.pipx.ok,
        result.garak.ok,
        result.strix.ok,
        result.node.ok,
        result.promptfoo.ok,
        result.docker.ok,
      ].every(ok => ok === true);

      if (allOk) {
        expect(result.status).toBe('healthy');
        expect(result.missingDependencies).toBeUndefined();
        expect(result.recommendations).toBeUndefined();
      }
    });

    it('should return unhealthy when Docker is missing (if Docker is missing)', async () => {
      const result = await service.getSystemHealth();

      // If Docker is missing, should be unhealthy
      if (!result.docker.ok) {
        expect(result.status).toBe('unhealthy');
        expect(result.docker.error).toBeDefined();
        expect(result.missingDependencies).toContain('docker');
      }
    });

    it('should return degraded when 1-2 non-Docker tools are missing', async () => {
      const result = await service.getSystemHealth();

      const missingCount = result.missingDependencies?.length || 0;
      const dockerMissing = result.missingDependencies?.includes('docker');

      // Degraded = 1-2 tools missing AND Docker is not one of them
      if (missingCount >= 1 && missingCount <= 2 && !dockerMissing) {
        expect(result.status).toBe('degraded');
      }
    });

    it('should return unhealthy when 3+ tools are missing', async () => {
      const result = await service.getSystemHealth();

      const missingCount = result.missingDependencies?.length || 0;

      // Unhealthy = 3+ tools missing (even if Docker is present)
      if (missingCount >= 3) {
        expect(result.status).toBe('unhealthy');
      }
    });
  });

  describe('Recommendations', () => {
    it('should provide platform-specific recommendations when tools are missing', async () => {
      const result = await service.getSystemHealth();

      if (result.missingDependencies && result.missingDependencies.length > 0) {
        expect(result.recommendations).toBeDefined();
        expect(result.recommendations).toContain('install-pentest-tools');

        // Should match current platform
        if (process.platform === 'win32') {
          expect(result.recommendations).toContain('.ps1');
        } else {
          expect(result.recommendations).toContain('.sh');
        }
      }
    });
  });

  describe('Tool Checks', () => {
    it('should detect Python with version number', async () => {
      const result = await service.getSystemHealth();

      if (result.python.ok) {
        // If Python is available, should have a version
        expect(result.python.version).toMatch(/^\d+\.\d+\.\d+$/);
        expect(result.python.error).toBeUndefined();
      } else {
        // If Python is missing, should have an error message
        expect(result.python.version).toBe('not found');
        expect(result.python.error).toBeDefined();
      }
    });

    it('should handle tools outputting to stderr', async () => {
      const result = await service.getSystemHealth();

      // Some tools (like garak/strix) may output version to stderr
      // Service should handle this correctly
      if (result.garak.ok) {
        expect(result.garak.version).toBeTruthy();
        expect(result.garak.version).not.toBe('not found');
      }

      if (result.strix.ok) {
        expect(result.strix.version).toBeTruthy();
        expect(result.strix.version).not.toBe('not found');
      }
    });

    it('should check Docker daemon status separately from Docker CLI', async () => {
      const result = await service.getSystemHealth();

      // Docker check includes both CLI presence AND daemon running
      if (result.docker.ok) {
        // Both CLI and daemon are working
        expect(result.docker.version).toMatch(/^\d+/);
      } else if (result.docker.version !== 'not found') {
        // CLI exists but daemon might not be running
        expect(result.docker.error).toBeDefined();
      }
    });
  });

  describe('Performance', () => {
    it('should complete health check within reasonable time (uncached)', async () => {
      // Clear cache
      (service as any).healthCache = null;

      const start = Date.now();
      await service.getSystemHealth();
      const duration = Date.now() - start;

      // Should complete within 10 seconds (7 parallel checks)
      expect(duration).toBeLessThan(10000);
    });

    it('should return cached result very quickly', async () => {
      // First call to populate cache
      await service.getSystemHealth();

      // Second call (cached)
      const start = Date.now();
      await service.getSystemHealth();
      const duration = Date.now() - start;

      // Cached response should be nearly instant (< 50ms)
      expect(duration).toBeLessThan(50);
    });
  });
});
