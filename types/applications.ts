// Application profile and testing session types

export type ApplicationArchitecture =
  | 'llm-chatbot'
  | 'rag'
  | 'agentic-rag'
  | 'text-to-speech'
  | 'text-to-video'
  | 'video-to-text'
  | 'speech-to-text'
  | 'complex-pipeline'
  | 'code-generation'
  | 'other';

export type TestMode = 'blackbox' | 'whitebox';

export type AuthenticationType =
  | 'none'
  | 'api-key'
  | 'bearer-token'
  | 'oauth'
  | 'basic-auth'
  | 'custom-header';

export type InputOutputType =
  | 'text'
  | 'audio'
  | 'video'
  | 'image'
  | 'multimodal';

export interface ApplicationEndpoint {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH';
  headers?: Record<string, string>;
  bodyTemplate?: string;
  responseField?: string;
}

export interface ApplicationAuthentication {
  type: AuthenticationType;
  credentials?: {
    apiKey?: string;
    token?: string;
    username?: string;
    password?: string;
    customHeaders?: Record<string, string>;
  };
  isEncrypted?: boolean;
}

export interface ApplicationTestability {
  promptfooCompatible: boolean;
  requiresCustomTest: boolean;
  inputType: InputOutputType;
  outputType: InputOutputType;
  limitations?: string[];
  estimatedTestDuration?: number;
}

export interface ApplicationSafetyConfig {
  maxRequestsPerMinute?: number;
  maxTestsPerSession?: number;
  allowedPlugins?: string[];
  dangerousPlugins?: string[];
  requiresConfirmation?: boolean;
  productionEnvironment?: boolean;
}

export interface ApplicationProfile {
  id: string;
  name: string;
  description?: string;
  architecture: ApplicationArchitecture;
  testMode: TestMode;
  endpoint: ApplicationEndpoint;
  authentication?: ApplicationAuthentication;
  testability: ApplicationTestability;
  safetyConfig: ApplicationSafetyConfig;
  owner?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  lastTestedAt?: string;
  testCount?: number;
}

export interface ApplicationTestSession {
  id: string;
  applicationId: string;
  applicationName: string;
  startedAt: string;
  completedAt?: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  testType: 'promptfoo' | 'custom-multimodal' | 'manual';
  promptfooConfig?: string;
  results?: {
    totalTests: number;
    passed: number;
    failed: number;
    score?: number;
    duration?: number;
    outputPath?: string;
  };
  logs: string[];
  warnings: string[];
  errors: string[];
}
