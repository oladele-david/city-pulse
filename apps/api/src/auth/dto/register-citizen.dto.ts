import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterCitizenDto {
  @ApiProperty({ example: 'Aisha Bello' })
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @ApiProperty({ example: 'aisha@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'StrongPass123!' })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: 'ikeja' })
  @IsString()
  @IsNotEmpty()
  lgaId!: string;

  @ApiProperty({ example: 'alausa' })
  @IsString()
  @IsNotEmpty()
  communityId!: string;

  @ApiProperty({ example: 'Obafemi Awolowo Way' })
  @IsString()
  @IsNotEmpty()
  streetOrArea!: string;
}
