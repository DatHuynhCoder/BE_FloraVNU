import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { QueryChatbotDto } from './dto/query-chatbot.dto';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  //chatbot generate service
  @Post('generate')
  async generateResponse(@Body() queryChatbotDto: QueryChatbotDto) {
    return this.chatbotService.getResponse(queryChatbotDto);
  }

  //Sync data between Qdrant DB and MongoDB
  @Post('sync')
  syncData(){
    return this.chatbotService.syncDataVectorDB()
  }

}
