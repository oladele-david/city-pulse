import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class ListIssuesQueryDto {
  @ApiPropertyOptional({ example: 'ikeja' })
  @IsOptional()
  @IsString()
  lgaId?: string;

  @ApiPropertyOptional({ example: 'alausa' })
  @IsOptional()
  @IsString()
  communityId?: string;

  @ApiPropertyOptional({ enum: ['open', 'in_progress', 'resolved'] })
  @IsOptional()
  @IsIn(['open', 'in_progress', 'resolved'])
  status?: 'open' | 'in_progress' | 'resolved';

  @ApiPropertyOptional({ enum: ['low', 'medium', 'high'] })
  @IsOptional()
  @IsIn(['low', 'medium', 'high'])
  severity?: 'low' | 'medium' | 'high';
}
