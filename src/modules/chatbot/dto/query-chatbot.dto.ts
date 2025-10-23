import { IsString } from "class-validator";

export class QueryChatbotDto {
  @IsString()
  query: string;
}
