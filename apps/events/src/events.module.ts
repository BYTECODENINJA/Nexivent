import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import {KafkaModule} from "@app/kafka";
import {DatabaseModule} from "@app/database";

@Module({
  imports: [KafkaModule.register('events-service-group'), DatabaseModule],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
