import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { OrderItem } from './order-item.schema'

// class OrderItem {
//   @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Flower', required: true })
//   flowerId: mongoose.Types.ObjectId;

//   @Prop({ required: true })
//   quantity: number;
//   // @Prop({ required: true })
//   // price: number;
// }

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true })
  accountId: mongoose.Types.ObjectId;

  @Prop({ type: [OrderItem], required: true })
  orderItems: OrderItem[];

  @Prop({ required: true })
  totalPrice: number;

  @Prop()
  senderName: string;

  @Prop({ required: true })
  senderEmail: string;

  @Prop({ required: true })
  senderPhone: string;

  @Prop({ required: true })
  recipientName: string;

  @Prop()
  recipientPhone: string;

  @Prop({ required: true })
  recipientAddress: string;

  @Prop({ required: true })
  deliveryDate: Date;

  @Prop({ required: true })
  deliveryTime: string;

  @Prop()
  message: string;

  @Prop()
  note: string;

  // may be removed because createdAt will be used instead
  // @Prop({ required: true })
  // orderDate: Date;

  @Prop({ required: true, enum: ["Pending", "Processing", "Delivered", "Cancelled"], default: "Pending" })
  orderStatus: string;
}

export type OrderDocument = HydratedDocument<Order>;
export const OrderSchema = SchemaFactory.createForClass(Order);