import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNumber, IsPositive, IsString } from 'class-validator';

export class InitializePaymentDto {
  @ApiProperty({
    enum: ['sanitation_levy', 'environmental_fee', 'community_due'],
  })
  @IsIn(['sanitation_levy', 'environmental_fee', 'community_due'])
  paymentType!: 'sanitation_levy' | 'environmental_fee' | 'community_due';

  @ApiProperty({ example: 15000 })
  @IsNumber()
  @IsPositive()
  amount!: number;

  @ApiProperty({ example: 'Q2 sanitation levy' })
  @IsString()
  description!: string;
}
