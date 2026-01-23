import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { QueryChatbotDto } from './dto/query-chatbot.dto';
import { SaveChatbotDto } from './dto/save-chatbot.dto';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  //chatbot generate service
  @Post('generate')
  async generateResponse(@Body() queryChatbotDto: QueryChatbotDto) {
    return this.chatbotService.getResponse(queryChatbotDto);
  }

  //chatbot save history service
  @Post('save')
  async saveChatHistory(@Body() saveChatbotDto: SaveChatbotDto){
    return this.chatbotService.saveChatHistory(saveChatbotDto);
  }

  //Sync data between Qdrant DB and MongoDB
  @Post('sync')
  syncData(){
    return this.chatbotService.syncDataVectorDB()
  }

  //delete chatbot history
  @Delete('history/:id')
  deleteChatbotHistory(@Param('id') sesstionId: string){
    return this.chatbotService.deleteChatbotHistory(sesstionId)
  }

}
