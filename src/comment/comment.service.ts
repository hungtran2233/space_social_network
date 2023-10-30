import { Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PrismaClient } from '@prisma/client';
import { badRequest, notFound, successCode } from 'config/Response';

@Injectable()
export class CommentService {
    prisma = new PrismaClient();
    ///////////////////
    // Tạo comment cho  POST
    async create(req: any, createCommentDto: CreateCommentDto) {
        const myInfo = req.user.data;
        // Kiểm tra và xác thực dữ liệu
        if (
            !req.body.hasOwnProperty('post_id') ||
            !req.body.hasOwnProperty('content')
        ) {
            // Trả về lỗi nếu thiếu các key bắt buộc
            return badRequest('Thiếu hoặc sai thông tin bắt buộc trong body');
        }
        if (createCommentDto.content == null)
            badRequest('Bạn chưa viết comment');
        // Tìm bài post ta đang định comment
        const existingPost = await this.prisma.post.findFirst({
            where: {
                post_id: createCommentDto.post_id,
            },
        });

        if (existingPost) {
            const newComment = await this.prisma.comment.create({
                data: {
                    user_id: myInfo.user_id,
                    post_id: existingPost.post_id,
                    content: createCommentDto.content,
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
                post_id: id,
            },
        });
        if (existingPost) {
            const allComment = await this.prisma.post.findFirst({
                where: {
                    post_id: id,
                },
                select: {
                    comment: {
                        select: {
                            comment_id: true,
                            content: true,
                            image_id: true,
                            user: {
                                select: {
                                    user_id: true,
                                    full_name: true,
                                    avatar: true,
                                    link_url: true,
                                },
                            },
                            created_at: true,
                        },
                    },
                },
            });
            return successCode(
                200,
                'Lấy danh sách comment của bài viết thành công',
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

    ////
    // Xóa comment POST của chính chủ user
    async removePostComment(
        postId: number,
        createCommentDto: CreateCommentDto,
        req: any,
    ) {
        // Kiểm tra post tồn tại hay không
        const existingPost = await this.prisma.post.findFirst({
            where: {
                post_id: postId,
            },
        });
        if (!existingPost) notFound('Bài viết không tồn tại');
        // Kiểm tra và xác thực dữ liệu
        if (!req.body.hasOwnProperty('comment_id'))
            badRequest('Thiếu hoặc sai thông tin bắt buộc trong body');

        const myInfo = req.user.data;
        const myComment = await this.prisma.comment.findFirst({
            where: {
                comment_id: createCommentDto.comment_id,
                user_id: myInfo.user_id,
                post_id: postId,
            },
        });

        if (myComment) {
            await this.prisma.comment.delete({
                where: {
                    comment_id: myComment.comment_id,
                },
            });
            return successCode(
                200,
                'Xóa comment thành công',
                `Deleted commentId=${myComment.comment_id}`,
            );
        } else {
            notFound('Bạn không có bình luận này');
        }
    }

    /////////////////////////////////////////////////////
    ////////////////////////////////////////////////////
    // Image
    // Tạo comment cho  image
    async createImageComment(req: any, createCommentDto: CreateCommentDto) {
        const myInfo = req.user.data;

        // Kiểm tra và xác thực dữ liệu
        if (
            !req.body.hasOwnProperty('image_id') ||
            !req.body.hasOwnProperty('content')
        ) {
            // Trả về lỗi nếu thiếu các key bắt buộc
            return badRequest('Thiếu hoặc sai thông tin bắt buộc trong body');
        }
        // Tìm bài post ta đang định comment
        const existingImage = await this.prisma.image.findFirst({
            where: {
                image_id: createCommentDto.image_id,
            },
        });

        if (createCommentDto.content === '')
            badRequest('Bạn chưa viết comment');

        if (!existingImage) notFound('Image không tồn tại');

        const newComment = await this.prisma.comment.create({
            data: {
                user_id: myInfo.user_id,
                image_id: existingImage.image_id,
                content: createCommentDto.content,
            },
        });
        return successCode(201, 'Tạo comment thành công', newComment);
    }

    // Lấy tất cả comment của image
    async findAllImageComment(id: number, req: any) {
        const existingImage = await this.prisma.image.findFirst({
            where: {
                image_id: id,
            },
        });
        if (!existingImage) notFound('Image không tồn tại');

        const allComment = await this.prisma.comment.findMany({
            where: {
                image_id: id,
            },
        });
        return successCode(
            200,
            'Lấy danh sách comment của image thành công',
            allComment,
        );
    }

    ////
    // Xóa comment IMAGE của chính chủ user
    async removeImageComment(
        imageId: number,
        createCommentDto: CreateCommentDto,
        req: any,
    ) {
        // Kiểm tra image tồn tại hay không
        const existingImage = await this.prisma.image.findFirst({
            where: {
                image_id: imageId,
            },
        });
        if (!existingImage) notFound('Image không tồn tại');
        // Kiểm tra và xác thực dữ liệu
        if (!req.body.hasOwnProperty('comment_id'))
            badRequest('Thiếu hoặc sai thông tin bắt buộc trong body');

        const myInfo = req.user.data;
        const myComment = await this.prisma.comment.findFirst({
            where: {
                comment_id: createCommentDto.comment_id,
                user_id: myInfo.user_id,
                image_id: imageId,
            },
        });

        if (myComment) {
            await this.prisma.comment.delete({
                where: {
                    comment_id: myComment.comment_id,
                },
            });
            return successCode(
                200,
                'Xóa comment thành công',
                `Deleted commentId=${myComment.comment_id}`,
            );
        } else {
            notFound('Bạn không có bình luận này');
        }
    }
}
