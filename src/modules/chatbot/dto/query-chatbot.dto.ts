import { IsNotEmpty, IsString } from "class-validator";

export class QueryChatbotDto {
  @IsString()
  @IsNotEmpty()
  query: string;

  @IsString()
  @IsNotEmpty()
  sessionId: string;
}
