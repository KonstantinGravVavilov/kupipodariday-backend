import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateOfferDto } from './dto/create-offer.dto';
import { Offer } from './entities/offer.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { WishesService } from 'src/wishes/wishes.service';
import { Wish } from 'src/wishes/entities/wish.entity';

@Injectable()
export class OffersService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Offer)
    private offerRepository: Repository<Offer>,
    private wishService: WishesService,
  ) {}

  async create(createOfferDto: CreateOfferDto, id: number) {
    const { amount, itemId } = createOfferDto;
    const wish = await this.wishService.findOne({
      where: { id: itemId },
      relations: { owner: true },
    });

    if (!wish) throw new BadRequestException('Подарка с таким id нет');

    const { owner, raised, price } = wish;

    if (id === owner.id)
      throw new BadRequestException('На свои подарки вносить деньги нельзя');

    if (amount + Number(raised) > Number(price))
      throw new BadRequestException(
        'Сумма взносов превышает стоимость подарка',
      );

    const offerToInsert = this.offerRepository.create({
      ...createOfferDto,
      user: { id },
      item: { id: itemId },
    });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await Promise.all([
        queryRunner.manager.update(Wish, itemId, {
          raised: Number(raised) + Number(amount),
        }),
        queryRunner.manager.insert(Offer, offerToInsert),
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

  async findAll() {
    return await this.offerRepository.find({
      relations: {
        user: { wishes: true, offers: true },
        item: { owner: true },
      },
    });
  }

  async findOne(id: number) {
    return await this.offerRepository.findOne({
      where: { id },
      relations: {
        user: { wishes: true, offers: true },
        item: { owner: true },
      },
    });
  }
}
