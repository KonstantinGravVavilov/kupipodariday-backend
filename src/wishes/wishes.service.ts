import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  Repository,
  FindOneOptions,
  FindManyOptions,
} from 'typeorm';
import { Wish } from './entities/wish.entity';

@Injectable()
export class WishesService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Wish)
    private wishRepository: Repository<Wish>,
  ) {}

  async create(createWishDto: CreateWishDto, id: number) {
    return await this.wishRepository.save({
      ...createWishDto,
      owner: { id },
    });
  }

  async getLastWishes() {
    return await this.wishRepository.find({
      relations: {
        owner: true,
        offers: true,
      },
      order: {
        createdAt: 'DESC',
      },
      take: 40,
    });
  }

  async getTopWishes() {
    return await this.wishRepository.find({
      relations: {
        owner: true,
        offers: true,
      },
      order: {
        copied: 'DESC',
      },
      take: 20,
    });
  }

  async getWish(id: number) {
    const wish = await this.wishRepository.findOne({
      where: {
        id,
      },
      relations: {
        owner: true,
        offers: {
          user: true,
        },
      },
    });
    if (!wish) throw new BadRequestException('Подарка с таким id нет');
    return wish;
  }

  async update(id: number, updateWishDto: UpdateWishDto, userId: number) {
    const wish = await this.getWish(+id);

    if (!wish) throw new BadRequestException('Подарка с таким id нет');

    if (userId !== wish.owner.id)
      throw new BadRequestException('Можно изменять только свои подарки');

    if (wish.offers.length !== 0)
      throw new BadRequestException('Стоимость подарка изменить нельзя');

    await this.wishRepository.update(id, {
      ...updateWishDto,
      owner: { id: userId },
    });
    return this.getWish(id);
  }

  async remove(id: number, userId: number) {
    const wish = await this.getWish(+id);

    if (!wish) throw new BadRequestException('Подарка с таким id нет');

    if (userId !== wish.owner.id)
      throw new BadRequestException('Можно удалять только свои подарки');

    if (wish.offers.length !== 0)
      throw new BadRequestException(
        'Уже нельзя удалить подарок: на него скинулись',
      );

    const del = await this.wishRepository.delete(id);
    if (del.affected) return wish;
  }

  async copy(wishId: number, userId: number) {
    const wish = await this.getWish(wishId);
    if (!wish) throw new BadRequestException('Подарка с таким id нет');

    const usersWish = await this.usersWish(wish, userId);
    if (!!usersWish) throw new BadRequestException('Подарок уже у вас есть');

    const { id, name, image, link, price, description, copied } = wish;

    const newWish = this.wishRepository.create({
      name,
      link,
      image,
      price,
      description,
      owner: { id: userId },
    });
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await Promise.all([
        queryRunner.manager.update(Wish, id, { copied: copied + 1 }),
        queryRunner.manager.insert(Wish, newWish),
      ]);
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      return false;
    } finally {
      await queryRunner.release();
    }
    return {};
  }

  async findOne(query: FindOneOptions<Wish>) {
    return await this.wishRepository.findOne(query);
  }

  async findMany(query: FindManyOptions<Wish>) {
    return await this.wishRepository.findOne(query);
  }

  async usersWish(wish: Wish, userId: number) {
    return await this.findOne({
      where: {
        name: wish.name,
        link: wish.link,
        price: wish.price,
        owner: {
          id: userId,
        },
      },
    });
  }
}
