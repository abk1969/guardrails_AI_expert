import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@app/database';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        firstName: true,
        lastName: true,
        role: true,
        organizationId: true,
        deletedAt: true,
        organization: true,
        isActive: true,
        emailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found');
    }

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
