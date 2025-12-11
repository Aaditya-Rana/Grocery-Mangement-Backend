import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ListItemDocument = ListItem & Document;

export enum ItemStatus {
  TO_BUY = 'to_buy',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
  UNAVAILABLE = 'unavailable',
  SUBSTITUTED = 'substituted',
}

@Schema({ timestamps: true })
export class ListItem {
  @Prop({ type: Types.ObjectId, ref: 'List', required: true })
  listId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, default: 1 })
  quantity: number;

  @Prop()
  unit?: string;

  @Prop()
  notes?: string;

  @Prop({ type: String, enum: ItemStatus, default: ItemStatus.TO_BUY })
  status: ItemStatus;

  createdAt?: Date;
  updatedAt?: Date;
}

export const ListItemSchema = SchemaFactory.createForClass(ListItem);
