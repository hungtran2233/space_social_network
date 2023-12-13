import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    HttpException,
    HttpStatus,
    Req,
} from '@nestjs/common';
import { BlockListService } from './block_list.service';
import { CreateBlockListDto } from './dto/create-block_list.dto';
import { UpdateBlockListDto } from './dto/update-block_list.dto';
import { RoleDecorator } from 'src/auth/guard/role.decorator';
import { Role } from 'src/auth/guard/role';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guard/role.guard';

@Controller('block-list')
export class BlockListController {
    constructor(private readonly blockListService: BlockListService) {}

    // Block 1 người khác
    @RoleDecorator(Role.ADMIN, Role.USER)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Post('/create-block')
    create(@Body() createBlockListDto: CreateBlockListDto, @Req() req: any) {
        try {
            return this.blockListService.create(createBlockListDto, req);
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // Lấy danh sách những người bị mình block
    @RoleDecorator(Role.ADMIN, Role.USER)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Get('/get-all-blocked-user')
    findAll(@Req() req: any) {
        try {
            return this.blockListService.findAll(req);
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.blockListService.findOne(+id);
    }

    // Bỏ block người khác
    @RoleDecorator(Role.ADMIN, Role.USER)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Delete('/delete-blocked')
    remove(@Body('blocked_user_id') otherUserId: number, @Req() req: any) {
        try {
            return this.blockListService.remove(otherUserId, req);
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
