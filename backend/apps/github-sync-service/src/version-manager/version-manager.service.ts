import { Injectable, Logger } from '@nestjs/common';
import { SemverParser } from './semver-parser';
import { ChangelogGenerator } from './changelog-generator';

type ToolName = 'promptfoo' | 'garak';

interface VersionInfo {
  tool: ToolName;
  version: string;
  major: number;
  minor: number;
  patch: number;
  prerelease?: string;
  buildMetadata?: string;
  deployedAt: Date;
}

@Injectable()
export class VersionManagerService {
  private readonly logger = new Logger(VersionManagerService.name);
  private readonly versions: Map<ToolName, VersionInfo[]> = new Map();

  constructor(
    private readonly semverParser: SemverParser,
    private readonly changelogGenerator: ChangelogGenerator,
  ) {}

  async registerVersion(
    tool: ToolName,
    versionString: string,
    commits: Array<{ id: string; message: string; timestamp: string; author: { name: string; email: string } }>,
  ): Promise<VersionInfo> {
    this.logger.log(`Registering version ${versionString} for ${tool}`);

    // Parse version
    const parsed = this.semverParser.parse(versionString);

    const versionInfo: VersionInfo = {
      tool,
      version: versionString,
      major: parsed.major,
      minor: parsed.minor,
      patch: parsed.patch,
      prerelease: parsed.prerelease,
      buildMetadata: parsed.buildMetadata,
      deployedAt: new Date(),
    };

    // Store version
    if (!this.versions.has(tool)) {
      this.versions.set(tool, []);
    }

    this.versions.get(tool)!.push(versionInfo);

    // Keep only last 10 versions
    const toolVersions = this.versions.get(tool)!;
    if (toolVersions.length > 10) {
      toolVersions.shift();
    }

    // Generate changelog
    await this.changelogGenerator.generate(tool, versionString, commits);

    return versionInfo;
  }

  getCurrentVersion(tool: ToolName): VersionInfo | null {
    const toolVersions = this.versions.get(tool);
    if (!toolVersions || toolVersions.length === 0) {
      return null;
    }

    return toolVersions[toolVersions.length - 1];
  }

  getPreviousVersion(tool: ToolName): VersionInfo | null {
    const toolVersions = this.versions.get(tool);
    if (!toolVersions || toolVersions.length < 2) {
      return null;
    }

    return toolVersions[toolVersions.length - 2];
  }

  getVersionHistory(tool: ToolName): VersionInfo[] {
    return this.versions.get(tool) || [];
  }

  compareVersions(version1: string, version2: string): number {
    const v1 = this.semverParser.parse(version1);
    const v2 = this.semverParser.parse(version2);

    return this.semverParser.compare(v1, v2);
  }
}
