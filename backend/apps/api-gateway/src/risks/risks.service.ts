import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/database';

@Injectable()
export class RisksService {
  constructor(private prisma: PrismaService) {}

  async getAllRisks() {
    return this.prisma.useCase.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
