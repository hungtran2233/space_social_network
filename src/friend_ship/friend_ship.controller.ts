import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Put,
    Param,
    Delete,
    HttpException,
    HttpStatus,
    UseGuards,
    Req,
} from '@nestjs/common';
import { FriendShipService } from './friend_ship.service';
import { CreateFriendShipDto } from './dto/create-friend_ship.dto';
import { UpdateFriendShipDto } from './dto/update-friend_ship.dto';
import { RoleDecorator } from 'src/auth/guard/role.decorator';
import { Role } from 'src/auth/guard/role';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guard/role.guard';

@Controller('friend-ship')
export class FriendShipController {
    constructor(private readonly friendShipService: FriendShipService) {}

    // Gửi lời mời kết bạn
    @RoleDecorator(Role.ADMIN, Role.USER)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Post('/send-invitation')
    create(@Req() req: any, @Body() createFriendShipDto: CreateFriendShipDto) {
        try {
            return this.friendShipService.create(createFriendShipDto, req);
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // Show ra tất cả lời mời kết bạn của người khác
    @RoleDecorator(Role.ADMIN, Role.USER)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Get('/show-all-invitation')
    findAllInvitation(@Req() req: any) {
        try {
            return this.friendShipService.findAllInvitation(req);
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // Kiểm tra trạng thái bạn bè của mình với người khác ==> dùng khi vào trang cá nhân của người khác
    @RoleDecorator(Role.ADMIN, Role.USER)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Post('/check-friendship-status/:link_url')
    checkFriendShipStatus(@Req() req: any, @Param('link_url') linkUrl: string) {
        try {
            return this.friendShipService.checkFriendShipStatus(req, linkUrl);
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // Show tất cả bạn bè của mình
    @RoleDecorator(Role.ADMIN, Role.USER)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Get('/show-all-friends')
    findAllFriends(@Req() req: any) {
        try {
            return this.friendShipService.findAllFriends(req);
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // Tìm kiếm thông tin của 1 người bạn trong danh sách bạn bè
    // @Get(':id')
    // findOne(@Param('id') id: string) {
    //     return this.friendShipService.findOne(+id);
    // }

    // Chấp nhận lời mời kết bạn
    @RoleDecorator(Role.ADMIN, Role.USER)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Put('/update-friend-ship/:id')
    update(@Req() req: any, @Param('id') id: string) {
        try {
            return this.friendShipService.update(req, +id);
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // Xóa bạn bè với user_id=id
    @RoleDecorator(Role.ADMIN, Role.USER)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Delete('/delete-friend-ship/:id')
    remove(@Req() req: any, @Param('id') id: string) {
        try {
            return this.friendShipService.remove(+id, req);
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
