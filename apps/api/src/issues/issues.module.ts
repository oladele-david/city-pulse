import { Module } from '@nestjs/common';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';
import { UsersModule } from 'src/users/users.module';
import { CloudinaryMediaService } from './cloudinary-media.service';
import { IssuesController } from './issues.controller';
import { IssuesRepository } from './issues.repository';
import { IssuesService } from './issues.service';

@Module({
  imports: [InfrastructureModule, UsersModule],
  controllers: [IssuesController],
  providers: [IssuesRepository, IssuesService, CloudinaryMediaService],
  exports: [IssuesRepository, IssuesService, CloudinaryMediaService],
})
export class IssuesModule {}
