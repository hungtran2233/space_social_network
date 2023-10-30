import {
    Controller,
    Get,
    Post,
    Put,
    Body,
    Patch,
    Param,
    Delete,
    ConflictException,
    HttpCode,
    HttpException,
    HttpStatus,
    UseGuards,
    Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { user } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { successCode } from 'config/Response';
import { Role } from 'src/auth/guard/role';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guard/role.guard';
import { RoleDecorator } from 'src/auth/guard/role.decorator';

@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService,
        private configService: ConfigService,
    ) {}

    // Create user
    @RoleDecorator(Role.ADMIN)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Post('/create-user')
    @HttpCode(201)
    create(@Body() createUserDto: CreateUserDto, @Req() req: any) {
        try {
            return this.userService.create(createUserDto, req);
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // Cấp quyền cho user
    @RoleDecorator(Role.ADMIN)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Put('/provide-role-user/:id')
    @HttpCode(200)
    provideRole(@Param('id') id: string, @Body() roleName: any) {
        try {
            return this.userService.provideRole(+id, roleName);
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // Lấy tất cả user, bao gồm cả user đã bị khóa
    @RoleDecorator(Role.ADMIN)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Get('/get-user')
    @HttpCode(200)
    findAll(@Req() req: any) {
        try {
            return this.userService.findAll(req);
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // Lấy 1 user
    @RoleDecorator(Role.ADMIN)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Get('/get-user/:id')
    @HttpCode(200)
    findOne(@Param('id') id: string) {
        return this.userService.findOne(Number(id));
    }

    // Sửa
    @RoleDecorator(Role.ADMIN)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Put('/update-user/:id')
    @HttpCode(200)
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        try {
            return this.userService.update(+id, updateUserDto);
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // Block user
    @RoleDecorator(Role.ADMIN)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Put('/block-user/:id')
    @HttpCode(200)
    blockUser(@Param('id') id: string) {
        return this.userService.blockUser(+id);
    }

    //////////////////////
    // Message - lấy tất cả user
    @RoleDecorator(Role.ADMIN, Role.USER)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Get('/get-all-user')
    getAllUser(@Req() req: any) {
        try {
            return this.userService.getAllUser(req);
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /////// OTHER USER
    // Tìm user thông qua link-url ==> lấy tất cả table user, user_info, post, image_list
    @RoleDecorator(Role.ADMIN, Role.USER)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Get('/get-user-from-link-url/total-info-other-user/:linkUrl')
    @HttpCode(200)
    findUserInfoFromLink(@Param('linkUrl') linkUrl: string) {
        try {
            return this.userService.findUserInfoFromLink(linkUrl);
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // Lấy ra danh sách bạn bè --> hiển thị lên tab "bạn bè"
    @RoleDecorator(Role.ADMIN, Role.USER)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Get('/get-user-from-link-url/show-on-friend/:linkUrl')
    @HttpCode(200)
    findFriendOtherUser(@Param('linkUrl') linkUrl: string) {
        try {
            return this.userService.findFriendOtherUser(linkUrl);
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
