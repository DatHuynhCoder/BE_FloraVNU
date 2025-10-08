import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({_id: false})
export class Image {
  @Prop()
  url: string;

  @Prop()
  public_id: string;
}

export const ImageSchema = SchemaFactory.createForClass(Image);