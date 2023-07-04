import { Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PrismaClient } from '@prisma/client';
import { badRequest, notFound, successCode } from 'config/Response';

@Injectable()
export class CommentService {
    prisma = new PrismaClient();
    ///////////////////
    // Tạo comment cho  post
    async create(id: number, req: any, createCommentDto: CreateCommentDto) {
        const myInfo = req.user.data;
        const existingPost = await this.prisma.post.findFirst({
            where: {
                post_id: id,
            },
        });

        if (createCommentDto.content == null)
            badRequest('Bạn chưa viết comment');

        if (existingPost) {
            const newComment = await this.prisma.comment.create({
                data: {
                    user_id: myInfo.user_id,
                    post_id: existingPost.post_id,
                    content: createCommentDto.content,
                    like_count_comment: 0,
                },
            });
            return successCode(201, 'Tạo comment thành công', newComment);
        } else {
            notFound('Bài viết không tồn tại');
        }
    }

    // Lấy tất cả comment của post
    async findAllPostComment(id: number, req: any) {
        const myInfo = req.user.data;
        const existingPost = await this.prisma.post.findFirst({
            where: {
                user_id: myInfo.user_id,
                post_id: id,
            },
        });
        if (existingPost) {
            const allComment = await this.prisma.comment.findMany({
                where: {
                    user_id: myInfo.user_id,
                    post_id: id,
                },
            });
            return successCode(
                200,
                'Lấy danh sách comment thành công',
                allComment,
            );
        } else {
            notFound('Bài viết không tồn tại');
        }
    }

    //
    update(id: number, updateCommentDto: UpdateCommentDto) {
        return `This action updates a #${id} comment`;
    }

    // Xóa comment
    async remove(postId: number, commentId: number, req: any) {
        const myInfo = req.user.data;
        const myComment = await this.prisma.comment.findFirst({
            where: {
                comment_id: commentId,
                user_id: myInfo.user_id,
                post_id: postId,
            },
        });
        if (myComment) {
            await this.prisma.comment.delete({
                where: {
                    comment_id: commentId,
                },
            });
            return successCode(
                200,
                'Xóa comment thành công',
                `Deleted commentId=${commentId}`,
            );
        } else {
            notFound('Bạn không có bình luận này');
        }
    }
}
