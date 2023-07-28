import {
  Controller,
  Get,
  Req,
  Body,
  Patch,
  Post,
  Param,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { ReqWithUser } from 'src/types/reqWithUser';

@Controller('users')
@UseGuards(JwtGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@Req() req: ReqWithUser) {
    return this.usersService.getMe(req.user.id);
  }

  @Patch('me')
  updateMe(@Body() updateUserDto: UpdateUserDto, @Req() req: ReqWithUser) {
    return this.usersService.updateMe(updateUserDto, req.user.id);
  }

  @Get('me/wishes')
  getMyWishes(@Req() req: ReqWithUser) {
    return this.usersService.getMyWishes(req.user.id);
  }

  @Get(':username')
  findByUsername(@Param('username') username: string) {
    return this.usersService.getByUsername(username);
  }

  @Get(':username/wishes')
  async getUsersWishes(@Param('username') username: string) {
    return this.usersService.getWishes(username);
  }

  @Post('find')
  findManyByQuery(@Body('query') query: string) {
    return this.usersService.getManyByQuery(query);
  }
}
