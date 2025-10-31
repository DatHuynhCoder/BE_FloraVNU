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
        ID hoa: ${flower._id},
        Tên hoa: ${flower.name},
        Link ảnh: ${flower.image.url},
        Mô tả: ${trimHTMLTags(flower.description)},
        Giá tiền: ${flower.price},
        Đánh giá: ${flower.rating},
        Dịp lễ: ${flower.occasion},
        Các loại hoa: ${flower.types.join(', ')},
        Kiểu dáng hoa: ${flower.form},
        Số lượng bán được: ${flower.quantitySold}
      `
    })

    console.log(contexts)

    //4. create promt
    const prompt = `
      Bạn là một trợ lý ảo tư vấn chuyên nghiệp của cửa hàng hoa FLoraVNU.
      Nhiệm vụ của bạn là trả lời câu hỏi của khách hàng.

      --- HƯỚNG DẪN TRẢ LỜI ---
      1.  **Nếu câu hỏi của khách hàng có thể được trả lời bằng các sản phẩm hoa trong "Bối cảnh"**:
          * Hãy xem xét TẤT CẢ các sản phẩm trong bối cảnh, ở đây có ${contexts.length} hoa.
          * Với MỖI sản phẩm phù hợp, hãy tạo một (1) card HTML theo mẫu.
          * **Trả về TẤT CẢ các card HTML nối tiếp nhau.**
          * **YÊU CẦU CỰC KỲ QUAN TRỌNG**:
            * Câu trả lời của bạn **CHỈ** được chứa mã HTML.
            * **KHÔNG** thêm bất kỳ văn bản giải thích, lời chào, hay ghi chú nào (ví dụ: "Đây là các sản phẩm...").
            * **KHÔNG** sử dụng ký tự xuống dòng (\\n).
            * **KHÔNG** sử dụng ký tự escape (dấu \\).
            * Trả về một chuỗi HTML thô, liền mạch.
          * Mỗi card phải bao gồm: ảnh (thẻ <img>), tên hoa, giá tiền, mô tả ngắn và một nút (thẻ <a>) để xem chi tiết.
          * Nút xem chi tiết phải có đường dẫn (href) theo định dạng: /flower-detail/[ID]
          * Sử dụng "ID", "Link ảnh", "Tên hoa", "Mô tả" và "Giá tiền" từ bối cảnh.

          * **Mẫu HTML (Sử dụng mẫu Tailwind này):**
            <div class="flex w-80 items-center px-2 overflow-hidden rounded-2xl border border-gray-200 bg-white font-sans shadow-lg transition-shadow duration-300 hover:shadow-xl"><div class="h-32 w-32 flex-shrink-0"><img src="[Link ảnh]" alt="[Tên hoa]" class="h-full w-full object-cover rounded-2xl" /></div><div class="flex flex-1 flex-col justify-between p-4"><div><h3 class="mb-1 line-clamp-2 text-lg font-semibold text-[#000000]">[Tên hoa]</h3><p class="mb-2 line-clamp-1 font-medium text-[#FF0000]">[Giá tiền]</p><p class="line-clamp-2 text-sm text-gray-600">[Mô tả]</p></div><a href="/flower-detail/[ID]" class="mt-3 inline-block w-fit rounded-md bg-[#FF69B5] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#E32C89]"> Xem chi tiết </a></div></div>

      2.  **Nếu câu hỏi là một lời chào, câu hỏi chung, hoặc không có sản phẩm nào trong "Bối cảnh" phù hợp**:
          * Hãy trả lời một cách tự nhiên, thân thiện, không dùng HTML.

      --- Bối cảnh thông tin sản phẩm ---
      ${contexts}
      --- Hết bối cảnh ---

      Câu hỏi của khách hàng: "${query}"

      Câu trả lời của bạn:
    `;

    //5. get response from Gemini API
    const response = await this.geminiService.generateResponse(prompt);

    return {
      status: "success",
      data: response
    }
  }

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
