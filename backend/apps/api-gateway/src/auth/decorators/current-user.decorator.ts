import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    // For development/testing, return a mock user if no user is present
    if (!request.user) {
      return {
        id: 'dev-user-id',
        email: 'dev@example.com',
        organizationId: 'dev-org-id',
      };
    }

    return request.user;
  },
);
