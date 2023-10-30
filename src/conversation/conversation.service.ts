import { Injectable } from '@nestjs/common';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import {
    Conversation,
    GroupConversation,
} from './entities/conversation.entity';
import { PrismaClient } from '@prisma/client';
import { notFound, successCode } from 'config/Response';

@Injectable()
export class ConversationService {
    prisma = new PrismaClient();
    //
    async create(conversation: Conversation) {
        let roomId = null;
        // Kiêm tra xem đã có conversation giữa 2 user chưa
        const existingCon = await this.prisma.msg_conversation.findFirst({
            where: {
                OR: [
                    {
                        user_id_1: conversation.user_id_1,
                        user_id_2: conversation.user_id_2,
                    },
                    {
                        user_id_1: conversation.user_id_2,
                        user_id_2: conversation.user_id_1,
                    },
                ],
            },
        });

        if (existingCon) {
            roomId = existingCon.conversation_id;
        } else {
            // Tạo conversation
            const newConversation = await this.prisma.msg_conversation.create({
                data: {
                    conversation_name: `${conversation.user_id_1}-${conversation.user_id_2}`,
                    user_id_1: conversation.user_id_1,
                    user_id_2: conversation.user_id_2,
                },
            });

            // Tạo user_conversation
            await this.prisma.msg_user_conversation.createMany({
                data: [
                    {
                        user_id: newConversation.user_id_1,
                        conversation_id: newConversation.conversation_id,
                    },
                    {
                        user_id: newConversation.user_id_2,
                        conversation_id: newConversation.conversation_id,
                    },
                ],
            });

            roomId = newConversation.conversation_id;
        }
        return successCode(200, 'Lấy cuộc trò chuyện thành công', roomId);
    }

    // Tạo conversation many
    async createGroup(groupConversation: GroupConversation, req: any) {
        // console.log(req.user.data);
        // console.log(groupConversation);
        const newGroupConversation = await this.prisma.msg_conversation.create({
            data: {
                conversation_name: groupConversation.conversation_name,
                user_id_1: req.user.data.user_id,
                is_one_to_one: false,
                uuid_v4: groupConversation.uuid_v4,
            },
        });
        // Thêm  người tạo vào conversation
        const newArr = [
            ...groupConversation.group_user_list,
            req.user.data.user_id,
        ];
        const newUserConversation = await Promise.all(
            newArr.map(async (id) => {
                return this.prisma.msg_user_conversation.create({
                    data: {
                        user_id: +id,
                        conversation_id: newGroupConversation.conversation_id,
                    },
                });
            }),
        );

        return successCode(201, 'Tạo nhóm thành công', {
            conversation_name: groupConversation.conversation_name,
            group_user_list: newArr,
            creator_id: req.user.data.user_id,
            created_at: newGroupConversation.created_at,
        });
    }

    // Lấy tất cả group conversation của user
    async findAll(req: any) {
        const myId = req.user.data.user_id;
        // const myGroup = await this.prisma
        //     .$queryRaw`select msg_conversation.conversation_id, msg_conversation.conversation_name,
        //     msg_conversation.user_id_1 as creator_id
        //     from msg_user_conversation join msg_conversation
        //     on msg_conversation.conversation_id = msg_user_conversation.conversation_id
        //     where msg_user_conversation.user_id = ${myId} and msg_conversation.is_one_to_one = false
        //     `;

        const myGroup = await this.prisma.msg_user_conversation.findMany({
            where: {
                user_id: myId,
                msg_conversation: {
                    is_one_to_one: false,
                },
            },
            select: {
                msg_conversation: {
                    select: {
                        conversation_id: true,
                        conversation_name: true,
                        user_id_1: true,
                        created_at: true,
                        msg_user_conversation: {
                            select: {
                                user: {
                                    select: {
                                        user_id: true,
                                        full_name: true,
                                        avatar: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        const transformedData = myGroup.map((group) => {
            const conversation = group.msg_conversation;
            const users = group.msg_conversation.msg_user_conversation.map(
                (user) => {
                    return {
                        user_id: user.user.user_id,
                        full_name: user.user.full_name,
                        avatar: user.user.avatar,
                    };
                },
            );

            return {
                conversation_id: conversation.conversation_id,
                conversation_name: conversation.conversation_name,
                creator_id: conversation.user_id_1,
                members: users,
                created_at: conversation.created_at,
            };
        });
        return successCode(
            200,
            'Lấy danh sách nhóm trò chuyện thành công',
            transformedData,
        );
    }

    async addMemberGroup(groupConversation: GroupConversation, req: any) {
        const addUserList = groupConversation.group_user_list;
        console.log(groupConversation);
        const newUserConversation = await Promise.all(
            addUserList.map(async (id) => {
                return this.prisma.msg_user_conversation.create({
                    data: {
                        user_id: +id,
                        conversation_id: groupConversation.conversation_id,
                    },
                });
            }),
        );
        return successCode(
            200,
            'Thêm thành viên thành công',
            newUserConversation,
        );
        // console.log(addUserList);
    }

    remove(id: number) {
        return `This action removes a #${id} conversation`;
    }
}
