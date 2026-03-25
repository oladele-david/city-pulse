import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AuthUser } from 'src/domain/models';
import { ActivityService } from './activity.service';

@ApiTags('activity')
@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get('me')
  @Roles('citizen')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List the authenticated citizen activity and points ledger' })
  getMine(@CurrentUser() user: AuthUser) {
    return this.activityService.getMyActivity(user.sub);
  }
}
