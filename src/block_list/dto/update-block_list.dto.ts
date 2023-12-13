import { PartialType } from '@nestjs/swagger';
import { CreateBlockListDto } from './create-block_list.dto';

export class UpdateBlockListDto extends PartialType(CreateBlockListDto) {}
