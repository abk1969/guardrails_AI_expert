import { Injectable, BadRequestException } from '@nestjs/common';

export interface SemverVersion {
  major: number;
  minor: number;
  patch: number;
  prerelease?: string;
  buildMetadata?: string;
  raw: string;
}

@Injectable()
export class SemverParser {
  private readonly SEMVER_REGEX =
    /^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

  parse(versionString: string): SemverVersion {
    const match = versionString.match(this.SEMVER_REGEX);

    if (!match) {
      throw new BadRequestException(`Invalid semver version: ${versionString}`);
    }

    const [, major, minor, patch, prerelease, buildMetadata] = match;

    return {
      major: parseInt(major, 10),
      minor: parseInt(minor, 10),
      patch: parseInt(patch, 10),
      prerelease,
      buildMetadata,
      raw: versionString,
    };
  }

  compare(v1: SemverVersion, v2: SemverVersion): number {
    // Compare major
    if (v1.major !== v2.major) {
      return v1.major - v2.major;
    }

    // Compare minor
    if (v1.minor !== v2.minor) {
      return v1.minor - v2.minor;
    }

    // Compare patch
    if (v1.patch !== v2.patch) {
      return v1.patch - v2.patch;
    }

    // Compare prerelease
    if (v1.prerelease && !v2.prerelease) {
      return -1; // prerelease versions have lower precedence
    }

    if (!v1.prerelease && v2.prerelease) {
      return 1;
    }

    if (v1.prerelease && v2.prerelease) {
      return v1.prerelease.localeCompare(v2.prerelease);
    }

    // Versions are equal
    return 0;
  }

  isValid(versionString: string): boolean {
    try {
      this.parse(versionString);
      return true;
    } catch {
      return false;
    }
  }

  satisfies(version: SemverVersion, range: string): boolean {
    // Simple range matching (supports ^, ~, >, <, >=, <=, =)
    if (range.startsWith('^')) {
      // Compatible with version (same major)
      const targetVersion = this.parse(range.slice(1));
      return (
        version.major === targetVersion.major &&
        this.compare(version, targetVersion) >= 0
      );
    }

    if (range.startsWith('~')) {
      // Approximately equivalent (same major and minor)
      const targetVersion = this.parse(range.slice(1));
      return (
        version.major === targetVersion.major &&
        version.minor === targetVersion.minor &&
        this.compare(version, targetVersion) >= 0
      );
    }

    if (range.startsWith('>=')) {
      const targetVersion = this.parse(range.slice(2));
      return this.compare(version, targetVersion) >= 0;
    }

    if (range.startsWith('<=')) {
      const targetVersion = this.parse(range.slice(2));
      return this.compare(version, targetVersion) <= 0;
    }

    if (range.startsWith('>')) {
      const targetVersion = this.parse(range.slice(1));
      return this.compare(version, targetVersion) > 0;
    }

    if (range.startsWith('<')) {
      const targetVersion = this.parse(range.slice(1));
      return this.compare(version, targetVersion) < 0;
    }

    // Exact match
    const targetVersion = this.parse(range);
    return this.compare(version, targetVersion) === 0;
  }

  increment(version: SemverVersion, type: 'major' | 'minor' | 'patch'): SemverVersion {
    switch (type) {
      case 'major':
        return {
          ...version,
          major: version.major + 1,
          minor: 0,
          patch: 0,
          prerelease: undefined,
          raw: `${version.major + 1}.0.0`,
        };

      case 'minor':
        return {
          ...version,
          minor: version.minor + 1,
          patch: 0,
          prerelease: undefined,
          raw: `${version.major}.${version.minor + 1}.0`,
        };

      case 'patch':
        return {
          ...version,
          patch: version.patch + 1,
          prerelease: undefined,
          raw: `${version.major}.${version.minor}.${version.patch + 1}`,
        };
    }
  }
}
