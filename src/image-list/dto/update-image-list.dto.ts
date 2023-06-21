import { PartialType } from '@nestjs/mapped-types';
import { CreateImageListDto } from './create-image-list.dto';

export class UpdateImageListDto extends PartialType(CreateImageListDto) {
    list_name?: string;
    updated_at?: any;
}
