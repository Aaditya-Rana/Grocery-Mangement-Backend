import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { ItemStatus } from '../schemas/list-item.schema';

export class CreateListItemDto {
    @IsString()
    name: string;

    @IsNumber()
    @IsOptional()
    quantity?: number;

    @IsString()
    @IsOptional()
    unit?: string;

    @IsString()
    @IsOptional()
    notes?: string;
}

export class UpdateListItemDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsNumber()
    quantity?: number;

    @IsOptional()
    @IsString()
    unit?: string;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsOptional()
    @IsEnum(ItemStatus)
    status?: ItemStatus;
}
