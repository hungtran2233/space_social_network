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
    UseGuards,
    UseInterceptors,
    UploadedFile,
} from '@nestjs/common';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { RoleDecorator } from 'src/auth/guard/role.decorator';
import { Role } from 'src/auth/guard/role';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guard/role.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller('news')
export class NewsController {
    constructor(private readonly newsService: NewsService) {}

    // Tạo tin
    @RoleDecorator(Role.ADMIN, Role.USER, Role.CELEBRITY)
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
    @Post('/create-news')
    create(
        @Req() req: any,
        @UploadedFile() file: Express.Multer.File,
        @Body('news_content') newsContent: string,
        @Body('music_url') musicUrl: string,
        @Body('privacy_id') privacyId: string,
    ) {
        try {
            return this.newsService.create(
                req,
                file,
                newsContent,
                musicUrl,
                +privacyId,
            );
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @RoleDecorator(Role.ADMIN, Role.USER, Role.CELEBRITY)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Get('/get-all-news')
    findAll() {
        try {
            return this.newsService.findAll();
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.newsService.remove(+id);
    }
}
