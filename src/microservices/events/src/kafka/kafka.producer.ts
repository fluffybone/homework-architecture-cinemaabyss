import {
  Injectable,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';
interface KafkaResponse {
  partition: number;
  baseOffset: string;
}
@Injectable()
export class KafkaProducer implements OnModuleInit, OnApplicationShutdown {
  private readonly kafka = new Kafka({
    brokers: process.env.KAFKA_BROKERS!.split(',').map((b) => b.trim()),
  });

  private producer: Producer = this.kafka.producer();

  async onModuleInit() {
    await this.producer.connect();
  }

  async sendMessage(topic: string, message: string): Promise<KafkaResponse[]> {
    const result = await this.producer.send({
      topic,
      messages: [{ value: message }],
    });

    return result.map((res) => ({
      partition: res.partition,
      baseOffset: res.baseOffset ?? '0',
    }));
  }

  async onApplicationShutdown() {
    await this.producer.disconnect();
  }
}
