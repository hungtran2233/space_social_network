import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class NotificationService {
    prisma = new PrismaClient();
    //

    async create(createNotificationDto: CreateNotificationDto) {
        // console.log(`service-- ${createNotificationDto}`);
        return;
        // console.log(createNotificationDto);
        // createNotificationDto có dạng:   {myId: 1, postId: 1, postPrivacyId: 1}

        // Kiểm tra xem bài viết có "công khai" hoặc "bạn bè" hay không ==> Thông báo
        // if (Number(postPrivacy) === 1 || Number(postPrivacy) === 2) {// }

        // ==== Thông báo bài post đến tất cả user đang theo dõi mình ====

        // console.log(allUserFollowing);

        // ============= LOGIC ĐẨY NOTIFICATION CHO TẤT CẢ USER ==============
    }

    userLogin() {
        return `This action returns all notification`;
    }

    findOne(id: number) {
        return `This action returns a #${id} notification`;
    }

    update(id: number, updateNotificationDto: UpdateNotificationDto) {
        return `This action updates a #${id} notification`;
    }

    remove(id: number) {
        return `This action removes a #${id} notification`;
    }
}
