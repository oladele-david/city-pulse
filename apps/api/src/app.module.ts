import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ActivityModule } from './activity/activity.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { IssuesModule } from './issues/issues.module';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { LeviesModule } from './levies/levies.module';
import { LocationsModule } from './locations/locations.module';
import { PaymentsModule } from './payments/payments.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'citypulse-dev-secret',
      signOptions: { expiresIn: '7d' },
    }),
    InfrastructureModule,
    AuthModule,
    UsersModule,
    LocationsModule,
    LeviesModule,
    IssuesModule,
    ActivityModule,
    LeaderboardModule,
    PaymentsModule,
    AnalyticsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
