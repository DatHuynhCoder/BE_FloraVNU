import { Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Comment } from './schemas/comment.schema';
import { CloudinaryService } from '../../common/services/cloudinary/cloudinary.service';
import { Model } from 'mongoose';
import { FlowerService } from '../flower/flower.service';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private CommentModel: Model<Comment>,
    private readonly cloudinary: CloudinaryService,
    private readonly flowerService: FlowerService
  ) { }

  //Create new comment service
  async create(userId: string, images: Array<Express.Multer.File>, createCommentDto: CreateCommentDto) {
    //Upload comment images to Cloudinary
    let uploadedImages: Array<{ url: string; public_id: string }> = [];

    if (images && images.length > 0) {
      const uploadPromises = images.map(async (image) => {
        const result = await this.cloudinary.uploadImage(image, "FloraVNU/Comments");
        return {
          url: result.secure_url,
          public_id: result.public_id,
        };
      });

      // Wait for all images to be uploaded
      uploadedImages = await Promise.all(uploadPromises);
    }

    //Change flower rating in Flower collection based on new comment rating
    await this.flowerService.addRating(createCommentDto.flowerId, createCommentDto.rating);

    //Create new comment
    const newComment = new this.CommentModel({
      ...createCommentDto,
      accountId: userId,
      images: uploadedImages
    })
    await newComment.save();

    return {
      data: newComment
    }
  }

  async findAllByFlower(flowerId) {
    //find all comments of a flower
    const comments = await this.CommentModel.find({ flowerId }).populate('accountId', 'username avatar');

    return {
      data: comments
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} comment`;
  }

  update(id: number, updateCommentDto: UpdateCommentDto) {
    return `This action updates a #${id} comment`;
  }

  remove(id: number) {
    return `This action removes a #${id} comment`;
  }
}
