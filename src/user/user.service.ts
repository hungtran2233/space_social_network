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
    async create(createUserDto: CreateUserDto, req: any) {
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

            // 3/ Tạo userInfo trong table user_info
            await this.prisma.user_info.create({
                data: {
                    user_id: newUser.user_id,
                },
            });

            // 4/ Tạo image_list mới là: uploaded-images  và saved-images
            const imageListData = [
                {
                    user_id: newUser.user_id,
                    list_name: 'uploaded-images',
                    privacy_id: 1,
                },
                {
                    user_id: newUser.user_id,
                    list_name: 'saved-images',
                    privacy_id: 1,
                },
            ];
            await this.prisma.image_list.createMany({
                data: imageListData,
            });

            return successCode(201, 'Tạo user mới thành công', newUser);
        } else {
            conflict('Email đã tồn tại');
        }
    }

    // Admin cấp quyền cho user
    async provideRole(id: number, roleName: any) {
        const existingUser = await this.prisma.user.findFirst({
            where: {
                user_id: id,
            },
        });

        if (!existingUser) return notFound('Người dùng không tồn tại');

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
                } else if (roleName.role_name === 'celebrity') {
                    desc = 'Người nổi tiếng, được user nhấn theo dõi';
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
            badRequest(
                `Nhập sai tên quyền ! ['admin', 'user', 'celebrity', 'guests']`,
            );
        }
    }

    // Lấy tất cả user, bao gồm cả user đã bị xóa
    async findAll(req: any) {
        let data = await this.prisma.user.findMany({
            where: {
                is_active: true,
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
                is_active: true,
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
        let existingUser = await this.prisma.user.findFirst({
            where: {
                user_id: id,
            },
        });
        if (!existingUser) notFound('Người dùng không tồn tại');
        const newUser = await this.prisma.user_info.update({
            where: {
                user_id: id,
            },
            data: {
                age: updateUserDto.age,
                gender: updateUserDto.gender,
                country: updateUserDto.country,
                study_at: updateUserDto.study_at,
                working_at: updateUserDto.working_at,
                favorites: updateUserDto.favorites,
            },
        });
        return successCode(200, 'Cập nhật user thành công', newUser);
    }

    // Block user --> is_active = false
    async blockUser(id: number) {
        const existingUser = await this.prisma.user.findFirst({
            where: {
                user_id: id,
            },
        });
        if (!existingUser) notFound('Người dùng không tồn tại');
        if (existingUser.is_active === true) {
            const newUser = await this.prisma.user.update({
                where: {
                    user_id: id,
                },
                data: {
                    is_active: false,
                },
            });
            return successCode(200, 'Khóa user thành công', newUser);
        } else {
            conflict('Người dùng đã bị khóa trước đây');
        }
    }
}
