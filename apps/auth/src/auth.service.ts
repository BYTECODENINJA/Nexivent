import {Inject, Injectable, OnModuleInit} from '@nestjs/common';
import {KAFKA_SERVICE, KAFKA_TOPICS, KafkaService} from "@app/kafka";
import {ClientKafka} from "@nestjs/microservices";

@Injectable()
export class AuthService implements OnModuleInit{
 constructor(
     @Inject(KAFKA_SERVICE) private readonly kafkaClient: ClientKafka,
 ){}

  async onModuleInit(){
   await this.kafkaClient.connect();
  }

  getHello(): string {
   return "Definately working"
  }

  simulateUserRegistration(email: string){
   this.kafkaClient.emit(KAFKA_TOPICS.USER_REGISTERED, {
     email,
     timestamp: new Date().toISOString(),
    })

    return {
  message: "User registered successfully",
    };
  }
}
