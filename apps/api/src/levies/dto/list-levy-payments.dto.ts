import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';

export class ListLevyPaymentsDto {
  @ApiPropertyOptional({ enum: ['pending', 'initialized', 'succeeded', 'failed'] })
  @IsOptional()
  @IsIn(['pending', 'initialized', 'succeeded', 'failed'])
  status?: 'pending' | 'initialized' | 'succeeded' | 'failed';
}
