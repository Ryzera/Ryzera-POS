import {
    Controller,
    Post,
    Get,
    Body,
    Req,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { LoginSchema, ChangePasswordSchema, JwtPayload } from '@ryzera/pos-schema';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    // POST /auth/login
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() body: unknown, @Req() req: Request) {
        const dto = LoginSchema.parse(body);
        const ip = req.ip;
        const userAgent = req.headers['user-agent'];
        return this.authService.login(dto, ip, userAgent);
    }

    // GET /auth/profile
    @Get('profile')
    @UseGuards(AuthGuard('jwt'))
    async getProfile(@CurrentUser() user: JwtPayload) {
        return this.authService.getProfile(user.userId);
    }

    // POST /auth/change-password
    @Post('change-password')
    @UseGuards(AuthGuard('jwt'))
    async changePassword(
        @Body() body: unknown,
        @CurrentUser() user: JwtPayload,
    ) {
        const dto = ChangePasswordSchema.parse(body);
        return this.authService.changePassword(user.userId, dto);
    }

    // POST /auth/logout
    @Post('logout')
    @UseGuards(AuthGuard('jwt'))
    @HttpCode(HttpStatus.OK)
    async logout(@CurrentUser() user: JwtPayload, @Req() req: Request) {
        return this.authService.logout(
            user.userId,
            req.ip,
            req.headers['user-agent'],
        );
    }
}