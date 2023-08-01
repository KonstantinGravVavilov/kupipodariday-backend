import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { HashService } from 'src/hash/hash.service';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private hashService: HashService,
  ) {}

  async validatePassword(username: string, password: string) {
    const user = await this.usersService.findByUsername(username);
    if (user) {
      const isPasswordOk = await this.hashService.verifyHash(
        password,
        user.password,
      );
      if (!isPasswordOk) return null;
      delete user.password;
      return user;
    }
    return null;
  }

  async auth(user: User) {
    const payload = { sub: user.id };
    return { access_token: this.jwtService.sign(payload, { expiresIn: '7d' }) };
  }
}
