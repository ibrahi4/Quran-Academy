import {
  Controller, Get, Post, Delete, Patch,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RecurringService } from './recurring.service';
import { CreateRecurringDto } from './dto/create-recurring.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Recurring Schedules')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('recurring')
export class RecurringController {
  constructor(private readonly recurringService: RecurringService) {}

  @Post('preview')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Preview dates + conflicts without creating' })
  preview(@Body() dto: CreateRecurringDto) {
    return this.recurringService.preview(dto);
  }

  @Post()
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Create recurring schedule + generate all sessions' })
  create(@Body() dto: CreateRecurringDto) {
    return this.recurringService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'List all recurring schedules' })
  findAll(
    @Query('studentId') studentId?: string,
    @Query('teacherId') teacherId?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.recurringService.findAll({
      studentId,
      teacherId,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    });
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Get recurring schedule with all sessions' })
  findOne(@Param('id') id: string) {
    return this.recurringService.findOne(id);
  }

  @Patch(':id/cancel-future')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Cancel all future sessions in this schedule' })
  cancelFuture(@Param('id') id: string) {
    return this.recurringService.cancelFuture(id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete schedule + all future sessions' })
  remove(@Param('id') id: string) {
    return this.recurringService.remove(id);
  }
}