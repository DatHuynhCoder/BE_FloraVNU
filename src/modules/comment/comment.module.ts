import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentSchema } from './schemas/comment.schema';
import {CloudinaryModule} from '../../common/services/cloudinary/cloudinary.module';
import { CloudinaryService } from '../../common/services/cloudinary/cloudinary.service';
import { FlowerModule } from '../flower/flower.module';

@Module({
  imports: [
    MongooseModule.forFeature([{name: Comment.name, schema: CommentSchema}]),
    FlowerModule,
    CloudinaryModule
  ],
  controllers: [CommentController],
  providers: [CommentService, CloudinaryService],
})
export class CommentModule {}
