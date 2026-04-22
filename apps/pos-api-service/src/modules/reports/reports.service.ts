import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService }         from '@ryzera/pos-database';
import { GenerateReportDto }     from './schemas/generate-report.schema';
import { SaveReportConfigDto }   from './schemas/saved-config.schema';
import { CreateReportScheduleDto } from './schemas/report-schedule.schema';
import { DeliveryStatus, ScheduleFrequency } from './enums/delivery-status.enum';
import { ReportType }            from './enums/report-type.enum';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Shape returned when a report is generated on demand. */
export interface GeneratedReportResult {
    reportType: ReportType;
    startDate:  string;
    endDate:    string;
    branchId:   number | undefined;
    categoryId: string | undefined;
    reportUrl:  string;
    generatedAt: string;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable()
export class ReportsService {
    constructor(private readonly prisma: PrismaService) {}

    // ─── Report Generation ──────────────────────────────────────────────────

    /**
     * Generates a report on demand from the provided filters.
     *
     * NOTE: Replace the stub reportUrl with real PDF/CSV export logic once
     *       the reporting engine is in place (e.g. call SalesReportService,
     *       aggregate data, pipe through a PDF generator).
     */
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

    /**
     * Returns all saved report configurations that belong to the requesting user,
     * ordered with the most recently created first.
     */
    async getAllSavedConfigs(userId: number) {
        return this.prisma.savedReportConfig.findMany({
            where:   { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Persists a new named filter configuration for the requesting user.
     */
    async saveReportConfig(
        dto:    SaveReportConfigDto,
        userId: number,
    ) {
        return this.prisma.savedReportConfig.create({
            data: {
                configName: dto.configName,
                reportType: dto.reportType,
                startDate:  dto.startDate,
                endDate:    dto.endDate,
                branchId:   dto.branchId   ?? null,
                categoryId: dto.categoryId ?? null,
                userId,
            },
        });
    }

    /**
     * Deletes a saved configuration.
     * Throws 404 if the record does not exist or does not belong to the user.
     */
    async deleteSavedConfig(configId: string, userId: number): Promise<void> {
        const config = await this.prisma.savedReportConfig.findFirst({
            where: { id: configId, userId },
        });

        if (!config) {
            throw new NotFoundException(
                `Saved config "${configId}" not found or access denied`,
            );
        }

        await this.prisma.savedReportConfig.delete({ where: { id: configId } });
    }

    // ─── Scheduled Reports ───────────────────────────────────────────────────

    /**
     * Returns ALL report schedules created by any user, newest first.
     * Any authenticated user can view all schedules — but can only
     * delete their own (enforced in deleteSchedule).
     */
    async getAllSchedules() {
        return this.prisma.reportSchedule.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Creates a new automated report schedule and calculates the first run date.
     */
    async createSchedule(
        dto:    CreateReportScheduleDto,
        userId: number,
    ) {
        const nextRunAt = this.calculateNextRunDate(dto.frequency);

        return this.prisma.reportSchedule.create({
            data: {
                scheduleName:   dto.scheduleName,
                reportType:     dto.reportType,
                frequency:      dto.frequency,
                recipientEmail: dto.recipientEmail,
                branchId:       dto.branchId   ?? null,
                categoryId:     dto.categoryId ?? null,
                isActive:       dto.isActive,
                nextRunAt,
                userId,
            },
        });
    }

    /**
     * Removes a schedule and all its delivery records (cascade).
     * Throws 404 if not found or not owned by the requesting user.
     */
    async deleteSchedule(scheduleId: string, userId: number): Promise<void> {
        const schedule = await this.prisma.reportSchedule.findFirst({
            where: { id: scheduleId, userId },   // ← ownership enforced here
        });

        if (!schedule) {
            throw new NotFoundException(
                `Schedule "${scheduleId}" not found or access denied`,
            );
        }

        await this.prisma.reportSchedule.delete({ where: { id: scheduleId } });
    }

    /**
     * Toggles the isActive flag on a schedule.
     * Throws 404 if not found or not owned by the requesting user.
     */
    async updateScheduleStatus(
        scheduleId: string,
        userId:     number,
        isActive:   boolean,
    ) {
        const schedule = await this.prisma.reportSchedule.findFirst({
            where: { id: scheduleId, userId },
        });

        if (!schedule) {
            throw new NotFoundException(
                `Schedule "${scheduleId}" not found or access denied`,
            );
        }

        return this.prisma.reportSchedule.update({
            where: { id: scheduleId },
            data:  { isActive },
        });
    }

    // ─── Delivery History ────────────────────────────────────────────────────

    /**
     * Returns all delivery records for a given schedule, newest first.
     * Validates that the schedule belongs to the requesting user before
     * exposing any delivery data.
     */
    async getDeliveryHistory(scheduleId: string) {
        const schedule = await this.prisma.reportSchedule.findFirst({
            where: { id: scheduleId },  // ← no userId filter
        });

        if (!schedule) {
            throw new NotFoundException(`Schedule "${scheduleId}" not found`);
        }

        return this.prisma.reportDelivery.findMany({
            where:   { scheduleId },
            orderBy: { sentAt: 'desc' },
        });
    }

    /**
     * Re-queues a FAILED delivery by resetting its status to PENDING.
     * Ownership is verified through the parent schedule.
     */
    async resendDelivery(deliveryId: string, userId: number) {
        const delivery = await this.prisma.reportDelivery.findFirst({
            where:   { id: deliveryId },
            include: { schedule: { select: { userId: true } } },
        });

        if (!delivery) {
            throw new NotFoundException(`Delivery record "${deliveryId}" not found`);
        }

        if (delivery.schedule.userId !== userId) {
            throw new BadRequestException(
                'You can only resend deliveries from your own schedules',
            );
        }

        if (delivery.status !== DeliveryStatus.FAILED) {
            throw new BadRequestException(
                `Only FAILED deliveries can be resent. Current status: ${delivery.status}`,
            );
        }

        return this.prisma.reportDelivery.update({
            where: { id: deliveryId },
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
}