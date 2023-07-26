import { Injectable } from '@nestjs/common';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { PrismaClient } from '@prisma/client';
import { badRequest, successCode } from 'config/Response';

@Injectable()
export class NewsService {
    prisma = new PrismaClient();

    // Tạo tin
    async create(req: any, fileUpload: Express.Multer.File, musicUrl: string) {
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
                user_id: myInfo.user_id,
                music_url: musicUrl,
            },
        });

        return successCode(200, 'Tạo tin thành công', news);
    }

    async findAll() {
        const allNews = await this.prisma.$queryRaw`
             SELECT 
                n.news_id,
                u.user_id,
                u.full_name,
                u.avatar,
                i.path,
                n.music_url
            FROM
                news n
            JOIN
                user u ON n.user_id = u.user_id
            JOIN
                image i ON n.image_id = i.image_id
            
        `;

        return successCode(200, 'Lấy tất cả news thành công', allNews);
    }

    remove(id: number) {
        return `This action removes a #${id} news`;
    }
}
