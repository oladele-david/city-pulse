import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsObject, IsOptional, IsString } from 'class-validator';

export class PaymentWebhookDto {
  @ApiProperty({ example: 'evt-1' })
  @IsString()
  eventId!: string;

  @ApiProperty({ example: 'CP-1234567890' })
  @IsString()
  reference!: string;

  @ApiProperty({ enum: ['succeeded', 'failed'] })
  @IsIn(['succeeded', 'failed'])
  status!: 'succeeded' | 'failed';

  @ApiPropertyOptional({ example: 'isw-123' })
  @IsOptional()
  @IsString()
  providerReference?: string;

  @ApiPropertyOptional({ type: 'object' })
  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;
}
