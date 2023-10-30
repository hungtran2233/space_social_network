import { Message } from '../entities/message.entity';

export class CreateMessageDto extends Message {
    conversation_id: string;
    sender_id: number;
    content: string;
    created_at: Date;
}
