import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@app/database';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'your-secret-key-change-in-production',
    });
  }

  async validate(payload: any) {
    // Payload contains: { sub: userId, email, role, organizationId }
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        organizationId: true,
        deletedAt: true,
        organization: true,
      },
    });

    if (!user || user.deletedAt) {
      throw new UnauthorizedException('User not found or deleted');
    }

    // Return user object that will be attached to request.user
    return {
      id: user.id,
      email: user.email,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
      role: user.role,
      organizationId: user.organizationId,
      organization: user.organization,
    };
  }
}
