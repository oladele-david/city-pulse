import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from 'src/common/decorators/public.decorator';
import { AuthUser } from 'src/domain/models';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException({
        error: {
          code: 'unauthorized',
          message: 'Missing bearer token',
          details: [],
        },
      });
    }

    const token = authHeader.slice(7);
    try {
      const payload = this.jwtService.verify<AuthUser>(token, {
        secret: process.env.JWT_SECRET ?? 'citypulse-dev-secret',
      });
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException({
        error: {
          code: 'unauthorized',
          message: 'Invalid or expired token',
          details: [],
        },
      });
    }
  }
}
