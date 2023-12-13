import {
    Controller,
    Get,
    Post,
    Put,
    Body,
    Patch,
    Param,
    Delete,
    HttpException,
    HttpStatus,
    Req,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    UploadedFiles,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { RoleDecorator } from 'src/auth/guard/role.decorator';
import { Role } from 'src/auth/guard/role';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guard/role.guard';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller('post')
export class PostController {
    constructor(private readonly postService: PostService) {}

    // Tạo bài post (giới hạn "20" tấm ảnh được upload 1 lần)
    @RoleDecorator(Role.ADMIN, Role.USER, Role.CELEBRITY)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @UseInterceptors(
        FilesInterceptor('files', 20, {
            storage: diskStorage({
                destination: process.cwd() + '/public/image/posts',
                filename: (req, file, callback) => {
                    callback(
                        null,
                        new Date().getTime() + '_' + file.originalname,
                    );
                },
            }),
        }),
    )
    @Post('/create-post')
    create(
        @Req() req: any,
        @Body('content') postContent: string,
        @Body('video_url') videoUrl: string,
        @Body('privacy') postPrivacy: number,
        @UploadedFiles() files: Express.Multer.File,
    ) {
        try {
            return this.postService.create(
                req,
                postContent,
                videoUrl,
                postPrivacy,
                files,
            );
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // Hiển thị tất cả bài post của tất cả user theo privacy
    @RoleDecorator(Role.ADMIN, Role.USER, Role.CELEBRITY)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Get('/get-all-post')
    findAll(@Req() req: any) {
        try {
            return this.postService.findAll(req);
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // Trang cá nhân, hiển thị tất cả bài post của cá nhân
    @RoleDecorator(Role.ADMIN, Role.USER, Role.CELEBRITY)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Get('/get-all-post-personal')
    findPostPersonal(@Req() req: any) {
        try {
            return this.postService.findPostPersonal(req);
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // Cập nhật bài viết
    // @RoleDecorator(Role.ADMIN, Role.USER)
    // @UseGuards(AuthGuard('jwt'), RolesGuard)
    // @Put('/update-post/:id')
    // update(@Param('id') id: string, @Body() postCon: any) {
    //     try {
    //         return this.postService.update(+id, postCon);
    //     } catch (error) {
    //         throw new HttpException(
    //             'Lỗi server',
    //             HttpStatus.INTERNAL_SERVER_ERROR,
    //         );
    //     }
    // }

    // Xóa bài viết
    @RoleDecorator(Role.ADMIN, Role.USER, Role.CELEBRITY)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Put('/remove-post/:id')
    removePost(@Param('id') id: string, @Req() req: any) {
        try {
            return this.postService.removePost(+id, req);
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
