import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { EventService } from './events.service';

describe('EventsController', () => {
  let controller: EventService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventService],
      providers: [EventService],
    }).compile();

    controller = module.get<EventService>(EventsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
