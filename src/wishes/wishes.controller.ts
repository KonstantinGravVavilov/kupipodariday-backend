import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { WishesService } from './wishes.service';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { ReqWithUser } from 'src/types/reqWithUser';

@Controller('wishes')
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  @Post()
  @UseGuards(JwtGuard)
  create(@Body() createWishDto: CreateWishDto, @Req() req: ReqWithUser) {
    return this.wishesService.create(createWishDto, req.user.id);
  }

  @Get('last')
  getLastWishes() {
    return this.wishesService.getLastWishes();
  }

  @Get('top')
  getTopWishes() {
    return this.wishesService.getTopWishes();
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  getAWish(@Param('id') id: number) {
    return this.wishesService.getWish(id);
  }

  @Patch(':id')
  @UseGuards(JwtGuard)
  update(
    @Param('id') id: string,
    @Body() updateWishDto: UpdateWishDto,
    @Req() req: ReqWithUser,
  ) {
    return this.wishesService.update(+id, updateWishDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  remove(@Param('id') id: string, @Req() req: ReqWithUser) {
    return this.wishesService.remove(+id, req.user.id);
  }

  @Post(':id/copy')
  @UseGuards(JwtGuard)
  copy(@Param('id') id: string, @Req() req: ReqWithUser) {
    return this.wishesService.copy(+id, req.user.id);
  }
}
