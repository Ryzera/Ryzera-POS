import { Body, Controller, Get, Post } from '@nestjs/common';
import { SyncService } from './sync.service';
import { PushSyncDto } from './dto/push-sync.dto';

@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Get('test')
  getTest() {
    return this.syncService.getTest();
  }

  @Post('push')
  push(@Body() data: PushSyncDto) {
    return this.syncService.push(data);
  }

  @Get('status')
  getStatus() {
    return this.syncService.getStatus();
  }
}