import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
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
  async getById(@Param('id') id: string) {
    return this.issuesService.getByIdOrThrow(id);
  }

  @Post()
  @Roles('citizen')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new citizen issue report' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        type: { type: 'string', example: 'drainage' },
        title: { type: 'string', example: 'Flooded drainage by community clinic' },
        description: {
          type: 'string',
          example:
            'Blocked drainage channel is overflowing beside the clinic entrance',
        },
        severity: { type: 'string', enum: ['low', 'medium', 'high'] },
        lgaId: { type: 'string', example: 'surulere' },
        communityId: { type: 'string', example: 'adeniran-ogunsanya' },
        streetOrLandmark: { type: 'string', example: 'Clinic Road' },
        latitude: { type: 'number', example: 6.5001 },
        longitude: { type: 'number', example: 3.3525 },
        photoUrls: {
          type: 'array',
          items: { type: 'string', format: 'uri' },
          maxItems: 5,
        },
        videoUrl: { type: 'string', format: 'uri' },
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Up to 5 image files, 30MB max each',
        },
        video: {
          type: 'string',
          format: 'binary',
          description: 'Optional video file, 30MB max',
        },
      },
      required: [
        'type',
        'title',
        'description',
        'severity',
        'lgaId',
        'communityId',
        'streetOrLandmark',
        'latitude',
        'longitude',
      ],
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'images', maxCount: 5 },
      { name: 'video', maxCount: 1 },
    ]),
  )
  async create(
    @Body() dto: CreateIssueDto,
    @CurrentUser() user: AuthUser,
    @UploadedFiles()
    files?: {
      images?: Array<{
        originalname: string;
        mimetype: string;
        size: number;
        buffer: Buffer;
      }>;
      video?: Array<{
        originalname: string;
        mimetype: string;
        size: number;
        buffer: Buffer;
      }>;
    },
  ) {
    return this.issuesService.create(dto, user, files);
  }

  @Patch(':id/status')
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update the official issue status as an admin' })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateIssueStatusDto) {
    return this.issuesService.updateStatus(id, dto);
  }

  @Put(':id/reaction')
  @Roles('citizen')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set, switch, or undo a citizen reaction on an issue' })
  async updateReaction(
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
  async getReaction(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.issuesService.getReaction(id, user.sub);
  }
}
