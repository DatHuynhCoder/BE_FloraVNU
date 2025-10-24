import { Module } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { ChatbotController } from './chatbot.controller';
import { GeminiModule } from '../../common/services/gemini/gemini.module';
import { QdrantModule } from '../../common/services/qdrant/qdrant.module';
import { FlowerModule } from '../flower/flower.module';

@Module({
  imports:[GeminiModule, QdrantModule, FlowerModule],
  controllers: [ChatbotController],
  providers: [ChatbotService],
})
export class ChatbotModule {}
