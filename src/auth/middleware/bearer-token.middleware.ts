import { BadRequestException, Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { envVariables } from '../../common/const/env.const';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BearerTokenMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private validateTokenFormat(rawToken: string) {
    const basicSplit = rawToken.split(' ');
    if (basicSplit.length !== 2) {
      throw new BadRequestException('토큰 포맷이 잘못되었습니다!');
    }

    const [bearer, token] = basicSplit;
    if (bearer.toLowerCase() !== 'bearer') {
      throw new BadRequestException('토큰 포맷이 잘못되었습니다!');
    }

    return token;
  }

  private decode(token: string) {
    const decodedPayload = this.jwtService.decode(token);

    if (!decodedPayload || (decodedPayload.type !== 'refresh' && decodedPayload.type !== 'access')) {
      throw new UnauthorizedException('잘못된 토큰입니다!');
    }

    return decodedPayload;
  }

  public async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return next();

    try {
      const token = this.validateTokenFormat(authHeader);
      const decodedPayload = this.decode(token);

      const isRefreshToken = decodedPayload.type === 'refresh';
      const secretKey = isRefreshToken ? envVariables.refreshTokenSecret : envVariables.accessTokenSecret;

      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.getOrThrow<string>(secretKey),
      });

      req.user = payload;
      next();
    } catch (e) {
      if (e.name === 'TokenExpiredError') {
        throw new UnauthorizedException('토큰이 만료되었습니다!');
      }

      next();
    }
  }
}
