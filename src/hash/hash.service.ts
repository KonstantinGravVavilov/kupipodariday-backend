import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HashService {
  async generateHash(password: string) {
    return bcrypt.hash(password, 10);
  }

  async verifyHash(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  }
}
