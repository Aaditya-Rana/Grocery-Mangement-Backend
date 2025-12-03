import { Test, TestingModule } from '@nestjs/testing';
import { ShareController } from './share.controller';
import { ShareService } from './share.service';

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
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
