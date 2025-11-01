import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@app/auth';
import { RisksService } from './risks.service';

@Controller('api/v1/risks')
@UseGuards(JwtAuthGuard)
export class RisksController {
  constructor(private risksService: RisksService) {}

  @Get()
  async getAllRisks() {
    return this.risksService.getAllRisks();
  }
}
