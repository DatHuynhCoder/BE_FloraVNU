import { Module } from '@nestjs/common';
import { FlowerService } from './flower.service';
import { FlowerController } from './flower.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Flower, FlowerSchema } from './schemas/flower.schema';
import { CloudinaryService } from '../../common/services/cloudinary/cloudinary.service';
import { CloudinaryModule } from '../../common/services/cloudinary/cloudinary.module';
import { QdrantModule } from '../../common/services/qdrant/qdrant.module';

@Module({
  imports:[
    MongooseModule.forFeature([{name: Flower.name, schema: FlowerSchema}]),
    CloudinaryModule,
    QdrantModule
  ],
  controllers: [FlowerController],
  providers: [FlowerService,CloudinaryService],
  exports: [FlowerService]
})
export class FlowerModule {}
