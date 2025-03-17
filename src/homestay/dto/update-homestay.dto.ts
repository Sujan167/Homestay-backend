import { PartialType } from '@nestjs/mapped-types';
import { CreateHomestayDto } from './create-homestay.dto';

export class UpdateHomestayDto extends PartialType(CreateHomestayDto) {}
