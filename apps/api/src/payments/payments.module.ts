import { Module } from '@nestjs/common';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';
import { LeviesModule } from 'src/levies/levies.module';
import { UsersModule } from 'src/users/users.module';
import { PaymentsController } from './payments.controller';
import { InterswitchService } from './interswitch.service';
import { PaymentsRepository } from './payments.repository';
import { PaymentsService } from './payments.service';

@Module({
  imports: [InfrastructureModule, UsersModule, LeviesModule],
  controllers: [PaymentsController],
  providers: [PaymentsRepository, PaymentsService, InterswitchService],
})
export class PaymentsModule {}
