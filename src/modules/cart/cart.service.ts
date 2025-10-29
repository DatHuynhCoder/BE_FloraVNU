import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Cart } from './schemas/cart.schema';
import mongoose, { Model } from 'mongoose';
import { AddToCartDto } from './dto/add-to-cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<Cart>
  ) { }

  // 🛒 Tạo mới giỏ hàng cho user
  async createCart(createCartDto: CreateCartDto) {
    const createdCart = new this.cartModel({
      ...createCartDto,
    });
    await createdCart.save();
    return {
      status: 'success',
      data: createdCart,
    };
  }

  // ➕ Thêm sản phẩm vào giỏ (tự tạo giỏ nếu chưa có)
  async addToCart(uid: string, addToCartDto: AddToCartDto) {
    let userCart = await this.cartModel.findOne({ accountId: uid });

    // Nếu chưa có giỏ → tạo mới
    if (!userCart) {
      const newCart = await this.createCart({
        accountId: new mongoose.Types.ObjectId(uid),
        cartItems: [
          {
            flowerId: new mongoose.Types.ObjectId(addToCartDto.flowerId),
            quantity: addToCartDto.quantity,
            // price: addToCartDto.flowerPrice,
          },
        ]
      });
      return newCart;
    }

    // Nếu giỏ đã tồn tại
    const existingItem = userCart.cartItems.find(
      (item) => item.flowerId.toString() === addToCartDto.flowerId
    );

    if (existingItem) {
      // Sản phẩm đã có → tăng quantity lên
      existingItem.quantity += addToCartDto.quantity;
    } else {
      // Sản phẩm chưa có → thêm mới
      userCart.cartItems.push({
        flowerId: new mongoose.Types.ObjectId(addToCartDto.flowerId),
        quantity: addToCartDto.quantity,
        // price: addToCartDto.flowerPrice,
      });
    }

    userCart.markModified('cartItems');

    // Cập nhật totalPrice
    // userCart.totalPrice = userCart.cartItems.reduce(
    //   (acc, item) => acc + Number(item.price) * Number(item.quantity),
    //   0,
    // );

    const updatedCart = await userCart.save();
    return {
      status: 'success',
      data: updatedCart,
    };
  }

  // 🔍 Lấy giỏ hàng theo user ID
  async findOne(uid: string) {
    const cart = await this.cartModel
      .findOne({ accountId: uid })
      .populate({
        path: 'cartItems.flowerId',
        select: 'name description price image.url stockQuantity'
      }); // populate nếu muốn hiển thị thông tin hoa
    if (!cart) throw new NotFoundException('Cart not found');
    return cart;
  }

  // 🔄 Cập nhật số lượng của một item trong giỏ
  async updateQuantity(uid: string, flowerId: string, quantity: number) {
    const cart = await this.cartModel.findOne({ accountId: uid });
    if (!cart) throw new NotFoundException('Cart not found');

    const item = cart.cartItems.find(
      (i) => i.flowerId.toString() === flowerId
    );
    if (!item) throw new NotFoundException('Item not found in cart');

    item.quantity = quantity;

    // Nếu quantity = 0 thì xóa luôn sản phẩm khỏi giỏ
    if (item.quantity <= 0) {
      cart.cartItems = cart.cartItems.filter(
        (i) => i.flowerId.toString() !== flowerId
      );
    }

    // cart.totalPrice = cart.cartItems.reduce(
    //   (acc, i) => acc + i.price * i.quantity,
    //   0
    // );

    const updatedCart = await cart.save();
    return {
      status: 'success',
      data: updatedCart,
    };
  }

  // ❌ Xóa một sản phẩm khỏi giỏ
  async removeItem(uid: string, flowerId: string) {
    const cart = await this.cartModel.findOne({ accountId: uid });
    if (!cart) throw new NotFoundException('Cart not found');

    cart.cartItems = cart.cartItems.filter(
      (item) => item.flowerId.toString() !== flowerId
    );

    cart.markModified('cartItems');

    // cart.totalPrice = cart.cartItems.reduce(
    //   (acc, i) => acc + i.price * i.quantity,
    //   0
    // );

    const updatedCart = await cart.save();
    return {
      status: 'success',
      data: updatedCart,
    };
  }

  // 🧹 Xóa toàn bộ giỏ hàng
  async clearCart(uid: string) {
    const cart = await this.cartModel.findOne({ accountId: uid });
    if (!cart) throw new NotFoundException('Cart not found');

    cart.cartItems = [];

    cart.markModified('cartItems');

    // cart.totalPrice = 0;

    await cart.save();

    return {
      status: 'success',
      message: 'Cart cleared successfully',
    };
  }

  async increaseQuantity(uid: string, flowerId: string) {
    const cart = await this.cartModel.findOne({ accountId: uid });
    console.log("before: ", cart);

    if (!cart) throw new Error('Cart not found');

    const item = cart.cartItems.find(i => i.flowerId.toString() === flowerId);

    if (!item) throw new Error('Item not found in cart');

    item.quantity += 1;

    cart.markModified('cartItems');

    // cart.totalPrice = cart.cartItems.reduce(
    //   (acc, i) => acc + i.price * i.quantity, 0
    // );

    console.log("after: ", cart);

    await cart.save();
    return { status: 'success', data: cart };
  }

  async decreaseQuantity(uid: string, flowerId: string) {
    const cart = await this.cartModel.findOne({ accountId: uid });
    if (!cart) throw new Error('Cart not found');

    const item = cart.cartItems.find(i => i.flowerId.toString() === flowerId);
    if (!item) throw new Error('Item not found in cart');

    if (item.quantity > 1) {
      item.quantity -= 1;
    } else {
      // Nếu chỉ còn 1 thì xóa khỏi giỏ
      cart.cartItems = cart.cartItems.filter(
        i => i.flowerId.toString() !== flowerId
      );
    }

    cart.markModified('cartItems');

    // cart.totalPrice = cart.cartItems.reduce(
    //   (acc, i) => acc + i.price * i.quantity, 0
    // );

    await cart.save();
    return { status: 'success', data: cart };
  }
}
