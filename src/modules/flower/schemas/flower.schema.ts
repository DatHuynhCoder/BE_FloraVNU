import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { Image, ImageSchema } from "src/common/schemas/image.schema";

@Schema({timestamps: true})
export class Flower {
  @Prop({required: true, index: true})
  name: string;

  @Prop({type: ImageSchema, required: true})
  image: Image;

  @Prop({default: ""})
  basedName: string;

  @Prop({default: ""})
  description: string;

  @Prop({default: 0})
  price: number;

  @Prop({type: Number, min: 0, max: 5, default: 0})
  rating: number;

  @Prop({default: 0})
  stockQuantity: number;

  @Prop({default: 0})
  discountPercent: Number;

  @Prop({required: true})
  occasion: string;

  @Prop({type: [String], required: true})
  types: string[];

  @Prop({type: [String], required: true})
  basedTypes: string[];

  @Prop({required: true})
  form: string;

  @Prop({default: 0})
  quantitySold: 0;
}

export type FlowerDocument = HydratedDocument<Flower>;
export const FlowerSchema = SchemaFactory.createForClass(Flower);
