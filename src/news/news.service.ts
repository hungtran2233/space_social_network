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
                path: fileUpload.filename,
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

    // Show danh sách tin
    async findAllNews(req: any) {
        const myInfo = req.user.data;

        //1/ Kiểm tra xem mình có đăng tin không
        const myNews = await this.prisma.news.findMany({
            where: {
                user_id: myInfo.user_id,
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

        //2/ Lấy danh sách tất cả bạn bè của bạn
        const myFriends: { user_id: number }[] = await this.prisma.$queryRaw`
        SELECT u.user_id
        FROM friend_ship f
        JOIN user u ON f.user_id_1 = u.user_id OR f.user_id_2 = u.user_id
         WHERE (f.user_id_1 = ${myInfo.user_id} OR f.user_id_2 = ${myInfo.user_id})
            AND f.status = 'accepted'
            AND u.user_id != ${myInfo.user_id};
        `;
        const arrMyFriend = myFriends.map((obj) => obj.user_id);

        // 3/ Check mỗi user trong mảng đó xem có user nào đăng tin hay không,
        // với điều kiện là tin còn hạn (24h kể từ lúc tạo), giá trị privacy_id = 2 (friend)
        const arrNewsOfMyFriend = await this.prisma.news.findMany({
            where: {
                user_id: {
                    in: arrMyFriend,
                },
                expires_at: {
                    gt: new Date(),
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
            allNews = [...myNews, ...arrNewsOfMyFriend];
        } else {
            allNews = [...arrNewsOfMyFriend];
        }

        return successCode(200, 'Lấy tất cả news thành công', allNews);
    }

    remove(id: number) {
        return `This action removes a #${id} news`;
    }
}
