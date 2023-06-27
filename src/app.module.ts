import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ImageListModule } from './image-list/image-list.module';
import { MessagesModule } from './messages/messages.module';
import { ImageModule } from './image/image.module';
import { PostModule } from './post/post.module';

@Module({
    imports: [
        UserModule,
        ConfigModule.forRoot({ isGlobal: true }),
        AuthModule,
        ImageListModule,
        MessagesModule,
        ImageModule,
        PostModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
