import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CheckInTicketDto, PurchaseTicketDto } from '@app/common';

@Controller()
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post('purchase')
  purchase(
      @Body() purchaseDto: PurchaseTicketDto,
      @Headers('x-user-id') userId: string,
  ) {
    return this.ticketsService.purchase(purchaseDto, userId);
  }

  @Get('my-tickets')
  findMyTickets(@Headers('x-user-id') userId: string) {
    return this.ticketsService.findMyTicket(userId);
  }

  @Get(':id')
  findOne(
      @Param('id', ParseUUIDPipe) id: string,
      @Headers('x-user-id') userId: string,
  ) {
    return this.ticketsService.findOne(id, userId);
  }

  @Post(':id/cancel')
  cancel(
      @Param('id', ParseUUIDPipe) id: string,
      @Headers('x-user-id') userId: string,
  ) {
    return this.ticketsService.cancel(id, userId);
  }

  @Post('check-in')
  checkIn(
      @Body() checkInDto: CheckInTicketDto,
      @Headers('x-user-id') organizerId: string,
  ) {
    return this.ticketsService.checkIn(
        checkInDto.ticketCode,
        organizerId,
    );
  }

  @Get('event/:eventId')
  findEventTickets(
      @Param('eventId', ParseUUIDPipe) eventId: string,
      @Headers('x-user-id') organizerId: string,
  ) {
    return this.ticketsService.findEventTicket(eventId, organizerId);
  }
}