import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
    imports: [NotificationModule],
    controllers: [PostController],
    providers: [PostService],
})
export class PostModule {}
