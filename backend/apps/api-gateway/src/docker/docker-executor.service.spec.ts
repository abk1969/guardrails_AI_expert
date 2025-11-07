import { Test, TestingModule } from '@nestjs/testing';
import { DockerExecutorService } from './docker-executor.service';
import { BadRequestException } from '@nestjs/common';
import { ChildProcess } from 'child_process';
import { EventEmitter } from 'events';

// Mock child_process spawn
jest.mock('child_process', () => {
  const actual = jest.requireActual('child_process');
  return {
    ...actual,
    spawn: jest.fn(),
  };
});

import { spawn } from 'child_process';
const mockSpawn = spawn as jest.MockedFunction<typeof spawn>;

describe('DockerExecutorService', () => {
  let service: DockerExecutorService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [DockerExecutorService],
    }).compile();

    service = module.get<DockerExecutorService>(DockerExecutorService);
  });

  describe('validateContainerName', () => {
    it('should accept valid container names', () => {
      const validNames = [
        'airiskmgr-garak-runner',
        'my-container',
        'container123',
        'test_container',
      ];

      validNames.forEach((name) => {
        expect(() => (service as any).validateContainerName(name)).not.toThrow();
      });
    });

    it('should reject container names with command injection attempts', () => {
      const invalidNames = [
        'container; rm -rf /',
        'container && malicious',
        'container | cat /etc/passwd',
        'container`whoami`',
        'container$(whoami)',
      ];

      invalidNames.forEach((name) => {
        expect(() => (service as any).validateContainerName(name)).toThrow(BadRequestException);
        expect(() => (service as any).validateContainerName(name)).toThrow(
          'Invalid container name',
        );
      });
    });

    it('should reject container names with special shell characters', () => {
      const invalidNames = ['container$test', 'container>output', 'container<input', 'container&bg'];

      invalidNames.forEach((name) => {
        expect(() => (service as any).validateContainerName(name)).toThrow(BadRequestException);
      });
    });

    it('should reject empty or whitespace-only container names', () => {
      expect(() => (service as any).validateContainerName('')).toThrow(BadRequestException);
      expect(() => (service as any).validateContainerName('   ')).toThrow(BadRequestException);
    });

    it('should reject container names that are too long', () => {
      const longName = 'a'.repeat(256);
      expect(() => (service as any).validateContainerName(longName)).toThrow(BadRequestException);
      expect(() => (service as any).validateContainerName(longName)).toThrow(
        'Container name too long',
      );
    });
  });

  describe('validateFilePath', () => {
    it('should accept valid file paths', () => {
      const validPaths = [
        '/app/data/file.txt',
        '/var/log/app.log',
        'relative/path/file.json',
        './local/file.yaml',
      ];

      validPaths.forEach((path) => {
        expect(() => (service as any).validateFilePath(path)).not.toThrow();
      });
    });

    it('should reject paths with path traversal attempts', () => {
      const invalidPaths = [
        '../../../etc/passwd',
        '/app/../../../etc/shadow',
        '..\\..\\windows\\system32',
        '/app/data/../../secret.key',
      ];

      invalidPaths.forEach((path) => {
        expect(() => (service as any).validateFilePath(path)).toThrow(BadRequestException);
        expect(() => (service as any).validateFilePath(path)).toThrow('Invalid file path');
      });
    });

    it('should reject paths with null bytes', () => {
      expect(() => (service as any).validateFilePath('/app/file\x00.txt')).toThrow(
        BadRequestException,
      );
    });

    it('should reject empty paths', () => {
      expect(() => (service as any).validateFilePath('')).toThrow(BadRequestException);
    });
  });

  describe('executeInContainer', () => {
    it('should validate container name before executing', () => {
      const mockProcess = new EventEmitter() as ChildProcess;
      mockSpawn.mockReturnValue(mockProcess);

      expect(() =>
        service.executeInContainer('container; rm -rf /', ['ls']),
      ).toThrow(BadRequestException);
      expect(mockSpawn).not.toHaveBeenCalled();
    });

    it('should spawn docker exec with correct arguments', () => {
      const mockProcess = new EventEmitter() as ChildProcess;
      mockProcess.stdout = new EventEmitter() as any;
      mockProcess.stderr = new EventEmitter() as any;
      mockSpawn.mockReturnValue(mockProcess);

      service.executeInContainer('my-container', ['ls', '-la'], {
        workingDir: '/app',
        user: 'appuser',
        env: { NODE_ENV: 'production' },
      });

      expect(mockSpawn).toHaveBeenCalledWith(
        'docker',
        [
          'exec',
          '-w',
          '/app',
          '-u',
          'appuser',
          '-e',
          'NODE_ENV=production',
          '-i',
          'my-container',
          'ls',
          '-la',
        ],
        { stdio: ['pipe', 'pipe', 'pipe'] },
      );
    });
  });

  describe('isDockerAvailable', () => {
    it('should return true when docker --version succeeds', async () => {
      const mockProcess = new EventEmitter() as ChildProcess;
      mockSpawn.mockReturnValue(mockProcess);

      const promise = service.isDockerAvailable();

      // Simulate successful close
      setImmediate(() => mockProcess.emit('close', 0));

      const result = await promise;
      expect(result).toBe(true);
      expect(mockSpawn).toHaveBeenCalledWith('docker', ['--version']);
    });

    it('should return false when docker --version fails', async () => {
      const mockProcess = new EventEmitter() as ChildProcess;
      mockSpawn.mockReturnValue(mockProcess);

      const promise = service.isDockerAvailable();

      // Simulate failure
      setImmediate(() => mockProcess.emit('close', 1));

      const result = await promise;
      expect(result).toBe(false);
    });

    it('should return false when docker command not found', async () => {
      const mockProcess = new EventEmitter() as ChildProcess;
      mockSpawn.mockReturnValue(mockProcess);

      const promise = service.isDockerAvailable();

      // Simulate error (command not found)
      setImmediate(() => mockProcess.emit('error', new Error('ENOENT')));

      const result = await promise;
      expect(result).toBe(false);
    });
  });

  describe('isContainerRunning', () => {
    it('should validate container name before checking', async () => {
      await expect(service.isContainerRunning('invalid; container')).rejects.toThrow(
        BadRequestException,
      );
      expect(mockSpawn).not.toHaveBeenCalled();
    });

    it('should return true when container is running', async () => {
      const mockProcess = new EventEmitter() as ChildProcess;
      mockProcess.stdout = new EventEmitter() as any;
      mockSpawn.mockReturnValue(mockProcess);

      const promise = service.isContainerRunning('my-container');

      // Simulate docker inspect output
      setImmediate(() => {
        (mockProcess.stdout as any).emit('data', Buffer.from('true\n'));
        mockProcess.emit('close', 0);
      });

      const result = await promise;
      expect(result).toBe(true);
    });

    it('should return false when container is not running', async () => {
      const mockProcess = new EventEmitter() as ChildProcess;
      mockProcess.stdout = new EventEmitter() as any;
      mockSpawn.mockReturnValue(mockProcess);

      const promise = service.isContainerRunning('my-container');

      setImmediate(() => {
        (mockProcess.stdout as any).emit('data', Buffer.from('false\n'));
        mockProcess.emit('close', 0);
      });

      const result = await promise;
      expect(result).toBe(false);
    });

    it('should return false when container does not exist', async () => {
      const mockProcess = new EventEmitter() as ChildProcess;
      mockProcess.stdout = new EventEmitter() as any;
      mockSpawn.mockReturnValue(mockProcess);

      const promise = service.isContainerRunning('non-existent');

      // Simulate command failure (container not found)
      setImmediate(() => mockProcess.emit('close', 1));

      const result = await promise;
      expect(result).toBe(false);
    });
  });

  describe('copyFromContainer', () => {
    it('should validate container name and paths before copying', async () => {
      await expect(
        service.copyFromContainer('invalid; container', '/app/file.txt', '/host/file.txt'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject path traversal in container path', async () => {
      await expect(
        service.copyFromContainer('my-container', '../../../etc/passwd', '/host/file.txt'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject path traversal in host path', async () => {
      await expect(
        service.copyFromContainer('my-container', '/app/file.txt', '../../../host/file.txt'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('copyToContainer', () => {
    it('should validate paths before copying', async () => {
      await expect(
        service.copyToContainer('../../../etc/passwd', 'my-container', '/app/file.txt'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getContainerLogs', () => {
    it('should validate container name before getting logs', async () => {
      await expect(service.getContainerLogs('invalid; container')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should limit tail parameter to prevent resource exhaustion', async () => {
      const mockProcess = new EventEmitter() as ChildProcess;
      mockProcess.stdout = new EventEmitter() as any;
      mockProcess.stderr = new EventEmitter() as any;
      mockSpawn.mockReturnValue(mockProcess);

      const promise = service.getContainerLogs('my-container', 100000);

      setImmediate(() => {
        (mockProcess.stdout as any).emit('data', Buffer.from('log line\n'));
        mockProcess.emit('close', 0);
      });

      await promise;

      // Should cap tail to max allowed value (e.g., 10000)
      expect(mockSpawn).toHaveBeenCalledWith('docker', ['logs', '--tail', '10000', 'my-container']);
    });
  });
});
