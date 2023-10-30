import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Message } from './entities/message.entity';
import { PrismaClient } from '@prisma/client';
import { Socket } from 'socket.io';

@Injectable()
export class MessagesService {
    prisma = new PrismaClient();

    clientToUser = {}; // cấu trúc dữ liệu để lưu lại clientName và clientId

    ///////////////
    private messages: any[] = [];

    identify(name: string, clientId: string) {
        // ánh xạ từ id thành name
        this.clientToUser[clientId] = name;
        // tìm ra ai hiện đang trực tuyến (tên của người đó)
        return Object.values(this.clientToUser);
    }

    //
    getClientName(clientId: string) {
        return this.clientToUser[clientId];
    }

    // Tạo tin nhắn
    async create(createMessageDto: CreateMessageDto, client: Socket) {
        return '';
    }

    // Tìm tin nhắn cũ
    async findAllMessages(conversationId: number) {
        return this.prisma.msg_message.findMany({
            where: {
                conversation_id: conversationId,
            },
        });
    }
}
