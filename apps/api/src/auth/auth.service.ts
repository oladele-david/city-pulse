import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from 'src/users/users.repository';
import { RegisterCitizenDto } from './dto/register-citizen.dto';
import { LoginDto } from './dto/login.dto';
import { getTrustWeight } from 'src/domain/rules/points.rules';
import { InMemoryDatabaseService } from 'src/infrastructure/in-memory/in-memory-database.service';
import { v4 as uuid } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
    private readonly db: InMemoryDatabaseService,
  ) {}

  async registerCitizen(dto: RegisterCitizenDto) {
    const existing = this.usersRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException({
        error: {
          code: 'email_taken',
          message: 'Email already registered',
          details: [],
        },
      });
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const lga = this.db.lgas.find((item) => item.id === dto.lgaId);
    const community = this.db.communities.find(
      (item) => item.id === dto.communityId && item.lgaId === dto.lgaId,
    );

    if (!lga || !community) {
      throw new NotFoundException({
        error: {
          code: 'not_found',
          message: 'Selected Lagos location was not found',
          details: [],
        },
      });
    }

    const user = this.usersRepository.create({
      fullName: dto.fullName,
      email: dto.email,
      passwordHash,
      role: 'citizen',
      lgaId: dto.lgaId,
      communityId: dto.communityId,
      streetOrArea: dto.streetOrArea,
      points: 0,
      rank: 'New',
      trustWeight: getTrustWeight('New'),
    });

    this.db.ledger.push({
      id: uuid(),
      userId: user.id,
      reason: 'report_submitted',
      pointsDelta: 0,
      metadata: { source: 'registration' },
      createdAt: new Date().toISOString(),
    });
    this.db.recalculateUserStanding(user.id);

    return this.buildAuthPayload(user);
  }

  async citizenLogin(dto: LoginDto) {
    return this.loginByRole(dto, 'citizen');
  }

  async adminLogin(dto: LoginDto) {
    return this.loginByRole(dto, 'admin');
  }

  private async loginByRole(dto: LoginDto, role: 'citizen' | 'admin') {
    const user = this.usersRepository.findByEmail(dto.email);
    if (!user || user.role !== role) {
      throw new UnauthorizedException({
        error: {
          code: 'invalid_credentials',
          message: 'Invalid email or password',
          details: [],
        },
      });
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException({
        error: {
          code: 'invalid_credentials',
          message: 'Invalid email or password',
          details: [],
        },
      });
    }

    return this.buildAuthPayload(user);
  }

  private buildAuthPayload(user: {
    id: string;
    email: string;
    role: 'citizen' | 'admin';
    passwordHash?: string;
    [key: string]: unknown;
  }) {
    const token = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
      },
      { secret: process.env.JWT_SECRET ?? 'citypulse-dev-secret' },
    );

    const { passwordHash: _passwordHash, ...profile } = user;

    return {
      accessToken: token,
      user: profile,
    };
  }
}
