import { Injectable } from '@nestjs/common';
import { CreateBlockListDto } from './dto/create-block_list.dto';
import { UpdateBlockListDto } from './dto/update-block_list.dto';
import { PrismaClient } from '@prisma/client';
import { conflict, successCode } from 'config/Response';

@Injectable()
export class BlockListService {
    prisma = new PrismaClient();
    // Block người khác
    async create(createBlockListDto: CreateBlockListDto, req: any) {
        const myId = req.user.data.user_id;
        // 1/ Không được chặn chính mình

        if (createBlockListDto.blocked_user_id === myId)
            return successCode(200, 'Không được chặn chính mình', 'no_data');

        // 2/ Kiểm tra xem mình đã block người đó hay chưa
        const checkBlockOtherUser = await this.prisma.block_list.findFirst({
            where: {
                blocker_id: myId,
                blocked_id: createBlockListDto.blocked_user_id,
            },
        });

        if (checkBlockOtherUser)
            return successCode(
                200,
                'Bạn đã chặn người dùng này rồi',
                'no_data',
            );

        // 3/ Tạo block
        const newBlock = await this.prisma.block_list.create({
            data: {
                blocker_id: myId,
                blocked_id: createBlockListDto.blocked_user_id,
            },
        });

        // 4/ Nếu cả 2 là bạn bè từ trước thì sẽ cập nhật friend_ship: status="blocked",
        // và cập nhật follow
        const existingFriendShip = await this.prisma.friend_ship.findFirst({
            where: {
                OR: [
                    {
                        user_id_1: myId,
                        user_id_2: createBlockListDto.blocked_user_id,
                    },
                    {
                        user_id_1: createBlockListDto.blocked_user_id,
                        user_id_2: myId,
                    },
                ],
            },
        });

        if (existingFriendShip) {
            // Cập nhật friend_ship status
            await this.prisma.friend_ship.update({
                where: {
                    friendship_id: existingFriendShip.friendship_id,
                },
                data: {
                    status: 'blocked',
                },
            });

            // Xóa follow lẫn nhau
            await this.prisma.follow.deleteMany({
                where: {
                    OR: [
                        {
                            follower_id: myId,
                            following_id: createBlockListDto.blocked_user_id,
                        },
                        {
                            follower_id: createBlockListDto.blocked_user_id,
                            following_id: myId,
                        },
                    ],
                },
            });
        }

        return successCode(200, 'Chặn người dùng thành công', newBlock);
    }

    // Lấy tất cả những người bị chặn
    async findAll(req: any) {
        const myId = req.user.data.user_id;
        const allBlocked1 = await this.prisma.block_list.findMany({
            where: {
                blocker_id: myId,
            },
            include: {
                user_block_list_blocked_idTouser: {
                    select: {
                        user_id: true,
                        full_name: true,
                        avatar: true,
                        link_url: true,
                    },
                },
            },
        });
        const allBlocked = await this.prisma.$queryRaw`
            SELECT 
                bl.block_id, 
                bl.blocker_id, 
                JSON_OBJECT(
                    'user_id', u.user_id,
                    'full_name', u.full_name,
                    'avatar', u.avatar,
                    'link_url', u.link_url,
                    'country', ui.country
                ) AS user_blocked_info
                
            FROM user u
            JOIN block_list bl ON u.user_id = bl.blocked_id
            JOIN user_info ui ON u.user_id = ui.user_id
            WHERE bl.blocker_id = ${myId}
        `;

        return successCode(200, 'Lấy danh sách bị chặn thành công', allBlocked);
    }

    findOne(id: number) {
        return `This action returns a #${id} blockList`;
    }

    // Bỏ chặn người khác
    async remove(otherUserId: number, req: any) {
        const myId = req.user.data.user_id;
        // 1/ Kiểm tra xem mình đã block người đó hay chưa
        const checkBlockedOtherUser = await this.prisma.block_list.findFirst({
            where: {
                blocker_id: myId,
                blocked_id: otherUserId,
            },
        });

        if (!checkBlockedOtherUser)
            return successCode(
                200,
                'Bạn không có chặn người dùng này',
                'no_data',
            );

        // 2/ Tiến hành bỏ chặn
        const deleteBlocked = await this.prisma.block_list.delete({
            where: {
                block_id: checkBlockedOtherUser.block_id,
            },
        });

        // 3/ Kiểm tra tình trạng bạn bè
        const existingFriendShip = await this.prisma.friend_ship.findFirst({
            where: {
                OR: [
                    {
                        user_id_1: myId,
                        user_id_2: otherUserId,
                    },
                    {
                        user_id_1: otherUserId,
                        user_id_2: myId,
                    },
                ],
            },
        });

        if (existingFriendShip) {
            // 4/ Cập nhật lại friend_ship status="pending"
            await this.prisma.friend_ship.update({
                where: {
                    friendship_id: existingFriendShip.friendship_id,
                },
                data: {
                    status: 'pending',
                },
            });
        }

        return successCode(200, 'Bỏ chặn người dùng thành công', deleteBlocked);
    }
}
