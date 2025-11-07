import { Test, TestingModule } from '@nestjs/testing';
import { SystemService } from './system.service';
import { exec } from 'child_process';
import { promisify } from 'util';

// Mock modules
jest.mock('child_process');
jest.mock('util');

// Get the mocked promisify
const mockPromisify = promisify as jest.MockedFunction<typeof promisify>;

describe('SystemService', () => {
  let service: SystemService;
  let mockExecAsync: jest.Mock;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.useRealTimers(); // Ensure real timers before each test

    // Create fresh mock for each test
    mockExecAsync = jest.fn();
    mockPromisify.mockReturnValue(mockExecAsync as any);

    const module: TestingModule = await Test.createTestingModule({
      providers: [SystemService],
    }).compile();

    service = module.get<SystemService>(SystemService);
  });

  describe('getSystemHealth', () => {
    it('should return system health with all tools checked', async () => {
      // Mock all tool checks to succeed
      mockExecAsync.mockImplementation((command: string) => {
        let stdout = '';
        if (command.includes('python --version')) stdout = 'Python 3.11.0';
        else if (command.includes('pipx --version')) stdout = '1.2.0';
        else if (command.includes('garak --version')) stdout = '0.9.0';
        else if (command.includes('strix --version')) stdout = '0.1.0';
        else if (command.includes('node --version')) stdout = 'v18.17.0';
        else if (command.includes('npx promptfoo')) stdout = '0.50.0';
        else if (command.includes('docker --version')) stdout = 'Docker version 24.0.0';
        else if (command.includes('docker ps')) stdout = 'CONTAINER ID   IMAGE';

        return Promise.resolve({ stdout, stderr: '' });
      });

      const result = await service.getSystemHealth();

      expect(result.status).toBe('healthy');
      expect(result.python.ok).toBe(true);
      expect(result.pipx.ok).toBe(true);
      expect(result.garak.ok).toBe(true);
      expect(result.strix.ok).toBe(true);
      expect(result.node.ok).toBe(true);
      expect(result.promptfoo.ok).toBe(true);
      expect(result.docker.ok).toBe(true);
      expect(result.timestamp).toBeDefined();
      expect(result.missingDependencies).toBeUndefined();
    });

    it('should return unhealthy status when Docker is missing', async () => {
      mockExecAsync.mockImplementation((command: string) => {
        if (command.includes('docker')) {
          return Promise.reject(new Error('Command not found'));
        }
        let stdout = 'version 1.0.0';
        if (command.includes('python --version')) stdout = 'Python 3.11.0';
        if (command.includes('node --version')) stdout = 'v18.17.0';
        return Promise.resolve({ stdout, stderr: '' });
      });

      const result = await service.getSystemHealth();

      expect(result.status).toBe('unhealthy');
      expect(result.docker.ok).toBe(false);
      expect(result.missingDependencies).toContain('docker');
      expect(result.recommendations).toContain('install-pentest-tools');
    });

    it('should return degraded status when 1-2 non-Docker tools are missing', async () => {
      mockExecAsync.mockImplementation((command: string) => {
        if (command.includes('garak') || command.includes('strix')) {
          return Promise.reject(new Error('Command not found'));
        }
        let stdout = 'version 1.0.0';
        if (command.includes('python --version')) stdout = 'Python 3.11.0';
        if (command.includes('node --version')) stdout = 'v18.17.0';
        if (command.includes('docker --version')) stdout = 'Docker version 24.0.0';
        if (command.includes('docker ps')) stdout = 'CONTAINER ID   IMAGE';
        return Promise.resolve({ stdout, stderr: '' });
      });

      const result = await service.getSystemHealth();

      expect(result.status).toBe('degraded');
      expect(result.garak.ok).toBe(false);
      expect(result.strix.ok).toBe(false);
      expect(result.missingDependencies).toContain('garak');
      expect(result.missingDependencies).toContain('strix');
    });

    it('should return unhealthy status when 3+ tools are missing', async () => {
      mockExecAsync.mockImplementation((command: string) => {
        if (
          command.includes('garak') ||
          command.includes('strix') ||
          command.includes('pipx') ||
          command.includes('promptfoo')
        ) {
          return Promise.reject(new Error('Command not found'));
        }
        let stdout = 'version 1.0.0';
        if (command.includes('python --version')) stdout = 'Python 3.11.0';
        if (command.includes('node --version')) stdout = 'v18.17.0';
        if (command.includes('docker --version')) stdout = 'Docker version 24.0.0';
        if (command.includes('docker ps')) stdout = 'CONTAINER ID   IMAGE';
        return Promise.resolve({ stdout, stderr: '' });
      });

      const result = await service.getSystemHealth();

      expect(result.status).toBe('unhealthy');
      expect(result.missingDependencies?.length).toBeGreaterThanOrEqual(3);
    });

    it('should detect Python version below 3.9 as not ok', async () => {
      mockExecAsync.mockImplementation((command: string) => {
        if (command.includes('python --version')) {
          return Promise.resolve({ stdout: 'Python 3.8.10', stderr: '' });
        }
        return Promise.resolve({ stdout: 'version 1.0.0', stderr: '' });
      });

      const result = await service.getSystemHealth();

      expect(result.python.ok).toBe(false);
      expect(result.python.version).toBe('3.8.10');
      expect(result.python.error).toContain('3.9+');
    });

    it('should detect Node.js version below 18 as not ok', async () => {
      mockExecAsync.mockImplementation((command: string) => {
        if (command.includes('node --version')) {
          return Promise.resolve({ stdout: 'v16.20.0', stderr: '' });
        }
        if (command.includes('python --version')) {
          return Promise.resolve({ stdout: 'Python 3.11.0', stderr: '' });
        }
        return Promise.resolve({ stdout: 'version 1.0.0', stderr: '' });
      });

      const result = await service.getSystemHealth();

      expect(result.node.ok).toBe(false);
      expect(result.node.version).toBe('16.20.0');
      expect(result.node.error).toContain('18+');
    });

    it('should detect when Docker daemon is not running', async () => {
      mockExecAsync.mockImplementation((command: string) => {
        if (command.includes('docker --version')) {
          return Promise.resolve({ stdout: 'Docker version 24.0.0', stderr: '' });
        }
        if (command.includes('docker ps')) {
          return Promise.reject(new Error('Cannot connect to Docker daemon'));
        }
        if (command.includes('python --version')) {
          return Promise.resolve({ stdout: 'Python 3.11.0', stderr: '' });
        }
        return Promise.resolve({ stdout: 'version 1.0.0', stderr: '' });
      });

      const result = await service.getSystemHealth();

      expect(result.docker.ok).toBe(false);
      expect(result.docker.error).toContain('daemon is not running');
      expect(result.status).toBe('unhealthy');
    });
  });

  describe('Health Check Caching', () => {
    it('should cache health check results for 30 seconds', async () => {
      // Mock all tools to succeed
      mockExecAsync.mockImplementation((command: string) => {
        let stdout = '';
        if (command.includes('python --version')) stdout = 'Python 3.11.0';
        else if (command.includes('pipx --version')) stdout = '1.2.0';
        else if (command.includes('garak --version')) stdout = '0.9.0';
        else if (command.includes('strix --version')) stdout = '0.1.0';
        else if (command.includes('node --version')) stdout = 'v18.17.0';
        else if (command.includes('npx promptfoo')) stdout = '0.50.0';
        else if (command.includes('docker --version')) stdout = 'Docker version 24.0.0';
        else if (command.includes('docker ps')) stdout = 'CONTAINER ID   IMAGE';

        return Promise.resolve({ stdout, stderr: '' });
      });

      // First call - should execute checks
      const result1 = await service.getSystemHealth();
      const execCallCount1 = mockExecAsync.mock.calls.length;

      // Second call immediately - should return cached result
      const result2 = await service.getSystemHealth();
      const execCallCount2 = mockExecAsync.mock.calls.length;

      // Should not have made additional exec calls
      expect(execCallCount2).toBe(execCallCount1);

      // Results should be identical
      expect(result1.timestamp).toBe(result2.timestamp);
      expect(result1.status).toBe(result2.status);
    });

    it('should refresh cache after 30 seconds', async () => {
      // Mock all tools to succeed
      mockExecAsync.mockImplementation((command: string) => {
        let stdout = '';
        if (command.includes('python --version')) stdout = 'Python 3.11.0';
        else if (command.includes('pipx --version')) stdout = '1.2.0';
        else if (command.includes('garak --version')) stdout = '0.9.0';
        else if (command.includes('strix --version')) stdout = '0.1.0';
        else if (command.includes('node --version')) stdout = 'v18.17.0';
        else if (command.includes('npx promptfoo')) stdout = '0.50.0';
        else if (command.includes('docker --version')) stdout = 'Docker version 24.0.0';
        else if (command.includes('docker ps')) stdout = 'CONTAINER ID   IMAGE';

        return Promise.resolve({ stdout, stderr: '' });
      });

      // First call
      const result1 = await service.getSystemHealth();
      const timestamp1 = result1.timestamp;
      const execCallCount1 = mockExecAsync.mock.calls.length;

      // Manually expire the cache by setting timestamp to past
      (service as any).cacheTimestamp = Date.now() - 31000;

      // Second call - should re-execute checks
      const result2 = await service.getSystemHealth();
      const timestamp2 = result2.timestamp;
      const execCallCount2 = mockExecAsync.mock.calls.length;

      // Should have made new exec calls
      expect(execCallCount2).toBeGreaterThan(execCallCount1);

      // Timestamps should be different
      expect(timestamp2).not.toBe(timestamp1);
    });

    it('should return cached result even if subsequent checks would fail', async () => {
      // Mock all tools to succeed initially
      mockExecAsync.mockImplementation((command: string) => {
        let stdout = '';
        if (command.includes('python --version')) stdout = 'Python 3.11.0';
        else if (command.includes('pipx --version')) stdout = '1.2.0';
        else if (command.includes('garak --version')) stdout = '0.9.0';
        else if (command.includes('strix --version')) stdout = '0.1.0';
        else if (command.includes('node --version')) stdout = 'v18.17.0';
        else if (command.includes('npx promptfoo')) stdout = '0.50.0';
        else if (command.includes('docker --version')) stdout = 'Docker version 24.0.0';
        else if (command.includes('docker ps')) stdout = 'CONTAINER ID   IMAGE';

        return Promise.resolve({ stdout, stderr: '' });
      });

      // First call - all healthy
      const result1 = await service.getSystemHealth();
      expect(result1.status).toBe('healthy');

      // Change mock to simulate tool failure
      mockExecAsync.mockImplementation(() => {
        return Promise.reject(new Error('All tools failed'));
      });

      // Second call within cache window - should return cached healthy result
      const result2 = await service.getSystemHealth();
      expect(result2.status).toBe('healthy'); // Cached from first call
      expect(result2.timestamp).toBe(result1.timestamp);
    });
  });

  describe('Edge Cases', () => {
    it('should handle unparseable version strings gracefully', async () => {
      mockExecAsync.mockImplementation((command: string) => {
        if (command.includes('python --version')) {
          return Promise.resolve({ stdout: 'Python version not found', stderr: '' });
        }
        if (command.includes('docker --version')) {
          return Promise.resolve({ stdout: 'Docker version unknown format', stderr: '' });
        }
        if (command.includes('docker ps')) {
          return Promise.resolve({ stdout: 'CONTAINER ID   IMAGE', stderr: '' });
        }
        return Promise.resolve({ stdout: 'version 1.0.0', stderr: '' });
      });

      const result = await service.getSystemHealth();

      expect(result.python.ok).toBe(false);
      expect(result.python.error).toContain('Could not parse');
    });

    it('should handle stderr output for version commands', async () => {
      mockExecAsync.mockImplementation((command: string) => {
        if (command.includes('garak --version')) {
          // Some tools output version to stderr
          return Promise.resolve({ stdout: '', stderr: 'garak 0.9.0' });
        }
        if (command.includes('python --version')) {
          return Promise.resolve({ stdout: 'Python 3.11.0', stderr: '' });
        }
        if (command.includes('node --version')) {
          return Promise.resolve({ stdout: 'v18.17.0', stderr: '' });
        }
        if (command.includes('docker --version')) {
          return Promise.resolve({ stdout: 'Docker version 24.0.0', stderr: '' });
        }
        if (command.includes('docker ps')) {
          return Promise.resolve({ stdout: 'CONTAINER ID   IMAGE', stderr: '' });
        }
        return Promise.resolve({ stdout: 'version 1.0.0', stderr: '' });
      });

      const result = await service.getSystemHealth();

      expect(result.garak.ok).toBe(true);
      expect(result.garak.version).toContain('0.9.0');
    });

    it('should generate platform-specific recommendations', async () => {
      const originalPlatform = process.platform;

      mockExecAsync.mockImplementation((command: string) => {
        if (command.includes('garak')) {
          return Promise.reject(new Error('Not found'));
        }
        if (command.includes('python --version')) {
          return Promise.resolve({ stdout: 'Python 3.11.0', stderr: '' });
        }
        if (command.includes('node --version')) {
          return Promise.resolve({ stdout: 'v18.17.0', stderr: '' });
        }
        if (command.includes('docker --version')) {
          return Promise.resolve({ stdout: 'Docker version 24.0.0', stderr: '' });
        }
        if (command.includes('docker ps')) {
          return Promise.resolve({ stdout: 'CONTAINER ID   IMAGE', stderr: '' });
        }
        return Promise.resolve({ stdout: 'version 1.0.0', stderr: '' });
      });

      // Test Windows
      Object.defineProperty(process, 'platform', { value: 'win32', writable: true });
      (service as any).healthCache = null; // Clear cache before first call
      const resultWin = await service.getSystemHealth();
      expect(resultWin.recommendations).toContain('.ps1');

      // Test Linux/Mac
      Object.defineProperty(process, 'platform', { value: 'linux', writable: true });
      (service as any).healthCache = null; // Clear cache before second call
      const resultLinux = await service.getSystemHealth();
      expect(resultLinux.recommendations).toContain('.sh');

      // Restore original platform
      Object.defineProperty(process, 'platform', { value: originalPlatform, writable: true });
    });
  });
});
