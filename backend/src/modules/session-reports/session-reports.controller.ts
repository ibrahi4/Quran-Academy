import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SessionReportsService } from './session-reports.service';
import { CreateSessionReportDto } from './dto/create-report.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Session Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('session-reports')
export class SessionReportsController {
  constructor(private readonly service: SessionReportsService) {}

  // ── Teacher ─────────────────────────────────────────────────
  @Post()
  @Roles(Role.TEACHER, Role.ADMIN)
  submitReport(
    @CurrentUser() user: any,
    @Body() dto: CreateSessionReportDto,
  ) {
    return this.service.submitReport(user.id, dto);
  }

  @Get('my')
  @Roles(Role.TEACHER, Role.ADMIN)
  getMyReports(
    @CurrentUser() user: any,
    @Query('status') status?: string,
  ) {
    return this.service.getMyReports(user.id, status);
  }

  @Get('by-session/:sessionId')
  getBySession(@Param('sessionId') sessionId: string) {
    return this.service.getReportBySession(sessionId);
  }

  // ── Admin ────────────────────────────────────────────────────
  @Get('pending')
  @Roles(Role.ADMIN)
  getPending() {
    return this.service.getPendingReports();
  }

  @Get()
  @Roles(Role.ADMIN)
  getAll(@Query('status') status?: string) {
    return this.service.getAllReports(status);
  }

  @Patch(':id/approve')
  @Roles(Role.ADMIN)
  approve(
    @Param('id') id: string,
    @Body() body: { adminNote?: string },
    @CurrentUser() admin: any,
  ) {
    const adminName = `${admin.firstName || ''} ${admin.lastName || ''}`.trim() || admin.email;
    return this.service.approveReport(id, admin.id, adminName, body.adminNote);
  }

  @Patch(':id/reject')
  @Roles(Role.ADMIN)
  reject(
    @Param('id') id: string,
    @Body() body: { reason: string },
    @CurrentUser() admin: any,
  ) {
    return this.service.rejectReport(id, admin.id, body.reason);
  }

  @Patch(':id/request-changes')
  @Roles(Role.ADMIN)
  requestChanges(
    @Param('id') id: string,
    @Body() body: { notes: string },
    @CurrentUser() admin: any,
  ) {
    return this.service.requestChanges(id, admin.id, body.notes);
  }
}