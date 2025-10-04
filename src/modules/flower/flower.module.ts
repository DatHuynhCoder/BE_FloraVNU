import { Module } from '@nestjs/common';
import { FlowerService } from './flower.service';
import { FlowerController } from './flower.controller';

@Module({
  controllers: [FlowerController],
  providers: [FlowerService],
})
export class FlowerModule {}
