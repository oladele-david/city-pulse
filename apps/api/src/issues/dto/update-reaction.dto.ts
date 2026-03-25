import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class UpdateReactionDto {
  @ApiProperty({ enum: ['confirm', 'disagree', 'fixed_signal', 'none'] })
  @IsIn(['confirm', 'disagree', 'fixed_signal', 'none'])
  reaction!: 'confirm' | 'disagree' | 'fixed_signal' | 'none';
}
