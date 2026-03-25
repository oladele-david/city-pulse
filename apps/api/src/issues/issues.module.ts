import { Module } from '@nestjs/common';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';
import { UsersModule } from 'src/users/users.module';
import { IssuesController } from './issues.controller';
import { IssuesRepository } from './issues.repository';
import { IssuesService } from './issues.service';

@Module({
  imports: [InfrastructureModule, UsersModule],
  controllers: [IssuesController],
  providers: [IssuesRepository, IssuesService],
  exports: [IssuesRepository, IssuesService],
})
export class IssuesModule {}
