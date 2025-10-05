import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Order } from './schemas/order.schema';
import { Model } from 'mongoose';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>
  ) { }

  // create new order
  async createOrder(createOrderDto: CreateOrderDto) {
    const createdOrder = new this.orderModel({
      ...createOrderDto,
      orderStatus: 'Pending'
    });
    await createdOrder.save();
    return {
      data: createdOrder
    }
  }

  findAll() {
    return `This action returns all order`;
  }

  async findOne(id: string) {
    const order = await this.orderModel.findById(id);
    return {
      data: order
    }
  }

  async findByAccountId(accountId: string) {
    const orders = await this.orderModel.find({ accountId: accountId });
    return {
      data: orders
    }
  }

  async updateStatus(id: string, status: string) {
    const order = await this.orderModel.findByIdAndUpdate(id, { orderStatus: status }, { new: true });
    return {
      data: order
    }
  }

  async update(id: string) {
    return `This action updates a #${id} order`;
  }

  // delete an order
  async remove(id: string) {
    await this.orderModel.findByIdAndDelete(id);
    return {
      message: 'Order deleted successfully'
    }
  }
}
