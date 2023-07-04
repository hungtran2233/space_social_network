import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    HttpException,
    HttpStatus,
    Req,
    UploadedFile,
    UseGuards,
    UseInterceptors,
    Put,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ImageService } from './image.service';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Image } from './entities/image.entity';
import { RoleDecorator } from 'src/auth/guard/role.decorator';
import { Role } from 'src/auth/guard/role';
import { RolesGuard } from 'src/auth/guard/role.guard';

@Controller('image')
export class ImageController {
    constructor(private readonly imageService: ImageService) {}

    // Upload ảnh
    @RoleDecorator(Role.ADMIN, Role.USER)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: process.cwd() + '/public/img',
                filename: (req, file, callback) => {
                    callback(
                        null,
                        new Date().getTime() + '_' + file.originalname,
                    );
                },
            }),
        }),
    )
    @Post('/create-image')
    uploadImage(
        @Req() req: any,
        @UploadedFile() fileUpload: Express.Multer.File,
        @Body('description') descImg: string,
    ) {
        try {
            return this.imageService.uploadImage(req, fileUpload, descImg);
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // Lấy toàn bộ ảnh
    @Get('/get-all-image')
    findAll() {
        try {
            return this.imageService.findAll();
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // Lấy chi tiết ảnh
    @Get('/image-detail/:id')
    getImageDetail(@Param('id') id: string) {
        try {
            return this.imageService.getImageDetail(+id);
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // Cập nhật lại image
    @RoleDecorator(Role.ADMIN, Role.USER)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Put('/update-image/:id')
    update(@Param('id') id: string, @Body() updateImageDto: UpdateImageDto) {
        try {
            return this.imageService.update(+id, updateImageDto);
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // Xóa mềm image
    @RoleDecorator(Role.ADMIN, Role.USER)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Put('/delete/:id')
    remove(@Param('id') id: string) {
        try {
            return this.imageService.remove(+id);
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /////////////////////////////

    // Lưu ảnh
    @RoleDecorator(Role.ADMIN, Role.USER)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Post('/save-image/:id')
    saveImage(@Param('id') id: string, @Req() req: any) {
        try {
            return this.imageService.saveImage(+id, req);
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // Bỏ lưu ảnh
    @RoleDecorator(Role.ADMIN, Role.USER)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Delete('/unsave-image/:id')
    unSaveImage(@Param('id') id: string, @Req() req: any) {
        try {
            return this.imageService.unSaveImage(+id, req);
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // Hiển thị tất cả ảnh đã lưu trên trang cá nhân
    @RoleDecorator(Role.ADMIN, Role.USER)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Get('/show-saved-image')
    showSavedImage(@Req() req: any) {
        try {
            return this.imageService.showSavedImage(req);
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
