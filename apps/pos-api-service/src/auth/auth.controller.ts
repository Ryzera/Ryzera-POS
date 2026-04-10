import { Controller, Post, Get, Body, UsePipes } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { LoginSchema, RegisterSchema } from '@ryzera/pos-schema';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Public()
  @Post('login')
  @UsePipes(new ZodValidationPipe(LoginSchema))
  login(@Body() dto: any) {
    return this.auth.login(dto);
  }

  @Public()
  @Post('register')
  @UsePipes(new ZodValidationPipe(RegisterSchema))
  register(@Body() dto: any) {
    return this.auth.register(dto);
  }

  @Get('me')
  me(@CurrentUser() user: any) {
    return this.auth.me(user.sub);
  }
}
