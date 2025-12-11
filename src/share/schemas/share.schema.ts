import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ShareDocument = Share & Document;

export enum ShareStatus {
  ACTIVE = 'active',
  REVOKED = 'revoked',
}

@Schema({ timestamps: true })
export class Share {
  @Prop({ type: Types.ObjectId, ref: 'List', required: true })
  listId: Types.ObjectId;

  @Prop({ required: true, unique: true })
  shareToken: string;

  @Prop({ type: String, enum: ShareStatus, default: ShareStatus.ACTIVE })
  status: ShareStatus;

  @Prop()
  shopkeeperName?: string;

  @Prop()
  expiresAt?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export const ShareSchema = SchemaFactory.createForClass(Share);
