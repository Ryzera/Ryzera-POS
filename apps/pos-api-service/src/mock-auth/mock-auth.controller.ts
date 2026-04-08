import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { MockAuthService } from './mock-auth.service';

@ApiTags('MockAuth')
@Controller('auth')
export class MockAuthController {
    constructor(private readonly mockAuthService: MockAuthService) {}

    @Post('login')
    @ApiOperation({ summary: 'Login and get JWT token' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                username: { type: 'string', example: 'super_admin' },
                password: { type: 'string', example: 'your_password' },
            },
        },
    })
    login(@Body() body: { username: string; password: string }) {
        return this.mockAuthService.login(body.username, body.password);
    }
}