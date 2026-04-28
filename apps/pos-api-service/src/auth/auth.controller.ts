import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Request,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import type { LoginDto, RegisterDto } from '@ryzera/pos-schema';
import { LoginSchema, RegisterSchema } from '@ryzera/pos-schema';

import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';

interface RequestWithUser {
    user: { id: string; name: string; email: string; role: string };
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    // @UseGuards(JwtAuthGuard, RolesGuard)
    // @Roles('ADMIN')
    // @ApiBearerAuth()
    @ApiOperation({ summary: 'Register a new user (ADMIN only)' })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['name', 'email', 'password', 'role'],
            properties: {
                name:     { type: 'string', example: 'Super Admin' },
                email:    { type: 'string', example: 'admin@ryzera.com' },
                password: { type: 'string', example: 'admin1234' },
                role:     { type: 'string', enum: ['ADMIN', 'STAFF'], example: 'ADMIN' },
                branchId: { type: 'string', format: 'uuid' },
            },
        },
    })
    @ApiResponse({ status: 201, description: 'User registered' })
    @ApiResponse({ status: 409, description: 'Email already exists' })
    register(@Body(new ZodValidationPipe(RegisterSchema)) dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Login and get JWT token' })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['email', 'password'],
            properties: {
                email:    { type: 'string', example: 'admin@ryzera.com' },
                password: { type: 'string', example: 'admin1234' },
            },
        },
    })
    @ApiResponse({ status: 200, description: 'JWT token returned' })
    @ApiResponse({ status: 401, description: 'Invalid credentials' })
    login(@Body(new ZodValidationPipe(LoginSchema)) dto: LoginDto) {
        return this.authService.login(dto);
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current authenticated user' })
    @ApiResponse({ status: 200, description: 'Current user profile' })
    me(@Request() req: RequestWithUser) {
        return this.authService.me(req.user.id);
    }
}