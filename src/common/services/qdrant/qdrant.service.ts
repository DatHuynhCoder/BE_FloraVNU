import { GoogleGenerativeAI } from "@google/generative-ai";
import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { QdrantClient } from "@qdrant/qdrant-js";
import { FlowerDocument } from "../../../modules/flower/schemas/flower.schema"
import { trimHTMLTags } from "src/utils/trimHTMLTags";

@Injectable()
export class QdrantService implements OnModuleInit {
  private readonly client: QdrantClient;
  private readonly genAI: GoogleGenerativeAI;
  private readonly collectionName: string;

  constructor(
    private configService: ConfigService
  ) {
    this.client = new QdrantClient({
      url: this.configService.get<string>('QDRANT_URI'),
      apiKey: this.configService.get<string>('QDRANT_API_KEY')
    });

    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);

    const colName = this.configService.get<string>('QDRANT_COLLECTION_NAME')
    if (!colName) {
      throw new Error('QDRANT_COLLECTION_NAME is not set in environment variables');
    }
    this.collectionName = colName
  }

  //Initialized Collection on Qdrant DB
  async onModuleInit() {
    // get vector size from gemini model because it is same as embedding size for consistency
    const embeddingModel = this.genAI.getGenerativeModel({ model: 'gemini-embedding-001' })
    const embeddingInfo = await embeddingModel.embedContent("Check dimension")
    const vectorSize = embeddingInfo.embedding.values.length //Got 3072

    //Check if collection in qrant exists and has the 
    const collections = await this.client.getCollections();
    const collectionExists = collections.collections.some(col => col.name === this.collectionName);

    //if collection does not exist, create it
    if (!collectionExists) {
      console.log(`Creating Qdrant collection: ${this.collectionName} with vector size: ${vectorSize}`);
      await this.client.createCollection(
        this.collectionName,
        {
          vectors: {
            size: vectorSize,
            distance: "Cosine"
          }
        }
      )
    }
  }

  //Embidding the text and return the vector
  private async getEmbedding(text: string) {
    const embeddingModel = this.genAI.getGenerativeModel({ model: 'gemini-embedding-001' })
    const result = await embeddingModel.embedContent(text);
    return result.embedding.values;
  }

  //Vectorize FlowerInfo and store it on Qdrant DB
  async embedAndStoreFlower(flower: FlowerDocument) {
    const flowerTypes = flower.types.join(' ');
    const textToEmbed =
      `Tên hoa: ${flower.name}. 
       Mô tả: ${trimHTMLTags(flower.description)}. 
       Giá tiền: ${flower.price} . 
       Đánh giá: ${flower.rating}.
       Dịp lễ: ${flower.occasion}.
       Các loại hoa: ${flowerTypes}.
       Kiểu dáng hoa: ${flower.form}.
       Số lượng bán được: ${flower.quantitySold}
      `;
    
    //get vector by embedding flower info
    const vector = await this.getEmbedding(textToEmbed);

    //Insert vector into Qdrant DB
    await this.client.upsert(this.collectionName, {
      wait: true,
      points: [
        {
          id: flower._id.toString(),
          vector: vector,
          //Payload fields are used to filter
          payload: {
            price: flower.price,
            rating: flower.rating,
            stockQuantity: flower.stockQuantity,
            quantitySold: flower.quantitySold,
            numRating: flower.numRating
          }
        }
      ]
    })
    console.log(`Vector hóa và lưu hoa: ${flower.name} thành công`)
  }
  
  //Find flowers using vector similarity
  async searchSimilarFlowers(query: string, limit = 3) {
    //get vector by embedding query text
    const queryVector = await this.getEmbedding(query);

    const searchResult = await this.client.search(this.collectionName, {
      vector: queryVector,
      limit: limit,
      with_payload: false
    })

    //get only ids, then we get full flowers info by query them on mongoDB
    const result = searchResult.map((result) => result.id.toString());

    return result;
  }
}