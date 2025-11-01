import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { BullModule } from '@nestjs/bull';
import { redisStore } from 'cache-manager-redis-yet';

// Shared libraries
import { DatabaseModule } from '@app/database';
import { AuthModule } from '@app/auth';
import { CommonModule } from '@app/common';

// Controllers
import { AppController } from './app.controller';

// Feature modules
import { TestsModule } from './tests/tests.module';
import { PoliciesModule } from './policies/policies.module';
import { RisksModule } from './risks/risks.module';
import { UsersModule } from './users/users.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { McpModule } from './mcp/mcp.module';
import { GeminiModule } from './gemini/gemini.module';
import { PromptfooModule } from './promptfoo/promptfoo.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database
    DatabaseModule,

    // Redis Cache
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
          socket: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
          },
          password: process.env.REDIS_PASSWORD,
          ttl: 3600 * 1000, // 1 hour default
        }),
      }),
    }),

    // Queue
    BullModule.forRootAsync({
      useFactory: () => ({
        redis: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
          password: process.env.REDIS_PASSWORD,
        },
      }),
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.THROTTLE_TTL || '60000'),
        limit: parseInt(process.env.THROTTLE_LIMIT || '100'),
      },
    ]),

    // Shared modules
    CommonModule,
    AuthModule,

    // Feature modules
    TestsModule,
    PoliciesModule,
    RisksModule,
    UsersModule,
    AnalyticsModule,
    McpModule,
    GeminiModule,
    PromptfooModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
