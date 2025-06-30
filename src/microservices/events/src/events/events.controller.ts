import { Controller, Get, Post, Body } from '@nestjs/common';
import { EventService } from './events.service';
import { MovieEvent, PaymentEvent, UserEvent } from './event.dto';

interface EventResponse {
  status: 'success';
  partition: number;
  offset: number;
  event: {
    id: string;
    type: string;
    timestamp: string;
    payload: any;
  };
}
@Controller('api/events')
export class EventsController {
  constructor(private readonly eventsService: EventService) {}

  @Get('health')
  getHealth() {
    return { status: true };
  }

  @Post('movie')
  async createMovieEvent(@Body() event: MovieEvent): Promise<EventResponse> {
    const result = await this.eventsService.sendEvent('movie-events', event);
    return {
      status: 'success',
      ...result,
      event: {
        id: `movie-${event.movie_id}-${event.action}`,
        type: 'movie',
        timestamp: new Date().toISOString(),
        payload: event,
      },
    };
  }

  @Post('user')
  async createUserEvent(@Body() event: UserEvent): Promise<EventResponse> {
    const result = await this.eventsService.sendEvent('user-events', event);
    return {
      status: 'success',
      ...result,
      event: {
        id: `user-${event.user_id}-${event.action}`,
        type: 'user',
        timestamp: new Date().toISOString(),
        payload: event,
      },
    };
  }

  @Post('payment')
  async createPaymentEvent(
    @Body() event: PaymentEvent,
  ): Promise<EventResponse> {
    const result = await this.eventsService.sendEvent('payment-events', event);
    return {
      status: 'success',
      ...result,
      event: {
        id: `payment-${event.payment_id}-${event.status}`,
        type: 'payment',
        timestamp: new Date().toISOString(),
        payload: event,
      },
    };
  }
}
