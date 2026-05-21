import {
  Controller, Get, Post, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import {
  AddBonusDto, DeductDto, RecordPayoutDto,
} from './dto/adjust-wallet.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role, WalletTransactionType } from '@prisma/client';

@ApiTags('Wallet')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  // ============================================
  // TEACHER: Get own wallet
  // ============================================
  @Get('me')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Get my wallet (Teacher)' })
  getMyWallet(@CurrentUser('id') userId: string) {
    return this.walletService.getWalletByUserId(userId);
  }

  @Get('me/transactions')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Get my transactions (Teacher)' })
  getMyTransactions(
    @CurrentUser('id') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: WalletTransactionType,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.walletService.getTransactionsByUserId(userId, {
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      type,
      from,
      to,
    });
  }

  // ============================================
  // ADMIN: View any teacher wallet
  // ============================================
  @Get('admin/all')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'List all teachers wallets summary (Admin)' })
  getAllWallets() {
    return this.walletService.getAllWalletsSummary();
  }

  @Get('admin/teacher/:teacherId')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get specific teacher wallet (Admin)' })
  getTeacherWallet(@Param('teacherId') teacherId: string) {
    return this.walletService.getWalletByTeacherId(teacherId);
  }

  @Get('admin/teacher/:teacherId/transactions')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get teacher transactions (Admin)' })
  getTeacherTransactions(
    @Param('teacherId') teacherId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: WalletTransactionType,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.walletService.getTransactions(teacherId, {
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      type,
      from,
      to,
    });
  }

  // ============================================
  // ADMIN: Adjustments
  // ============================================
  @Post('admin/teacher/:teacherId/bonus')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Add bonus to teacher wallet (Admin)' })
  addBonus(
    @Param('teacherId') teacherId: string,
    @Body() dto: AddBonusDto,
    @CurrentUser() admin: any,
  ) {
    return this.walletService.addBonus(
      teacherId,
      dto,
      admin.id,
      `${admin.firstName || ''} ${admin.lastName || ''}`.trim() || admin.email,
    );
  }

  @Post('admin/teacher/:teacherId/deduct')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Deduct from teacher wallet (Admin)' })
  deduct(
    @Param('teacherId') teacherId: string,
    @Body() dto: DeductDto,
    @CurrentUser() admin: any,
  ) {
    return this.walletService.deduct(
      teacherId,
      dto,
      admin.id,
      `${admin.firstName || ''} ${admin.lastName || ''}`.trim() || admin.email,
    );
  }

  @Post('admin/teacher/:teacherId/payout')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Record payout to teacher (Admin)' })
  recordPayout(
    @Param('teacherId') teacherId: string,
    @Body() dto: RecordPayoutDto,
    @CurrentUser() admin: any,
  ) {
    return this.walletService.recordPayout(
      teacherId,
      dto,
      admin.id,
      `${admin.firstName || ''} ${admin.lastName || ''}`.trim() || admin.email,
    );
  }
}