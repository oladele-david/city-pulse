import { Body, Controller, Get, HttpCode, Post, UnauthorizedException } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { AuthUser } from 'src/domain/models';
import { UsersRepository } from 'src/users/users.repository';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterCitizenDto } from './dto/register-citizen.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersRepository: UsersRepository,
  ) {}

  @Public()
  @Post('citizen/register')
  @ApiOperation({ summary: 'Register a citizen account' })
  registerCitizen(@Body() dto: RegisterCitizenDto) {
    return this.authService.registerCitizen(dto);
  }

  @Public()
  @Post('citizen/login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Authenticate a citizen user' })
  citizenLogin(@Body() dto: LoginDto) {
    return this.authService.citizenLogin(dto);
  }

  @Public()
  @Post('admin/login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Authenticate an admin user' })
  adminLogin(@Body() dto: LoginDto) {
    return this.authService.adminLogin(dto);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Return the authenticated user profile' })
  me(@CurrentUser() user: AuthUser) {
    const profile = this.usersRepository.findById(user.sub);
    if (!profile) {
      throw new UnauthorizedException({
        error: {
          code: 'unauthorized',
          message: 'User session is no longer valid',
          details: [],
        },
      });
    }

    return profile;
  }
}
