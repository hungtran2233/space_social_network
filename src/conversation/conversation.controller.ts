import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    HttpException,
    HttpStatus,
    UseGuards,
    Req,
    Put,
} from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import {
    Conversation,
    GroupConversation,
} from './entities/conversation.entity';
import { RoleDecorator } from 'src/auth/guard/role.decorator';
import { Role } from 'src/auth/guard/role';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guard/role.guard';

@Controller('conversation')
export class ConversationController {
    constructor(private readonly conversationService: ConversationService) {}

    // Tạo  conversation: giữa 2 user với nhau
    @Post('post-conversation-one-to-one')
    create(@Body() conversationDto: Conversation) {
        try {
            return this.conversationService.create(conversationDto);
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // Tạo conversation: cuộc hội thoại nhóm
    @RoleDecorator(Role.ADMIN, Role.USER)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Post('post-conversation-group')
    createGroup(@Body() groupConversation: GroupConversation, @Req() req: any) {
        try {
            return this.conversationService.createGroup(groupConversation, req);
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /////////
    // Lấy tất cả cuộc hội thoại nhóm
    @RoleDecorator(Role.ADMIN, Role.USER)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Get('get-conversation-group')
    findAll(@Req() req: any) {
        try {
            return this.conversationService.findAll(req);
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // Thêm thành viên nhóm
    @RoleDecorator(Role.ADMIN, Role.USER)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Put('add-member-group')
    addMemberGroup(
        @Body() groupConversation: GroupConversation,
        @Req() req: any,
    ) {
        try {
            return this.conversationService.addMemberGroup(
                groupConversation,
                req,
            );
        } catch (error) {
            throw new HttpException(
                'Lỗi server',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.conversationService.remove(+id);
    }
}
