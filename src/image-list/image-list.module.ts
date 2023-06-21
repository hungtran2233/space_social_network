import { Module } from '@nestjs/common';
import { ImageListService } from './image-list.service';
import { ImageListController } from './image-list.controller';

@Module({
  controllers: [ImageListController],
  providers: [ImageListService]
})
export class ImageListModule {}
