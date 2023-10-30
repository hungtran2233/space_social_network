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

    // Tạo image list
    async create(createImageListDto: CreateImageListDto, req: any) {
        const id = req.user.data.user_id;
        const existingImageList = await this.prisma.image_list.findFirst({
            where: {
                user_id: id,
                list_name: createImageListDto.list_name,
            },
        });

        if (existingImageList) {
            conflict('Tên image list đã tồn tại');
        } else {
            let newList = await this.prisma.image_list.create({
                data: {
                    user_id: id,
                    list_name: createImageListDto.list_name,
                    privacy_id: 1,
                },
            });
            return successCode(201, 'Thêm image list thành công', newList);
        }
    }

    // Lấy tất cả image list của cá nhân user (ngoại trừ 2 cái mặc định uploaded-images và saved-images)
    async findAll(req: any) {
        const myInfo = req.user.data;
        let myImageList = await this.prisma.image_list.findMany({
            where: {
                user_id: myInfo.user_id,
                // NOT: {
                //     list_name: {
                //         in: ['uploaded-images', 'saved-images'],
                //     },
                // },
            },
            include: {
                image: true,
            },
        });
        if (myImageList.length === 0)
            // notFound('Bộ sưu tập Image List của bạn đang trống');
            return successCode(200, 'Danh sách album của bạn đang trống', []);
        return successCode(
            200,
            'Lấy danh sách image-list thành công',
            myImageList,
        );
    }

    // TÌm 1 danh sách dựa vào id
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
    async update(id: number, updateImageListDto: UpdateImageListDto, req: any) {
        const myInfo = req.user.data;

        let existingImageList = await this.prisma.image_list.findFirst({
            where: {
                image_list_id: id,
            },
        });
        if (!existingImageList)
            notFound('Image list này không có trong danh sách của bạn');

        const existingListName = await this.prisma.image_list.findFirst({
            where: {
                user_id: myInfo.user_id,
                list_name: updateImageListDto.list_name,
            },
        });
        if (existingListName)
            conflict('List name đã tồn tại, hãy chọn cái tên khác');

        const newImageList = await this.prisma.image_list.update({
            where: {
                image_list_id: existingImageList.image_list_id,
            },
            data: {
                list_name: updateImageListDto.list_name,
            },
        });
        return successCode(
            200,
            'Cập nhật tên image list thành công',
            newImageList,
        );
    }

    // Xóa image list
    async remove(id: number, req: any) {
        const myInfo = req.user.data;
        let existingImageList = await this.prisma.image_list.findFirst({
            where: {
                image_list_id: id,
                user_id: myInfo.user_id,
            },
        });

        if (!existingImageList) notFound('Bạn không có image-list này ');

        await this.prisma.image_list.delete({
            where: {
                image_list_id: id,
            },
        });
        return successCode(
            200,
            'Xóa image list thành công',
            `Deleted imageListName= ${existingImageList.list_name}`,
        );
    }
}
