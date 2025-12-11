import { Test, TestingModule } from '@nestjs/testing';
import { ShareService } from './share.service';
import { ListsService } from '../lists/lists.service';
import { getModelToken } from '@nestjs/mongoose';
import { Share } from './schemas/share.schema';
import { EventsGateway } from '../events/events.gateway';

const mockShareModel = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  updateMany: jest.fn(),
};

const mockListsService = {
  findListById: jest.fn(),
  findAllItems: jest.fn(),
  updateList: jest.fn(),
  updateListItem: jest.fn(),
};

const mockEventsGateway = {
  emitShareRevoked: jest.fn(),
};

describe('ShareService', () => {
  let service: ShareService;

  beforeEach(async () => {
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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
