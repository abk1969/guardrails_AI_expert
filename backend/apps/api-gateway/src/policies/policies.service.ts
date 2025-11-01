import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/database';

@Injectable()
export class PoliciesService {
  constructor(private prisma: PrismaService) {}

  async getAllPolicies() {
    return this.prisma.aIPolicy.findMany({
      orderBy: { reference: 'asc' },
    });
  }
}
