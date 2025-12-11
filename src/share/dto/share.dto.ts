import { IsString, IsOptional } from 'class-validator';

export class CreateShareDto {
  @IsOptional()
  @IsString()
  shopkeeperName?: string;
}

export class UpdateShareStatusDto {
  @IsOptional()
  @IsString()
  shopkeeperName?: string;
}
