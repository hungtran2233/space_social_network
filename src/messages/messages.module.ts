import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesGateway } from './messages.gateway';
import { JwtStrategy } from 'src/strategy/jwt.strategy';

@Module({
    providers: [MessagesGateway, JwtStrategy, MessagesService],
})
export class MessagesModule {}
