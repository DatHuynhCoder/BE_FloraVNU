/**
 * @author: Le Nguyen Quynh Anh
 * @email: ...
 * @date: 2025-10-05
 * @description: Order controller to handle order-related requests
 */
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/passport/jwt-auth.guard';
import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards, UseInterceptors, UploadedFile, ParseIntPipe } from '@nestjs/common';
import { Roles } from 'src/decorators/roles.decorator';
import { RolesGuard } from 'src/guards/roles.guard';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  // create a new order
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'customer')
  createOrder(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    const uid = req.user._id
    return this.orderService.createOrder(uid, createOrderDto);
  }

  // get all orders
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findAll() {
    return this.orderService.findAll();
  }

  // get orders by account id

  @Get('account')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'customer')
  findByAccountId(@Request() req) {
    return this.orderService.findByAccountId(req.user._id);
  }

  // update order status
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  updateStatus(@Param('id') id: string, @Body() updateOrderStatusDto: UpdateOrderStatusDto) {
    return this.orderService.updateStatus(id, updateOrderStatusDto.status);
  }

  // update an order
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(id, updateOrderDto);
  }

  // delete an order
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(id);
  }
}
