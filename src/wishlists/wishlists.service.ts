import {
  Injectable,
  ForbiddenException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { Repository, QueryFailedError } from 'typeorm';
import { ERR_WISH_NOT_EXIST } from 'src/constants';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistRepository: Repository<Wishlist>,
  ) {}

  async create(createWishlistDto: CreateWishlistDto, userId: number) {
    const { itemsId, ...rest } = createWishlistDto;
    const wishItems = itemsId.map((id) => ({ id }));
    return await this.wishlistRepository.save({
      ...rest,
      items: wishItems,
      owner: { id: userId },
    });
  }

  async findAll() {
    return await this.wishlistRepository.find({
      relations: {
        owner: true,
        items: true,
      },
    });
  }

  async findOne(id: number) {
    return await this.wishlistRepository.findOne({
      where: { id },
      relations: {
        owner: true,
        items: true,
      },
    });
  }

  async update(
    id: number,
    updateWishlistDto: UpdateWishlistDto,
    userId: number,
  ) {
    const wishlist = await this.findOne(id);
    if (!wishlist)
      throw new NotFoundException('Вишлиста с таким id не существует');
    if (wishlist.owner.id !== userId)
      throw new ForbiddenException('Редактировать чужие вишлисты нельзя');

    const { itemsId } = updateWishlistDto;
    const items = itemsId ? itemsId.map((id) => ({ id })) : undefined;
    try {
      delete updateWishlistDto.itemsId;
      await this.wishlistRepository.save({
        ...updateWishlistDto,
        id,
        items,
        owner: { id: userId },
      });
    } catch (err) {
      if (err instanceof QueryFailedError) {
        const error = err.driverError;
        if (error.code === ERR_WISH_NOT_EXIST) {
          throw new ConflictException(
            'Подарка, который вы хотите добавить в вишлист, не существует',
          );
        }
      }
    }
    return this.findOne(id);
  }

  async remove(id: number, userId: number) {
    const wishlist = await this.findOne(id);
    if (wishlist.owner.id !== userId)
      throw new ForbiddenException('Удалять чужие вишлисты нельзя');
    await this.wishlistRepository.delete(id);
    return wishlist;
  }
}
