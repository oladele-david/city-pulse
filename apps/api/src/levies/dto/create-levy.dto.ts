import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateLevyDto {
  @ApiProperty({ example: 'Quarterly sanitation levy' })
  @IsString()
  @MaxLength(120)
  title!: string;

  @ApiProperty({ example: 'Community cleaning contribution for Q2.' })
  @IsString()
  @MaxLength(1000)
  description!: string;

  @ApiProperty({
    enum: ['sanitation_levy', 'environmental_fee', 'community_due'],
  })
  @IsIn(['sanitation_levy', 'environmental_fee', 'community_due'])
  levyType!: 'sanitation_levy' | 'environmental_fee' | 'community_due';

  @ApiProperty({ example: 15000 })
  @IsNumber()
  @IsPositive()
  amount!: number;

  @ApiProperty({ example: '2026-04-30T00:00:00.000Z' })
  @IsDateString()
  dueDate!: string;

  @ApiProperty({ enum: ['community', 'lga'] })
  @IsIn(['community', 'lga'])
  targetType!: 'community' | 'lga';

  @ApiPropertyOptional({ example: 'adeniran-ogunsanya' })
  @IsOptional()
  @IsString()
  targetCommunityId?: string;

  @ApiPropertyOptional({ example: 'surulere' })
  @IsOptional()
  @IsString()
  targetLgaId?: string;
}
