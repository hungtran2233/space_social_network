import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PrismaClient } from '@prisma/client';
import { notFound, successCode } from 'config/Response';

@Injectable()
export class PostService {
    prisma = new PrismaClient();
    ///////
    // User tạo bài post
    async create(
        req: any,
        postContent: string,
        videoUrl: string,
        postPrivacy: number,
        files: Express.Multer.File,
    ) {
        const myInfo = req.user.data;
        // 1/ Tạo mới bài post
        const newPost = await this.prisma.post.create({
            data: {
                user_id: Number(myInfo.user_id),
                content: postContent,
                video_url: videoUrl,
                privacy_id: Number(postPrivacy),
            },
        });

        // Tìm image_list có list_name='uploaded-images' của user đang tạo post
        const imgList = await this.prisma.image_list.findFirst({
            where: {
                user_id: myInfo.user_id,
                list_name: 'uploaded-images',
            },
        });

        // Nếu post có image thì sẽ lưu image vào table image và table post_image
        const newFiles = JSON.parse(JSON.stringify(files));
        let postImageDetail = null;
        if (newFiles && newFiles.length > 0) {
            // 1/Map files để lưu nhiều image vào table image
            const images = newFiles.map((files) => ({
                image_name: files.originalname,
                path: files.filename,
                image_list_id: imgList.image_list_id,
                is_delete: false,
            }));
            const temp = await this.prisma.image.createMany({
                data: images,
            });

            const countImg = temp.count;
            // 2/Sau khi lưu vào table image, lấy ra giá trị id của các image đó từ countImg (số image vừa mới tạo ra)
            const arrImg = await this.prisma.image.findMany({
                take: +countImg,
                orderBy: {
                    created_at: 'desc',
                },
                select: {
                    image_id: true,
                },
            });

            // 3/Lưu vào table post_image
            const arrPostImage = arrImg.map((img) => ({
                post_id: newPost.post_id,
                image_id: img.image_id,
            }));
            postImageDetail = await this.prisma.post_image.createMany({
                data: arrPostImage,
            });
        }

        return successCode(201, 'Tạo bài post thành công', newPost);
    }

    // Hiển thị tất cả bài post công khai Lấy tất cả bài post của tất cả user có privacy_id=1  (public)
    async findAll() {
        const allPost = await this.prisma.$queryRaw`
            SELECT 
                p.post_id,
                p.user_id,
                p.content,
                p.video_url,
                CASE WHEN COUNT(i.image_id) = 0 THEN JSON_ARRAY() ELSE 
                JSON_ARRAYAGG(JSON_OBJECT('image_id', i.image_id, "image_name", i.image_name,  
                'path', i.path,  'description', i.description)) 
                END AS arr_img
            FROM
                post p
            LEFT JOIN
                post_image pi ON p.post_id = pi.post_id
            LEFT JOIN
                image i ON pi.image_id = i.image_id
            WHERE
                p.privacy_id = 1 and p.is_deleted = 0
            GROUP BY
                p.post_id;
        `;

        if (allPost) {
            return successCode(
                200,
                'Lấy danh sách bài viết thành công',
                allPost,
            );
        } else {
            notFound('Không có bài viết nào tồn tại');
        }
    }

    // Trang cá nhân: lấy tất cả bài viết cá nhân
    async findPostPersonal(req: any) {
        const myPost = await this.prisma.post.findMany({
            where: {
                user_id: req.user.data.user_id,
                is_deleted: false,
            },
        });
        if (myPost) {
            successCode(200, 'Lấy danh sách bài viết thành công', myPost);
        } else {
            notFound('Bạn không có bài viết nào');
        }
        return myPost;
    }

    // Cập nhật bài viết
    async update(id: number, postCon) {
        console.log(postCon);
        // Cập nhật bài post và xử lý các file tại đây
        return postCon;
    }

    // Xóa bài viết
    async removePost(id: number, req: any) {
        const existingPost = await this.prisma.post.findFirst({
            where: {
                user_id: req.user.data.user_id,
                post_id: id,
                is_deleted: false,
            },
        });

        if (existingPost) {
            await this.prisma.post.update({
                where: {
                    post_id: id,
                },
                data: {
                    is_deleted: true,
                },
            });

            return successCode(
                200,
                'Xóa bài viết thành công',
                `Deleted postId=${id}`,
            );
        } else {
            notFound('Bài viết của bạn không tồn tại');
        }
    }
}
