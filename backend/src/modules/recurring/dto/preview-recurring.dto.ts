import { PartialType } from '@nestjs/swagger';
import { CreateRecurringDto } from './create-recurring.dto';

export class PreviewRecurringDto extends PartialType(CreateRecurringDto) {}