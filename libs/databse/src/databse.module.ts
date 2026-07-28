import { Module } from '@nestjs/common';
import { DatabseService } from './databse.service';

@Module({
  providers: [DatabseService],
  exports: [DatabseService],
})
export class DatabseModule {}
