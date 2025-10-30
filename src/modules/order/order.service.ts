import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Order } from './schemas/order.schema';
import { Model } from 'mongoose';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>
  ) { }

  // create new order
  async createOrder(uid: string, createOrderDto: CreateOrderDto) {
    const orderItems = createOrderDto?.orderItems;
    let totalPrice = orderItems.reduce((acc, item) => acc + item.quantity * item.price * (100 - item.discountPercent) / 100, 0);
    console.log("totalPrice: ", totalPrice)
    const createdOrder = new this.orderModel({
      ...createOrderDto,
      accountId: uid,
      totalPrice,
      orderStatus: 'Pending',
      // paymentMethod: 'Bank'
    });
    await createdOrder.save();
    return {
      status: "success",
      message: "order created successfully",
      data: createdOrder
    }
  }

  findAll() {
    return `This action returns all order`;
  }

  async findOne(id: string) {
    const order = await this.orderModel.findById(id);
    return {
      status: "success",
      message: "...",
      data: order
    }
  }

  async findByAccountId(accountId: string) {
    const orders = await this.orderModel
      .find({ accountId: accountId })
      .populate({
        path: 'orderItems.flowerId',
        select: 'name description price discountPercent image.url stockQuantity'
      }); // populate nếu muốn hiển thị thông tin hoa;
    return {
      status: "success",
      message: `all orders of user with id: ${accountId}`,
      data: orders
    }
  }

  async updateOrderStatus(id: string, status: string) {
    const order = await this.orderModel.findOne({ _id: id })
    if (!order) throw new NotFoundException({
      message: "Not found any order with that id or you are not authorized to update this order",
      statusCode: 404
    })
    const updatedOrder = await this.orderModel.findByIdAndUpdate(id, { orderStatus: status }, { new: true });
    return {
      status: "success",
      message: "status updated successfully",
      data: updatedOrder
    }
  }

  async updateOrderPaymentStatus(id: string, paymentStatus: boolean) {
    const order = await this.orderModel.findOne({ _id: id })
    if (!order) throw new NotFoundException({
      message: "Not found any order with that id or you are not authorized to update payment status of this order",
      statusCode: 404
    })
    const updatedOrder = await this.orderModel.findByIdAndUpdate(id, { paymentStatus: paymentStatus }, { new: true });
    return {
      status: "success",
      message: "payment status updated successfully",
      data: updatedOrder
    }
  }

  async cancelOrder(id: string, uid: string) {
    const order = await this.orderModel.findOne({ _id: id, accountId: uid })
    if (!order) throw new NotFoundException({
      message: "Not found any order with that id or you are not authorized to cancel this order",
      statusCode: 404
    })
    const updatedOrder = await this.orderModel.findByIdAndUpdate(id, { orderStatus: 'Cancelled' }, { new: true });
    return {
      status: "success",
      message: "order cancelled successfully",
      data: updatedOrder
    }
  }

  async updatePaymentMethod(id: string, uid: string, paymentMethod: string) {
    const order = await this.orderModel.findOne({ _id: id, accountId: uid })
    if (!order) throw new NotFoundException({ message: "Order not found or you are not authorized to change the payment method of this order", statusCode: 404 })
    const updatedOrder = await this.orderModel.findByIdAndUpdate(id, { paymentMethod: paymentMethod }, { new: true });
    return {
      status: "success",
      message: "payment method updated successfully",
      data: updatedOrder
    }
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const orderFinding = await this.orderModel.findById(id) // return null if not found 
    if (!orderFinding) throw new NotFoundException()
    const order = await this.orderModel.findByIdAndUpdate(id, {
      ...updateOrderDto
    })
    return {
      status: "success",
      message: "order updated successfully",
      data: order
    };
  }

  // delete an order
  async remove(id: string) {
    await this.orderModel.findByIdAndDelete(id);
    return {
      status: "success",
      message: 'Order deleted successfully',
      data: null
    }
  }
}
