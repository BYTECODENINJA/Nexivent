import {Body, Controller, Get, Headers, Param, ParseUUIDPipe, Post, Put} from '@nestjs/common';
import { EventsService } from './events.service';
import {CreateEventDto, UpdateEventDto} from "@app/common";

@Controller()
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  create(
      @Body() createEventDto: CreateEventDto,
      @Headers('x-user-id') userId: string,
  ){
    return this.eventsService.create(createEventDto, userId);
  }
  
  @Get()
  findAll(){
    return this.eventsService.findAll();
  }

  @Get('my-events')
  findMyEvent(@Headers('x-user-id') userId: string){
    return this.eventsService.findMyEvent(userId)
  }

  @Get('id')
  findOne(@Param('id', ParseUUIDPipe) id: string){
    return this.eventsService.findOne(id);
  }

  @Put(':id')
  update(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() updateEventDto: UpdateEventDto,
      @Headers('x-user-id') userId: string,
      @Headers('x-user-role') userRole: string,
  ){
    return this.eventsService.update(id, updateEventDto, userId, userRole);
  }

  @Post(':id/publish')
  publish(
      @Param('id', ParseUUIDPipe) id: string,
      @Headers('x-user-id') userId: string,
      @Headers('x-user-role') userRole: string,
      ){
    return this.eventsService.publish(id, userId, userRole);
  }

  @Post(':id/cancel')
  cancel(
      @Param('id', ParseUUIDPipe) id: string,
      @Headers('x-user-id') userId: string,
      @Headers('x-user-role') userRole: string,
  ){
    return this.eventsService.cancel(id, userId, userRole);
  }


}
