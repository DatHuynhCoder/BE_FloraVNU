import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { QueryChatbotDto } from './dto/query-chatbot.dto';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('query')
  async getChatbotResponse(@Body() queryChatbotDto: QueryChatbotDto) {
    return this.chatbotService.getResponse(queryChatbotDto.query);
  }

  @Post()
  create(@Body() queryChatbotDto: QueryChatbotDto) {
    return this.chatbotService.create(queryChatbotDto);
  }

  @Get()
  findAll() {
    return this.chatbotService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chatbotService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chatbotService.remove(+id);
  }
}
