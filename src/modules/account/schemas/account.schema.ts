import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { Image, ImageSchema } from "../../../common/schemas/image.schema";

@Schema({timestamps: true})
export class Account {
  @Prop({required: true})
  username: string;

  @Prop({required: true})
  fullName: string;

  @Prop({required: true, unique: true})
  email: string;

  @Prop({enum: ['Nam', 'Nữ', 'Khác'], default: 'Nam'})
  gender: string;

  @Prop({required: true})
  birthday: Date;

  @Prop({required: true})
  phone: string;

  @Prop({required: true})
  password: string;

  @Prop({enum: ['admin','customer','seller'], default: 'customer'})
  role: string;

  @Prop({type: ImageSchema})
  avatar?: Image;

   @Prop()
  resetPasswordOTP?: string;

  @Prop()
  resetPasswordExpires?: Date;

  @Prop({ default: 0 })
  resetPasswordAttempts?: number;
}

export type AccountDocument = HydratedDocument<Account>;
export const AccountSchema = SchemaFactory.createForClass(Account);
