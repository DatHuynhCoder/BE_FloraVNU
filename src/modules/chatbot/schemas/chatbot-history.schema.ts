import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

@Schema({ timestamps: true})
export class ChatbotHistory {
  // contains chat messages summary between user and chatbot
  @Prop({default: 'Chưa có'})
  summary: string

  @Prop({required: true})
  sessionId: string
}

export type ChatbotHistoryDocument = HydratedDocument<Comment>;
export const ChatbotHistorySchema = SchemaFactory.createForClass(ChatbotHistory)