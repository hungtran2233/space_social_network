import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Message } from './entities/message.entity';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class MessagesService {
    private readonly prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }
    messages: Message[] = [{ name: 'Marius', text: 'heyooo' }];

    clientToUser = {};
    identify(name: string, clientId: string) {
        this.clientToUser[clientId] = name;
        return Object.values(this.clientToUser); // tìm ra ai hiện đang trực tuyến
    }

    getClientName(clientId: string) {
        return this.clientToUser[clientId];
    }

    create(createMessageDto: CreateMessageDto, clientId: string) {
        const message = {
            name: this.clientToUser[clientId],
            text: createMessageDto.text,
        };

        this.messages.push(message);

        return message;
    }

    async findAll() {
        // database: thêm truy vấn vào đây
        // const msg = await this.prisma.msg_message.findFirst({
        //     where: {
        //         message_id: 1,
        //     },
        // });
        // const q = [{ name: msg.sender_id, text: msg.content }];
        // //
        // return q;
        return this.messages;
    }
}
