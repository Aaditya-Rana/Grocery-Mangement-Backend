import { Test, TestingModule } from '@nestjs/testing';
import { ListsService } from './lists.service';
import { getModelToken } from '@nestjs/mongoose';
import { List } from './schemas/list.schema';
import { ListItem } from './schemas/list-item.schema';
import { EventsGateway } from '../events/events.gateway';
import { Types } from 'mongoose';

const mockList = {
    _id: new Types.ObjectId(),
    name: 'Test List',
    userId: new Types.ObjectId(),
    save: jest.fn(),
    deleteOne: jest.fn(),
};

const mockListItem = {
    _id: new Types.ObjectId(),
    name: 'Test Item',
    listId: mockList._id,
    save: jest.fn(),
    deleteOne: jest.fn(),
};

const mockListModel = {
    new: jest.fn().mockResolvedValue(mockList),
    constructor: jest.fn().mockResolvedValue(mockList),
    find: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
};

const mockListItemModel = {
    new: jest.fn().mockResolvedValue(mockListItem),
    constructor: jest.fn().mockResolvedValue(mockListItem),
    find: jest.fn(),
    findById: jest.fn(),
    deleteMany: jest.fn(),
    insertMany: jest.fn(),
};

const mockEventsGateway = {
    emitListUpdated: jest.fn(),
    emitItemUpdated: jest.fn(),
};

describe('ListsService', () => {
    let service: ListsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ListsService,
                {
                    provide: getModelToken(List.name),
                    useValue: mockListModel,
                },
                {
                    provide: getModelToken(ListItem.name),
                    useValue: mockListItemModel,
                },
                {
                    provide: EventsGateway,
                    useValue: mockEventsGateway,
                },
            ],
        }).compile();

        service = module.get<ListsService>(ListsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
