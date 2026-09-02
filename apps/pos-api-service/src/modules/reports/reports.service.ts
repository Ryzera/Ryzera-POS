import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService }          from '@ryzera/pos-database';
import { GenerateReportDto }      from './schemas/generate-report.schema';
import { SaveReportConfigDto }    from './schemas/saved-config.schema';
import { CreateReportScheduleDto } from './schemas/report-schedule.schema';
import { DeliveryStatus, ScheduleFrequency } from './enums/delivery-status.enum';
import { ReportType }             from './enums/report-type.enum';
import { ROLES } from '../../common/constants/roles.constants';


export interface GeneratedReportResult {
    reportType:  ReportType;
    startDate:   string;
    endDate:     string;
    branchId:    number | undefined;
    categoryId:  string | undefined;
    reportUrl:   string;
    generatedAt: string;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable()
export class ReportsService {
    constructor(private readonly prisma: PrismaService) {}

    // ─── Report Generation ──────────────────────────────────────────────────

    async generateReport(dto: GenerateReportDto): Promise<GeneratedReportResult> {
        const reportUrl = `/reports/generated/${dto.reportType}_${dto.startDate}_${dto.endDate}.pdf`;

        return {
            reportType:  dto.reportType,
            startDate:   dto.startDate,
            endDate:     dto.endDate,
            branchId:    dto.branchId,
            categoryId:  dto.categoryId,
            reportUrl,
            generatedAt: new Date().toISOString(),
        };
    }

    // ─── Saved Configurations ────────────────────────────────────────────────

    async getAllSavedConfigs() {
        const rows = await this.prisma.savedReportConfig.findMany({
            include: { branch: { select: { id: true, name: true } } },
            orderBy: { created_at: 'desc' },
        });
        return rows.map(r => this.mapSavedConfig(r));
    }

    async saveReportConfig(dto: SaveReportConfigDto, userId: number) {
        const row = await this.prisma.savedReportConfig.create({
            data: {
                configName: dto.configName,
                reportType: dto.reportType,
                startDate:  dto.startDate,
                endDate:    dto.endDate,
                branch_id:  dto.branchId ?? null,
                categoryId: dto.categoryId != null ? Number(dto.categoryId) : null,
                user_id:    userId,
            },
            include: { branch: { select: { id: true, name: true } } },
        });
        return this.mapSavedConfig(row);
    }

    async deleteSavedConfig(configId: string, userId: number, role: string): Promise<void> {
        const numericId = Number(configId);
        const isAdmin = role === ROLES.ADMIN;

        const config = await this.prisma.savedReportConfig.findFirst({
            where: isAdmin ? { id: numericId } : { id: numericId, user_id: userId },
        });

        if (!config) {
            throw new NotFoundException(`Saved config "${configId}" not found or access denied`);
        }
        await this.prisma.savedReportConfig.delete({ where: { id: numericId } });
    }

    // ─── Scheduled Reports ───────────────────────────────────────────────────

    async getAllSchedules() {
        const rows = await this.prisma.reportSchedule.findMany({
            include: { branch: { select: { id: true, name: true } } },
            orderBy: { created_at: 'desc' },
        });
        return rows.map(r => this.mapSchedule(r));
    }

    async createSchedule(dto: CreateReportScheduleDto, userId: number) {
        const nextRunAt = this.calculateNextRunDate(dto.frequency);
        const row = await this.prisma.reportSchedule.create({
            data: {
                scheduleName:   dto.scheduleName,
                reportType:     dto.reportType,
                frequency:      dto.frequency,
                recipientEmail: dto.recipientEmail,
                branch_id:      dto.branchId ?? null,
                isActive:       dto.isActive,
                user_id:        userId,
                nextRunAt,
            },
            include: { branch: { select: { id: true, name: true } } },
        });
        return this.mapSchedule(row);
    }

    async deleteSchedule(scheduleId: string, userId: number, role: string): Promise<void> {
        const numericId = Number(scheduleId);
        const isAdmin = role === ROLES.ADMIN;

        const schedule = await this.prisma.reportSchedule.findFirst({
            where: isAdmin ? { id: numericId } : { id: numericId, user_id: userId },
        });

        if (!schedule) {
            throw new NotFoundException(`Schedule "${scheduleId}" not found or access denied`);
        }
        await this.prisma.reportSchedule.delete({ where: { id: numericId } });
    }

    async updateScheduleStatus(
        scheduleId: string,
        userId:     number,
        isActive:   boolean,
    ) {
        const numericId = Number(scheduleId);

        // FIX: `id` is Int — use the parsed number.
        const schedule = await this.prisma.reportSchedule.findFirst({
            where: { id: numericId, user_id: userId },
        });

        if (!schedule) {
            throw new NotFoundException(
                `Schedule "${scheduleId}" not found or access denied`,
            );
        }

        return this.prisma.reportSchedule.update({
            where: { id: numericId },
            data:  { isActive },
        });
    }

    // ─── Delivery History ────────────────────────────────────────────────────

    async getDeliveryHistory(scheduleId: string) {
        const numericId = Number(scheduleId);

        // FIX: `id` is Int — use the parsed number.
        const schedule = await this.prisma.reportSchedule.findFirst({
            where: { id: numericId },
        });

        if (!schedule) {
            throw new NotFoundException(`Schedule "${scheduleId}" not found`);
        }

        return this.prisma.reportDelivery.findMany({
            where:   { schedule_id: numericId },
            orderBy: { sentAt: 'desc' },
        });
    }

    async resendDelivery(deliveryId: string, userId: number) {
        const numericId = Number(deliveryId);

        const delivery = await this.prisma.reportDelivery.findFirst({
            where:   { id: numericId },
            include: { schedule: { select: { user_id: true } } },
        });

        if (!delivery) {
            throw new NotFoundException(`Delivery record "${deliveryId}" not found`);
        }

        if (delivery.schedule.user_id !== userId) {
            throw new BadRequestException(
                'You can only resend deliveries from your own schedules',
            );
        }

        if (delivery.status !== DeliveryStatus.FAILED) {
            throw new BadRequestException(
                `Only FAILED deliveries can be resent. Current status: ${delivery.status}`,
            );
        }

        // FIX: `id` is Int — use the parsed number.
        return this.prisma.reportDelivery.update({
            where: { id: numericId },
            data:  {
                status:        DeliveryStatus.PENDING,
                failureReason: null,
            },
        });
    }

    // ─── Private Helpers ─────────────────────────────────────────────────────

    private calculateNextRunDate(frequency: ScheduleFrequency): Date {
        const next = new Date();

        switch (frequency) {
            case ScheduleFrequency.DAILY:
                next.setDate(next.getDate() + 1);
                break;

            case ScheduleFrequency.WEEKLY:
                next.setDate(next.getDate() + 7);
                break;

            case ScheduleFrequency.MONTHLY:
                next.setMonth(next.getMonth() + 1);
                break;

            default:
                throw new BadRequestException(
                    `Unsupported schedule frequency: ${frequency}`,
                );
        }

        return next;
    }

    private mapSavedConfig(row: any) {
        return {
            id: String(row.id),
            configName: row.configName,
            reportType: row.reportType,
            startDate:  row.startDate,
            endDate:    row.endDate,
            branchId:   row.branch_id,
            branch:     row.branch ? { id: row.branch.id, name: row.branch.name } : null,
            categoryId: row.categoryId,
            userId:     row.user_id,
            createdAt:  row.created_at.toISOString(),
        };
    }

    private mapSchedule(row: any) {
        return {
            id: String(row.id),
            scheduleName:   row.scheduleName,
            reportType:     row.reportType,
            frequency:      row.frequency,
            recipientEmail: row.recipientEmail,
            branchId:       row.branch_id,
            branch:         row.branch ? { id: row.branch.id, name: row.branch.name } : null,
            isActive:       row.isActive,
            nextRunAt:      row.nextRunAt ? row.nextRunAt.toISOString() : null,
            userId:         row.user_id,
            createdAt:      row.created_at.toISOString(),
        };
    }

}