import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    WebSocketServer,
    ConnectedSocket,
} from '@nestjs/websockets';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Server, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { OnModuleInit } from '@nestjs/common';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class NotificationGateway implements OnModuleInit {
    constructor(private readonly notificationService: NotificationService) {}

    @WebSocketServer()
    server: Server;
    prisma = new PrismaClient();

    /////////
    onlineUsers = [];
    addNewUser = (userId, socketId) => {
        if (!userId) return;
        !this.onlineUsers.some((user) => user.userId === userId) &&
            this.onlineUsers.push({ userId: Number(userId), socketId });
    };

    removeUser = (socketId) => {
        this.onlineUsers = this.onlineUsers.filter(
            (user) => user.socketId !== socketId,
        );
    };

    getUser = (userId: number) => {
        return this.onlineUsers.find((user) => user.userId === userId);
    };

    // Kiểm tra kết nối
    onModuleInit() {
        this.server.on('connection', (socket) => {
            // khi nhấn tải lại trang web, thì sẽ đóng kết nối và mở lại một kết nối mới ==> thay đổi socket.id
            socket.on('disconnect', () => {
                this.removeUser(socket.id);
            });
        });
    }

    // Khi 1 user login thì sẽ tạo kết nối đến user nào đó đang online
    @SubscribeMessage('newUserLogin')
    userLogin(@MessageBody() userId: any, @ConnectedSocket() socket: Socket) {
        console.log(userId + '---' + socket.id);
        this.addNewUser(userId, socket.id);
        console.log('Đang online', { content: this.onlineUsers });
    }

    // Khi 1 user đăng xuất sẽ xóa kết nối
    @SubscribeMessage('userLogout')
    userLogout(@MessageBody() socketId: any) {
        this.removeUser(socketId);
        console.log('Đang online', { content: this.onlineUsers });
    }

    @SubscribeMessage('createUserPost')
    async create(
        @MessageBody() createNotificationDto: CreateNotificationDto,
        @ConnectedSocket() socket: Socket,
    ) {
        // Kiểm tra nếu bài viết là private ==> không có thông báo
        if (createNotificationDto.postPrivacyId === 3) return;

        // Lấy tất cả những user đang theo dõi mình
        const allUserFollowing = await this.prisma.follow.findMany({
            where: {
                following_id: createNotificationDto.senderId,
            },
            select: {
                follower_id: true,
            },
        });
        // Lọc danh sách user online và đang  theo dõi mình)
        const onlineUsersToNotify = this.onlineUsers.filter(
            (onlineUsersElement) =>
                allUserFollowing.some(
                    (allUserFollowingElement) =>
                        allUserFollowingElement.follower_id ===
                        onlineUsersElement.userId,
                ),
        );

        // Gửi notification trực tiếp
        onlineUsersToNotify.forEach((item) => {
            this.server.to(item.socketId).emit('getNotificationFromPost', {
                senderId: createNotificationDto.senderId,
                postId: createNotificationDto.postId,
                message: 'Đã đăng bài mới',
            });
        });

        // =================== LOGIC LƯU DATABASE  ==========================
        // 1/ Bảng "notification" -- Gửi thông báo cho tất cả user đang theo dõi  - Lưu vào database
        // Map data
        const allDataNotification = allUserFollowing.map((item) => {
            const data = {
                event_id: 1,
                target_user_id: Number(item.follower_id),
                is_read: false,
            };
            return data;
        });

        // console.log(allDataNotification);
        // return;
        // Thực hiện lưu xuống database
        const createdNotifications = await Promise.all(
            allDataNotification.map((data) =>
                this.prisma.notification.create({ data }),
            ),
        );

        // 2/ Bảng "notification_post_user" -- Gửi thông báo cho tất cả user đang theo dõi  - Lưu vào database
        // Map data
        const allDataNotificationPostUser = createdNotifications.map((item) => {
            const data = {
                notification_id: item.notification_id,
                source_user_id: createNotificationDto.senderId,
                source_post_id: createNotificationDto.postId,
            };
            return data;
        });
        // Thực hiện lưu xuống database
        const createdNotificationPostUser = await Promise.all(
            allDataNotificationPostUser.map((data) =>
                this.prisma.notification_post_user.create({ data }),
            ),
        );
    }

    @SubscribeMessage('findOneNotification')
    findOne(@MessageBody() id: number) {
        return this.notificationService.findOne(id);
    }

    @SubscribeMessage('updateNotification')
    update(@MessageBody() updateNotificationDto: UpdateNotificationDto) {
        return this.notificationService.update(
            updateNotificationDto.id,
            updateNotificationDto,
        );
    }

    @SubscribeMessage('removeNotification')
    remove(@MessageBody() id: number) {
        return this.notificationService.remove(id);
    }
}
