import { Global, Module } from '@nestjs/common';
import { InMemoryDatabaseService } from './in-memory/in-memory-database.service';

@Global()
@Module({
  providers: [InMemoryDatabaseService],
  exports: [InMemoryDatabaseService],
})
export class InfrastructureModule {}
