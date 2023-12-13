import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Req,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { FollowService } from './follow.service';
import { CreateFollowDto } from './dto/create-follow.dto';
import { UpdateFollowDto } from './dto/update-follow.dto';
import { RoleDecorator } from 'src/auth/guard/role.decorator';
import { Role } from 'src/auth/guard/role';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guard/role.guard';

@Controller('follow')
export class FollowController {
    constructor(private readonly followService: FollowService) {}

    // Tạo lượt theo dõi trang người khác ==> Nhấn nút "Theo dõi" người khác
    @RoleDecorator(Role.ADMIN, Role.USER)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Post('/create-follow')
    create(@Body() createFollowDto: CreateFollowDto, @Req() req: any) {
        try {
            return this.followService.create(createFollowDto, req);
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // Kiểm tra xem mình có đang theo dõi người kia hay không
    @RoleDecorator(Role.ADMIN, Role.USER)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Get('/check-follow/:link_url')
    findOne(@Param('link_url') linkUrl: string, @Req() req: any) {
        try {
            return this.followService.findOne(linkUrl, req);
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateFollowDto: UpdateFollowDto) {
        return this.followService.update(+id, updateFollowDto);
    }

    // Bỏ theo dõi người khác
    @RoleDecorator(Role.ADMIN, Role.USER)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Delete('/remove-follow/:link_url')
    remove(@Param('link_url') linkUrl: string, @Req() req: any) {
        try {
            return this.followService.remove(linkUrl, req);
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
