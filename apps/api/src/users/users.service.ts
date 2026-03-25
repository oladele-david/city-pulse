import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  getByIdOrThrow(id: string) {
    const user = this.usersRepository.findById(id);
    if (!user) {
      throw new Error(`User not found: ${id}`);
    }

    return user;
  }
}
