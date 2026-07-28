import { DynamicModule, Module } from '@nestjs/common';
import { ClientsModule, Transport } from "@nestjs/microservices"; // Removed unused 'Client' import
import { KAFKA_BROKER, KAFKA_CLIENT_ID, KAFKA_CONSUMER_GROUP } from "@app/kafka/constants/kafka.constants";

export const KAFKA_SERVICE = 'KAFKA_SERVICE';

@Module({})
export class KafkaModule {
  static register(consumerGroup?: string): DynamicModule {
    return {
      module: KafkaModule,
      imports: [
        ClientsModule.register([
          {
            name: KAFKA_SERVICE,
            transport: Transport.KAFKA,
            options: {
              client: {
                clientId: KAFKA_CLIENT_ID,
                brokers: [KAFKA_BROKER],
              },
              consumer: {
                groupId: consumerGroup ?? KAFKA_CONSUMER_GROUP,
              }
            }
          }
        ])
      ],
      exports: [ClientsModule] // ✨ Fixed: Exporting ClientsModule instead of Client
    }
  }
}