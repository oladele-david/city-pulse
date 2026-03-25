import { Body, Controller, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AuthUser } from 'src/domain/models';
import { CreateIssueDto } from './dto/create-issue.dto';
import { ListIssuesQueryDto } from './dto/list-issues.query.dto';
import { UpdateIssueStatusDto } from './dto/update-issue-status.dto';
import { UpdateReactionDto } from './dto/update-reaction.dto';
import { IssuesService } from './issues.service';

@ApiTags('issues')
@Controller('issues')
export class IssuesController {
  constructor(private readonly issuesService: IssuesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List public issues with optional Lagos area filters' })
  list(@Query() query: ListIssuesQueryDto) {
    return this.issuesService.list(query);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a single issue by id' })
  getById(@Param('id') id: string) {
    return this.issuesService.getByIdOrThrow(id);
  }

  @Post()
  @Roles('citizen')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new citizen issue report' })
  create(@Body() dto: CreateIssueDto, @CurrentUser() user: AuthUser) {
    return this.issuesService.create(dto, user);
  }

  @Patch(':id/status')
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update the official issue status as an admin' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateIssueStatusDto) {
    return this.issuesService.updateStatus(id, dto);
  }

  @Put(':id/reaction')
  @Roles('citizen')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set, switch, or undo a citizen reaction on an issue' })
  updateReaction(
    @Param('id') id: string,
    @Body() dto: UpdateReactionDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.issuesService.updateReaction(id, dto, user);
  }

  @Get(':id/reaction')
  @Roles('citizen')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the current citizen reaction for an issue' })
  getReaction(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.issuesService.getReaction(id, user.sub);
  }
}
