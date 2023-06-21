import { Injectable } from '@nestjs/common';
import { CreateImageListDto } from './dto/create-image-list.dto';
import { UpdateImageListDto } from './dto/update-image-list.dto';
import { PrismaClient } from '@prisma/client';
import { conflict, notFound, successCode } from 'config/Response';
import { getTimeNowVN } from 'config/FormatDateTime';

@Injectable()
export class ImageListService {
    // Đối tượng lấy dữ liệu
    prisma = new PrismaClient();

    // Tạo image-list
    async create(createImageListDto: CreateImageListDto, req: any) {
        const existingImageList = await this.prisma.image_list.findFirst({
            where: {
                list_name: createImageListDto.list_name,
            },
        });

        const id = req.user.data.user_id;

        if (existingImageList) {
            conflict('Tên image list đã tồn tại');
        } else {
            let newList = await this.prisma.image_list.create({
                data: {
                    user_id: id,
                    list_name: createImageListDto.list_name,
                },
            });
            return successCode(201, 'Thêm image list thành công', newList);
        }
    }

    // Lấy tất cả
    async findAll() {
        let data = await this.prisma.image_list.findMany();
        return successCode(200, 'Lấy danh sách image-list thành công', data);
    }

    // Lấy 1
    async findOne(id: number) {
        let data = await this.prisma.image_list.findFirst({
            where: {
                image_list_id: id,
            },
        });

        if (data) {
            return successCode(200, 'Lấy image-list thành công', data);
        } else {
            notFound('Image list không tồn tại');
        }
    }

    // Cập nhật image list
    async update(id: number, updateImageListDto: UpdateImageListDto) {
        let data = await this.prisma.image_list.findFirst({
            where: {
                image_list_id: id,
            },
        });

        if (data) {
            let newList = await this.prisma.image_list.update({
                data: {
                    list_name: updateImageListDto.list_name,
                    updated_at: getTimeNowVN(),
                },
                where: {
                    image_list_id: id,
                },
            });
            return successCode(200, 'Cập nhật image list thành công', newList);
        } else {
            notFound('Image list không tồn tại');
        }
    }

    // Xóa image list
    async remove(id: number) {
        let data = await this.prisma.image_list.findFirst({
            where: {
                image_list_id: id,
            },
        });

        if (data) {
            await this.prisma.image_list.delete({
                where: {
                    image_list_id: id,
                },
            });
            return successCode(200, 'Xóa image list thành công', 'Success');
        } else {
            notFound('Image list không tồn tại');
        }
    }
}
