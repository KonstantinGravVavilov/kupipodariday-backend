import { PartialType } from '@nestjs/swagger';
import { CreateWishDto } from './create-wish.dto';
import {
  IsNumber,
  IsString,
  IsUrl,
  Length,
  Min,
  IsOptional,
} from 'class-validator';

export class UpdateWishDto extends PartialType(CreateWishDto) {
  @IsOptional()
  @IsString()
  @Length(1, 250)
  name: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  link: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  image: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  price: number;

  @IsOptional()
  @IsString()
  @Length(1, 1024)
  description: string;
}
