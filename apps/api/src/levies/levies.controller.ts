import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AuthUser } from 'src/domain/models';
import { CreateLevyDto } from './dto/create-levy.dto';
import { ListAdminLeviesDto } from './dto/list-admin-levies.dto';
import { ListLevyPaymentsDto } from './dto/list-levy-payments.dto';
import { UpdateLevyDto } from './dto/update-levy.dto';
import { LeviesService } from './levies.service';

@ApiTags('levies')
@Controller()
export class LeviesController {
  constructor(private readonly leviesService: LeviesService) {}

  @Post('admin/levies')
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a levy for a community or LGA' })
  async create(@Body() dto: CreateLevyDto, @CurrentUser() user: AuthUser) {
    return this.leviesService.create(dto, user);
  }

  @Get('admin/levies')
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List levies for admin management' })
  async listAdmin(@Query() query: ListAdminLeviesDto) {
    return this.leviesService.listAdmin(query.status);
  }

  @Get('admin/levies/:levyId')
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get one levy with target details' })
  async getAdminDetail(@Param('levyId') levyId: string) {
    return this.leviesService.getAdminDetail(levyId);
  }

  @Patch('admin/levies/:levyId')
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Edit a draft or published levy' })
  async update(@Param('levyId') levyId: string, @Body() dto: UpdateLevyDto) {
    return this.leviesService.update(levyId, dto);
  }

  @Post('admin/levies/:levyId/publish')
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish a levy' })
  async publish(@Param('levyId') levyId: string) {
    return this.leviesService.publish(levyId);
  }

  @Post('admin/levies/:levyId/unpublish')
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unpublish a levy back to draft' })
  async unpublish(@Param('levyId') levyId: string) {
    return this.leviesService.unpublish(levyId);
  }

  @Post('admin/levies/:levyId/close')
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Close a levy and stop new collections' })
  async close(@Param('levyId') levyId: string) {
    return this.leviesService.close(levyId);
  }

  @Get('admin/levies/:levyId/dashboard')
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get levy collection metrics and totals' })
  async getDashboard(@Param('levyId') levyId: string) {
    return this.leviesService.getDashboard(levyId);
  }

  @Get('admin/levies/:levyId/payments')
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List levy payments filtered by status' })
  async listPayments(@Param('levyId') levyId: string, @Query() query: ListLevyPaymentsDto) {
    return this.leviesService.listPayments(levyId, query);
  }

  @Get('levies/me')
  @Roles('citizen')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List the published levies applicable to the current citizen' })
  async listCitizen(@CurrentUser() user: AuthUser) {
    return this.leviesService.listCitizenLevies(user);
  }

  @Get('levies/:levyId')
  @Roles('citizen')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get one applicable levy for the current citizen' })
  async getCitizenDetail(@Param('levyId') levyId: string, @CurrentUser() user: AuthUser) {
    return this.leviesService.getCitizenLevyDetail(levyId, user);
  }
}
