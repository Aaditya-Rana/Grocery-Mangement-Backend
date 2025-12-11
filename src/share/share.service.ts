import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Share, ShareDocument, ShareStatus } from './schemas/share.schema';
import { ListsService } from '../lists/lists.service';
import { CreateShareDto } from './dto/share.dto';
import { UpdateListDto } from '../lists/dto/list.dto';
import { UpdateListItemDto } from '../lists/dto/list-item.dto';
import { EventsGateway } from '../events/events.gateway';
import * as crypto from 'crypto';

@Injectable()
export class ShareService {
  constructor(
    @InjectModel(Share.name) private shareModel: Model<ShareDocument>,
    private listsService: ListsService,
    @Inject(forwardRef(() => EventsGateway))
    private eventsGateway: EventsGateway,
  ) {}

  async createShare(
    listId: string,
    userId: string,
    createShareDto: CreateShareDto,
  ): Promise<Share> {
    // Verify list ownership
    await this.listsService.findListById(listId, userId);

    // Revoke any existing active shares for this list
    await this.shareModel.updateMany(
      { listId: new Types.ObjectId(listId), status: ShareStatus.ACTIVE },
      { status: ShareStatus.REVOKED },
    );

    // Generate unique share token
    const shareToken = crypto.randomBytes(16).toString('hex');

    const share = new this.shareModel({
      listId: new Types.ObjectId(listId),
      shareToken,
      shopkeeperName: createShareDto.shopkeeperName,
    });

    return share.save();
  }

  async revokeShare(listId: string, userId: string): Promise<void> {
    // Verify list ownership
    await this.listsService.findListById(listId, userId);

    await this.shareModel.updateMany(
      { listId: new Types.ObjectId(listId), status: ShareStatus.ACTIVE },
      { status: ShareStatus.REVOKED },
    );

    // Emit real-time event
    this.eventsGateway.emitShareRevoked(listId, {
      message: 'Share link has been revoked',
    });
  }

  async getListByShareToken(shareToken: string) {
    const share = await this.shareModel
      .findOne({ shareToken, status: ShareStatus.ACTIVE })
      .populate('listId')
      .exec();

    if (!share) {
      throw new NotFoundException('Share link not found or has been revoked');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const list = share.listId as any;
    const items = await this.listsService.findAllItems(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      String(list._id),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      String(list.userId),
    );

    return {
      list: share.listId,
      items,
      share: {
        shareToken: share.shareToken,
        shopkeeperName: share.shopkeeperName,
      },
    };
  }

  async acceptShare(
    shareToken: string,
    shopkeeperName?: string,
  ): Promise<Share> {
    const share = await this.shareModel
      .findOne({ shareToken, status: ShareStatus.ACTIVE })
      .exec();

    if (!share) {
      throw new NotFoundException('Share link not found or has been revoked');
    }

    if (shopkeeperName) {
      share.shopkeeperName = shopkeeperName;
      await share.save();
    }

    return share;
  }

  async updateListStatusViaShare(
    shareToken: string,
    updateListDto: UpdateListDto,
  ) {
    const share = await this.shareModel
      .findOne({ shareToken, status: ShareStatus.ACTIVE })
      .populate('listId')
      .exec();

    if (!share) {
      throw new NotFoundException('Share link not found or has been revoked');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const list = share.listId as any;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userId = String(list.userId);

    return this.listsService.updateList(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      String(list._id),
      userId,
      updateListDto,
    );
  }

  async updateItemStatusViaShare(
    shareToken: string,
    itemId: string,
    updateItemDto: UpdateListItemDto,
  ) {
    const share = await this.shareModel
      .findOne({ shareToken, status: ShareStatus.ACTIVE })
      .populate('listId')
      .exec();

    if (!share) {
      throw new NotFoundException('Share link not found or has been revoked');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const list = share.listId as any;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userId = String(list.userId);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const listId = String(list._id);

    return this.listsService.updateListItem(
      listId,
      itemId,
      userId,
      updateItemDto,
    );
  }

  async findShareByListId(listId: string): Promise<Share | null> {
    return this.shareModel
      .findOne({
        listId: new Types.ObjectId(listId),
        status: ShareStatus.ACTIVE,
      })
      .exec();
  }
}
