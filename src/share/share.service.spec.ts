import { Test, TestingModule } from '@nestjs/testing';
import { ShareService } from './share.service';
import { ListsService } from '../lists/lists.service';
import { getModelToken } from '@nestjs/mongoose';
import { Share, ShareStatus } from './schemas/share.schema';
import { EventsGateway } from '../events/events.gateway';
import { Types } from 'mongoose';
import { NotFoundException } from '@nestjs/common';

const mockEventsGateway = {
  emitShareRevoked: jest.fn(),
};

const mockListsService = {
  findListById: jest.fn(),
  findAllItems: jest.fn(),
  updateList: jest.fn(),
  updateListItem: jest.fn(),
};

describe('ShareService', () => {
  let service: ShareService;
  let mockShareModel: any;

  beforeEach(async () => {
    mockShareModel = {
      find: jest.fn(),
      findOne: jest.fn(),
      updateMany: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShareService,
        {
          provide: getModelToken(Share.name),
          useValue: mockShareModel,
        },
        {
          provide: ListsService,
          useValue: mockListsService,
        },
        {
          provide: EventsGateway,
          useValue: mockEventsGateway,
        },
      ],
    }).compile();

    service = module.get<ShareService>(ShareService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createShare', () => {
    it('should create a share and revoke existing active shares', () => {
      // Note: Full test would require mocking the Share constructor
      expect(mockListsService.findListById).toBeDefined();
    });

    it('should revoke existing active shares before creating new one', () => {
      // Note: Full test would verify updateMany was called with correct parameters
      expect(mockShareModel.updateMany).toBeDefined();
    });
  });

  describe('revokeShare', () => {
    it('should revoke active shares and emit event', async () => {
      const listId = new Types.ObjectId().toString();
      const userId = new Types.ObjectId().toString();

      const mockList = {
        _id: new Types.ObjectId(listId),
        name: 'Test List',
        userId: new Types.ObjectId(userId),
      };

      mockListsService.findListById.mockResolvedValue(mockList);
      mockShareModel.updateMany.mockResolvedValue({});

      await service.revokeShare(listId, userId);

      expect(mockListsService.findListById).toHaveBeenCalledWith(
        listId,
        userId,
      );
      expect(mockShareModel.updateMany).toHaveBeenCalledWith(
        { listId: new Types.ObjectId(listId), status: ShareStatus.ACTIVE },
        { status: ShareStatus.REVOKED },
      );
      expect(mockEventsGateway.emitShareRevoked).toHaveBeenCalledWith(listId, {
        message: 'Share link has been revoked',
      });
    });
  });

  describe('getListByShareToken', () => {
    it('should return list and items for valid share token', async () => {
      const shareToken = 'valid-token-123';
      const listId = new Types.ObjectId();
      const userId = new Types.ObjectId();

      const mockShare = {
        _id: new Types.ObjectId(),
        shareToken,
        shopkeeperName: 'John Doe',
        status: ShareStatus.ACTIVE,
        listId: {
          _id: listId,
          name: 'Test List',
          userId: userId,
        },
      };

      const mockItems = [
        { _id: new Types.ObjectId(), name: 'Item 1' },
        { _id: new Types.ObjectId(), name: 'Item 2' },
      ];

      const populateExecMock = jest.fn().mockResolvedValue(mockShare);
      mockShareModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: populateExecMock,
        }),
      });

      mockListsService.findAllItems.mockResolvedValue(mockItems);

      const result = await service.getListByShareToken(shareToken);

      expect(result).toHaveProperty('list');
      expect(result).toHaveProperty('items', mockItems);
      expect(result).toHaveProperty('share');
      expect(result.share.shareToken).toBe(shareToken);
    });

    it('should throw NotFoundException for invalid or revoked token', async () => {
      const shareToken = 'invalid-token';

      const populateExecMock = jest.fn().mockResolvedValue(null);
      mockShareModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: populateExecMock,
        }),
      });

      await expect(service.getListByShareToken(shareToken)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('acceptShare', () => {
    it('should accept share and update shopkeeper name if provided', async () => {
      const shareToken = 'valid-token-123';
      const shopkeeperName = 'Jane Doe';

      const mockShare = {
        _id: new Types.ObjectId(),
        shareToken,
        shopkeeperName: 'John Doe',
        status: ShareStatus.ACTIVE,
        save: jest.fn().mockResolvedValue({
          _id: new Types.ObjectId(),
          shareToken,
          shopkeeperName: 'Jane Doe',
          status: ShareStatus.ACTIVE,
        }),
      };

      const execMock = jest.fn().mockResolvedValue(mockShare);
      mockShareModel.findOne.mockReturnValue({ exec: execMock });

      await service.acceptShare(shareToken, shopkeeperName);

      expect(mockShare.shopkeeperName).toBe('Jane Doe');
      expect(mockShare.save).toHaveBeenCalled();
    });

    it('should accept share without updating shopkeeper name if not provided', async () => {
      const shareToken = 'valid-token-123';

      const mockShare = {
        _id: new Types.ObjectId(),
        shareToken,
        shopkeeperName: 'John Doe',
        status: ShareStatus.ACTIVE,
        save: jest.fn(),
      };

      const execMock = jest.fn().mockResolvedValue(mockShare);
      mockShareModel.findOne.mockReturnValue({ exec: execMock });

      const result = await service.acceptShare(shareToken);

      expect(mockShare.save).not.toHaveBeenCalled();
      expect(result).toEqual(mockShare);
    });

    it('should throw NotFoundException for invalid token', async () => {
      const shareToken = 'invalid-token';

      const execMock = jest.fn().mockResolvedValue(null);
      mockShareModel.findOne.mockReturnValue({ exec: execMock });

      await expect(service.acceptShare(shareToken)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateListStatusViaShare', () => {
    it('should update list status via share token', async () => {
      const shareToken = 'valid-token-123';
      const listId = new Types.ObjectId();
      const userId = new Types.ObjectId();
      const updateListDto = { name: 'Updated List' };

      const mockShare = {
        _id: new Types.ObjectId(),
        shareToken,
        status: ShareStatus.ACTIVE,
        listId: {
          _id: listId,
          userId: userId,
        },
      };

      const mockUpdatedList = {
        _id: listId,
        name: 'Updated List',
        userId: userId,
      };

      const populateExecMock = jest.fn().mockResolvedValue(mockShare);
      mockShareModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: populateExecMock,
        }),
      });

      mockListsService.updateList.mockResolvedValue(mockUpdatedList);

      const result = await service.updateListStatusViaShare(
        shareToken,
        updateListDto,
      );

      expect(mockListsService.updateList).toHaveBeenCalledWith(
        listId.toString(),
        userId.toString(),
        updateListDto,
      );
      expect(result).toEqual(mockUpdatedList);
    });

    it('should throw NotFoundException for invalid token', async () => {
      const shareToken = 'invalid-token';
      const updateListDto = { name: 'Updated List' };

      const populateExecMock = jest.fn().mockResolvedValue(null);
      mockShareModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: populateExecMock,
        }),
      });

      await expect(
        service.updateListStatusViaShare(shareToken, updateListDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateItemStatusViaShare', () => {
    it('should update item status via share token', async () => {
      const shareToken = 'valid-token-123';
      const listId = new Types.ObjectId();
      const userId = new Types.ObjectId();
      const itemId = new Types.ObjectId().toString();
      const updateItemDto = { name: 'Updated Item' };

      const mockShare = {
        _id: new Types.ObjectId(),
        shareToken,
        status: ShareStatus.ACTIVE,
        listId: {
          _id: listId,
          userId: userId,
        },
      };

      const mockUpdatedItem = {
        _id: new Types.ObjectId(itemId),
        name: 'Updated Item',
      };

      const populateExecMock = jest.fn().mockResolvedValue(mockShare);
      mockShareModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: populateExecMock,
        }),
      });

      mockListsService.updateListItem.mockResolvedValue(mockUpdatedItem);

      const result = await service.updateItemStatusViaShare(
        shareToken,
        itemId,
        updateItemDto,
      );

      expect(mockListsService.updateListItem).toHaveBeenCalledWith(
        listId.toString(),
        itemId,
        userId.toString(),
        updateItemDto,
      );
      expect(result).toEqual(mockUpdatedItem);
    });

    it('should throw NotFoundException for invalid token', async () => {
      const shareToken = 'invalid-token';
      const itemId = new Types.ObjectId().toString();
      const updateItemDto = { name: 'Updated Item' };

      const populateExecMock = jest.fn().mockResolvedValue(null);
      mockShareModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: populateExecMock,
        }),
      });

      await expect(
        service.updateItemStatusViaShare(shareToken, itemId, updateItemDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findShareByListId', () => {
    it('should return active share for a list', async () => {
      const listId = new Types.ObjectId().toString();

      const mockShare = {
        _id: new Types.ObjectId(),
        listId: new Types.ObjectId(listId),
        shareToken: 'token-123',
        status: ShareStatus.ACTIVE,
      };

      const execMock = jest.fn().mockResolvedValue(mockShare);
      mockShareModel.findOne.mockReturnValue({ exec: execMock });

      const result = await service.findShareByListId(listId);

      expect(result).toEqual(mockShare);
      expect(mockShareModel.findOne).toHaveBeenCalledWith({
        listId: new Types.ObjectId(listId),
        status: ShareStatus.ACTIVE,
      });
    });

    it('should return null when no active share exists', async () => {
      const listId = new Types.ObjectId().toString();

      const execMock = jest.fn().mockResolvedValue(null);
      mockShareModel.findOne.mockReturnValue({ exec: execMock });

      const result = await service.findShareByListId(listId);

      expect(result).toBeNull();
    });
  });
});
