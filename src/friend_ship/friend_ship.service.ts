import { Injectable } from '@nestjs/common';
import { CreateFriendShipDto } from './dto/create-friend_ship.dto';
import { PrismaClient } from '@prisma/client';
import { conflict, notFound, successCode } from 'config/Response';

@Injectable()
export class FriendShipService {
    prisma = new PrismaClient();

    // Gửi lời mời kết bạn
    async create(createFriendShipDto: CreateFriendShipDto, req: any) {
        const myInfo = req.user.data;
        // 1/ Kiểm tra xem user mình muốn kết bạn có tồn tại hay không
        const existingUser = await this.prisma.user.findFirst({
            where: {
                user_id: createFriendShipDto.receive_user_id,
            },
        });
        if (!existingUser)
            notFound('Người dùng bạn muốn kết bạn không tồn tại');

        if (myInfo.user_id === createFriendShipDto.receive_user_id)
            conflict('Không thể gửi lời mời cho chính bạn');

        // 2/ Kiểm tra xem cả 2 đã là bạn bè hay chưa => status='accepted'
        const existingFriendShip = await this.prisma.friend_ship.findFirst({
            where: {
                OR: [
                    {
                        user_id_1: myInfo.user_id,
                        user_id_2: createFriendShipDto.receive_user_id,
                    },
                    {
                        user_id_1: createFriendShipDto.receive_user_id,
                        user_id_2: myInfo.user_id,
                    },
                ],
                status: 'accepted',
            },
        });

        if (existingFriendShip)
            conflict(
                `Bạn đang là bạn bè với UserId=${createFriendShipDto.receive_user_id}`,
            );

        // 3/ Kiểm tra xem mình có nhận được lời mời kết bạn từ user đó hay chưa
        const existingReceived = await this.prisma.friend_ship.findFirst({
            where: {
                user_id_1: createFriendShipDto.receive_user_id,
                user_id_2: myInfo.user_id,
                status: 'pending',
            },
        });
        if (existingReceived) {
            conflict(
                `UserId=${createFriendShipDto.receive_user_id} đã gửi cho bạn lời mời trước đây, hãy xác nhận nó`,
            );
        }

        // 4/ Kiểm tra xem mình đã gửi lời mời kết bạn cho user đó hay chưa
        const existingSend = await this.prisma.friend_ship.findFirst({
            where: {
                user_id_1: myInfo.user_id,
                user_id_2: createFriendShipDto.receive_user_id,
                status: 'pending',
            },
        });

        if (!existingSend) {
            // 5/ Tạo lời mời kết bạn với trạng thái 'pending'
            await this.prisma.friend_ship.create({
                data: {
                    user_id_1: myInfo.user_id,
                    user_id_2: createFriendShipDto.receive_user_id,
                    status: 'pending',
                },
            });
            return successCode(
                201,
                'Lời mời kết bạn được gửi đi thành công',
                'Pending',
            );
        } else {
            conflict(
                `Bạn đã gửi lời mời cho UserId=${createFriendShipDto.receive_user_id} trước đây rồi, đang chờ phản hồi`,
            );
        }
    }

    // Show ra tất cả lời mời kết bạn của người khác
    async findAllInvitation(req: any) {
        // console.log(req.user.data);
        const myId = req.user.data.user_id;
        // console.log(myId);
        const allInvitation = await this.prisma.friend_ship.findMany({
            where: {
                user_id_2: myId,
                status: 'pending',
            },
        });

        if (allInvitation.length !== 0) {
            return successCode(
                200,
                'Tìm thấy tất cả lời mời kết bạn thành công',
                allInvitation,
            );
        } else {
            notFound('Không tìm thấy lời mời kết bạn nào');
        }
    }

    // Chấp nhận lời mời kết bạn từ user_id_1
    async update(req: any, id: number) {
        const myId = req.user.data.user_id;

        // Tìm user_id_1 đã gửi lời mời mà mình là user_id_2 muốn chấp nhận kết bạn
        const friendShip = await this.prisma.friend_ship.findFirst({
            where: {
                user_id_1: id,
                user_id_2: myId,
                status: 'pending',
            },
        });

        if (friendShip) {
            await this.prisma.friend_ship.update({
                where: {
                    friendship_id: friendShip.friendship_id,
                },
                data: {
                    status: 'accepted',
                },
            });
            return successCode(
                200,
                `Bạn đã chấp nhận lời mời kết bạn của UserId = ${id} `,
                'Accepted',
            );
        } else {
            notFound(`UserId=${id} không có gửi cho bạn lời mời kết bạn`);
        }
    }

    // Show tất cả bạn bè của user
    async findAllFriends(req: any) {
        const myInfo = req.user.data;
        const myFriends = await this.prisma.friend_ship.findMany({
            where: {
                OR: [
                    {
                        user_id_1: myInfo.user_id,
                    },
                    {
                        user_id_2: myInfo.user_id,
                    },
                ],
                status: 'accepted',
            },
        });
        return successCode(200, 'Lấy danh sách bạn bè thành công', myFriends);
    }

    // Xóa bạn bè với user_id=id
    async remove(id: number, req: any) {
        const myId = req.user.data.user_id;
        // Kiểm tra xem mối quan hệ có đang là accepted hoặc pending hay không
        const friendShip = await this.prisma.friend_ship.findFirst({
            where: {
                OR: [
                    {
                        user_id_1: id,
                        user_id_2: myId,
                        status: { in: ['accepted', 'pending'] },
                    },
                    {
                        user_id_1: myId,
                        user_id_2: id,
                        status: { in: ['accepted', 'pending'] },
                    },
                ],
            },
        });

        if (friendShip) {
            await this.prisma.friend_ship.delete({
                where: {
                    friendship_id: friendShip.friendship_id,
                },
            });
            return successCode(
                200,
                'Xóa bạn thành công',
                `Removed UserId = ${id}`,
            );
        } else {
            notFound(
                `Không xóa được do bạn không có bất kì mối quan hệ gì với UserId=${id}`,
            );
        }
    }
}
