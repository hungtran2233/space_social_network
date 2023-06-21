import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaClient, user } from '@prisma/client';
import { badRequest, conflict, notFound, successCode } from 'config/Response';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/auth/guard/role';

@Injectable()
export class UserService {
    // Lấy dữ liệu
    prisma = new PrismaClient();

    // Create user
    async create(createUserDto: CreateUserDto) {
        const existingUser = await this.prisma.user.findFirst({
            where: {
                email: createUserDto.email,
            },
        });

        if (!existingUser) {
            // 1/ Tạo user trong table user
            // mã hóa pass_word
            let hashedPassword = await bcrypt.hash(createUserDto.pass_word, 10);
            let newUser = await this.prisma.user.create({
                data: {
                    ...createUserDto,
                    pass_word: hashedPassword,
                },
            });

            // 2/ Tạo Role cho user
            await this.prisma.ro_role.create({
                data: {
                    user_id: newUser.user_id,
                    role_name: 'user',
                    role_desc: 'Người dùng được thao tác giới hạn',
                },
            });

            // 3/ Tạo image-list có list_name=avatar để lưu avatar cho user mỗi khi up avatar lên
            await this.prisma.image_list.create({
                data: {
                    user_id: newUser.user_id,
                    list_name: 'avatar',
                },
            });

            return successCode(201, 'Tạo user mới thành công', newUser);
        } else {
            conflict('Email đã tồn tại');
        }
    }

    // Admin cấp quyền cho user
    async provideRole(id: number, roleName: any) {
        if (Object.values(Role).includes(roleName.role_name)) {
            const userRoleId = await this.prisma.ro_role.findFirst({
                where: {
                    user_id: id,
                },
                select: {
                    role_id: true,
                },
            });

            if (userRoleId) {
                let desc = '';
                if (roleName.role_name === 'admin') {
                    desc = 'Quyền quản trị cao nhất, được thao tác toàn bộ';
                } else if (roleName.role_name === 'user') {
                    desc = 'Người dùng được thao tác giới hạn';
                } else {
                    desc = 'Chỉ được xem, không được thao tác';
                }

                const newUserRole = await this.prisma.ro_role.update({
                    where: {
                        role_id: userRoleId.role_id,
                    },
                    data: {
                        role_name: roleName.role_name,
                        role_desc: desc,
                    },
                });
                return successCode(200, 'Cấp quyền thành công', newUserRole);
            }
        } else {
            badRequest(`Nhập sai tên quyền ! ['admin', 'user', 'guests']`);
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
            include: {
                ro_role: true,
            },
        });
        return successCode(200, 'Lấy danh sách user thành công', data);
    }

    // Lấy 1 user theo id
    async findOne(id: number) {
        let data = await this.prisma.user.findFirst({
            where: {
                user_id: id,
                is_deleted: false,
            },
            include: {
                ro_role: true,
            },
        });
        if (data) {
            return successCode(200, 'Lấy user thành công', data);
        } else {
            notFound('User không tồn tại');
        }
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
