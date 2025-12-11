import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ListStatus } from '../schemas/list.schema';

export class CreateListDto {
  @IsString()
  name: string;
}

export class UpdateListDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(ListStatus)
  status?: ListStatus;
}
