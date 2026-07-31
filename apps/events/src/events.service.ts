import {ForbiddenException, Inject, Injectable, NotFoundException, OnModuleInit} from '@nestjs/common';
import {KAFKA_SERVICE, KAFKA_TOPICS} from "@app/kafka";
import {ClientKafka} from "@nestjs/microservices";
import {DatabaseService, events} from "@app/database";
import {CreateEventDto, UpdateEventDto} from "@app/common";
import {eq} from "drizzle-orm";

@Injectable()
export class EventsService implements OnModuleInit{
  constructor(
      @Inject(KAFKA_SERVICE) private readonly kafkaClient: ClientKafka,
      private readonly dbService: DatabaseService,
  ) {}

  async onModuleInit() {
    try {
      //Connect to Kafka when module initialises
      await this.kafkaClient.connect();
    } catch (error) {
      console.error('Failed to connect to Kafka in EventsService:', error.message);
    }
  }

  async create(createEventDto: CreateEventDto, organizerId: string) {
    const [event] = await this.dbService.db.insert(events).values({
      ...createEventDto,
      date: new Date(createEventDto.date),
      price: createEventDto.price,
      organizerId
        }
    ).returning();

    this.kafkaClient.emit(KAFKA_TOPICS.EVENT_CREATED,{
      eventId: event.id,
      organizerId: event.organizerId,
      title: event.title,
      timestamp: new Date().toISOString(),
    })

    return event;
  }

  async findAll(){
    return this.dbService.db
        .select()
        .from(events)
        .where(eq(events.status, 'PUBLISHED'))
  }

  async findOne(id: string){
    const [event] = await this.dbService.db
        .select()
        .from(events)
        .where(eq(events.id, id))
        .limit(1)

    if (!event) {
      throw new NotFoundException('Event not found')
    }

    return event;
  }

  async update(
      id: string,
      updateEventDto: UpdateEventDto,
      userId: string,
      userRole: string,
  ){
    const event = await this.findOne(id);

    if(event.organizerId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You are not authorized to update this event')
    }

    const updatedData: Record<string, unknown> = { ...updateEventDto };
    if (updateEventDto.date) {
      updatedData.date = new Date(updateEventDto.date);
    }
    updatedData.updateAt = new Date();

    const [updated] = await this.dbService.db
        .update(events)
        .set(updatedData)
        .where(eq(events.id, id))
        .returning();

    this.kafkaClient.emit(KAFKA_TOPICS.EVENT_UPDATED, {
      eventId: updated.id,
      changes: Object.keys(updateEventDto),
      timestamp: new Date().toISOString(),
    });

    return updated;
  }

  async publish(id: string, userId: string, userRole: string) {
    const event = await this.findOne(id);

    if (event.organizerId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You are not authorized to publish this event');
    }

    const [published] = await this.dbService.db
        .update(events)
        .set({ status: 'PUBLISHED' })
        .where(eq(events.id, id))
        .returning();

    this.kafkaClient.emit(KAFKA_TOPICS.EVENT_PUBLISHED, {
      eventId: published.id,
      organizerId: published.organizerId,
      timestamp: new Date().toISOString(),
    })

    return published;
    }

    async cancel(id: string, userId: string, userRole: string){
    const event = await this.findOne(id)

      if(event.organizerId !== userId && userRole !== 'ADMIN'){
        throw new ForbiddenException('You are not authorized to cancel this event.')
      }

      const [cancelled] = await this.dbService.db
          .update(events)
          .set({ status: 'CANCELLED', updatedAt: new Date()})
          .where(eq(events.id, id))
          .returning()

      this.kafkaClient.emit(KAFKA_TOPICS.EVENT_CANCELLED, {
        eventId: cancelled.id,
        organizerId: cancelled.organizerId,
        timestamp: new Date().toISOString()
      })

      return cancelled;
    }

    async findMyEvent(organizerId: string){
    return this.dbService.db
        .select()
        .from(events)
        .where(eq(events.organizerId, organizerId))
    }
}
