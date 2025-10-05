/**
 * @author: Le Nguyen Quynh Anh
 * @email: ...
 * @date: 2025-10-05
 * @description: Order controller to handle order-related requests
 */
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/passport/jwt-auth.guard';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, ParseIntPipe } from '@nestjs/common';
import { Roles } from 'src/decorators/roles.decorator';
import { RolesGuard } from 'src/guards/roles.guard';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  // create a new order
  @Post()
  createOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.createOrder(createOrderDto);
  }

  @Get()
  findAll() {
    return this.orderService.findAll();
  }

  // get all orders
  // get order by id
  // update order status
  // delete an order
}
