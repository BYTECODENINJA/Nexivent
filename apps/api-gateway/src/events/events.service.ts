import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SERVICES_PORTS, CreateEventDto, UpdateEventDto } from '@app/common';

@Injectable()
export class EventsService {
  private readonly eventsUrl = `http://localhost:${SERVICES_PORTS.EVENTS_SERVICE}`;

  constructor(private readonly httpService: HttpService) {}

  async create(data: object, userId: string, userRole: string) {
    try {
      const response = await firstValueFrom(
          this.httpService.post(this.eventsUrl, data, {
            headers: { 'x-user-id': userId, 'x-user-role': userRole },
          }),
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async findAll() {
    try {
      const response = await firstValueFrom(this.httpService.get(this.eventsUrl));
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async findMyEvents(userId: string) {
    try {
      const response = await firstValueFrom(
          this.httpService.get(`${this.eventsUrl}/my-events`, {
            headers: { 'x-user-id': userId },
          }),
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async findOne(id: string) {
    try {
      const response = await firstValueFrom(
          this.httpService.get(`${this.eventsUrl}/${id}`),
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async update(
      id: string,
      updateEventDto: UpdateEventDto,
      userId: string,
      userRole: string,
  ) {
    try {
      const response = await firstValueFrom(
          this.httpService.put(`${this.eventsUrl}/${id}`, updateEventDto, {
            headers: {
              'x-user-id': userId,
              'x-user-role': userRole,
            },
          }),
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async publish(id: string, userId: string, userRole: string) {
    try {
      const response = await firstValueFrom(
          this.httpService.post(
              `${this.eventsUrl}/${id}/publish`,
              {},
              {
                headers: {
                  'x-user-id': userId,
                  'x-user-role': userRole,
                },
              },
          ),
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async cancel(id: string, userId: string, userRole: string) {
    try {
      const response = await firstValueFrom(
          this.httpService.post(
              `${this.eventsUrl}/${id}/cancel`,
              {},
              {
                headers: {
                  'x-user-id': userId,
                  'x-user-role': userRole,
                },
              },
          ),
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: unknown): never {
    const err = error as {
      response?: {data: string | object; status: number }
    }
    if (err.response) {
      throw new HttpException(err.response.data, err.response.status);
    }
    throw new HttpException('Something went wrong', 503);
  }
}
