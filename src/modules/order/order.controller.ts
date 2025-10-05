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
  @UseGuards(JwtAuthGuard)
  createOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.createOrder(createOrderDto);
  }

  // get all orders
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findAll() {
    return this.orderService.findAll();
  }

  // get orders by account id
  @UseGuards(JwtAuthGuard)
  @Get('account/:accountId')
  findByAccountId(@Param('accountId') accountId: string) {
    return this.orderService.findByAccountId(accountId);
  }

  // update order status
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.orderService.updateStatus(id, status);
  }
  // update an order
  @Patch(':id')
  update(@Param('id') id: string) {
    return this.orderService.update(id);
  }
  // delete an order
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(id);
  }
}
