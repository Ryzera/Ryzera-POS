import { Controller, Post, Body, Req, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { Request } from 'express';   // ← "import type" කරන්න

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('login')
    async login(@Body() dto: LoginDto, @Req() req: Request) {
        return this.authService.login(dto, req.ip, req.headers['user-agent']);
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    async logout(@Req() req: any) {
        return this.authService.logout(req.user.id, req.ip, req.headers['user-agent']);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getProfile(@Req() req: any) {
        return this.authService.getProfile(req.user.id);
    }
}