import { PartialType } from '@nestjs/mapped-types';
import { CreateFriendShipDto } from './create-friend_ship.dto';

export class UpdateFriendShipDto extends PartialType(CreateFriendShipDto) {}
