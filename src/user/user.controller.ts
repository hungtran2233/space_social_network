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
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { user } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { successCode } from 'config/Response';

@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService,
        private configService: ConfigService,
    ) {}

    // Create user
    @Post('/create-user')
    @HttpCode(201)
    create(@Body() createUserDto: user) {
        try {
            return this.userService.create(createUserDto);
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // Lấy tất cả user, bao gồm cả user đã bị xóa
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
    @Get('/get-user/:id')
    findOne(@Param('id') id: string) {
        return this.userService.findOne(Number(id));
    }

    // Sửa
    @Put('/update-user/:id')
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
    @Delete('/delete-user/:id')
    remove(@Param('id') id: string) {
        return this.userService.remove(+id);
    }
}
