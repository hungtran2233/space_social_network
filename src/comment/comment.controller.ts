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
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { RoleDecorator } from 'src/auth/guard/role.decorator';
import { AuthGuard } from '@nestjs/passport';
import { Role } from 'src/auth/guard/role';
import { RolesGuard } from 'src/auth/guard/role.guard';

@Controller('comment')
export class CommentController {
    constructor(private readonly commentService: CommentService) {}

    // Tạo comment cho post
    @RoleDecorator(Role.ADMIN, Role.USER, Role.CELEBRITY)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Post('/create-post-comment')
    create(@Req() req: any, @Body() createCommentDto: CreateCommentDto) {
        try {
            return this.commentService.create(req, createCommentDto);
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // Lấy tất cả comment của post
    @RoleDecorator(Role.ADMIN, Role.USER, Role.CELEBRITY)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Get('/get-all-post-comment/:id')
    findAllPostComment(@Param('id') id: string, @Req() req: any) {
        try {
            return this.commentService.findAllPostComment(+id, req);
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateCommentDto: UpdateCommentDto,
    ) {
        return this.commentService.update(+id, updateCommentDto);
    }

    // Xóa comment post của chính chủ user
    @RoleDecorator(Role.ADMIN, Role.USER, Role.CELEBRITY)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Delete('/delete-post-comment/:postId')
    removePostComment(
        @Param('postId') postId: string,
        @Body() createCommentDto: CreateCommentDto,
        @Req() req: any,
    ) {
        try {
            return this.commentService.removePostComment(
                +postId,
                createCommentDto,
                req,
            );
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    ////////////////////////////////////
    // Image
    // Tạo comment cho image
    @RoleDecorator(Role.ADMIN, Role.USER, Role.CELEBRITY)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Post('/create-image-comment')
    createImageComment(
        @Req() req: any,
        @Body() createCommentDto: CreateCommentDto,
    ) {
        try {
            return this.commentService.createImageComment(
                req,
                createCommentDto,
            );
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // Lấy tất cả comment của image
    @RoleDecorator(Role.ADMIN, Role.USER, Role.CELEBRITY)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Get('/get-all-image-comment/:id')
    findAllImageComment(@Param('id') id: string, @Req() req: any) {
        try {
            return this.commentService.findAllImageComment(+id, req);
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // Xóa comment image của chính chủ user
    @RoleDecorator(Role.ADMIN, Role.USER, Role.CELEBRITY)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Delete('/delete-image-comment/:imageId')
    removeImageComment(
        @Param('imageId') imageId: string,
        @Body() createCommentDto: CreateCommentDto,
        @Req() req: any,
    ) {
        try {
            return this.commentService.removeImageComment(
                +imageId,
                createCommentDto,
                req,
            );
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
