import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { QuerySessionsDto } from './dto/query-sessions.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Sessions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.TEACHER)
  create(@Body() dto: CreateSessionDto) {
    return this.sessionsService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.TEACHER)
  findAll(@Query() query: QuerySessionsDto) {
    return this.sessionsService.findAll(query);
  }

  @Get('my')
  findMy(@CurrentUser() user: any, @Query() query: QuerySessionsDto) {
    return this.sessionsService.findMy(user.id, query);
  }

  @Get('upcoming')
  getUpcoming(@Query('studentId') studentId?: string) {
    return this.sessionsService.getUpcoming(studentId);
  }

  // ✅ NEW: Pending confirmations for admin dashboard
  @Get('pending-confirmations')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get sessions awaiting attendance confirmation (Admin)' })
  getPendingConfirmations() {
    return this.sessionsService.getPendingConfirmations();
  }

  @Get('check-conflict')
  @Roles(Role.ADMIN, Role.TEACHER)
  checkConflict(
    @Query('teacherId') teacherId: string,
    @Query('date') date: string,
    @Query('duration') duration?: string,
    @Query('excludeId') excludeId?: string,
  ) {
    return this.sessionsService.checkConflict(teacherId, date, Number(duration) || 60, excludeId);
  }

  @Get('teacher-slots')
  @Roles(Role.ADMIN, Role.TEACHER)
  getTeacherSlots(@Query('teacherId') teacherId: string, @Query('date') date: string) {
    return this.sessionsService.getTeacherAvailableSlots(teacherId, date);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sessionsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  update(@Param('id') id: string, @Body() dto: UpdateSessionDto) {
    return this.sessionsService.update(id, dto);
  }

  // ✅ NEW: Confirm attendance (auto-credit if teacher attended)
  @Patch(':id/confirm-attendance')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Confirm session attendance & auto-credit teacher wallet (Admin)' })
  confirmAttendance(
    @Param('id') id: string,
    @Body() data: {
      teacherAttended: boolean;
      studentAttended: boolean;
      teacherLateMins?: number;
      studentLateMins?: number;
      teacherNotes?: string;
    },
    @CurrentUser() admin: any,
  ) {
    const adminName = `${admin.firstName || ''} ${admin.lastName || ''}`.trim() || admin.email;
    return this.sessionsService.confirmAttendance(id, data, admin.id, adminName);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.sessionsService.remove(id);
  }
}