import { Injectable } from '@nestjs/common';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { PrismaClient } from '@prisma/client';
import { conflict, notFound, successCode } from 'config/Response';
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

        // 2/ Thêm ảnh này vào table image
        const newImage = await this.prisma.image.create({
            data: {
                image_name: fileUpload.originalname,
                path: fileUpload.filename,
                image_list_id: imageList.image_list_id,
                description: descImg,
            },
        });

        return successCode(200, 'Upload ảnh thành công', fileUpload);
    }

    // Lấy tất cả ảnh table image
    async findAll() {
        const allImage = await this.prisma.image.findMany({
            where: {
                is_delete: false,
            },
        });
        return successCode(200, 'Lấy danh sách ảnh thành công', allImage);
    }

    // Chi tiết ảnh
    async getImageDetail(id: number) {
        const imageDetail = await this.prisma.image.findFirst({
            where: {
                image_id: id,
                is_delete: false,
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
                is_delete: false,
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
    }

    // Xóa image
    async remove(id: number) {
        const imageDetail = await this.prisma.image.findFirst({
            where: {
                image_id: id,
                is_delete: false,
            },
        });
        if (imageDetail) {
            await this.prisma.image.update({
                where: {
                    image_id: id,
                },
                data: {
                    is_delete: true,
                },
            });
            return successCode(200, 'Xóa image thành công', 'Deleted');
        } else {
            notFound('Image không tồn tại');
        }
    }

    // Chức năng lưu ảnh
    async saveImage(id: number, req: any) {
        const myInfo = req.user.data;
        const existingImage = await this.prisma.image.findFirst({
            where: {
                image_id: id,
                is_delete: false,
            },
        });

        if (existingImage) {
            const existingSaveImage = await this.prisma.save_image.findFirst({
                where: {
                    user_id: myInfo.user_id,
                    image_id: id,
                },
            });
            if (existingSaveImage) {
                conflict('Ảnh này đã lưu rồi');
            } else {
                const savedImage = await this.prisma.save_image.create({
                    data: {
                        user_id: myInfo.user_id,
                        image_id: id,
                    },
                });
                return successCode(201, 'Lưu ảnh thành công', savedImage);
            }
        } else {
            notFound('Ảnh này không tồn tại');
        }
    }

    // Chức năng bỏ lưu ảnh
    async unSaveImage(id: number, req: any) {
        const myInfo = req.user.data;
        const existingImage = await this.prisma.image.findFirst({
            where: {
                image_id: id,
                is_delete: false,
            },
        });

        if (existingImage) {
            const existingSaveImage = await this.prisma.save_image.findFirst({
                where: {
                    user_id: myInfo.user_id,
                    image_id: id,
                },
            });
            if (existingSaveImage) {
                await this.prisma.save_image.delete({
                    where: {
                        user_id_image_id: {
                            user_id: myInfo.user_id,
                            image_id: id,
                        },
                    },
                });
                return successCode(
                    200,
                    'Bỏ lưu thành công',
                    `Unsaved imageId=${id}`,
                );
            } else {
                notFound('Ảnh này chưa được lưu trong danh sách của bạn');
            }
        } else {
            notFound('Ảnh này không tồn tại');
        }
    }

    // Hiển thị tất cả ảnh đã lưu trên trang cá nhân
    async showSavedImage(req: any) {
        const myInfo = req.user.data;
        const savedImage = await this.prisma.$queryRaw`
            select save_image.user_id,  
            save_image.image_id, image.image_name, image.path, image.description, 
             image.image_list_id
            from save_image
            join user on save_image.user_id = user.user_id 
            join image on save_image.image_id = image.image_id
            where save_image.user_id = ${myInfo.user_id} 
        `;

        const mySavedImage = Array.isArray(savedImage)
            ? savedImage.map((item) => {
                  return {
                      image_id: item.image_id,
                      image_name: item.image_name,
                      path: item.path,
                      description: item.description,
                      like_count_image: item.like_count_image,
                      image_list_id: item.image_list_id,
                  };
              })
            : [];

        const result = {
            user_id: myInfo.user_id,
            all_saved_image: mySavedImage,
        };

        if (savedImage) {
            return successCode(
                200,
                'Lấy danh sách ảnh đã lưu thành công',
                result,
            );
        } else {
            notFound('Danh sách ảnh đã lưu trống');
        }
    }
}
