import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@app/auth';
import { PoliciesService } from './policies.service';

@Controller('api/v1/policies')
@UseGuards(JwtAuthGuard)
export class PoliciesController {
  constructor(private policiesService: PoliciesService) {}

  @Get()
  async getAllPolicies() {
    return this.policiesService.getAllPolicies();
  }
}
