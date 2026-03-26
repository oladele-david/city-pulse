import { Module } from '@nestjs/common';
import { LocationsModule } from 'src/locations/locations.module';
import { UsersModule } from 'src/users/users.module';
import { LeviesController } from './levies.controller';
import { LeviesRepository } from './levies.repository';
import { LeviesService } from './levies.service';

@Module({
  imports: [LocationsModule, UsersModule],
  controllers: [LeviesController],
  providers: [LeviesRepository, LeviesService],
  exports: [LeviesRepository, LeviesService],
})
export class LeviesModule {}
