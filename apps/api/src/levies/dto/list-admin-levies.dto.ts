import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';

export class ListAdminLeviesDto {
  @ApiPropertyOptional({ enum: ['draft', 'published', 'closed'] })
  @IsOptional()
  @IsIn(['draft', 'published', 'closed'])
  status?: 'draft' | 'published' | 'closed';
}
