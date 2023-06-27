import {
    Body,
    Headers,
    ConflictException,
    Controller,
    HttpCode,
    HttpException,
    HttpStatus,
    Post,
    Get,
    Param,
    Req,
    UseGuards,
    Put,
    UseInterceptors,
    UploadedFile,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { user } from '@prisma/client';
import {
    ChangePasswordType,
    UpdateUserInfoType,
    UserLoginType,
    UserSignUpType,
} from './entities/auth.entities';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { RoleDecorator } from './guard/role.decorator';
import { RolesGuard } from './guard/role.guard';
import { Role } from './guard/role';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    // Đăng nhập
    @Post('login')
    @HttpCode(200)
    login(@Body() userLogin: UserLoginType) {
        try {
            return this.authService.login(userLogin);
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // Đăng ký
    @Post('signup')
    @HttpCode(201)
    signUp(@Body() userSignUp: UserSignUpType, @Headers() headers: any) {
        try {
            return this.authService.signUp(userSignUp, headers);
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // Lấy thông tin user từ token
    @RoleDecorator(Role.ADMIN, Role.USER)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Get('/get-user-info')
    getUserInfo(@Req() req) {
        try {
            return this.authService.getUserInfo(req);
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // Cập nhật user info
    @RoleDecorator(Role.ADMIN, Role.USER)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Put('/update-user-info')
    updateUserInfo(@Body() updateUserInfo: UpdateUserInfoType, @Req() req) {
        try {
            return this.authService.updateUserInfo(updateUserInfo, req);
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // Upload avatar
    @RoleDecorator(Role.ADMIN, Role.USER)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: process.cwd() + '/public/img',
                filename: (req, file, callback) =>
                    callback(
                        null,
                        new Date().getTime() + '_' + file.originalname,
                    ),
            }),
        }),
    )
    @Post('/upload-user-avatar')
    uploadAvatar(@Req() req, @UploadedFile() fileUpload: Express.Multer.File) {
        try {
            return this.authService.uploadUserAvatar(req, fileUpload);
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // Đổi mật khẩu user
    @RoleDecorator(Role.ADMIN, Role.USER)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Put('/change-password')
    changePassword(@Body() changePass: ChangePasswordType, @Req() req) {
        try {
            return this.authService.changePassword(changePass, req);
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // Đăng xuất
    @RoleDecorator(Role.ADMIN, Role.USER)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Post('/logout')
    logout(@Req() req) {
        try {
            return this.authService.logout(req);
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
