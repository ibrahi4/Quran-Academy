import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Admin Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard stats' })
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('recent-bookings')
  @ApiOperation({ summary: 'Get recent bookings' })
  getRecentBookings(@Query('limit') limit?: number) {
    return this.adminService.getRecentBookings(limit || 10);
  }

  @Get('recent-contacts')
  @ApiOperation({ summary: 'Get recent contacts' })
  getRecentContacts(@Query('limit') limit?: number) {
    return this.adminService.getRecentContacts(limit || 10);
  }

  @Get('recent-payments')
  @ApiOperation({ summary: 'Get recent payments' })
  getRecentPayments(@Query('limit') limit?: number) {
    return this.adminService.getRecentPayments(limit || 10);
  }

  @Get('upcoming-sessions')
  @ApiOperation({ summary: 'Get upcoming sessions' })
  getUpcomingSessions(@Query('limit') limit?: number) {
    return this.adminService.getUpcomingSessions(limit || 10);
  }

  @Get('revenue-chart')
  @ApiOperation({ summary: 'Monthly revenue chart data' })
  getRevenueChart(@Query('months') months?: number) {
    return this.adminService.getMonthlyRevenueChart(months || 12);
  }

  @Get('user-growth')
  @ApiOperation({ summary: 'Monthly user growth chart data' })
  getUserGrowth(@Query('months') months?: number) {
    return this.adminService.getUserGrowthChart(months || 12);
  }
}
