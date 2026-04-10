import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiBody } from '@nestjs/swagger'; import { KpiTargetsService }   from './kpi-targets.service';
import { ZodValidationPipe }   from '../common/pipes/zod-validation.pipe';
import { CreateKpiTargetSchema } from './schemas/create-kpi-target.schema';
import type { CreateKpiTargetDto } from './schemas/create-kpi-target.schema';
import { JwtAuthGuard }        from '../common/guards/jwt-auth.guard';
import { RolesGuard }          from '../common/guards/roles.guard';
import { Roles }               from '../common/decorators/roles.decorator';
import { CurrentUser }         from '../common/decorators/current-user.decorator';
import type { JwtPayload }     from '../common/interfaces/jwt-payload.interface';

@ApiTags('KpiTargets')
@ApiBearerAuth()
@Controller('kpi-targets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class KpiTargetsController {
    constructor(private readonly kpiTargetsService: KpiTargetsService) {}

    @Post()
    @Roles('SUPER_ADMIN', 'BRANCH_MANAGER')
    @ApiBody({                          // ← add this
        schema: {
            type: 'object',
            required: ['period_type', 'target_amount'],
            properties: {
                period_type:   { type: 'string', enum: ['Daily', 'Weekly', 'Monthly'] },
                target_amount: { type: 'number', example: 500000 },
                branch_id:     { type: 'number', example: 1 },
            },
        },
    })
    setTarget(
        @Body(new ZodValidationPipe(CreateKpiTargetSchema)) dto: CreateKpiTargetDto
    ) {
        return this.kpiTargetsService.setTarget(dto);
    }

    @Get('progress')
    getProgress(@CurrentUser() user: JwtPayload) {
        const branchId = user.role === 'SUPER_ADMIN' ? undefined : user.branchId ?? undefined;
        return this.kpiTargetsService.getTargetProgress(branchId);
    }
}