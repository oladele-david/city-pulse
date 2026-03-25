import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AuthUser } from 'src/domain/models';
import { InitializePaymentDto } from './dto/initialize-payment.dto';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
import { PaymentsService } from './payments.service';

@ApiTags('payments')
@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('payments/initialize')
  @Roles('citizen')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initialize an Interswitch Web Checkout payment' })
  initialize(
    @Body() dto: InitializePaymentDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.paymentsService.initialize(dto, user);
  }

  @Get('payments/me')
  @Roles('citizen')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List the authenticated citizen payment history' })
  getMine(@CurrentUser() user: AuthUser) {
    return this.paymentsService.getMyPayments(user.sub);
  }

  @Get('payments/:reference/status')
  @Roles('citizen', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the current status of a payment reference' })
  getStatus(
    @Param('reference') reference: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.paymentsService.getStatus(reference, user);
  }

  @Public()
  @Post('payments/webhook')
  @HttpCode(200)
  @ApiOperation({ summary: 'Process an idempotent payment webhook callback' })
  webhook(@Body() dto: PaymentWebhookDto) {
    return this.paymentsService.processWebhook(dto);
  }

  @Get('admin/payments')
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all payments for admin operations' })
  listAll() {
    return this.paymentsService.listAll();
  }
}
