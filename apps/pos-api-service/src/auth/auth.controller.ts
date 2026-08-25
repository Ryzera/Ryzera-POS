import {
    Controller, Post, Get, Body,
    Req, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import {
    ApiTags, ApiOperation, ApiResponse,
    ApiBearerAuth, ApiBody,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { LoginSchema, ChangePasswordSchema, JwtPayload } from '@ryzera/pos-schema';

@ApiTags('🔐 Authentication')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'User Login',
        description: 'Authenticate with username/password. Returns JWT token. Account locks after 5 failed attempts.',
    })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['username', 'password'],
            properties: {
                username: { type: 'string', example: 'admin' },
                password: { type: 'string', example: 'admin123' },
            },
        },
    })
    @ApiResponse({ status: 200, description: '✅ Login successful — JWT token returned' })
    @ApiResponse({ status: 401, description: '❌ Invalid credentials' })
    @ApiResponse({ status: 403, description: '🔒 Account locked (5 failed attempts)' })
    async login(@Body() body: unknown, @Req() req: Request) {
        const dto = LoginSchema.parse(body);
        return this.authService.login(dto, req.ip, req.headers['user-agent']);
    }

    @Get('profile')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Get My Profile', description: 'Get current logged-in user profile' })
    @ApiResponse({ status: 200, description: '✅ Profile data returned' })
    @ApiResponse({ status: 401, description: '❌ Invalid or expired token' })
    async getProfile(@CurrentUser() user: JwtPayload) {
        return this.authService.getProfile(user.userId);
    }

    @Post('change-password')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Change Password', description: 'Change current user password' })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['currentPassword', 'newPassword', 'confirmPassword'],
            properties: {
                currentPassword: { type: 'string', example: 'admin123' },
                newPassword: { type: 'string', example: 'newpass123' },
                confirmPassword: { type: 'string', example: 'newpass123' },
            },
        },
    })
    @ApiResponse({ status: 200, description: '✅ Password changed' })
    @ApiResponse({ status: 400, description: '❌ Current password incorrect' })
    async changePassword(@Body() body: unknown, @CurrentUser() user: JwtPayload) {
        const dto = ChangePasswordSchema.parse(body);
        return this.authService.changePassword(user.userId, dto);
    }

    @Post('logout')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('JWT-auth')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Logout', description: 'Logout and invalidate session' })
    @ApiResponse({ status: 200, description: '✅ Logged out successfully' })
    async logout(@CurrentUser() user: JwtPayload & { token?: string }, @Req() req: Request) {
        const token = req.headers.authorization?.replace('Bearer ', '');
        return this.authService.logout(user.userId, token, req.ip, req.headers['user-agent']);
    }
}
