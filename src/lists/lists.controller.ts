import { Controller, Get, Post, Patch, Delete, Body, Param, Request, UseGuards } from '@nestjs/common';
import { ListsService } from './lists.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateListDto, UpdateListDto } from './dto/list.dto';
import { CreateListItemDto, UpdateListItemDto } from './dto/list-item.dto';

@Controller('lists')
@UseGuards(JwtAuthGuard)
export class ListsController {
    constructor(private readonly listsService: ListsService) { }

    // List endpoints
    @Get()
    async getAllLists(@Request() req) {
        return this.listsService.findAllLists(req.user.userId);
    }

    @Post()
    async createList(@Request() req, @Body() createListDto: CreateListDto) {
        return this.listsService.createList(req.user.userId, createListDto);
    }

    @Get(':listId')
    async getList(@Param('listId') listId: string, @Request() req) {
        return this.listsService.findListById(listId, req.user.userId);
    }

    @Patch(':listId')
    async updateList(@Param('listId') listId: string, @Request() req, @Body() updateListDto: UpdateListDto) {
        return this.listsService.updateList(listId, req.user.userId, updateListDto);
    }

    @Delete(':listId')
    async deleteList(@Param('listId') listId: string, @Request() req) {
        await this.listsService.deleteList(listId, req.user.userId);
        return { message: 'List deleted successfully' };
    }

    @Post(':listId/duplicate')
    async duplicateList(@Param('listId') listId: string, @Request() req) {
        return this.listsService.duplicateList(listId, req.user.userId);
    }

    // ListItem endpoints
    @Get(':listId/items')
    async getAllItems(@Param('listId') listId: string, @Request() req) {
        return this.listsService.findAllItems(listId, req.user.userId);
    }

    @Post(':listId/items')
    async createItem(@Param('listId') listId: string, @Request() req, @Body() createItemDto: CreateListItemDto) {
        return this.listsService.createListItem(listId, req.user.userId, createItemDto);
    }

    @Get(':listId/items/:itemId')
    async getItem(@Param('listId') listId: string, @Param('itemId') itemId: string, @Request() req) {
        return this.listsService.findItemById(listId, itemId, req.user.userId);
    }

    @Patch(':listId/items/:itemId')
    async updateItem(
        @Param('listId') listId: string,
        @Param('itemId') itemId: string,
        @Request() req,
        @Body() updateItemDto: UpdateListItemDto,
    ) {
        return this.listsService.updateListItem(listId, itemId, req.user.userId, updateItemDto);
    }

    @Delete(':listId/items/:itemId')
    async deleteItem(@Param('listId') listId: string, @Param('itemId') itemId: string, @Request() req) {
        await this.listsService.deleteListItem(listId, itemId, req.user.userId);
        return { message: 'Item deleted successfully' };
    }
}
