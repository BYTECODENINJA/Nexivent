import {
  Body,
  Controller,
  Get,
  Headers,
  Param, ParseUUIDPipe,
  Post,
    Request,
  Put, UseGuards,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto, UpdateEventDto } from '@app/common';
import { AuthGuard} from "@nestjs/passport";

 @Controller('events')
export class EventsController {
    constructor(private readonly events: EventsService) {}

   @Get()
   findAll(){
      return this.events.findAll();
   }

   @UseGuards(AuthGuard('jwt'))
   @Get('my-events')
   findMyEvents(@Request() req: { user: {userId: string}}){
      return this.events.findMyEvents(req.user.userId)
   }

   //Public - get a single event
   @Get(':id')
   findOne(@Param('id', ParseUUIDPipe) id: string){
      return this.events.findOne(id)
   }

   @UseGuards(AuthGuard('jwt'))
   @Post()
   create(
       @Body() createEventDto: CreateEventDto,
       @Request() req: { user: {userId: string; role?:string}},
   ){
      return this.events.create(createEventDto, req.user.userId, req.user.role || 'USER');
   }

     @UseGuards(AuthGuard('jwt'))
     @Put(':id/publish')
     publish(
         @Param('id', ParseUUIDPipe) id: string,
         @Request() req: { user: { userId: string; role?: string}}
     ){
         return this.events.publish(
             id, req.user.userId, req.user.role || 'USER'
         )
     }

     @UseGuards(AuthGuard('jwt'))
     @Put(':id/cancel')
     cancel(
         @Param('id', ParseUUIDPipe) id: string,
         @Request() req: { user: { userId: string; role?: string}}
     ){
         return this.events.cancel(
             id, req.user.userId, req.user.role || 'USER'
         )
     }
 }