export class Conversation {
    conversation_name: string;
    user_id_1: number;
    user_id_2: number;
}

export class GroupConversation {
    conversation_name: string;
    uuid_v4: string;
    group_user_list: Array<{ user_id: number }>;
    conversation_id: number;
}
