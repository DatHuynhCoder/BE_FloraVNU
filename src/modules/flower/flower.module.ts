import { Module } from '@nestjs/common';
import { FlowerService } from './flower.service';
import { FlowerController } from './flower.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Flower, FlowerSchema } from './schemas/flower.schema';
import { CloudinaryService } from 'src/common/services/cloudinary/cloudinary.service';
import { CloudinaryModule } from 'src/common/services/cloudinary/cloudinary.module';

@Module({
  imports:[
    MongooseModule.forFeature([{name: Flower.name, schema: FlowerSchema}]),
    CloudinaryModule
  ],
  controllers: [FlowerController],
  providers: [FlowerService,CloudinaryService],
})
export class FlowerModule {}
