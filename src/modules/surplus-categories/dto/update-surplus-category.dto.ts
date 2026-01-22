import { PartialType } from '@nestjs/mapped-types';
import { CreateSurplusCategoryDto } from './create-surplus-category.dto';

export class UpdateSurplusCategoryDto extends PartialType(CreateSurplusCategoryDto) {}
