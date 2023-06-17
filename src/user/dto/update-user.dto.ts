import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    pass_word?: string;
    full_name?: string;
    age?: number;
    avatar?: string;
    gender?: string;
    country?: string;
}
