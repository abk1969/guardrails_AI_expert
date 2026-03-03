import { Test, TestingModule } from '@nestjs/testing';
import { SystemService } from './system.service';
import { ToolCheckDto } from './dto/system-health.dto';

describe('SystemService', () => {
  let service: SystemService;

  // Reusable tool check results
  const okPython: ToolCheckDto = { version: '3.11.5', ok: true, required: true };
  const okPipx: ToolCheckDto = { version: '1.2.0', ok: true, required: true };
  const okGarak: ToolCheckDto = { version: 'garak 0.9.0', ok: true, required: true };
  const okNode: ToolCheckDto = { version: '20.11.0', ok: true, required: true };
  const okPromptfoo: ToolCheckDto = { version: '0.85.0', ok: true, required: true };
  const okDocker: ToolCheckDto = { version: '24.0.7', ok: true, required: true };

  const failPython: ToolCheckDto = { version: 'not found', ok: false, required: true, error: 'Python not found in PATH' };
  const failPipx: ToolCheckDto = { version: 'not found', ok: false, required: true, error: 'pipx not found' };
  const failGarak: ToolCheckDto = { version: 'not found', ok: false, required: true, error: 'Garak not found' };
  const failDocker: ToolCheckDto = { version: 'not found', ok: false, required: true, error: 'Docker not found' };
  const failDockerDaemon: ToolCheckDto = { version: '24.0.7', ok: false, required: true, error: 'Docker daemon is not running. Please start Docker.' };
  const oldPython: ToolCheckDto = { version: '3.7.2', ok: false, required: true, error: 'Python 3.9+ required' };

  function mockAllToolsOk() {
    jest.spyOn(service as any, 'checkPython').mockResolvedValue(okPython);
    jest.spyOn(service as any, 'checkPipx').mockResolvedValue(okPipx);
    jest.spyOn(service as any, 'checkGarak').mockResolvedValue(okGarak);
    jest.spyOn(service as any, 'checkNode').mockResolvedValue(okNode);
    jest.spyOn(service as any, 'checkPromptfoo').mockResolvedValue(okPromptfoo);
    jest.spyOn(service as any, 'checkDocker').mockResolvedValue(okDocker);
  }

  function mockTools(overrides: Partial<Record<'python' | 'pipx' | 'garak' | 'node' | 'promptfoo' | 'docker', ToolCheckDto>>) {
    jest.spyOn(service as any, 'checkPython').mockResolvedValue(overrides.python || okPython);
    jest.spyOn(service as any, 'checkPipx').mockResolvedValue(overrides.pipx || okPipx);
    jest.spyOn(service as any, 'checkGarak').mockResolvedValue(overrides.garak || okGarak);
    jest.spyOn(service as any, 'checkNode').mockResolvedValue(overrides.node || okNode);
    jest.spyOn(service as any, 'checkPromptfoo').mockResolvedValue(overrides.promptfoo || okPromptfoo);
    jest.spyOn(service as any, 'checkDocker').mockResolvedValue(overrides.docker || okDocker);
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SystemService],
    }).compile();

    service = module.get<SystemService>(SystemService);

    // Clear cache before each test
    (service as any).healthCache = null;
    (service as any).cacheTimestamp = 0;

    jest.restoreAllMocks();
  });

  describe('getSystemHealth - all tools available', () => {
    beforeEach(() => {
      mockAllToolsOk();
    });

    it('should return healthy status when all tools are available', async () => {
      const result = await service.getSystemHealth();

      expect(result).toBeDefined();
      expect(result.status).toBe('healthy');
      expect(result.timestamp).toBeDefined();
      expect(new Date(result.timestamp).getTime()).toBeGreaterThan(Date.now() - 5000);
    });

    it('should have all tool fields present', async () => {
      const result = await service.getSystemHealth();

      expect(result.python).toBeDefined();
      expect(result.pipx).toBeDefined();
      expect(result.garak).toBeDefined();
      expect(result.node).toBeDefined();
      expect(result.promptfoo).toBeDefined();
      expect(result.docker).toBeDefined();
    });

    it('should mark all tools as ok with correct versions', async () => {
      const result = await service.getSystemHealth();

      expect(result.python.ok).toBe(true);
      expect(result.python.version).toBe('3.11.5');
      expect(result.python.required).toBe(true);

      expect(result.pipx.ok).toBe(true);
      expect(result.pipx.version).toBe('1.2.0');

      expect(result.garak.ok).toBe(true);
      expect(result.garak.version).toBe('garak 0.9.0');

      expect(result.node.ok).toBe(true);
      expect(result.node.version).toBe('20.11.0');

      expect(result.promptfoo.ok).toBe(true);
      expect(result.promptfoo.version).toBe('0.85.0');

      expect(result.docker.ok).toBe(true);
      expect(result.docker.version).toBe('24.0.7');
    });

    it('should not have missingDependencies or recommendations when healthy', async () => {
      const result = await service.getSystemHealth();

      expect(result.missingDependencies).toBeUndefined();
      expect(result.recommendations).toBeUndefined();
    });

    it('should mark each tool as required', async () => {
      const result = await service.getSystemHealth();

      [result.python, result.pipx, result.garak, result.node, result.promptfoo, result.docker].forEach(tool => {
        expect(tool.required).toBe(true);
      });
    });
  });

  describe('getSystemHealth - degraded status', () => {
    it('should return degraded when 1-2 non-Docker tools are missing', async () => {
      mockTools({ python: failPython, pipx: failPipx });

      const result = await service.getSystemHealth();

      expect(result.status).toBe('degraded');
      expect(result.missingDependencies).toBeDefined();
      expect(result.missingDependencies).toContain('python');
      expect(result.missingDependencies).toContain('pipx');
      expect(result.missingDependencies).not.toContain('docker');
    });

    it('should provide recommendations when tools are missing', async () => {
      mockTools({ python: failPython });

      const result = await service.getSystemHealth();

      expect(result.recommendations).toBeDefined();
      expect(result.recommendations).toContain('install-pentest-tools');

      if (process.platform === 'win32') {
        expect(result.recommendations).toContain('.ps1');
      } else {
        expect(result.recommendations).toContain('.sh');
      }
    });
  });

  describe('getSystemHealth - unhealthy status', () => {
    it('should return unhealthy when Docker is missing', async () => {
      mockTools({ docker: failDocker });

      const result = await service.getSystemHealth();

      expect(result.status).toBe('unhealthy');
      expect(result.docker.ok).toBe(false);
      expect(result.docker.version).toBe('not found');
      expect(result.missingDependencies).toContain('docker');
    });

    it('should return unhealthy when 3+ tools are missing', async () => {
      mockTools({ python: failPython, pipx: failPipx, garak: failGarak });

      const result = await service.getSystemHealth();

      expect(result.status).toBe('unhealthy');
      expect(result.missingDependencies.length).toBeGreaterThanOrEqual(3);
    });

    it('should return unhealthy when Docker daemon is not running', async () => {
      mockTools({ docker: failDockerDaemon });

      const result = await service.getSystemHealth();

      expect(result.docker.ok).toBe(false);
      expect(result.docker.version).toBe('24.0.7');
      expect(result.docker.error).toContain('Docker daemon is not running');
      expect(result.status).toBe('unhealthy');
    });
  });

  describe('Health Check Caching', () => {
    beforeEach(() => {
      mockAllToolsOk();
    });

    it('should cache results for 30 seconds', async () => {
      const result1 = await service.getSystemHealth();
      const result2 = await service.getSystemHealth();

      expect(result1.timestamp).toBe(result2.timestamp);
      expect(result1).toEqual(result2);
    });

    it('should refresh cache after expiration', async () => {
      const checkPythonSpy = jest.spyOn(service as any, 'checkPython');

      await service.getSystemHealth();
      expect(checkPythonSpy).toHaveBeenCalledTimes(1);

      // Cached call should NOT invoke checks again
      await service.getSystemHealth();
      expect(checkPythonSpy).toHaveBeenCalledTimes(1);

      // Expire the cache
      (service as any).cacheTimestamp = Date.now() - 31000;

      // This call should re-run all checks
      await service.getSystemHealth();
      expect(checkPythonSpy).toHaveBeenCalledTimes(2);
    });

    it('should return cached result even after multiple rapid calls', async () => {
      const result1 = await service.getSystemHealth();

      const results = await Promise.all([
        service.getSystemHealth(),
        service.getSystemHealth(),
        service.getSystemHealth(),
      ]);

      results.forEach(result => {
        expect(result.timestamp).toBe(result1.timestamp);
        expect(result).toEqual(result1);
      });
    });
  });

  describe('Tool Checks - Edge Cases', () => {
    it('should detect Node.js version correctly', async () => {
      mockAllToolsOk();

      const result = await service.getSystemHealth();

      expect(result.node.ok).toBe(true);
      expect(result.node.version).toMatch(/^\d+\.\d+\.\d+$/);
      expect(result.node.error).toBeUndefined();
    });

    it('should handle garak version in output', async () => {
      mockTools({ garak: { version: 'garak 0.9.0', ok: true, required: true } });

      const result = await service.getSystemHealth();

      expect(result.garak.ok).toBe(true);
      expect(result.garak.version).toBe('garak 0.9.0');
    });

    it('should detect Python version too old', async () => {
      mockTools({ python: oldPython });

      const result = await service.getSystemHealth();

      expect(result.python.ok).toBe(false);
      expect(result.python.version).toBe('3.7.2');
      expect(result.python.error).toContain('3.9+');
    });

    it('should report python as not found with error message', async () => {
      mockTools({ python: failPython });

      const result = await service.getSystemHealth();

      expect(result.python.ok).toBe(false);
      expect(result.python.version).toBe('not found');
      expect(result.python.error).toBeDefined();
    });

    it('should check Docker daemon status separately from Docker CLI', async () => {
      mockTools({ docker: failDockerDaemon });

      const result = await service.getSystemHealth();

      expect(result.docker.version).toBe('24.0.7');
      expect(result.docker.ok).toBe(false);
      expect(result.docker.error).toBeDefined();
    });
  });

  describe('Performance', () => {
    beforeEach(() => {
      mockAllToolsOk();
    });

    it('should complete health check within reasonable time (mocked)', async () => {
      (service as any).healthCache = null;

      const start = Date.now();
      await service.getSystemHealth();
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(1000);
    });

    it('should return cached result very quickly', async () => {
      await service.getSystemHealth();

      const start = Date.now();
      await service.getSystemHealth();
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(50);
    });
  });
});
