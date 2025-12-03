import { Controller, Get, Post, Body, Param, Request, UseGuards, Patch } from '@nestjs/common';
import { ShareService } from './share.service';
import { JwtAuthGuard } from 'auth/guards/jwt-auth.guard';
import { CreateShareDto } from './dto/share.dto';
import { UpdateListDto } from 'lists/dto/list.dto';
import { UpdateListItemDto } from 'lists/dto/list-item.dto';

@Controller()
export class ShareController {
    constructor(private readonly shareService: ShareService) { }

    // Protected routes (for list owners)
    @Post('lists/:listId/share')
    @UseGuards(JwtAuthGuard)
    async createShare(@Param('listId') listId: string, @Request() req, @Body() createShareDto: CreateShareDto) {
        const share = await this.shareService.createShare(listId, req.user.userId, createShareDto);
        return {
            shareToken: share.shareToken,
            shareUrl: `/share/${share.shareToken}`,
        };
    }

    @Post('lists/:listId/share/revoke')
    @UseGuards(JwtAuthGuard)
    async revokeShare(@Param('listId') listId: string, @Request() req) {
        await this.shareService.revokeShare(listId, req.user.userId);
        return { message: 'Share link revoked successfully' };
    }

    // Public routes (for shopkeepers)
    @Get('share/:shareToken')
    async getSharedList(@Param('shareToken') shareToken: string) {
        return this.shareService.getListByShareToken(shareToken);
    }

    @Post('share/:shareToken/accept')
    async acceptShare(@Param('shareToken') shareToken: string, @Body() body: { shopkeeperName?: string }) {
        return this.shareService.acceptShare(shareToken, body.shopkeeperName);
    }

    @Post('share/:shareToken/status')
    async updateListStatus(@Param('shareToken') shareToken: string, @Body() updateListDto: UpdateListDto) {
        return this.shareService.updateListStatusViaShare(shareToken, updateListDto);
    }

    @Post('share/:shareToken/items/:itemId/status')
    async updateItemStatus(
        @Param('shareToken') shareToken: string,
        @Param('itemId') itemId: string,
        @Body() updateItemDto: UpdateListItemDto,
    ) {
        return this.shareService.updateItemStatusViaShare(shareToken, itemId, updateItemDto);
    }
}
