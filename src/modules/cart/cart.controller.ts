import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { JwtAuthGuard } from '../auth/passport/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "customer")
  addToCart(@Request() req, @Body() addToCartDto: AddToCartDto) {
    return this.cartService.addToCart(req.user._id, addToCartDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "customer")
  findOne(@Request() req) {
    return this.cartService.findOne(req.user._id);
  }

  @Patch(':flowerId/increase')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "customer")
  increase(@Param('flowerId') flowerId: string, @Request() req) {
    return this.cartService.increaseQuantity(req.user._id, flowerId);
  }

  @Patch(':flowerId/decrease')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "customer")
  decrease(@Param('flowerId') flowerId: string, @Request() req) {
    return this.cartService.decreaseQuantity(req.user._id, flowerId);
  }


  @Delete(':flowerId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "customer")
  async removeItem(@Request() req, @Param('flowerId') flowerId: string) {
    return this.cartService.removeItem(req.user._id, flowerId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  async clearCart(@Request() req) {
    return this.cartService.clearCart(req.user._id);
  }
}
