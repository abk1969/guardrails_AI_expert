import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class GitHubSyncService {
  private readonly logger = new Logger(GitHubSyncService.name);

  constructor(
    @InjectQueue('github-sync') private readonly syncQueue: Queue,
  ) {}

  async queueSync(payload: {
    tool: string;
    version: string;
    repositoryUrl: string;
    commitSha: string;
  }) {
    this.logger.log(`Queueing sync for ${payload.tool} v${payload.version}`);

    const job = await this.syncQueue.add('sync', payload, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: 100,
      removeOnFail: false,
    });

    return {
      jobId: job.id,
      status: 'queued',
      tool: payload.tool,
      version: payload.version,
    };
  }

  async getJobStatus(jobId: string) {
    const job = await this.syncQueue.getJob(jobId);

    if (!job) {
      return { status: 'not_found' };
    }

    const state = await job.getState();
    const progress = job.progress();

    return {
      jobId: job.id,
      status: state,
      progress,
      data: job.data,
      finishedOn: job.finishedOn,
      failedReason: job.failedReason,
    };
  }
}
