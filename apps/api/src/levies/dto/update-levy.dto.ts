import { PartialType } from '@nestjs/swagger';
import { CreateLevyDto } from './create-levy.dto';

export class UpdateLevyDto extends PartialType(CreateLevyDto) {}
