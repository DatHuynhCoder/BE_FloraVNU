import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

@Schema({ _id: false })
class CartItem {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Flower", required: true })
  flowerId: mongoose.Types.ObjectId
  @Prop({ required: true })
  quantity: number
  // @Prop({ required: true })
  // price: number
}

export const CartItemSchema = SchemaFactory.createForClass(CartItem);

@Schema({ timestamps: true })
export class Cart {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true })
  accountId: mongoose.Types.ObjectId

  @Prop({ type: [CartItemSchema], required: true })
  cartItems: CartItem[]

  // @Prop({ required: true })
  // totalPrice: number
}

export type CartDocument = HydratedDocument<Cart>
export const CartSchema = SchemaFactory.createForClass(Cart)
