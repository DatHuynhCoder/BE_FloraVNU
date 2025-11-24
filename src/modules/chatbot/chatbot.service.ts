import { Injectable } from '@nestjs/common';
import { QueryChatbotDto } from './dto/query-chatbot.dto';
import { QdrantService } from '../../common/services/qdrant/qdrant.service';
import { FlowerService } from '../flower/flower.service';
import { GeminiService } from '../../common/services/gemini/gemini.service';
import { trimHTMLTags } from '../../utils/trimHTMLTags';
import { InjectModel } from '@nestjs/mongoose';
import { ChatbotHistory } from './schemas/chatbot-history.schema';
import { Model } from 'mongoose';

@Injectable()
export class ChatbotService {
  constructor(
    @InjectModel(ChatbotHistory.name) private ChatbotHistoryModel: Model<ChatbotHistory>,
    private readonly qdrantService: QdrantService,
    private readonly flowerService: FlowerService,
    private readonly geminiService: GeminiService
  ) { }

  async getResponse(queryChatDto: QueryChatbotDto) {
    const { query, sessionId } = queryChatDto;
    //1a. find if there is an existing session (meaning that we continue the same chat)
    const existingSession = await this.ChatbotHistoryModel.findOne({
      sessionId: sessionId
    })

    //1bif no existing session, create a new one
    let summary: string;
    if (!existingSession) {
      const newSession = new this.ChatbotHistoryModel({
        sessionId: sessionId,
        summary: 'Chưa có'
      })
      summary = 'Chưa có';
      await newSession.save();
    } else {
      summary = existingSession.summary;
    }

    //2. search similar flowers ids in Qdrant based on query
    const similarFlowerIds = await this.qdrantService.searchSimilarFlowers(query);

    //3. get full flowers info from mongoDB
    const similarFlowers = await this.flowerService.findByIds(similarFlowerIds);

    //4. Get flower context
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
    
    //5. create promt
    const prompt = `
      Bạn là một trợ lý ảo tư vấn chuyên nghiệp của cửa hàng hoa FLoraVNU.
      Nhiệm vụ của bạn là trả lời câu hỏi của khách hàng.

      --- HƯỚNG DẪN TRẢ LỜI ---
      1.  **Nếu câu hỏi của khách hàng có thể được trả lời bằng các sản phẩm hoa trong "Bối cảnh"**:
          * Trả lời cần xem xét đến "Tóm tắt đoạn hội thoại trước đó" nếu có.
          * Hãy xem xét TẤT CẢ các sản phẩm trong bối cảnh, ở đây có ${contexts.length} hoa.
          * Với MỖI sản phẩm phù hợp, hãy tạo một (1) card HTML theo mẫu.
          * **Trả về TẤT CẢ các card HTML nối tiếp nhau.**
          * **YÊU CẦU CỰC KỲ QUAN TRỌNG**:
            * Câu trả lời của bạn **CHỈ** được chứa mã HTML.
            * Nhớ thêm câu chào, giới thiệu trong mã HTML.
            * **KHÔNG** sử dụng ký tự xuống dòng (\\n).
            * **KHÔNG** sử dụng ký tự escape (dấu \\).
            * Trả về một chuỗi HTML thô, liền mạch.
          * Mỗi card phải bao gồm: ảnh (thẻ <img>), tên hoa, giá tiền, mô tả ngắn và một nút (thẻ <a>) để xem chi tiết.
          * Nút xem chi tiết phải có đường dẫn (href) theo định dạng: /flower-detail/[ID]
          * Sử dụng "ID hoa", "Link ảnh", "Tên hoa", "Mô tả" và "Giá tiền" từ bối cảnh.

          * **Mẫu HTML (Sử dụng mẫu Tailwind này):**
            <a href="/flower-detail/[ID]" class="block mt-2"><div class="flex max-w-70 items-center gap-2 overflow-hidden rounded-lg border border-gray-200 bg-white p-2 font-sans shadow-md transition-all duration-300 hover:-translate-y-1 hover:bg-[#ff69b422] hover:shadow-xl"><div class="h-full w-16 flex-shrink-0"><img src="[Link ảnh]" alt="[Tên hoa]" class="h-full w-full rounded-lg object-cover" /></div><div class="flex flex-col justify-between gap-0.5"><h3 class="line-clamp-1 text-sm font-semibold text-[#000000]">[Tên hoa]</h3><p class="line-clamp-2 text-xs text-gray-600">[Mô tả]</p><div class="flex items-end gap-0.5"><p class="line-clamp-1 text-xs font-medium text-[#FF0000]">[Giá tiền]</p><p class="line-clamp-1 text-xs font-medium text-[#FF0000]">VNĐ</p></div></div></div></a>

      2.  **Nếu câu hỏi là một lời chào, câu hỏi chung, hoặc không có sản phẩm nào trong "Bối cảnh" phù hợp**:
          * Hãy trả lời một cách tự nhiên, thân thiện, không dùng HTML.

      ---Tóm tắt đoạn hội thoại trước đó---
      ${summary}
      ---Hết tóm tắt---

      --- Bối cảnh thông tin sản phẩm ---
      ${contexts}
      --- Hết bối cảnh ---

      Câu hỏi của khách hàng: "${query}"

      Câu trả lời của bạn:
    `;

    //6. get response from Gemini API
    const response = await this.geminiService.generateResponse(prompt);
    const cleanResponse = trimHTMLTags(response)

    //7. Update summary based on query and response
    const newSummaryPrompt = `
      Tóm tắt ngắn gọn đoạn hội thoại giữa trợ lý ảo của cửa hàng hoa FLoraVNU và khách hàng dựa trên câu hỏi và câu trả lời gần nhất dưới đây:
      Đoạn tóm tắt hiện tại: "${summary}"
      Câu hỏi: "${query}"
      Câu trả lời: "${cleanResponse}"
      Yêu cầu: Tóm tắt ngắn gọn các thông tin quan trọng có thể hỏi ở những lần chat tiếp theo không quá 30 từ, tập trung vào ý chính của cuộc trò chuyện.
    `;
    const newSummary = await this.geminiService.generateResponse(newSummaryPrompt);
    await this.ChatbotHistoryModel.updateOne(
      { sessionId: sessionId },
      { summary: newSummary }
    )

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

  //Delete chatbot history by sessionId
  async deleteChatbotHistory(sessionId: string){
    await this.ChatbotHistoryModel.deleteOne({sessionId: sessionId});
    return {
      status: 'success',
      message: `Xóa lịch sử chatbot với sessionId: ${sessionId} thành công`
    }
  }

}
