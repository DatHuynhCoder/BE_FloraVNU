import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '../auth/passport/jwt-auth.guard';
import { Roles } from '../../decorators/roles.decorator';
import { RolesGuard } from '../../guards/roles.guard';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) { }

  //create a new comment
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'customer')
  @UseInterceptors(FilesInterceptor('images'))
  create(@Request() req, @UploadedFiles() images: Array<Express.Multer.File>, @Body() createCommentDto: CreateCommentDto) {
    const userId = req.user._id;
    return this.commentService.create(userId, images, createCommentDto);
  }

  //find all comments of a flower
  @Get(':flowerId')
  findAllByFlower(@Param('flowerId') flowerId: string) {
    return this.commentService.findAllByFlower(flowerId);
  }

  @Get()
  findOne() {
    return this.commentService.findOne(1);
  }

  //Update flower comment
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'customer')
  @UseInterceptors(FilesInterceptor('images'))
  update(
    @Param('id') id: string, 
    @Body() updateCommentDto: UpdateCommentDto,
    @Request() req,
    @UploadedFiles() images?: Array<Express.Multer.File>
  ){
    const userId = req.user._id;
    return this.commentService.update(id, userId, updateCommentDto, images);
  }

  //Delete a comment
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'customer')
  remove(@Param('id') id: string, @Request() req) {
    const userId = req.user._id;
    return this.commentService.remove(id, userId);
  }
}
