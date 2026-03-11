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
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGuard } from './strategy/local.strategy';
import { JwtAuthGuard } from './strategy/jwt.strategy';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  /// authorization: Basic $token
  registerUser(@Headers('authorization') token: string) {
    return this.authService.register(token);
  }

  @Post('/login')
  loginUser(@Headers('authorization') token: string) {
    return this.authService.login(token);
  }

  @Post('/login/passport')
  @UseGuards(LocalAuthGuard)
  async loginUserPassport(@Request() req) {
    return {
      refreshToken: await this.authService.issueToken(req.user, true),
      accessToken: await this.authService.issueToken(req.user, false),
    };
  }

  @Get('/private')
  @UseGuards(JwtAuthGuard)
  async private(@Request() req) {
    console.log('ru');
    return req.user;
  }
}
