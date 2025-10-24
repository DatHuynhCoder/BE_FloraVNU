import { Injectable } from '@nestjs/common';
import { QueryChatbotDto } from './dto/query-chatbot.dto';
import { QdrantService } from '../../common/services/qdrant/qdrant.service';
import { FlowerService } from '../flower/flower.service';
import { GeminiService } from '../../common/services/gemini/gemini.service';
import { trimHTMLTags } from '../../utils/trimHTMLTags';

@Injectable()
export class ChatbotService {
  constructor(
    private readonly qdrantService: QdrantService,
    private readonly flowerService: FlowerService,
    private readonly geminiService: GeminiService
  ) { }

  async getResponse(queryChatDto: QueryChatbotDto) {
    const { query } = queryChatDto;
    //1. search similar flowers ids in Qdrant based on query
    const similarFlowerIds = await this.qdrantService.searchSimilarFlowers(query);

    //2. get full flowers info from mongoDB
    const similarFlowers = await this.flowerService.findByIds(similarFlowerIds);

    //3. Get flower context
    const contexts = similarFlowers.map(flower => {
      return `
        Tên hoa: ${flower.name},
        Mô tả: ${trimHTMLTags(flower.description)},
        Giá tiền: ${flower.price},
        Đánh giá: ${flower.rating},
        Dịp lễ: ${flower.occasion},
        Các loại hoa: ${flower.types.join(', ')},
        Kiểu dáng hoa: ${flower.form},
        Số lượng bán được: ${flower.quantitySold}
      `
    })

    //4. create promt
    const prompt = `
      Bạn là một trợ lý ảo tư vấn chuyên nghiệp và thân thiện của một cửa hàng hoa.
      Nhiệm vụ của bạn là trả lời câu hỏi của khách hàng dựa trên những thông tin sản phẩm có sẵn dưới đây.
      Hãy tư vấn một cách tự nhiên, không chỉ liệt kê thông tin.

      --- Bối cảnh thông tin sản phẩm ---
      ${contexts}
      --- Hết bối cảnh ---

      Câu hỏi của khách hàng: "${query}"

      Câu trả lời của bạn:
    `;

    //5. get response from Gemini API
    const response = await this.geminiService.generateResponse(prompt);

    return {
      data: response
    }
  }

  //ERROR UUID NOT COMPARTABLE WITH OBJECTID, NEED TO FIX LATER
  //Get all flowers data and embed to Qdrant
  async syncDataVectorDB() {
    //get all flowers
    const flowers = await this.flowerService.findAll();

    //for each flower we embedding it and send it to vectorDB
    for (const flower of flowers) {
      await this.qdrantService.embedAndStoreFlower(flower)
    }
    return {
      message: 'Đồng bộ dữ liệu thành công',
      count: flowers.length
    }
  }

}
