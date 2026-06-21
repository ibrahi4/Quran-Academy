import { Module } from '@nestjs/common';
import { SessionReportsService } from './session-reports.service';
import { SessionReportsController } from './session-reports.controller';
import { DatabaseModule } from '../../database/database.module';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [DatabaseModule, WalletModule],
  controllers: [SessionReportsController],
  providers: [SessionReportsService],
  exports: [SessionReportsService],
})
export class SessionReportsModule {}