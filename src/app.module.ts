import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ImageListModule } from './image-list/image-list.module';

@Module({
    imports: [
        UserModule,
        ConfigModule.forRoot({ isGlobal: true }),
        AuthModule,
        ImageListModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
