import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { ResolveLocationDto } from './dto/resolve-location.dto';
import { LocationsService } from './locations.service';

@ApiTags('locations')
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Public()
  @Post('resolve')
  @HttpCode(200)
  @ApiOperation({ summary: 'Resolve a guest coordinate to the nearest Lagos community point' })
  resolve(@Body() dto: ResolveLocationDto) {
    return this.locationsService.resolve(dto.latitude, dto.longitude, dto.street);
  }

  @Public()
  @Get('lgas')
  @ApiOperation({ summary: 'List Lagos LGAs' })
  listLgas() {
    return this.locationsService.listLgas();
  }

  @Public()
  @Get('lgas/:lgaId/communities')
  @ApiOperation({ summary: 'List communities for a specific LGA' })
  listCommunities(@Param('lgaId') lgaId: string) {
    return this.locationsService.listCommunitiesByLga(lgaId);
  }
}
