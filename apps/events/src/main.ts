import { NestFactory } from '@nestjs/core';
import { EventsModule } from './events.module';
import {ValidationPipe} from "@nestjs/common";
import {SERVICES_PORTS} from "@app/common";

async function bootstrap() {
  const app = await NestFactory.create(EventsModule);

  //Enable Validation
  app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      })
  )
  await app.listen(SERVICES_PORTS.EVENTS_SERVICE);
  console.log(`Events service is running on port ${SERVICES_PORTS.EVENTS_SERVICE}`)
}
bootstrap();
