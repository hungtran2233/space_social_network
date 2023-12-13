import { Injectable } from '@nestjs/common';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { PrismaClient } from '@prisma/client';
import { badRequest, successCode } from 'config/Response';

@Injectable()
export class NewsService {
    prisma = new PrismaClient();

    // Tạo tin
    async create(
        req: any,
        fileUpload: Express.Multer.File,
        newsContent: string,
        musicUrl: string,
        privacyId: number,
    ) {
        const myInfo = req.user.data;
        if (!fileUpload) badRequest('Bạn chưa chọn hình ảnh');

        // 1/ Lấy được image_list_id thông qua user_id và list_name=uploaded-images
        const imageList = await this.prisma.image_list.findFirst({
            where: {
                user_id: req.user.data.user_id,
                list_name: 'uploaded-images',
            },
        });

        // 2/ Thêm ảnh này vào table image
        const newImage = await this.prisma.image.create({
            data: {
                image_name: fileUpload.originalname,
                path: `/public/image/news/${fileUpload.filename}`,
                image_list_id: imageList.image_list_id,
            },
        });

        // 3/ Thêm vào table news
        const news = await this.prisma.news.create({
            data: {
                image_id: newImage.image_id,
                news_content: newsContent,
                music_url: musicUrl,
                privacy_id: privacyId,
                user_id: myInfo.user_id,
            },
        });

        return successCode(200, 'Tạo tin thành công', news);
    }

    // Lấy danh sách tin
    async findAllNews(req: any) {
        const myId = req.user.data.user_id;

        //1/ Kiểm tra xem mình có đăng tin không
        const myNews = await this.prisma.news.findMany({
            where: {
                user_id: myId,
                expires_at: {
                    gt: new Date(),
                },
            },
            include: {
                image: {
                    select: {
                        image_id: true,
                        path: true,
                    },
                },
                user: {
                    select: {
                        user_id: true,
                        full_name: true,
                        avatar: true,
                        link_url: true,
                    },
                },
            },
        });

        // 2/ Lấy danh sách user mình đang follow
        const allMyFollowingUser = await this.prisma.follow.findMany({
            where: {
                follower_id: myId,
            },
            select: {
                following_id: true,
            },
        });

        const followingIds = allMyFollowingUser.map(
            (user) => user.following_id,
        );

        // 3/ Tìm trong danh sách trên xem có ai đăng tin không
        const allFriendsNewsAvailable = await this.prisma.news.findMany({
            where: {
                user_id: {
                    in: followingIds,
                },
                expires_at: {
                    // gt: new Date(),
                    // Lớn hơn thời điểm hiện tại / Bé hơn là: lt
                },
                privacy_id: 2,
            },
            orderBy: {
                created_at: 'desc',
            },
            include: {
                image: {
                    select: {
                        image_id: true,
                        path: true,
                    },
                },
                user: {
                    select: {
                        user_id: true,
                        full_name: true,
                        avatar: true,
                        link_url: true,
                    },
                },
            },
        });

        // Gộp mảng, để news của mình lên đầu tiên
        let allNews = null;
        if (myNews && myNews.length > 0) {
            allNews = [...myNews, ...allFriendsNewsAvailable];
        } else {
            allNews = [...allFriendsNewsAvailable];
        }

        return successCode(200, 'Lấy tất cả news thành công', allNews);
    }

    // Xóa news
    remove(id: number) {
        return `This action removes a #${id} news`;
    }
}
