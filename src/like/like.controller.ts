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
import { LikeService } from './like.service';
import {
    CountPostLikeDto,
    CreatePostLikeDto,
    CreateImageLikeDto,
    CountImageLikeDto,
    CreateCommentLikeDto,
    CountCommentLikeDto,
} from './dto/create-like.dto';
import { UpdateLikeDto } from './dto/update-like.dto';
import { RoleDecorator } from 'src/auth/guard/role.decorator';
import { Role } from 'src/auth/guard/role';
import { RolesGuard } from 'src/auth/guard/role.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('like')
export class LikeController {
    constructor(private readonly likeService: LikeService) {}

    // Post Like ---- Nhấn like - bỏ like
    @RoleDecorator(Role.ADMIN, Role.USER, Role.CELEBRITY)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Post('/like-post')
    actionPostLike(
        @Req() req: any,
        @Body() createPostLikeDto: CreatePostLikeDto,
    ) {
        try {
            return this.likeService.actionPostLike(req, createPostLikeDto);
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // Post Like -- Đếm số lượt like của bài post
    @Get('/count-post-like')
    countPostLike(@Req() req: any, @Body() countPostLike: CountPostLikeDto) {
        try {
            return this.likeService.countPostLike(req, countPostLike);
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    //////////////////////
    // Image Like ---- Nhấn like - bỏ like
    @RoleDecorator(Role.ADMIN, Role.USER, Role.CELEBRITY)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Post('/image-like')
    actionImageLike(
        @Req() req: any,
        @Body() createImageLikeDto: CreateImageLikeDto,
    ) {
        try {
            return this.likeService.actionImageLike(req, createImageLikeDto);
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // Image Like -- Đếm số lượt like của image
    @Get('/count-image-like')
    countImageLike(@Req() req: any, @Body() countImageLike: CountImageLikeDto) {
        try {
            return this.likeService.countImageLike(req, countImageLike);
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    //////////////////////
    // Comment Like ---- Nhấn like - bỏ like
    @RoleDecorator(Role.ADMIN, Role.USER, Role.CELEBRITY)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Post('/comment-like')
    actionCommentLike(
        @Req() req: any,
        @Body() createCommentLikeDto: CreateCommentLikeDto,
    ) {
        try {
            return this.likeService.actionCommentLike(
                req,
                createCommentLikeDto,
            );
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // Comment Like -- Đếm số lượt like của comment
    @Get('/count-comment-like')
    countCommentLike(
        @Req() req: any,
        @Body() countCommentLike: CountCommentLikeDto,
    ) {
        try {
            return this.likeService.countCommentLike(req, countCommentLike);
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
