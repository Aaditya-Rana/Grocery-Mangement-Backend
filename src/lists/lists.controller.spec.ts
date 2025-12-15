import { Test, TestingModule } from '@nestjs/testing';
import { ListsController } from './lists.controller';
import { ListsService } from './lists.service';
import { Types } from 'mongoose';

const mockListsService = {
  createList: jest.fn(),
  findAllLists: jest.fn(),
  findListById: jest.fn(),
  updateList: jest.fn(),
  deleteList: jest.fn(),
  duplicateList: jest.fn(),
  findAllItems: jest.fn(),
  createListItem: jest.fn(),
  findItemById: jest.fn(),
  updateListItem: jest.fn(),
  deleteListItem: jest.fn(),
};

describe('ListsController', () => {
  let controller: ListsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ListsController],
      providers: [
        {
          provide: ListsService,
          useValue: mockListsService,
        },
      ],
    }).compile();

    controller = module.get<ListsController>(ListsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllLists', () => {
    it('should return all lists for the authenticated user', async () => {
      const mockRequest = {
        user: { userId: '123', email: 'test@example.com' },
      } as any;

      const mockLists = [
        { _id: new Types.ObjectId(), name: 'List 1' },
        { _id: new Types.ObjectId(), name: 'List 2' },
      ];

      mockListsService.findAllLists.mockResolvedValue(mockLists);

      const result = await controller.getAllLists(mockRequest);

      expect(result).toEqual(mockLists);
      expect(mockListsService.findAllLists).toHaveBeenCalledWith('123');
    });
  });

  describe('createList', () => {
    it('should create a new list', async () => {
      const mockRequest = {
        user: { userId: '123', email: 'test@example.com' },
      } as any;

      const createListDto = { name: 'New List' };
      const mockList = { _id: new Types.ObjectId(), name: 'New List' };

      mockListsService.createList.mockResolvedValue(mockList);

      const result = await controller.createList(mockRequest, createListDto);

      expect(result).toEqual(mockList);
      expect(mockListsService.createList).toHaveBeenCalledWith(
        '123',
        createListDto,
      );
    });
  });

  describe('getList', () => {
    it('should return a specific list', async () => {
      const mockRequest = {
        user: { userId: '123', email: 'test@example.com' },
      } as any;

      const listId = new Types.ObjectId().toString();
      const mockList = { _id: new Types.ObjectId(listId), name: 'Test List' };

      mockListsService.findListById.mockResolvedValue(mockList);

      const result = await controller.getList(listId, mockRequest);

      expect(result).toEqual(mockList);
      expect(mockListsService.findListById).toHaveBeenCalledWith(listId, '123');
    });
  });

  describe('updateList', () => {
    it('should update a list', async () => {
      const mockRequest = {
        user: { userId: '123', email: 'test@example.com' },
      } as any;

      const listId = new Types.ObjectId().toString();
      const updateListDto = { name: 'Updated List' };
      const mockUpdatedList = {
        _id: new Types.ObjectId(listId),
        name: 'Updated List',
      };

      mockListsService.updateList.mockResolvedValue(mockUpdatedList);

      const result = await controller.updateList(
        listId,
        mockRequest,
        updateListDto,
      );

      expect(result).toEqual(mockUpdatedList);
      expect(mockListsService.updateList).toHaveBeenCalledWith(
        listId,
        '123',
        updateListDto,
      );
    });
  });

  describe('deleteList', () => {
    it('should delete a list and return success message', async () => {
      const mockRequest = {
        user: { userId: '123', email: 'test@example.com' },
      } as any;

      const listId = new Types.ObjectId().toString();

      mockListsService.deleteList.mockResolvedValue(undefined);

      const result = await controller.deleteList(listId, mockRequest);

      expect(result).toEqual({ message: 'List deleted successfully' });
      expect(mockListsService.deleteList).toHaveBeenCalledWith(listId, '123');
    });
  });

  describe('duplicateList', () => {
    it('should duplicate a list', async () => {
      const mockRequest = {
        user: { userId: '123', email: 'test@example.com' },
      } as any;

      const listId = new Types.ObjectId().toString();
      const mockDuplicatedList = {
        _id: new Types.ObjectId(),
        name: 'Test List (Copy)',
      };

      mockListsService.duplicateList.mockResolvedValue(mockDuplicatedList);

      const result = await controller.duplicateList(listId, mockRequest);

      expect(result).toEqual(mockDuplicatedList);
      expect(mockListsService.duplicateList).toHaveBeenCalledWith(
        listId,
        '123',
      );
    });
  });

  describe('getAllItems', () => {
    it('should return all items for a list', async () => {
      const mockRequest = {
        user: { userId: '123', email: 'test@example.com' },
      } as any;

      const listId = new Types.ObjectId().toString();
      const mockItems = [
        { _id: new Types.ObjectId(), name: 'Item 1' },
        { _id: new Types.ObjectId(), name: 'Item 2' },
      ];

      mockListsService.findAllItems.mockResolvedValue(mockItems);

      const result = await controller.getAllItems(listId, mockRequest);

      expect(result).toEqual(mockItems);
      expect(mockListsService.findAllItems).toHaveBeenCalledWith(listId, '123');
    });
  });

  describe('createItem', () => {
    it('should create a new item in a list', async () => {
      const mockRequest = {
        user: { userId: '123', email: 'test@example.com' },
      } as any;

      const listId = new Types.ObjectId().toString();
      const createItemDto = { name: 'Milk', quantity: 2, unit: 'L' };
      const mockItem = { _id: new Types.ObjectId(), ...createItemDto };

      mockListsService.createListItem.mockResolvedValue(mockItem);

      const result = await controller.createItem(
        listId,
        mockRequest,
        createItemDto,
      );

      expect(result).toEqual(mockItem);
      expect(mockListsService.createListItem).toHaveBeenCalledWith(
        listId,
        '123',
        createItemDto,
      );
    });
  });

  describe('getItem', () => {
    it('should return a specific item', async () => {
      const mockRequest = {
        user: { userId: '123', email: 'test@example.com' },
      } as any;

      const listId = new Types.ObjectId().toString();
      const itemId = new Types.ObjectId().toString();
      const mockItem = { _id: new Types.ObjectId(itemId), name: 'Test Item' };

      mockListsService.findItemById.mockResolvedValue(mockItem);

      const result = await controller.getItem(listId, itemId, mockRequest);

      expect(result).toEqual(mockItem);
      expect(mockListsService.findItemById).toHaveBeenCalledWith(
        listId,
        itemId,
        '123',
      );
    });
  });

  describe('updateItem', () => {
    it('should update an item', async () => {
      const mockRequest = {
        user: { userId: '123', email: 'test@example.com' },
      } as any;

      const listId = new Types.ObjectId().toString();
      const itemId = new Types.ObjectId().toString();
      const updateItemDto = { name: 'Updated Item' };
      const mockUpdatedItem = {
        _id: new Types.ObjectId(itemId),
        name: 'Updated Item',
      };

      mockListsService.updateListItem.mockResolvedValue(mockUpdatedItem);

      const result = await controller.updateItem(
        listId,
        itemId,
        mockRequest,
        updateItemDto,
      );

      expect(result).toEqual(mockUpdatedItem);
      expect(mockListsService.updateListItem).toHaveBeenCalledWith(
        listId,
        itemId,
        '123',
        updateItemDto,
      );
    });
  });

  describe('deleteItem', () => {
    it('should delete an item and return success message', async () => {
      const mockRequest = {
        user: { userId: '123', email: 'test@example.com' },
      } as any;

      const listId = new Types.ObjectId().toString();
      const itemId = new Types.ObjectId().toString();

      mockListsService.deleteListItem.mockResolvedValue(undefined);

      const result = await controller.deleteItem(listId, itemId, mockRequest);

      expect(result).toEqual({ message: 'Item deleted successfully' });
      expect(mockListsService.deleteListItem).toHaveBeenCalledWith(
        listId,
        itemId,
        '123',
      );
    });
  });
});
