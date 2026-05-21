import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('teacher')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  // ===== ADMIN =====

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateTeacherDto) {
    return this.teacherService.create(dto);
  }

  @Get()
  findAll() {
    return this.teacherService.findAll();
  }

  // ===== TEACHER DASHBOARD =====

  @Get('dashboard')
  @Roles(Role.TEACHER)
  getDashboard(@CurrentUser('id') userId: string) {
    return this.teacherService.getDashboard(userId);
  }

  // ===== TEACHER SESSIONS =====

  @Get('sessions')
  @Roles(Role.TEACHER)
  getSessions(
    @CurrentUser('id') userId: string,
    @Query() query: { status?: string; from?: string; to?: string },
  ) {
    return this.teacherService.getSessions(userId, query);
  }

  @Patch('sessions/:id/complete')
  @Roles(Role.TEACHER)
  completeSession(
    @CurrentUser('id') userId: string,
    @Param('id') sessionId: string,
    @Body() data: {
      teacherNotes?: string;
      studentAttended?: boolean;
      teacherAttended?: boolean;
      studentLateMins?: number;
      teacherLateMins?: number;
    },
  ) {
    return this.teacherService.completeSession(userId, sessionId, data);
  }

  // ===== TEACHER STUDENTS =====

  @Get('my-students')
  @Roles(Role.TEACHER)
  getMyStudents(@CurrentUser('id') userId: string) {
    return this.teacherService.getMyStudents(userId);
  }

  // ===== SCHEDULE & AVAILABILITY =====

  @Get('weekly-schedule')
  @Roles(Role.TEACHER)
  getWeeklySchedule(
    @CurrentUser('id') userId: string,
    @Query('startDate') startDate?: string,
  ) {
    return this.teacherService.getWeeklySchedule(userId, startDate);
  }

  @Get('check-availability')
  @Roles(Role.TEACHER)
  checkAvailability(
    @CurrentUser('id') userId: string,
    @Query('date') date: string,
    @Query('duration') duration?: string,
  ) {
    return this.teacherService.checkAvailability(userId, date, Number(duration) || 60);
  }

  @Get('available-slots')
  @Roles(Role.TEACHER)
  getAvailableSlots(
    @CurrentUser('id') userId: string,
    @Query('date') date: string,
  ) {
    return this.teacherService.getAvailableSlots(userId, date);
  }

  // ===== EARNINGS =====

  @Get('earnings')
  @Roles(Role.TEACHER)
  getEarnings(
    @CurrentUser('id') userId: string,
    @Query('month') month?: string,
  ) {
    return this.teacherService.getEarnings(userId, month);
  }

  // ===== ADMIN: Single Teacher =====

  @Get(':id')
  @Roles(Role.ADMIN)
  findOne(@Param('id') id: string) {
    return this.teacherService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateTeacherDto) {
    return this.teacherService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.teacherService.remove(id);
  }
}