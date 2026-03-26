import { Module } from '@nestjs/common';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';
import { LocationsModule } from 'src/locations/locations.module';
import { UsersModule } from 'src/users/users.module';
import { CloudinaryMediaService } from './cloudinary-media.service';
import { IssuesController } from './issues.controller';
import { IssuesListCacheService } from './issues-list-cache.service';
import { IssuesRepository } from './issues.repository';
import { IssuesService } from './issues.service';

@Module({
  imports: [InfrastructureModule, UsersModule, LocationsModule],
  controllers: [IssuesController],
  providers: [
    IssuesRepository,
    IssuesService,
    CloudinaryMediaService,
    IssuesListCacheService,
  ],
  exports: [
    IssuesRepository,
    IssuesService,
    CloudinaryMediaService,
    IssuesListCacheService,
  ],
})
export class IssuesModule {}
