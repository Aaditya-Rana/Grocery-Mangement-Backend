import { Test, TestingModule } from '@nestjs/testing';
import { ShareController } from './share.controller';
import { ShareService } from './share.service';
import { Types } from 'mongoose';

const mockShareService = {
  createShare: jest.fn(),
  revokeShare: jest.fn(),
  getListByShareToken: jest.fn(),
  acceptShare: jest.fn(),
  updateListStatusViaShare: jest.fn(),
  updateItemStatusViaShare: jest.fn(),
};

describe('ShareController', () => {
  let controller: ShareController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShareController],
      providers: [
        {
          provide: ShareService,
          useValue: mockShareService,
        },
      ],
    }).compile();

    controller = module.get<ShareController>(ShareController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createShare', () => {
    it('should create a share and return formatted response', async () => {
      const mockRequest = {
        user: { userId: '123', email: 'test@example.com' },
      } as any;

      const listId = new Types.ObjectId().toString();
      const createShareDto = { shopkeeperName: 'John Doe' };

      const mockShare = {
        _id: new Types.ObjectId(),
        shareToken: 'abc123def456',
        shopkeeperName: 'John Doe',
      };

      mockShareService.createShare.mockResolvedValue(mockShare);

      const result = await controller.createShare(
        listId,
        mockRequest,
        createShareDto,
      );

      expect(result).toEqual({
        shareToken: 'abc123def456',
        shareUrl: '/share/abc123def456',
      });
      expect(mockShareService.createShare).toHaveBeenCalledWith(
        listId,
        '123',
        createShareDto,
      );
    });
  });

  describe('revokeShare', () => {
    it('should revoke a share and return success message', async () => {
      const mockRequest = {
        user: { userId: '123', email: 'test@example.com' },
      } as any;

      const listId = new Types.ObjectId().toString();

      mockShareService.revokeShare.mockResolvedValue(undefined);

      const result = await controller.revokeShare(listId, mockRequest);

      expect(result).toEqual({ message: 'Share link revoked successfully' });
      expect(mockShareService.revokeShare).toHaveBeenCalledWith(listId, '123');
    });
  });

  describe('getSharedList', () => {
    it('should return shared list data', async () => {
      const shareToken = 'abc123def456';

      const mockSharedData = {
        list: {
          _id: new Types.ObjectId(),
          name: 'Test List',
        },
        items: [
          { _id: new Types.ObjectId(), name: 'Item 1' },
          { _id: new Types.ObjectId(), name: 'Item 2' },
        ],
        share: {
          shareToken: 'abc123def456',
          shopkeeperName: 'John Doe',
        },
      };

      mockShareService.getListByShareToken.mockResolvedValue(mockSharedData);

      const result = await controller.getSharedList(shareToken);

      expect(result).toEqual(mockSharedData);
      expect(mockShareService.getListByShareToken).toHaveBeenCalledWith(
        shareToken,
      );
    });
  });

  describe('acceptShare', () => {
    it('should accept share with shopkeeper name', async () => {
      const shareToken = 'abc123def456';
      const body = { shopkeeperName: 'Jane Doe' };

      const mockShare = {
        _id: new Types.ObjectId(),
        shareToken: 'abc123def456',
        shopkeeperName: 'Jane Doe',
      };

      mockShareService.acceptShare.mockResolvedValue(mockShare);

      const result = await controller.acceptShare(shareToken, body);

      expect(result).toEqual(mockShare);
      expect(mockShareService.acceptShare).toHaveBeenCalledWith(
        shareToken,
        'Jane Doe',
      );
    });

    it('should accept share without shopkeeper name', async () => {
      const shareToken = 'abc123def456';
      const body = {};

      const mockShare = {
        _id: new Types.ObjectId(),
        shareToken: 'abc123def456',
        shopkeeperName: 'John Doe',
      };

      mockShareService.acceptShare.mockResolvedValue(mockShare);

      const result = await controller.acceptShare(shareToken, body);

      expect(result).toEqual(mockShare);
      expect(mockShareService.acceptShare).toHaveBeenCalledWith(
        shareToken,
        undefined,
      );
    });
  });

  describe('updateListStatus', () => {
    it('should update list status via share token', async () => {
      const shareToken = 'abc123def456';
      const updateListDto = { name: 'Updated List' };

      const mockUpdatedList = {
        _id: new Types.ObjectId(),
        name: 'Updated List',
      };

      mockShareService.updateListStatusViaShare.mockResolvedValue(
        mockUpdatedList,
      );

      const result = await controller.updateListStatus(
        shareToken,
        updateListDto,
      );

      expect(result).toEqual(mockUpdatedList);
      expect(mockShareService.updateListStatusViaShare).toHaveBeenCalledWith(
        shareToken,
        updateListDto,
      );
    });
  });

  describe('updateItemStatus', () => {
    it('should update item status via share token', async () => {
      const shareToken = 'abc123def456';
      const itemId = new Types.ObjectId().toString();
      const updateItemDto = { name: 'Updated Item' };

      const mockUpdatedItem = {
        _id: new Types.ObjectId(itemId),
        name: 'Updated Item',
      };

      mockShareService.updateItemStatusViaShare.mockResolvedValue(
        mockUpdatedItem,
      );

      const result = await controller.updateItemStatus(
        shareToken,
        itemId,
        updateItemDto,
      );

      expect(result).toEqual(mockUpdatedItem);
      expect(mockShareService.updateItemStatusViaShare).toHaveBeenCalledWith(
        shareToken,
        itemId,
        updateItemDto,
      );
    });
  });
});
