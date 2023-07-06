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
import { ImageListService } from './image-list.service';
import { CreateImageListDto } from './dto/create-image-list.dto';
import { UpdateImageListDto } from './dto/update-image-list.dto';
import { AuthGuard } from '@nestjs/passport';
import { RoleDecorator } from 'src/auth/guard/role.decorator';
import { Role } from 'src/auth/guard/role';
import { RolesGuard } from 'src/auth/guard/role.guard';

@Controller('image-list')
export class ImageListController {
    constructor(private readonly imageListService: ImageListService) {}

    // Tạo image list
    @RoleDecorator(Role.ADMIN, Role.USER, Role.CELEBRITY)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Post('/create')
    create(@Body() createImageListDto: CreateImageListDto, @Req() req: any) {
        try {
            return this.imageListService.create(createImageListDto, req);
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // Lấy tất cả image list
    @RoleDecorator(Role.ADMIN, Role.USER, Role.CELEBRITY)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Get('/get-all-image-list')
    findAll(@Req() req: any) {
        try {
            return this.imageListService.findAll(req);
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // Tìm 1 danh sách dựa vào id
    @Get('/get-one/:id')
    findOne(@Param('id') id: string) {
        return this.imageListService.findOne(+id);
    }

    // Cập nhật
    @RoleDecorator(Role.ADMIN, Role.USER, Role.CELEBRITY)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Put('/update-image-list/:id')
    update(
        @Param('id') id: string,
        @Body() updateImageListDto: UpdateImageListDto,
        @Req() req: any,
    ) {
        try {
            return this.imageListService.update(+id, updateImageListDto, req);
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // Xóa image list của mình
    @RoleDecorator(Role.ADMIN, Role.USER, Role.CELEBRITY)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Delete('/delete-image-list/:id')
    remove(@Param('id') id: string, @Req() req: any) {
        try {
            return this.imageListService.remove(+id, req);
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
