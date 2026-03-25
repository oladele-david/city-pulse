import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { InMemoryDatabaseService } from 'src/infrastructure/in-memory/in-memory-database.service';
import { UserRecord } from 'src/domain/models';

@Injectable()
export class UsersRepository {
  constructor(private readonly db: InMemoryDatabaseService) {}

  create(data: Omit<UserRecord, 'id' | 'createdAt' | 'updatedAt'>): UserRecord {
    const now = new Date().toISOString();
    const user: UserRecord = {
      ...data,
      id: uuid(),
      createdAt: now,
      updatedAt: now,
    };

    this.db.users.push(user);
    return user;
  }

  findByEmail(email: string): UserRecord | undefined {
    return this.db.users.find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }

  findById(id: string): UserRecord | undefined {
    return this.db.users.find((user) => user.id === id);
  }

  listAdmins(): UserRecord[] {
    return this.db.users.filter((user) => user.role === 'admin');
  }
}
