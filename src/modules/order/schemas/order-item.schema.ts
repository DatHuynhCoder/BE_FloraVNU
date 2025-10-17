import { Prop, Schema } from "@nestjs/mongoose";
import mongoose from 'mongoose'

@Schema()
export class OrderItem {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Flower', required: true })
  flowerId: mongoose.Types.ObjectId;

  @Prop({ required: true })
  quantity: number;
  // @Prop({ required: true })
  // price: number;
}