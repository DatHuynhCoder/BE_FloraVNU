import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, ParseIntPipe, Query } from '@nestjs/common';
import { FlowerService } from './flower.service';
import { CreateFlowerDto } from './dto/create-flower.dto';
import { UpdateFlowerDto } from './dto/update-flower.dto';
import { JwtAuthGuard } from '../auth/passport/jwt-auth.guard';
import { Roles } from '../../decorators/roles.decorator';
import { RolesGuard } from '../../guards/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { SearchFlowerDto } from './dto/search-flower.dto';

@Controller('flower')
export class FlowerController {
  constructor(private readonly flowerService: FlowerService) { }

  //Create a new flower
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('image'))
  create(@Body() createFlowerDto: CreateFlowerDto, @UploadedFile() image: Express.Multer.File) {
    return this.flowerService.create(createFlowerDto, image);
  }

  //Search flower
  @Get('/search')
  search(@Query() query: SearchFlowerDto){
    return this.flowerService.search(query);
  }

  //Get all occasions
  @Get('/occasions')
  getAllOccasions(){
    return this.flowerService.getAllOccasions();
  }

  //Get all types
  @Get('/types')
  getAllTypes(){
    return this.flowerService.getAllTypes();
  }

  //Get all forms
  @Get('/forms')
  getAllForms(){
    return this.flowerService.getAllForms();
  }

  @Get()
  findAll() {
    return this.flowerService.findAll();
  }

  //Get detail flower
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.flowerService.findOne(id);
  }

  //update a Flower
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Param('id') id: string,
    @Body() updateFlowerDto: UpdateFlowerDto,
    @UploadedFile() image?: Express.Multer.File
  ) {
    return this.flowerService.update(id, updateFlowerDto, image);
  }

  //Delete a Flower
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.flowerService.remove(id);
  }
}
