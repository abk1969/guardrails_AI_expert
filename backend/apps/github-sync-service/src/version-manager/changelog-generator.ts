import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

type ToolName = 'promptfoo' | 'garak';

interface ChangelogEntry {
  version: string;
  date: string;
  commits: Array<{
    type: string;
    scope?: string;
    subject: string;
    hash: string;
    author: string;
  }>;
}

@Injectable()
export class ChangelogGenerator {
  private readonly logger = new Logger(ChangelogGenerator.name);
  private readonly changelogDir = '/tmp/changelogs';

  constructor() {
    this.ensureChangelogDir();
  }

  private async ensureChangelogDir(): Promise<void> {
    try {
      await fs.mkdir(this.changelogDir, { recursive: true });
    } catch (error) {
      this.logger.error(`Failed to create changelog directory: ${error.message}`);
    }
  }

  async generate(
    tool: ToolName,
    version: string,
    commits: Array<{ id: string; message: string; timestamp: string; author: { name: string; email: string } }>,
  ): Promise<void> {
    this.logger.log(`Generating changelog for ${tool} v${version}`);

    const parsedCommits = commits.map(commit => this.parseCommit(commit));

    const entry: ChangelogEntry = {
      version,
      date: new Date().toISOString().split('T')[0],
      commits: parsedCommits,
    };

    const changelogPath = path.join(this.changelogDir, `${tool}-CHANGELOG.md`);

    // Read existing changelog
    let existingContent = '';
    try {
      existingContent = await fs.readFile(changelogPath, 'utf-8');
    } catch {
      // File doesn't exist yet, create header
      existingContent = `# Changelog - ${tool}\n\nAll notable changes to this project will be documented in this file.\n\n`;
    }

    // Generate new entry
    const newEntry = this.formatEntry(entry);

    // Insert new entry after header
    const lines = existingContent.split('\n');
    const headerEndIndex = lines.findIndex(line => line.startsWith('## '));
    if (headerEndIndex === -1) {
      // No previous entries
      existingContent += `\n${newEntry}`;
    } else {
      // Insert before first existing entry
      lines.splice(headerEndIndex, 0, newEntry);
      existingContent = lines.join('\n');
    }

    // Write updated changelog
    await fs.writeFile(changelogPath, existingContent, 'utf-8');

    this.logger.log(`✅ Changelog updated for ${tool} v${version}`);
  }

  private parseCommit(commit: {
    id: string;
    message: string;
    author: { name: string; email: string };
  }): { type: string; scope?: string; subject: string; hash: string; author: string } {
    // Parse conventional commit format: type(scope): subject
    const conventionalCommitRegex = /^(\w+)(?:\(([^)]+)\))?: (.+)$/;
    const match = commit.message.match(conventionalCommitRegex);

    if (match) {
      const [, type, scope, subject] = match;
      return {
        type,
        scope,
        subject,
        hash: commit.id.substring(0, 7),
        author: commit.author.name,
      };
    }

    // Fallback: treat as generic commit
    return {
      type: 'other',
      subject: commit.message,
      hash: commit.id.substring(0, 7),
      author: commit.author.name,
    };
  }

  private formatEntry(entry: ChangelogEntry): string {
    let markdown = `## [${entry.version}] - ${entry.date}\n\n`;

    // Group commits by type
    const groupedCommits = this.groupCommitsByType(entry.commits);

    // Order: feat, fix, perf, refactor, docs, test, chore, other
    const typeOrder = ['feat', 'fix', 'perf', 'refactor', 'docs', 'test', 'chore', 'other'];
    const typeLabels = {
      feat: '### ✨ Features',
      fix: '### 🐛 Bug Fixes',
      perf: '### ⚡ Performance',
      refactor: '### ♻️ Refactoring',
      docs: '### 📝 Documentation',
      test: '### ✅ Tests',
      chore: '### 🔧 Chores',
      other: '### 📦 Other Changes',
    };

    for (const type of typeOrder) {
      const commits = groupedCommits.get(type);
      if (commits && commits.length > 0) {
        markdown += `${typeLabels[type]}\n\n`;

        for (const commit of commits) {
          const scope = commit.scope ? `**${commit.scope}**: ` : '';
          markdown += `- ${scope}${commit.subject} (${commit.hash})\n`;
        }

        markdown += '\n';
      }
    }

    return markdown;
  }

  private groupCommitsByType(
    commits: Array<{ type: string; scope?: string; subject: string; hash: string; author: string }>,
  ): Map<string, typeof commits> {
    const grouped = new Map<string, typeof commits>();

    for (const commit of commits) {
      if (!grouped.has(commit.type)) {
        grouped.set(commit.type, []);
      }
      grouped.get(commit.type)!.push(commit);
    }

    return grouped;
  }

  async getChangelog(tool: ToolName): Promise<string> {
    const changelogPath = path.join(this.changelogDir, `${tool}-CHANGELOG.md`);

    try {
      return await fs.readFile(changelogPath, 'utf-8');
    } catch {
      return `# Changelog - ${tool}\n\nNo changelog available yet.\n`;
    }
  }
}
