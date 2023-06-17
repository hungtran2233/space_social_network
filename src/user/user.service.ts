import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaClient, user } from '@prisma/client';
import { conflict, notFound, successCode } from 'config/Response';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
    // Lấy dữ liệu
    prisma = new PrismaClient();

    // Create user
    async create(createUserDto: user) {
        const existingUser = await this.prisma.user.findFirst({
            where: {
                email: createUserDto.email,
            },
        });

        if (!existingUser) {
            // mã hóa pass_word
            let hashedPassword = await bcrypt.hash(createUserDto.pass_word, 10);
            let newUser = await this.prisma.user.create({
                data: {
                    ...createUserDto,
                    pass_word: hashedPassword,
                },
            });
            return successCode(201, 'Tạo user mới thành công', newUser);
        } else {
            conflict('Email đã tồn tại');
        }
    }

    // Lấy tất cả user, bao gồm cả user đã bị xóa
    async findAll(): Promise<{
        statusCode: number;
        message: string;
        content: user[];
    }> {
        let data = await this.prisma.user.findMany({
            where: {
                is_deleted: false,
            },
        });
        return successCode(200, 'Lấy danh sách user thành công', data);
    }

    // Tìm 1 user theo id
    async findOne(id: number) {
        let data = await this.prisma.user.findFirst({
            where: {
                user_id: id,
                is_deleted: false,
            },
        });
        return successCode(200, 'Lấy user thành công', data);
    }

    // update user
    async update(id: number, updateUserDto: UpdateUserDto) {
        let checkUser = await this.prisma.user.findFirst({
            where: {
                user_id: id,
                is_deleted: false,
            },
        });
        if (checkUser) {
            const { pass_word, full_name, age, avatar, gender, country } =
                updateUserDto;
            const updatedUser = await this.prisma.user.update({
                data: {
                    pass_word,
                    full_name,
                    age,
                    avatar,
                    gender,
                    country,
                },
                where: {
                    user_id: id,
                },
            });
            return successCode(200, 'Cập nhật user thành công', updatedUser);
        } else {
            notFound('User không tồn tại');
        }
    }

    // Vì là soft delete nên ta sẽ đổi thành update
    async remove(id: number) {
        // tim user cần delete
        let newData = await this.prisma.user.findFirst({
            where: {
                user_id: id,
            },
        });
        if (newData) {
            if (newData.is_deleted == true) {
                return {
                    message: `Nguời dùng có ID: ${id} đã được xóa trước đây`,
                    content: newData,
                };
            } else {
                // thay đổi is_delete
                newData.is_deleted = true;
                // update lại user
                await this.prisma.user.update({
                    data: newData,
                    where: {
                        user_id: id,
                    },
                });
            }
            return {
                message: `Xóa người dùng có ID: ${id} thành công`,
                content: newData,
            };
        } else {
            notFound('User không tồn tại');
        }
    }
}
