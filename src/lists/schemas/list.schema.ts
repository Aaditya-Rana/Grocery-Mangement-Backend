import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ListDocument = List & Document;

export enum ListStatus {
  DRAFT = 'draft',
  SHARED = 'shared',
  COMPLETED = 'completed',
}

@Schema({ timestamps: true })
export class List {
  @Prop({ required: true })
  name: string;

  @Prop({ type: String, enum: ListStatus, default: ListStatus.DRAFT })
  status: ListStatus;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  createdAt?: Date;
  updatedAt?: Date;
}

export const ListSchema = SchemaFactory.createForClass(List);
