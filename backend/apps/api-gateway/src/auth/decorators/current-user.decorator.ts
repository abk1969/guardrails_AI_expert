import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    // For development/testing, return a mock user if no user is present
    // Using actual seed data IDs from database (Demo Organization + admin user)
    if (!request.user) {
      return {
        id: '81976246-23f4-465c-bd1f-0b42c492a204', // admin@demo.airiskmgr.com from seed data
        email: 'admin@demo.airiskmgr.com',
        organizationId: '0872cd2b-4b4c-41a6-b505-799671a44daa', // Demo Organization from seed data
      };
    }

    return request.user;
  },
);
