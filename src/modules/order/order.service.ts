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
    const createdOrder = new this.orderModel({
      ...createOrderDto,
      accountId: uid,
      orderStatus: 'Pending'
    });
    await createdOrder.save();
    return {
      status: "success",
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
      data: order
    }
  }

  async findByAccountId(accountId: string) {
    const orders = await this.orderModel.find({ accountId: accountId });
    return {
      status: "success",
      data: orders
    }
  }

  async updateStatus(id: string, status: string) {
    const order = await this.orderModel.findById(id)
    if (!order) throw new NotFoundException()
    const updatedOrder = await this.orderModel.findByIdAndUpdate(id, { orderStatus: status }, { new: true });
    return {
      status: "success",
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
      message: `This action updates a #${id} order`
    };
  }

  // delete an order
  async remove(id: string) {
    await this.orderModel.findByIdAndDelete(id);
    return {
      status: "success",
      message: 'Order deleted successfully'
    }
  }
}
