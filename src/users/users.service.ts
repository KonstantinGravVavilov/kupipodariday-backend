import {
  ConflictException,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { QueryFailedError, Repository } from 'typeorm';
import { HashService } from 'src/hash/hash.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ERR_USER_EXIST } from 'src/constants';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private hashService: HashService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { password } = createUserDto;
    const hash = await this.hashService.generateHash(password);
    try {
      const newUser = await this.userRepository.save({
        ...createUserDto,
        password: hash,
      });
      delete newUser.password;
      return newUser;
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const err = error.driverError;
        if (err.code === ERR_USER_EXIST) {
          throw new ConflictException(
            'Пользователь с таким email или username уже зарегистрирован',
          );
        }
      }
    }
  }

  async findByUsername(username: string) {
    return await this.userRepository.findOne({
      select: {
        id: true,
        username: true,
        password: true,
      },
      where: {
        username,
      },
    });
  }

  async getMe(id: number) {
    return await this.userRepository.findOneBy({ id });
  }

  async getMyWishes(id: number) {
    const data = await this.userRepository.findOne({
      where: {
        id,
      },
      relations: {
        wishes: { owner: true, offers: true },
      },
    });
    return data.wishes;
  }

  async getWishes(username: string) {
    const user = await this.getByUsername(username);
    const data = await this.userRepository.findOne({
      where: {
        id: user.id,
      },
      relations: {
        wishes: { owner: true, offers: true },
      },
    });
    return data.wishes;
  }

  async updateMe(updateUserDto: UpdateUserDto, id: number) {
    const { password } = updateUserDto;
    try {
      if (password) {
        const hash = await this.hashService.generateHash(password);
        await this.userRepository.update(id, {
          ...updateUserDto,
          password: hash,
        });
      } else await this.userRepository.update(id, updateUserDto);
      return await this.getMe(id);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const err = error.driverError;
        if (err.code === ERR_USER_EXIST) {
          throw new ConflictException(
            'Пользователь с таким email или username уже зарегистрирован',
          );
        }
      }
    }
  }

  async getByUsername(username: string) {
    const user = await this.userRepository.findOne({
      where: {
        username,
      },
    });
    if (!user) throw new BadRequestException('Пользователь не найден');
    return user;
  }

  async getManyByQuery(query: string) {
    const user = await this.userRepository.find({
      where: [{ username: query }, { email: query }],
    });
    if (!user.length) throw new BadRequestException('Пользователи не найдены');
    return user;
  }

  async findOne(id: number) {
    return await this.userRepository.findOneBy({ id });
  }
}
