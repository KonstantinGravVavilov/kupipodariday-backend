import { IsArray, IsOptional, IsString, IsUrl, Length } from 'class-validator';

export class CreateWishlistDto {
  @IsString()
  @Length(1, 250)
  name: string;

  @IsString()
  @IsUrl()
  image: string;

  @IsArray()
  itemsId: number[];

  @IsOptional()
  @Length(1, 1500)
  description: string;
}
