import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    full_name?: string;
    age?: number;
    cover_image?: string;
    gender?: string;
    country?: string;
    study_at?: string;
    working_at?: string;
    favorites?: string;
}
