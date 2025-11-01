import { TestStatus } from '@prisma/client';

export class TestResultDto {
  id: string;
  testRunId: string;
  promptId: string;
  promptText: string;
  promptCategory: string;
  promptComplexity: string;
  response?: string | null;
  responseTime?: number | null;
  status: TestStatus;
  score: number;
  explanation?: string | null;
  evaluationChain: any;
  remediation?: string | null;
  metadata?: any | null;
  createdAt: Date;
}

export class TestResultsResponseDto {
  results: TestResultDto[];
  total: number;
  page: number;
  pageSize: number;
}
