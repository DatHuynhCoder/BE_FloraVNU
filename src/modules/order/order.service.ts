import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { FilterOrderDto } from './dto/filter-order.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Order } from './schemas/order.schema';
import mongoose, { Model } from 'mongoose';
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

  async findAll(query: FilterOrderDto) {
    const { page = 1, limit = 10, search, status, startDate, endDate, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (status) {
      filter.orderStatus = status;
    }

    if (search) {
      filter.$or = [
        { recipientName: { $regex: search, $options: 'i' } },
        { recipientPhone: { $regex: search, $options: 'i' } },
        mongoose.isValidObjectId(search) ? { _id: search } : null
      ].filter(Boolean);
    }

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const [orders, total] = await Promise.all([
      this.orderModel.find(filter)
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .populate('accountId', 'name email avatar')
        .exec(),
      this.orderModel.countDocuments(filter)
    ]);

    return {
      status: "success",
      message: "orders retrieved successfully",
      data: orders,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findOne(id: string) {
    const order = await this.orderModel.findById(id)
      .populate('accountId', 'name email phone avatar')
      .populate({
        path: 'orderItems.flowerId',
        select: 'name price image'
      });

    if (!order) {
      throw new NotFoundException({
        message: "Order not found",
        statusCode: 404
      });
    }

    return {
      status: "success",
      message: "order retrieved successfully",
      data: order
    }
  }

  async getStats() {
    const today = new Date();
    const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [totalRevenue, totalOrders, ordersByStatus, dailyRevenue] = await Promise.all([
      this.orderModel.aggregate([
        { $match: { orderStatus: 'Delivered', paymentStatus: true } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ]),
      this.orderModel.countDocuments(),
      this.orderModel.aggregate([
        { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
      ]),
      this.orderModel.aggregate([
        {
          $match: {
            createdAt: { $gte: last7Days },
            orderStatus: { $ne: 'Cancelled' }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenue: { $sum: '$totalPrice' },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    return {
      status: "success",
      message: "stats retrieved successfully",
      data: {
        totalRevenue: totalRevenue[0]?.total || 0,
        totalOrders,
        ordersByStatus: ordersByStatus.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {}),
        dailyRevenue
      }
    };
  }

  async findByAccountId(accountId: string) {
    const orders = await this.orderModel
      .find({ accountId: accountId })
      .populate({
        path: 'orderItems.flowerId',
        select: 'name description price discountPercent image.url stockQuantity rating'
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
