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
import { conflict, successCode, unauthorized } from 'config/Response';
import { getTimeExpiresByToken, getTimeNowVN } from 'config/FormatDateTime';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private config: ConfigService,
    ) {}

    // khai báo prisma
    prisma = new PrismaClient();

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

    // Đăng ký
    async signUp(userSignUp: UserSignUpType) {
        const existingUser = await this.prisma.user.findFirst({
            where: {
                email: userSignUp.email,
            },
        });
        if (!existingUser) {
            // mã hóa pass_word
            let hashedPassword = await bcrypt.hash(userSignUp.pass_word, 10);

            // 1/ Tạo user trong table user
            let newUser = await this.prisma.user.create({
                data: {
                    ...userSignUp,
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

            // 3/ Tạo image_list mới với tên là avatar
            await this.prisma.image_list.create({
                data: {
                    user_id: newUser.user_id,
                    list_name: 'avatar',
                },
            });
            return successCode(201, 'Đăng ký thành công', newUser);
        } else {
            conflict('Email đã tồn tại');
        }
    }

    // Lấy thông tin user từ token
    async getUserInfo(req: any) {
        let decodeToken = await req.user;
        let id = decodeToken.data.user_id;

        let role_name = decodeToken.data.role_name;

        let allUserInfo = await this.prisma.user.findFirst({
            where: {
                user_id: id,
            },
        });

        let { user_id, email, full_name, age, avatar, gender, country } =
            allUserInfo;
        let userInfo = {
            user_id,
            email,
            full_name,
            age,
            avatar,
            gender,
            country,
            role_name,
        };

        return successCode(200, 'Lấy thông tin user thành công ', userInfo);
    }

    // Cập nhật user info
    async updateUserInfo(updateUserInfo: UpdateUserInfoType, req: any) {
        let decodeToken = await req.user;
        if (decodeToken) {
            let id = decodeToken.data.user_id;

            const { full_name, age, avatar, gender, country } = updateUserInfo;
            const newUserInfo = await this.prisma.user.update({
                data: {
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

            let showUserInfo = { full_name, age, avatar, gender, country };

            return successCode(
                200,
                'Cập nhật thông tin user thành công',
                showUserInfo,
            );
        } else {
            unauthorized('Không đủ quyền truy cập hoặc token đã hết hạn');
        }
    }

    // Cập nhật avatar user
    async uploadUserAvatar(
        // uploadUserAvatar: UploadUserAvatarType,
        req: any,
        fileUpload: Express.Multer.File,
    ) {
        // 1/ Thực hiện lưu file vào table user - cột avatar

        await this.prisma.user.update({
            data: {
                avatar: fileUpload.filename,
            },
            where: {
                user_id: req.user.data.user_id,
            },
        });

        // 2/ Lấy ra được image_list_id thông qua user_id và list_name=avatar
        let findImageList = await this.prisma.image_list.findFirst({
            where: {
                user_id: req.user.user_id,
                list_name: 'avatar',
            },
        });

        // 3/ Thêm avatar này vào image
        await this.prisma.image.create({
            data: {
                image_name: fileUpload.originalname,
                path: fileUpload.filename,
                image_list_id: findImageList.image_list_id,
            },
        });

        return successCode(
            200,
            'Cập nhật avatar thành công',
            fileUpload.originalname,
        );
    }

    // Đổi mật khẩu user
    async changePassword(changePass: ChangePasswordType, req: any) {
        let decodeToken = await req.user;
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
}
