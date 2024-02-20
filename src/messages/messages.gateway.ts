import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    WebSocketServer,
    ConnectedSocket,
} from '@nestjs/websockets';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Server, Socket } from 'socket.io';
import { RoleDecorator } from 'src/auth/guard/role.decorator';
import { Role } from 'src/auth/guard/role';
import { OnModuleInit } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guard/role.guard';
import { JwtStrategy } from 'src/strategy/jwt.strategy';
import { PrismaClient } from '@prisma/client';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class MessagesGateway implements OnModuleInit {
    @WebSocketServer()
    server: Server;
    constructor(private readonly messagesService: MessagesService) {}

    prisma = new PrismaClient();

    // Kiểm tra kết nối
    onModuleInit() {
        this.server.on('connection', (socket) => {
            // console.log(socket.id + ' -- connected ');
        });
    }

    // Join room (room tương ứng với conversation) giữa 2 user với nhau (cuộc trò chuyện 2 người)
    @SubscribeMessage('joinRoom')
    async handleJoinRoom(client: Socket, roomId: string) {
        // Phải join room trước rồi mới server.to
        client.join(roomId);

        // Gọi phương thức findAllMessages để lấy tin nhắn từ cơ sở dữ liệu
        const messages = await this.messagesService.findAllMessages(+roomId);
        // Gửi tin nhắn về cho client đã tham gia room
        client.emit('loadMessages', messages);
    }

    // Tạo tin nhắn
    @SubscribeMessage('createMessage')
    async create(
        @MessageBody() createMessageDto: CreateMessageDto,
        @ConnectedSocket() client: Socket,
    ) {
        // Gửi tin nhắn mới cho tất cả các client đã kết nối
        this.server
            .to(String(createMessageDto.conversation_id))
            .emit('onMessage', createMessageDto);

        // Tạo tin nhắn lưu vào database
        const newClientMessage = await this.prisma.msg_message.create({
            data: {
                conversation_id: +createMessageDto.conversation_id,
                sender_id: createMessageDto.sender_id,
                content: createMessageDto.content,
            },
        });
    }

    @SubscribeMessage('leaveRoom')
    handleLeaveRoom(client: Socket, roomId: string) {
        client.leave(roomId);
        client.emit('leftRoom', roomId);
    }

    // hành động khi user đang gõ
    @SubscribeMessage('userTyping')
    async typing(
        @MessageBody() userTyping: any,
        @ConnectedSocket() client: Socket,
    ) {
        // console.log(userTyping);
        // const name = await this.messagesService.getClientName(client.id);
        // Thông báo 'đang gõ' cho tất cả mọi người ngoại trừ bản thân
        client.broadcast.emit('typing', userTyping);
    }
}
