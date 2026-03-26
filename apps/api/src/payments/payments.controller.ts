import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AuthUser } from 'src/domain/models';
import { InitializePaymentDto } from './dto/initialize-payment.dto';
import { PaymentsService } from './payments.service';

@ApiTags('payments')
@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('payments/initialize')
  @Roles('citizen')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initialize a generic Interswitch Web Checkout payment' })
  async initialize(@Body() dto: InitializePaymentDto, @CurrentUser() user: AuthUser) {
    return this.paymentsService.initialize(dto, user);
  }

  @Post('payments/levies/:levyId/initialize')
  @Roles('citizen')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initialize a levy payment via Interswitch Web Checkout' })
  async initializeLevyPayment(
    @Param('levyId') levyId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.paymentsService.initializeLevyPayment(levyId, user);
  }

  @Get('payments/me')
  @Roles('citizen')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List the authenticated citizen payment history' })
  async getMine(@CurrentUser() user: AuthUser) {
    return this.paymentsService.getMyPayments(user.sub);
  }

  @Get('payments/:reference/status')
  @Roles('citizen', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the authoritative status of a payment reference' })
  async getStatus(@Param('reference') reference: string, @CurrentUser() user: AuthUser) {
    return this.paymentsService.getStatus(reference, user);
  }

  @Get('payments/:reference/receipt')
  @Roles('citizen', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get receipt details for a payment reference' })
  async getReceipt(@Param('reference') reference: string, @CurrentUser() user: AuthUser) {
    return this.paymentsService.getReceipt(reference, user);
  }

  @Public()
  @Post('payments/webhook')
  @HttpCode(200)
  @ApiOperation({ summary: 'Process an idempotent Interswitch payment webhook callback' })
  async webhook(
    @Body() payload: Record<string, unknown>,
    @Req() req: Request & { rawBody?: Buffer },
    @Headers('x-interswitch-signature') signature?: string,
  ) {
    const rawBody =
      req.rawBody?.toString('utf8') ??
      (typeof payload === 'string' ? payload : JSON.stringify(payload));

    return this.paymentsService.processWebhook(payload, rawBody, signature);
  }

  @Get('admin/payments')
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all payments for admin operations' })
  async listAll() {
    return this.paymentsService.listAll();
  }
}
