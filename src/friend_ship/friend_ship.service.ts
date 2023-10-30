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
            const newInvitation = await this.prisma.friend_ship.create({
                data: {
                    user_id_1: myInfo.user_id,
                    user_id_2: createFriendShipDto.receive_user_id,
                    status: 'pending',
                },
            });

            // 6/ Lấy lại record mới tạo lời mời đó
            const getNewInvitation = await this.prisma.friend_ship.findFirst({
                where: {
                    friendship_id: newInvitation.friendship_id,
                },
                select: {
                    user_id_1: true,
                    user_id_2: true,
                    status: true,
                },
            });
            return successCode(
                201,
                'Lời mời kết bạn được gửi đi thành công',
                getNewInvitation,
            );
        } else {
            conflict(
                `Bạn đã gửi lời mời cho UserId=${createFriendShipDto.receive_user_id} trước đây rồi, đang chờ phản hồi`,
            );
        }
    }

    // Show ra tất cả lời mời kết bạn
    async findAllInvitation(req: any) {
        // console.log(req.user.data);
        const myInfo = req.user.data;
        // console.log(myId);
        // const allInvitation = await this.prisma.friend_ship.findMany({
        //     where: {
        //         user_id_2: myId,
        //         status: 'pending',
        //     },
        //     select: {
        //         user_friend_ship_user_id_1Touser: {
        //             select: {
        //                 user_id: true,
        //                 full_name: true,
        //                 avatar: true,
        //                 link_url: true,
        //             },
        //         },
        //     },
        // });

        const allInvitation = await this.prisma.$queryRaw`
        SELECT u.user_id, u.full_name, u.avatar, u.avatar, u.link_url, 
        ui.cover_image, ui.country, ui.study_at, ui.working_at, ui.favorites, ui.created_at
        FROM friend_ship f
        JOIN user u ON  f.user_id_1 = u.user_id
        JOIN user_info ui ON u.user_id = ui.user_id
         WHERE  f.user_id_2 = ${myInfo.user_id}
            AND f.status = 'pending'
           
        `;

        return successCode(
            200,
            'Tìm thấy tất cả lời mời kết bạn thành công',
            allInvitation,
        );
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

    // Kiểm tra trạng thái bạn bè của mình với người khác
    async checkFriendShipStatus(req: any, linkUrl: string) {
        const myInfo = req.user.data;
        // 1/ Tìm ra id của user đó dựa vào linkUrl
        const otherUser = await this.prisma.user.findFirst({
            where: {
                link_url: linkUrl,
            },
        });

        if (!otherUser)
            return notFound(
                'Không tìm thấy user này, hãy kiểm tra lại đường link',
            );
        // 2/ Dựa vào user_id để tìm ra mối quan hệ của 2 người
        const existingCreatedFriendShip =
            await this.prisma.friend_ship.findFirst({
                where: {
                    OR: [
                        {
                            user_id_1: myInfo.user_id,
                            user_id_2: otherUser.user_id,
                        },
                        {
                            user_id_1: otherUser.user_id,
                            user_id_2: myInfo.user_id,
                        },
                    ],
                },
                select: {
                    user_id_1: true,
                    user_id_2: true,
                    status: true,
                },
            });

        if (existingCreatedFriendShip) {
            return successCode(
                200,
                'Tìm thấy trạng thái bạn bè thành công',
                existingCreatedFriendShip,
            );
        }
        return successCode(
            200,
            'Bạn chưa thiết lập trạng thái với người này',
            false,
        );
    }

    // Lấy tất cả bạn bè của user
    async findAllFriends(req: any) {
        const myInfo = req.user.data;
        // const arrMyFriends = await this.prisma.friend_ship.findMany({
        //     where: {
        //         OR: [
        //             {
        //                 user_id_1: myInfo.user_id,
        //             },
        //             {
        //                 user_id_2: myInfo.user_id,
        //             },
        //         ],
        //         status: 'accepted',
        //     },
        //     select: {
        //         user_friend_ship_user_id_2Touser: true,
        //     },
        // });

        const myFriends = await this.prisma.$queryRaw`
        SELECT u.user_id, u.full_name, u.avatar, u.avatar, u.link_url, 
        ui.cover_image, ui.country, ui.study_at, ui.working_at, ui.favorites, ui.created_at
        FROM friend_ship f
        JOIN user u ON f.user_id_1 = u.user_id OR f.user_id_2 = u.user_id
        JOIN user_info ui ON u.user_id = ui.user_id
         WHERE (f.user_id_1 = ${myInfo.user_id} OR f.user_id_2 = ${myInfo.user_id})
            AND f.status = 'accepted'
            AND u.user_id != ${myInfo.user_id};
        `;

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
