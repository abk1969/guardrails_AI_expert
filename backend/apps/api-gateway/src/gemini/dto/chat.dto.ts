import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ChatDto {
  @ApiProperty({
    description: 'User message to send to Gemini',
    example: 'Comment améliorer la sécurité de mon système AI?',
  })
  @IsString()
  message: string;

  @ApiPropertyOptional({
    description: 'Additional context for the chat (optional)',
    example: { testResults: [], currentModule: 'dashboard' },
  })
  @IsOptional()
  @IsObject()
  context?: any;
}
