import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsLatitude, IsLongitude, IsOptional, IsString } from 'class-validator';

export class ResolveLocationDto {
  @ApiProperty({ example: 6.6212 })
  @IsLatitude()
  latitude!: number;

  @ApiProperty({ example: 3.3579 })
  @IsLongitude()
  longitude!: number;

  @ApiPropertyOptional({ example: 'Alausa Secretariat Road' })
  @IsOptional()
  @IsString()
  street?: string;
}
