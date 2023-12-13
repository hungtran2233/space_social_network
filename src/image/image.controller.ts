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
    UploadedFiles,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ImageService } from './image.service';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Image } from './entities/image.entity';
import { RoleDecorator } from 'src/auth/guard/role.decorator';
import { Role } from 'src/auth/guard/role';
import { RolesGuard } from 'src/auth/guard/role.guard';

@Controller('image')
export class ImageController {
    constructor(private readonly imageService: ImageService) {}

    // Upload ảnh -- user upload ảnh lên cho cộng đồng
    @RoleDecorator(Role.ADMIN, Role.USER, Role.CELEBRITY)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @UseInterceptors(
        FilesInterceptor('files', 20, {
            storage: diskStorage({
                destination: process.cwd() + '/public/image/community',
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
        @UploadedFiles() filesUpload: Express.Multer.File,
        @Body('description') descImg: string,
    ) {
        try {
            return this.imageService.uploadImage(req, filesUpload, descImg);
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // Upload ảnh cho album cá nhân
    @RoleDecorator(Role.ADMIN, Role.USER, Role.CELEBRITY)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @UseInterceptors(
        FilesInterceptor('files', 20, {
            storage: diskStorage({
                destination: process.cwd() + '/public/image/community',
                filename: (req, file, callback) => {
                    callback(
                        null,
                        new Date().getTime() + '_' + file.originalname,
                    );
                },
            }),
        }),
    )
    @Post('/create-image-for-album')
    uploadImageForAlbum(
        @Req() req: any,
        @UploadedFiles() filesUpload: Express.Multer.File,
        @Body('description') descImg: string,
        @Body('image_list_id') imgListId: number,
    ) {
        try {
            return this.imageService.uploadImageForAlbum(
                req,
                filesUpload,
                descImg,
                imgListId,
            );
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // User xem toàn bộ ảnh của tất cả user trong hệ thống
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

    // User xem ảnh cá nhân của mình
    @RoleDecorator(Role.ADMIN, Role.USER, Role.CELEBRITY)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Get('/get-all-personal-image')
    findAllPersonalImage(@Req() req: any) {
        try {
            return this.imageService.findAllPersonalImage(req);
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
