import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '../auth/passport/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  //create a new comment
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin','customer')
  @UseInterceptors(FilesInterceptor('images'))
  create(@Request() req, @UploadedFiles() images: Array<Express.Multer.File> ,@Body() createCommentDto: CreateCommentDto) {
    const userId = req.user._id;
    return this.commentService.create(userId,images, createCommentDto);
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

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto) {
    return this.commentService.update(+id, updateCommentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.commentService.remove(+id);
  }
}
