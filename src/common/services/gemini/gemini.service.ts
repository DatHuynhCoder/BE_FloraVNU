import { GoogleGenerativeAI } from "@google/generative-ai";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class GeminiService {
  private genAI: GoogleGenerativeAI;

  constructor(private configService: ConfigService) {
    // Get the API key from environment variables
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  //generate response base on query text
  async generateResponse(prompt: string) {
    try {
      //choosing model
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      //generate response
      const response = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      })

      //return only text response
      return response.response.text();
    } catch (error) {
      console.error('Error generating response from Gemini:', error);
      return 'Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau.';
    }
  }
}