import {
  Controller,
  Post,
  Headers,
  UseInterceptors,
  ClassSerializerInterceptor,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './strategy/local.strategy';
import { JwtAuthGuard } from './strategy/jwt.strategy';
import { Request as RequestType } from 'express';
import { Role } from '../user/entities/user.entity';
import { Public } from './decorator/public.decorator';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('/register')
  registerUser(@Headers('authorization') token: string) {
    return this.authService.register(token);
  }

  @Public()
  @Post('/login')
  loginUser(@Headers('authorization') token: string) {
    return this.authService.login(token);
  }

  @Post('/token/access')
  async rotateAccessToken(@Request() req: RequestType) {
    const payload = req.user as { id: number; role: Role };

    return {
      accessToken: await this.authService.issueToken(payload, false),
    };
  }

  @Post('/login/passport')
  @UseGuards(LocalAuthGuard)
  async loginUserPassport(@Request() req: RequestType) {
    const payload = req.user as { id: number; role: Role };

    return {
      refreshToken: await this.authService.issueToken(payload, true),
      accessToken: await this.authService.issueToken(payload, false),
    };
  }

  @Get('/private')
  @UseGuards(JwtAuthGuard)
  private(@Request() req: RequestType) {
    return req.user;
  }
}
