import { Injectable, NotFoundException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { List, ListDocument } from './schemas/list.schema';
import { ListItem, ListItemDocument } from './schemas/list-item.schema';
import { CreateListDto, UpdateListDto } from './dto/list.dto';
import { CreateListItemDto, UpdateListItemDto } from './dto/list-item.dto';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class ListsService {
    constructor(
        @InjectModel(List.name) private listModel: Model<ListDocument>,
        @InjectModel(ListItem.name) private listItemModel: Model<ListItemDocument>,
        @Inject(forwardRef(() => EventsGateway)) private eventsGateway: EventsGateway,
    ) { }

    // List CRUD
    async createList(userId: string, createListDto: CreateListDto): Promise<ListDocument> {
        const list = new this.listModel({
            ...createListDto,
            userId: new Types.ObjectId(userId),
        });
        return list.save();
    }

    async findAllLists(userId: string): Promise<List[]> {
        return this.listModel.find({ userId: new Types.ObjectId(userId) }).exec();
    }

    async findListById(listId: string, userId: string): Promise<ListDocument> {
        const list = await this.listModel.findById(listId).exec();
        if (!list) {
            throw new NotFoundException('List not found');
        }
        if (list.userId.toString() !== userId) {
            throw new ForbiddenException('Access denied');
        }
        return list;
    }

    async updateList(listId: string, userId: string, updateListDto: UpdateListDto): Promise<ListDocument> {
        const list = await this.findListById(listId, userId);
        Object.assign(list, updateListDto);
        const updated = await list.save();

        // Emit real-time event
        this.eventsGateway.emitListUpdated(listId, updated);

        return updated;
    }

    async deleteList(listId: string, userId: string): Promise<void> {
        const list = await this.findListById(listId, userId);
        await this.listItemModel.deleteMany({ listId: new Types.ObjectId(listId) }).exec();
        await list.deleteOne();
    }

    async duplicateList(listId: string, userId: string): Promise<ListDocument> {
        const originalList = await this.findListById(listId, userId);
        const items = await this.listItemModel.find({ listId: new Types.ObjectId(listId) }).exec();

        const newList = new this.listModel({
            name: `${originalList.name} (Copy)`,
            userId: new Types.ObjectId(userId),
        });
        const savedList = await newList.save();

        const newItems = items.map(item => ({
            listId: savedList._id,
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            notes: item.notes,
        }));

        if (newItems.length > 0) {
            await this.listItemModel.insertMany(newItems);
        }

        return savedList;
    }

    // ListItem CRUD
    async createListItem(listId: string, userId: string, createItemDto: CreateListItemDto): Promise<ListItemDocument> {
        await this.findListById(listId, userId); // Verify ownership
        const item = new this.listItemModel({
            ...createItemDto,
            listId: new Types.ObjectId(listId),
        });
        return item.save();
    }

    async findAllItems(listId: string, userId: string): Promise<ListItem[]> {
        await this.findListById(listId, userId); // Verify ownership
        return this.listItemModel.find({ listId: new Types.ObjectId(listId) }).exec();
    }

    async findItemById(listId: string, itemId: string, userId: string): Promise<ListItemDocument> {
        await this.findListById(listId, userId); // Verify ownership
        const item = await this.listItemModel.findById(itemId).exec();
        if (!item || item.listId.toString() !== listId) {
            throw new NotFoundException('Item not found');
        }
        return item;
    }

    async updateListItem(listId: string, itemId: string, userId: string, updateItemDto: UpdateListItemDto): Promise<ListItemDocument> {
        const item = await this.findItemById(listId, itemId, userId);
        Object.assign(item, updateItemDto);
        const updated = await item.save();

        // Emit real-time event
        this.eventsGateway.emitItemUpdated(listId, updated);

        return updated;
    }

    async deleteListItem(listId: string, itemId: string, userId: string): Promise<void> {
        const item = await this.findItemById(listId, itemId, userId);
        await item.deleteOne();
    }
}
