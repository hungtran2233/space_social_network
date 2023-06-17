import {
    Body,
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
    signUp(@Body() userSignUp: UserSignUpType) {
        try {
            return this.authService.signUp(userSignUp);
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // Lấy thông tin user từ token
    @UseGuards(AuthGuard('jwt'))
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
    @UseGuards(AuthGuard('jwt'))
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

    // Đổi mật khẩu user
    @UseGuards(AuthGuard('jwt'))
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
