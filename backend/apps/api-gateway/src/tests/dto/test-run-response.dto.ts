import { TestRunStatus } from '@prisma/client';

export class TestRunResponseDto {
  id: string;
  organizationId: string;
  createdById: string;
  targetId: string;
  status: TestRunStatus;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  blockedTests: number;
  startedAt: Date;
  completedAt?: Date | null;
  configuration: any;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}
