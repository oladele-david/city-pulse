import {
  IsIn,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateIssueDto {
  @ApiProperty({ example: 'drainage' })
  @IsString()
  @IsNotEmpty()
  type!: string;

  @ApiProperty({ example: 'Flooded drainage by community clinic' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    example: 'Blocked drainage channel is overflowing beside the clinic entrance',
  })
  @IsString()
  @MaxLength(500)
  description!: string;

  @ApiProperty({ enum: ['low', 'medium', 'high'] })
  @IsIn(['low', 'medium', 'high'])
  severity!: 'low' | 'medium' | 'high';

  @ApiProperty({ example: 'surulere' })
  @IsString()
  lgaId!: string;

  @ApiProperty({ example: 'adeniran-ogunsanya' })
  @IsString()
  communityId!: string;

  @ApiProperty({ example: 'Clinic Road' })
  @IsString()
  streetOrLandmark!: string;

  @ApiProperty({ example: 6.5001 })
  @IsLatitude()
  latitude!: number;

  @ApiProperty({ example: 3.3525 })
  @IsLongitude()
  longitude!: number;

  @ApiPropertyOptional({ example: 'https://example.com/flood.jpg' })
  @IsOptional()
  @IsUrl()
  photoUrl?: string;
}
