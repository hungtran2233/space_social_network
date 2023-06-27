import { Injectable } from '@nestjs/common';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { PrismaClient } from '@prisma/client';
import { notFound, successCode } from 'config/Response';
import { Image } from './entities/image.entity';

@Injectable()
export class ImageService {
    prisma = new PrismaClient();

    // Upload ảnh mặc định vào image_list có list_name=uploaded-images
    async uploadImage(
        req: any,
        fileUpload: Express.Multer.File,
        descImg: string,
    ) {
        // // 1/ Lấy được image_list_id thông qua user_id và list_name=uploaded-images
        const imageList = await this.prisma.image_list.findFirst({
            where: {
                user_id: req.user.data.user_id,
                list_name: 'uploaded-images',
            },
        });

        // // 2/ Thêm ảnh này vào table image
        const newImage = await this.prisma.image.create({
            data: {
                image_name: fileUpload.originalname,
                path: fileUpload.filename,
                image_list_id: imageList.image_list_id,
                description: descImg,
            },
        });

        return successCode(200, 'Upload ảnh thành công', newImage);
    }

    // Lấy tất cả ảnh table image
    async findAll() {
        const allImage = await this.prisma.image.findMany();
        return successCode(200, 'Lấy danh sách ảnh thành công', allImage);
    }

    // Chi tiết ảnh
    async getImageDetail(id: number) {
        const imageDetail = await this.prisma.image.findFirst({
            where: {
                image_id: id,
            },
            include: {
                image_list: {
                    include: {
                        user: {
                            select: {
                                user_id: true,
                                email: true,
                                full_name: true,
                                avatar: true,
                            },
                        },
                    },
                },

                likes: true,
                comment: true,
                save_image: {
                    select: {
                        user_id: true,
                        created_at: true,
                    },
                },
            },
        });

        if (imageDetail) {
            return successCode(200, 'Thành công', imageDetail);
        } else {
            notFound('Image không tồn tại');
        }
    }

    // Cập nhật lại image
    async update(id: number, updateImageDto: UpdateImageDto) {
        const imageDetail = await this.prisma.image.findFirst({
            where: {
                image_id: id,
            },
        });

        if (imageDetail) {
            const newImageDetail = await this.prisma.image.update({
                where: {
                    image_id: id,
                },
                data: {
                    image_name: updateImageDto.image_name,
                    description: updateImageDto.description,
                },
            });
            return successCode(
                200,
                'Cập nhật image thành công',
                newImageDetail,
            );
        } else {
            notFound('Image không tồn tại');
        }

        return imageDetail;
    }

    // Xóa image
    remove(id: number) {
        return `This action removes a #${id} image`;
    }
}
