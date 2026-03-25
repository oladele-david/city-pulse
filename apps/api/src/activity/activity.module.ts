import { Module } from '@nestjs/common';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';
import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';

@Module({
  imports: [InfrastructureModule],
  controllers: [ActivityController],
  providers: [ActivityService],
})
export class ActivityModule {}
