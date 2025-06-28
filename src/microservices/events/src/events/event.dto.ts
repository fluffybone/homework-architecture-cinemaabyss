export interface MovieEvent {
  movie_id: number;
  title: string;
  action: string;
  user_id?: number;
  rating?: number;
  genres?: string[];
  description?: string;
}

export interface UserEvent {
  user_id: number;
  username?: string;
  email?: string;
  action: string;
  timestamp: string;
}

export interface PaymentEvent {
  payment_id: number;
  user_id: number;
  amount: number;
  status: string;
  timestamp?: string;
  method_type?: string;
}

export type EventType = 'User' | 'Payment' | 'Movie';

export class CreateEventDto {
  readonly type: EventType;
  readonly payload: unknown;
}
