import { Injectable } from '@nestjs/common';
import { CreateFollowDto } from './dto/create-follow.dto';
import { UpdateFollowDto } from './dto/update-follow.dto';
import { PrismaClient } from '@prisma/client';
import { successCode } from 'config/Response';

@Injectable()
export class FollowService {
    prisma = new PrismaClient();

    // Tạo lượt theo dõi ==> Mình nhấn nút "Theo dõi" người khác
    async create(createFollowDto: CreateFollowDto, req: any) {
        const myInfo = req.user.data;

        // 1/ Kiểm tra xem đã theo dõi người kia chưa
        const checkFollow = await this.prisma.follow.findFirst({
            where: {
                follower_id: myInfo.user_id,
                following_id: createFollowDto.following_id,
            },
        });

        // 2/ Tạo record follow
        if (!checkFollow) {
            const newFollowers = await this.prisma.follow.create({
                data: {
                    follower_id: myInfo.user_id,
                    following_id: createFollowDto.following_id,
                },
            });
            return successCode(
                200,
                'Tạo lượt theo dõi thành công',
                newFollowers,
            );
        } else {
            return successCode(200, 'Đã theo dõi người này', checkFollow);
        }
    }

    // Kiểm tra xem mình có đang theo dõi người kia hay không
    async findOne(linkUrl: string, req: any) {
        const myId = req.user.data.user_id;

        // 1/ Tìm ra user_id của người đó dựa vào linkUrl
        const otherUser = await this.prisma.user.findFirst({
            where: {
                link_url: linkUrl,
            },
        });

        // Nếu sai đường dẫn
        if (!otherUser)
            return successCode(
                200,
                'Không tìm thấy người dùng này, hãy kiểm tra lại đường link',
                'no_data',
            );

        const checkFollow = await this.prisma.follow.findFirst({
            where: {
                follower_id: myId,
                following_id: otherUser.user_id,
            },
        });

        if (checkFollow === null)
            return successCode(200, 'Kiểm tra theo dõi thành công', {
                is_follow: false,
            });
        return successCode(200, 'Kiểm tra theo dõi thành công', {
            is_follow: true,
        });
    }

    update(id: number, updateFollowDto: UpdateFollowDto) {
        return `This action updates a #${id} follow`;
    }

    // Bỏ theo dõi người khác
    async remove(linkUrl: string, req: any) {
        const myId = req.user.data.user_id;

        // 1/ Tìm ra user_id của người đó dựa vào linkUrl
        const otherUser = await this.prisma.user.findFirst({
            where: {
                link_url: linkUrl,
            },
        });

        // Nếu sai đường dẫn
        if (!otherUser)
            return successCode(
                200,
                'Không tìm thấy người dùng này, hãy kiểm tra lại đường link',
                'no_data',
            );

        // Kiểm tra tồn tại theo dõi
        const checkFollow = await this.prisma.follow.findFirst({
            where: {
                follower_id: myId,
                following_id: otherUser.user_id,
            },
        });

        if (!checkFollow)
            return successCode(200, 'Bạn không có theo dõi người này', {
                is_follow: false,
            });

        // Bỏ theo dõi
        await this.prisma.follow.delete({
            where: {
                follow_id: checkFollow.follow_id,
            },
        });
        return successCode(200, 'Bỏ theo dõi thành công', { is_follow: false });
    }
}
