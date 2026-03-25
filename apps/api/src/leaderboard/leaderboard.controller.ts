import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { LeaderboardService } from './leaderboard.service';

@ApiTags('leaderboard')
@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get the Lagos-wide community leaderboard' })
  async getLagos() {
    return this.leaderboardService.getLagosLeaderboard();
  }

  @Public()
  @Get('lgas/:lgaId')
  @ApiOperation({ summary: 'Get the leaderboard filtered to one LGA' })
  async getByLga(@Param('lgaId') lgaId: string) {
    return this.leaderboardService.getLgaLeaderboard(lgaId);
  }

  @Public()
  @Get('communities/:communityId')
  @ApiOperation({ summary: 'Get the leaderboard filtered to one community' })
  async getByCommunity(@Param('communityId') communityId: string) {
    return this.leaderboardService.getCommunityLeaderboard(communityId);
  }
}
