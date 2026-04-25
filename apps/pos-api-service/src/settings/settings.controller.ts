import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { CreateSettingSchema, UpdateSettingSchema, CreateSettingDto, UpdateSettingDto } from './schema/settings.schema';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../auth/guards/roles.guards';
// import { Roles } from '../auth/decorators/roles.decorator';

/**
 * System settings CRUD operations.
 * Auth guards temporarily disabled - waiting for auth module fix.
 */
@Controller('settings')
// @UseGuards(JwtAuthGuard, RolesGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  /** Create a setting. @example {"key":"tax_rate","value":"15"} */
  @Post()
  // @Roles('ADMIN')
  async create(@Body() data: unknown) {
    const validated = CreateSettingSchema.parse(data) as CreateSettingDto;
    return this.settingsService.create(validated);
  }

  /** Get all settings. @example GET /api/settings */
  @Get()
  // @Roles('MANAGER', 'ADMIN')
  findAll(@Query('companyId') companyId?: string, @Query('branchId') branchId?: string) {
    return this.settingsService.findAll(companyId, branchId);
  }

  /** Get setting by key. @example GET /api/settings/tax_rate */
  @Get(':key')
  // @Roles('MANAGER', 'ADMIN')
  findByKey(@Param('key') key: string, @Query('companyId') companyId?: string, @Query('branchId') branchId?: string) {
    return this.settingsService.findByKey(key, companyId, branchId);
  }

  /** Update setting value. @example PUT /api/settings/tax_rate Body: {"value":"18"} */
  @Put(':key')
  // @Roles('ADMIN')
  async update(@Param('key') key: string, @Body() data: unknown, @Query('companyId') companyId?: string, @Query('branchId') branchId?: string) {
    const validated = UpdateSettingSchema.parse(data) as UpdateSettingDto;
    return this.settingsService.update(key, validated, companyId, branchId);
  }

  /** Delete setting by key. @example DELETE /api/settings/tax_rate */
  @Delete(':key')
  // @Roles('ADMIN')
  delete(@Param('key') key: string, @Query('companyId') companyId?: string, @Query('branchId') branchId?: string) {
    return this.settingsService.delete(key, companyId, branchId);
  }
}