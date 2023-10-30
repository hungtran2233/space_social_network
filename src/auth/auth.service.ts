import {
    ConflictException,
    Injectable,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient, user } from '@prisma/client';
import {
    ChangePasswordType,
    UpdateUserInfoType,
    UserLoginType,
    UserSignUpType,
} from './entities/auth.entities';
import * as bcrypt from 'bcrypt';
import {
    badRequest,
    conflict,
    successCode,
    unauthorized,
} from 'config/Response';
import { v4 as uuidv4 } from 'uuid';
import { validate } from 'class-validator';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private config: ConfigService,
    ) {}

    // khai báo prisma
    prisma = new PrismaClient();
    ////////////////////////

    // Đăng ký
    async signUp(userSignUp: UserSignUpType, headers: any) {
        // // Kiểm tra định dạng email
        // const validationErrors = await validate(userSignUp);

        // if (validationErrors.length > 0) {
        //     // Có lỗi, xử lý lỗi ở đây
        //     return { error: 'Dữ liệu không hợp lệ', validationErrors };
        // }

        const existingUser = await this.prisma.user.findFirst({
            where: {
                email: userSignUp.email,
            },
        });
        if (!existingUser) {
            // mã hóa pass_word
            let hashedPassword = await bcrypt.hash(userSignUp.pass_word, 10);
            let newUser;

            // Check admin_private_key
            const adminPK = headers.admin_private_key;
            if (!adminPK) {
                // 1/ Tạo user trong table user
                newUser = await this.prisma.user.create({
                    data: {
                        ...userSignUp,
                        pass_word: hashedPassword,
                        full_name: userSignUp.full_name,
                        avatar: '/public/default/default-avatar.png',
                        link_url: uuidv4(),
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
            } else if (
                adminPK &&
                adminPK === this.config.get('ADMIN_PRIVATE_KEY')
            ) {
                newUser = await this.prisma.user.create({
                    data: {
                        ...userSignUp,
                        pass_word: hashedPassword,
                        full_name: userSignUp.full_name,
                        avatar: '/public/default/default-avatar.png',
                        link_url: uuidv4(),
                    },
                });

                await this.prisma.ro_role.create({
                    data: {
                        user_id: newUser.user_id,
                        role_name: 'admin',
                        role_desc:
                            'Quyền quản trị cao nhất, được thao tác toàn bộ',
                    },
                });
            } else {
                badRequest('Admin private key không chính xác');
            }

            // 3/ Tạo userInfo trong table user_info
            await this.prisma.user_info.create({
                data: {
                    user_id: newUser.user_id,
                },
            });

            // 4/ Tạo image_list mới với tên là avatar
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

            return successCode(201, 'Đăng ký thành công', newUser);
        } else {
            conflict('Email đã tồn tại');
        }
    }

    // Remove token cũ cùng user_id trong session, chỉ lấy token đăng nhập mới nhất
    async removeOldToken(id: number) {
        const latestSession = await this.prisma.session.findFirst({
            where: {
                user_id: id,
            },
            orderBy: {
                session_id: 'desc',
            },
        });

        const sessionToDelete = await this.prisma.session.findMany({
            where: {
                user_id: id,
                NOT: {
                    session_id: latestSession.session_id,
                },
            },
            select: {
                session_id: true,
            },
        });

        if (sessionToDelete.length > 0) {
            await this.prisma.$transaction(
                sessionToDelete.map((session) =>
                    this.prisma.session.update({
                        data: {
                            token: 'expires',
                            is_online: false,
                        },
                        where: { session_id: session.session_id },
                    }),
                ),
            );
        }
    }

    // Đăng nhập
    async login(userLogin: UserLoginType) {
        // 1/ Check email và pass_word
        let checkUser = await this.prisma.user.findFirst({
            where: {
                email: userLogin.email,
            },
        });

        if (checkUser) {
            // 2/ compare(pass_word, hashedPassword)
            const isMatch = await bcrypt.compare(
                userLogin.pass_word,
                checkUser.pass_word,
            );

            if (isMatch) {
                // 3/ Tạo token
                let { user_id, email } = checkUser;
                let user_role = await this.prisma.ro_role.findFirst({
                    where: {
                        user_id: user_id,
                    },
                });

                let userLogin = {
                    user_id,
                    email,
                    role_name: user_role.role_name,
                    role_desc: user_role.role_desc,
                };
                let token = this.jwtService.sign(
                    { data: userLogin },
                    {
                        expiresIn: this.config.get('TOKEN_TIME'),
                        secret: this.config.get('SECRET_KEY'),
                    },
                );

                // Tìm record mới nhất trong tất cả record có cùng user_id
                // 4/ Cập nhật  bảng session
                await this.prisma.session.create({
                    data: {
                        user_id: user_id,
                        token: token,
                        is_online: true,
                        logout_at: null,
                    },
                });

                // 5/ Remove token cũ cùng user_id trong session, chỉ giữ token đăng nhập mới nhất
                await this.removeOldToken(user_id);

                // 6/ Thông báo đăng nhập thành công, trả lại token
                return successCode(200, 'Đăng nhập thành công', { token });
            } else {
                unauthorized('Mật khẩu không chính xác');
            }
        } else {
            unauthorized('Email không chính xác');
        }

        // khóa API theo token đó
    }

    // Lấy thông tin user từ token
    async getUserInfo(req: any) {
        let myInfo = req.user.data;
        let allUserInfo = await this.prisma.user.findFirst({
            where: {
                user_id: myInfo.user_id,
            },
            include: {
                user_info: true,
            },
        });

        return successCode(200, 'Lấy thông tin user thành công', {
            ...allUserInfo,
            role: myInfo.role_name,
        });
    }

    // Cập nhật user info
    async updateUserInfo(updateUserInfo: UpdateUserInfoType, req: any) {
        const myInfo = req.user.data;
        if (myInfo) {
            const {
                full_name,
                age,
                gender,
                country,
                study_at,
                working_at,
                favorites,
            } = updateUserInfo;
            await this.prisma.user.update({
                where: {
                    user_id: myInfo.user_id,
                },
                data: {
                    full_name,
                },
            });
            await this.prisma.user_info.update({
                data: {
                    age,
                    gender,
                    country,
                    study_at,
                    working_at,
                    favorites,
                },
                where: {
                    user_id: myInfo.user_id,
                },
            });

            //
            const newUser = await this.prisma.user.findFirst({
                where: {
                    user_id: myInfo.user_id,
                },
                include: {
                    user_info: true,
                },
            });

            return successCode(
                200,
                'Cập nhật thông tin user thành công',
                newUser,
            );
        } else {
            unauthorized('Không đủ quyền truy cập hoặc token đã hết hạn');
        }
    }

    // Upload avatar
    async uploadUserAvatar(req: any, fileUpload: Express.Multer.File) {
        const myInfo = req.user.data;
        // 1/ Thực hiện lưu file vào table user - cột avatar

        await this.prisma.user.update({
            data: {
                avatar: `/public/img/${fileUpload.filename}`,
            },
            where: {
                user_id: myInfo.user_id,
            },
        });

        // 2/ Lấy ra được image_list_id thông qua user_id và list_name=avatar
        let findImageList = await this.prisma.image_list.findFirst({
            where: {
                user_id: myInfo.user_id,
                list_name: 'uploaded-images',
            },
        });

        // 3/ Thêm avatar này vào image
        await this.prisma.image.create({
            data: {
                image_name: fileUpload.originalname,
                path: `/public/img/${fileUpload.filename}`,
                image_list_id: findImageList.image_list_id,
            },
        });

        return successCode(
            200,
            'Cập nhật avatar thành công',
            fileUpload.originalname,
        );
    }

    // Upload ảnh bìa - cover_image
    async uploadUserCoverImage(req: any, fileUpload: Express.Multer.File) {
        const myInfo = req.user.data;
        // 1/ Thực hiện lưu file vào table user_info  - cột cover_image

        await this.prisma.user_info.update({
            data: {
                cover_image: `/public/img/${fileUpload.filename}`,
            },
            where: {
                user_id: myInfo.user_id,
            },
        });

        // 2/ Lấy ra được image_list_id thông qua user_id và list_name=avatar
        let findImageList = await this.prisma.image_list.findFirst({
            where: {
                user_id: myInfo.user_id,
                list_name: 'uploaded-images',
            },
        });

        // 3/ Thêm cover_image này vào image
        await this.prisma.image.create({
            data: {
                image_name: fileUpload.originalname,
                path: fileUpload.filename,
                image_list_id: findImageList.image_list_id,
            },
        });

        return successCode(
            200,
            'Cập nhật ảnh bìa thành công',
            fileUpload.originalname,
        );
    }

    // Đổi mật khẩu user
    async changePassword(changePass: ChangePasswordType, req: any) {
        let decodeToken = req.user;
        if (decodeToken) {
            // 1/Tìm thông tin user
            let id = decodeToken.data.user_id;
            let userInfo = await this.prisma.user.findFirst({
                where: {
                    user_id: id,
                },
            });

            // 2/ match với mật khẩu cũ
            const isMatch = await bcrypt.compare(
                changePass.old_pass_word,
                userInfo.pass_word,
            );

            if (isMatch) {
                let hashedPassword = await bcrypt.hash(
                    changePass.new_pass_word,
                    10,
                );
                // return newPass;
                await this.prisma.user.update({
                    data: {
                        ...userInfo,
                        pass_word: hashedPassword,
                    },
                    where: {
                        user_id: id,
                    },
                });
                // return 'Thành công';
                return successCode(200, 'Đổi mật khẩu thành công', 'success');
            } else {
                unauthorized('Mật khẩu không chính xác');
            }
        } else {
            unauthorized('Không đủ quyền truy cập hoặc token đã hết hạn');
        }
    }

    // Đăng xuất
    async logout(req: any) {
        // Đổi token trong table session
        const userId = req.user.data.user_id;
        const latestSession = await this.prisma.session.findFirst({
            where: {
                user_id: userId,
            },
            orderBy: {
                session_id: 'desc',
            },
        });

        if (latestSession) {
            await this.prisma.session.update({
                where: {
                    session_id: latestSession.session_id,
                },
                data: {
                    token: 'expires',
                    is_online: false,
                },
            });

            return successCode(200, 'Đăng xuất thành công', 'Logout');
        }
    }

    //////////
}
