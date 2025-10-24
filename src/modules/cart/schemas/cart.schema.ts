import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

@Schema()
class CartItem {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Flower", required: true })
  flowerId: mongoose.Types.ObjectId
  @Prop({ required: true })
  quantity: number
  @Prop({ required: true })
  price: number
}

@Schema({ timestamps: true })
export class Cart {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true })
  accountId: mongoose.Types.ObjectId

  @Prop({ required: true })
  cartItems: CartItem[]

  @Prop({ required: true })
  totalPrice: number
}

export type CartDocument = HydratedDocument<Cart>
export const CartSchema = SchemaFactory.createForClass(Cart)
