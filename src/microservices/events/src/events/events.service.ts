import { Injectable } from '@nestjs/common';
import { KafkaProducer } from '../kafka/kafka.producer';

@Injectable()
export class EventService {
  constructor(private readonly kafkaProducer: KafkaProducer) {}

  async sendEvent(
    topic: string,
    payload: unknown,
  ): Promise<{ partition: number; offset: number }> {
    const message = JSON.stringify({
      topic,
      payload,
      timestamp: new Date().toISOString(),
    });

    const responses = await this.kafkaProducer.sendMessage(topic, message);
    const [response] = responses;

    if (!response) {
      throw new Error('Kafka response was empty');
    }

    return {
      partition: response.partition,
      offset: parseInt(response.baseOffset, 10),
    };
  }
}
