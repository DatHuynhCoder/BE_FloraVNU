import { Module } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { ChatbotController } from './chatbot.controller';
import { GeminiModule } from '../../common/services/gemini/gemini.module';
import { QdrantModule } from '../../common/services/qdrant/qdrant.module';
import { FlowerModule } from '../flower/flower.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatbotHistory, ChatbotHistorySchema } from './schemas/chatbot-history.schema';

@Module({
  imports:[
    MongooseModule.forFeature([{name: ChatbotHistory.name, schema: ChatbotHistorySchema}]),
    GeminiModule, 
    QdrantModule, 
    FlowerModule],
  controllers: [ChatbotController],
  providers: [ChatbotService],
})
export class ChatbotModule {}
