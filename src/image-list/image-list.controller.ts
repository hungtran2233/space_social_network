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

@Controller('image-list')
export class ImageListController {
    constructor(private readonly imageListService: ImageListService) {}

    // Thêm
    @UseGuards(AuthGuard('jwt'))
    @Post('/create')
    create(@Body() createImageListDto: CreateImageListDto, @Req() req) {
        return this.imageListService.create(createImageListDto, req);
    }

    // Lấy tất cả
    @Get('/get-all')
    findAll() {
        try {
            return this.imageListService.findAll();
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // Lấy 1
    @Get('/get-one/:id')
    findOne(@Param('id') id: string) {
        return this.imageListService.findOne(+id);
    }

    // Cập nhật
    @Put('/update-image-list/:id')
    update(
        @Param('id') id: string,
        @Body() updateImageListDto: UpdateImageListDto,
    ) {
        try {
            return this.imageListService.update(+id, updateImageListDto);
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // Xóa
    @Delete('/delete-image-list/:id')
    remove(@Param('id') id: string) {
        try {
            return this.imageListService.remove(+id);
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
