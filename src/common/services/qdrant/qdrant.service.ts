import { GoogleGenerativeAI } from "@google/generative-ai";
import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { QdrantClient } from "@qdrant/qdrant-js";

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
}