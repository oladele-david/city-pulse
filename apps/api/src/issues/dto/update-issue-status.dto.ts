import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class UpdateIssueStatusDto {
  @ApiProperty({ enum: ['open', 'in_progress', 'resolved'] })
  @IsIn(['open', 'in_progress', 'resolved'])
  status!: 'open' | 'in_progress' | 'resolved';
}
