import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { Image, ImageSchema } from "../../../common/schemas/image.schema";

@Schema({ timestamps: true })
export class Comment {
  @Prop({ default: "" })
  content: string

  @Prop({ default: 0 })
  likes: number

  @Prop({ default: 0 })
  rating: number

  @Prop({ type: [ImageSchema], default: [] })
  images: Image[]

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Flower', required: true })
  flowerId: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true })
  accountId: mongoose.Types.ObjectId;
}
export type CommentDocument = HydratedDocument<Comment>;
export const CommentSchema = SchemaFactory.createForClass(Comment);
