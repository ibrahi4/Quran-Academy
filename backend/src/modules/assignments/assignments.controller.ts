import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto, ReviewSubmissionDto } from './dto/create-assignment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Assignments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly service: AssignmentsService) {}

  // ── Teacher ─────────────────────────────────────────────────
  @Post()
  @Roles(Role.TEACHER, Role.ADMIN)
  create(@CurrentUser() user: any, @Body() dto: CreateAssignmentDto) {
    return this.service.create(user.id, dto);
  }

  @Get('teacher')
  @Roles(Role.TEACHER, Role.ADMIN)
  getTeacherAssignments(
    @CurrentUser() user: any,
    @Query('status') status?: string,
  ) {
    return this.service.getTeacherAssignments(user.id, status);
  }

  @Get('pending-submissions')
  @Roles(Role.TEACHER, Role.ADMIN)
  getPendingSubmissions(@CurrentUser() user: any) {
    return this.service.getPendingSubmissions(user.id);
  }

  @Patch('submissions/:id/review')
  @Roles(Role.TEACHER, Role.ADMIN)
  reviewSubmission(
    @CurrentUser() user: any,
    @Param('id') submissionId: string,
    @Body() dto: ReviewSubmissionDto,
  ) {
    return this.service.reviewSubmission(user.id, submissionId, dto);
  }

  // ── Student ──────────────────────────────────────────────────
  @Get('my')
  @Roles(Role.STUDENT, Role.TRIAL_STUDENT)
  getMyAssignments(
    @CurrentUser() user: any,
    @Query('status') status?: string,
  ) {
    return this.service.getStudentAssignments(user.id, status);
  }

  @Post(':id/submit')
  @Roles(Role.STUDENT, Role.TRIAL_STUDENT)
  submit(
    @CurrentUser() user: any,
    @Param('id') assignmentId: string,
    @Body() body: { content?: string; linkUrl?: string; fileUrl?: string },
  ) {
    return this.service.submitAssignment(user.id, assignmentId, body);
  }

  // ── Admin ────────────────────────────────────────────────────
  @Get()
  @Roles(Role.ADMIN)
  getAll(@Query('status') status?: string) {
    return this.service.getAll(status);
  }
}