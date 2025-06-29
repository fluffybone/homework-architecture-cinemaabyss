import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { Consumer, ConsumerSubscribeTopics, Kafka } from 'kafkajs';

@Injectable()
export class KafkaConsumer implements OnApplicationShutdown {
  private readonly logger = new Logger(KafkaConsumer.name);
  kafka = new Kafka({
    brokers: ['kafka:9092'],
  });

  private readonly consumers: Consumer[] = [];

  async consume(topic: ConsumerSubscribeTopics) {
    const consumer = this.kafka.consumer({ groupId: 'events-group' });
    await consumer.connect();
    await consumer.subscribe(topic);
    await consumer.run({
      // eslint-disable-next-line @typescript-eslint/require-await
      eachMessage: async ({ topic, partition, message }) => {
        this.logger.log(
          `[Kafka] Получено сообщение из ${topic} (partition ${partition}): ${message && message.value && message.value.toString()}`,
        );
      },
    });
    this.consumers.push(consumer);
  }

  async onApplicationShutdown() {
    for (const consumer of this.consumers) {
      await consumer.disconnect();
    }
  }
}
