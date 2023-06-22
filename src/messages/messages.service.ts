import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Message } from './entities/message.entity';

@Injectable()
export class MessagesService {
    messages: Message[] = [{ name: 'Marius', text: 'heyooo' }];

    clientToUser = {};
    identify(name: string, clientId: string) {
        this.clientToUser[clientId] = name;
        return Object.values(this.clientToUser); // tìm ra ai hiện đang trực tuyến
    }

    getClientName(clientId: string) {
        return this.clientToUser[clientId];
    }

    create(createMessageDto: CreateMessageDto) {
        const message = { ...createMessageDto };

        this.messages.push(createMessageDto);

        return message;
    }

    findAll() {
        // database: thêm truy vấn vào đây

        //
        return this.messages;
    }
}
