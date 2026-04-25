import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { TrackEventDto } from './dto/track-event.dto';
import { QueryAnalyticsDto } from './dto/query-analytics.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('track')
  @ApiOperation({ summary: 'Track event (public)' })
  track(@Body() dto: TrackEventDto, @Req() req: any) {
    const ip =
      req.ip || (req.headers['x-forwarded-for'] as string) || undefined;
    const userAgent = req.headers['user-agent'] as string;
    return this.analyticsService.trackEvent(dto, ip, userAgent);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List analytics events (Admin)' })
  findAll(@Query() query: QueryAnalyticsDto) {
    return this.analyticsService.findAll(query);
  }

  @Get('overview')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Analytics overview (Admin)' })
  overview() {
    return this.analyticsService.getOverview();
  }

  @Get('page-views')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Top page views (Admin)' })
  pageViews(@Query('days') days?: number) {
    return this.analyticsService.getPageViews(days || 30);
  }

  @Get('event-counts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Event counts (Admin)' })
  eventCounts(@Query('days') days?: number) {
    return this.analyticsService.getEventCounts(days || 30);
  }

  @Get('daily')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Daily stats (Admin)' })
  dailyStats(@Query('days') days?: number) {
    return this.analyticsService.getDailyStats(days || 30);
  }
}
