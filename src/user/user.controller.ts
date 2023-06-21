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
    create(@Body() createUserDto: CreateUserDto) {
        try {
            return this.userService.create(createUserDto);
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

    // Lấy tất cả user, bao gồm cả user đã bị xóa
    @RoleDecorator(Role.ADMIN)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Get('/get-user')
    @HttpCode(200)
    findAll(): Promise<{
        message: string;
        statusCode: number;
        content: user[];
    }> {
        try {
            return this.userService.findAll();
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
            const updateData: UpdateUserDto = {};
            return this.userService.update(+id, updateData);
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // Xóa
    @RoleDecorator(Role.ADMIN)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Delete('/delete-user/:id')
    @HttpCode(200)
    remove(@Param('id') id: string) {
        return this.userService.remove(+id);
    }
}
