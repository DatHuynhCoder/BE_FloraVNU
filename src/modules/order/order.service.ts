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
}
