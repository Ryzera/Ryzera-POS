import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SettingDto } from './dto/setting.dto';

@Controller('settings')
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get()
  async getAll() {
    return this.settingsService.getAll();
  }

  @Get(':key')
  async getByKey(@Param('key') key: string) {
    return this.settingsService.getByKey(key);
  }

  @Post(':key')
  async set(
    @Param('key') key: string,
    @Body() body: SettingDto
  ) {
    return this.settingsService.set(key, body.value, body.description);
  }

  @Delete(':key')
  async delete(@Param('key') key: string) {
    return this.settingsService.delete(key);
  }
}