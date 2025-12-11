import { Test, TestingModule } from '@nestjs/testing';
import { ListsController } from './lists.controller';
import { ListsService } from './lists.service';

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
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
