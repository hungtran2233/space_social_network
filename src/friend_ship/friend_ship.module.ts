import { Module } from '@nestjs/common';
import { FriendShipService } from './friend_ship.service';
import { FriendShipController } from './friend_ship.controller';

@Module({
  controllers: [FriendShipController],
  providers: [FriendShipService]
})
export class FriendShipModule {}
