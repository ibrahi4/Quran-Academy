import { Controller, Post, Get, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { BookingStatus, Role } from '@prisma/client';

@ApiTags('Bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create trial booking (public, auto-creates account)' })
  create(@Body() dto: CreateBookingDto) {
    return this.bookingsService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiBearerAuth()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.bookingsService.findAll(
      Number(page) || 1,
      Number(limit) || 20,
      status,
      search,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiBearerAuth()
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  // ✅ NEW: Dedicated confirm endpoint with teacher assignment
  @Patch(':id/confirm')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirm booking + assign teacher + create session' })
  confirmBooking(
    @Param('id') id: string,
    @Body() data: {
      teacherId: string;
      date: string;
      time: string;
      duration?: number;
      meetingLink: string;
      adminNotes?: string;
    },
  ) {
    return this.bookingsService.confirmBooking(id, data);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: BookingStatus,
    @Body('adminNotes') adminNotes?: string,
    @Body('meetingLink') meetingLink?: string,
  ) {
    return this.bookingsService.updateStatus(id, status, adminNotes, meetingLink);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.bookingsService.remove(id);
  }
}