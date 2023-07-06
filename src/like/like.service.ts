import { Injectable } from '@nestjs/common';
import {
    CountPostLikeDto,
    CreatePostLikeDto,
    CreateImageLikeDto,
    CountImageLikeDto,
    CreateCommentLikeDto,
    CountCommentLikeDto,
} from './dto/create-like.dto';
import { UpdateLikeDto } from './dto/update-like.dto';
import { PrismaClient } from '@prisma/client';
import { badRequest, notFound, successCode } from 'config/Response';

@Injectable()
export class LikeService {
    prisma = new PrismaClient();
    //////////

    // Post Like --- Nhấn like - bỏ like
    async actionPostLike(req: any, createPostLikeDto: CreatePostLikeDto) {
        if (!req.body.hasOwnProperty('post_id'))
            badRequest('Thiếu thông tin bắt buộc trong body');
        const myInfo = req.user.data;
        const existingPost = await this.prisma.post.findFirst({
            where: {
                post_id: createPostLikeDto.post_id,
            },
        });
        if (!existingPost) notFound('Bài viết không tồn tại');

        const existingPostLike = await this.prisma.post_like.findFirst({
            where: {
                user_id: myInfo.user_id,
                post_id: createPostLikeDto.post_id,
            },
        });

        if (existingPostLike) {
            const deletePostLike = await this.prisma.post_like.delete({
                where: {
                    user_id_post_id: {
                        user_id: myInfo.user_id,
                        post_id: createPostLikeDto.post_id,
                    },
                },
            });
            return successCode(
                200,
                'Bỏ like bài viết thành công',
                `Deleted postLikeId=${createPostLikeDto.post_id}`,
            );
        } else {
            const newPostLike = await this.prisma.post_like.create({
                data: {
                    user_id: myInfo.user_id,
                    post_id: createPostLikeDto.post_id,
                },
            });
            return successCode(
                200,
                'Bạn đã like bài viết thành công',
                newPostLike,
            );
        }
    }

    // Post Like -- Đếm số lượt like của bài post
    async countPostLike(req: any, countPostLike: CountPostLikeDto) {
        if (!req.body.hasOwnProperty('post_id'))
            badRequest('Thiếu thông tin bắt buộc trong body');

        const existingPost = await this.prisma.post.findFirst({
            where: {
                post_id: countPostLike.post_id,
            },
        });
        if (!existingPost) notFound('Bài post không tồn tại');
        const countLike = await this.prisma.post_like.count({
            where: {
                post_id: countPostLike.post_id,
            },
        });
        return successCode(200, 'Lấy lượt like của bài viết thành công', {
            count_post_like: countLike,
        });
    }

    ///////////
    // Image Like -- Nhấn Like - bỏ like
    async actionImageLike(req: any, createImageLikeDto: CreateImageLikeDto) {
        if (!req.body.hasOwnProperty('image_id'))
            badRequest('Thiếu thông tin bắt buộc trong body');
        const myInfo = req.user.data;
        const existingImage = await this.prisma.image.findFirst({
            where: {
                image_id: createImageLikeDto.image_id,
            },
        });
        if (!existingImage) notFound('Image không tồn tại');

        const existingImageLike = await this.prisma.image_like.findFirst({
            where: {
                user_id: myInfo.user_id,
                image_id: createImageLikeDto.image_id,
            },
        });

        if (existingImageLike) {
            const deleteImageLike = await this.prisma.image_like.delete({
                where: {
                    user_id_image_id: {
                        user_id: myInfo.user_id,
                        image_id: createImageLikeDto.image_id,
                    },
                },
            });
            return successCode(
                200,
                'Bỏ like image thành công',
                `Deleted imageLikeId=${createImageLikeDto.image_id}`,
            );
        } else {
            const newImageLike = await this.prisma.image_like.create({
                data: {
                    user_id: myInfo.user_id,
                    image_id: createImageLikeDto.image_id,
                },
            });
            return successCode(
                200,
                'Bạn đã like image thành công',
                newImageLike,
            );
        }
    }

    //
    // Post Like -- Đếm số lượt like của bài post
    async countImageLike(req: any, countImageLike: CountImageLikeDto) {
        if (!req.body.hasOwnProperty('image_id'))
            badRequest('Thiếu thông tin bắt buộc trong body');

        const existingImage = await this.prisma.image.findFirst({
            where: {
                image_id: countImageLike.image_id,
            },
        });
        if (!existingImage) notFound('Image không tồn tại');
        const countLike = await this.prisma.image_like.count({
            where: {
                image_id: countImageLike.image_id,
            },
        });
        return successCode(200, 'Lấy lượt like của image thành công', {
            count_image_like: countLike,
        });
    }

    ///////////
    // Comment Like -- Nhấn Like - bỏ like
    async actionCommentLike(
        req: any,
        createCommentLikeDto: CreateCommentLikeDto,
    ) {
        if (!req.body.hasOwnProperty('comment_id'))
            badRequest('Thiếu thông tin bắt buộc trong body');
        const myInfo = req.user.data;
        const existingComment = await this.prisma.comment.findFirst({
            where: {
                comment_id: createCommentLikeDto.comment_id,
            },
        });
        if (!existingComment) notFound('Comment không tồn tại');

        const existingCommentLike = await this.prisma.comment_like.findFirst({
            where: {
                user_id: myInfo.user_id,
                comment_id: createCommentLikeDto.comment_id,
            },
        });

        if (existingCommentLike) {
            const deleteCommentLike = await this.prisma.comment_like.delete({
                where: {
                    user_id_comment_id: {
                        user_id: myInfo.user_id,
                        comment_id: createCommentLikeDto.comment_id,
                    },
                },
            });
            return successCode(
                200,
                'Bỏ like comment thành công',
                `Deleted commentLikeId=${createCommentLikeDto.comment_id}`,
            );
        } else {
            const newCommentLike = await this.prisma.comment_like.create({
                data: {
                    user_id: myInfo.user_id,
                    comment_id: createCommentLikeDto.comment_id,
                },
            });
            return successCode(
                200,
                'Bạn đã like comment thành công',
                newCommentLike,
            );
        }
    }

    //
    // Comment Like -- Đếm số lượt like của comment
    async countCommentLike(req: any, countCommentLike: CountCommentLikeDto) {
        if (!req.body.hasOwnProperty('comment_id'))
            badRequest('Thiếu thông tin bắt buộc trong body');

        const existingComment = await this.prisma.comment.findFirst({
            where: {
                comment_id: countCommentLike.comment_id,
            },
        });
        if (!existingComment) notFound('Comment không tồn tại');
        const countLike = await this.prisma.comment_like.count({
            where: {
                comment_id: countCommentLike.comment_id,
            },
        });
        return successCode(200, 'Lấy lượt like của comment thành công', {
            count_comment_like: countLike,
        });
    }
}
