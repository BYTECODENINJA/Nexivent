import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SERVICES_PORTS } from '@app/common';
import {TicketsModule} from "./tickets.module";

async function bootstrap() {
  const app = await NestFactory.create(TicketsModule);

  //Enable validation
  app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
  );

  await app.listen(SERVICES_PORTS.TICKETS_SERVICE);
  console.log(
      `Tickets Service is running on port ${SERVICES_PORTS.TICKETS_SERVICE}`,
  );
}
bootstrap();