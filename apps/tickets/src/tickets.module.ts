import { Module } from '@nestjs/common';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import {DatabaseModule} from "@app/database";
import {KafkaModule} from "@app/kafka";

@Module({
      imports: [KafkaModule.register('tickets-service-group'), DatabaseModule],
  controllers: [TicketsController],
  providers: [TicketsService],
})
export class TicketsModule {}
