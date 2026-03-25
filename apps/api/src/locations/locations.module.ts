import { Module } from '@nestjs/common';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';
import { LocationsController } from './locations.controller';
import { LocationsRepository } from './locations.repository';
import { LocationsService } from './locations.service';

@Module({
  imports: [InfrastructureModule],
  controllers: [LocationsController],
  providers: [LocationsRepository, LocationsService],
  exports: [LocationsRepository, LocationsService],
})
export class LocationsModule {}
