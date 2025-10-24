import { Module } from "@nestjs/common";
import { QdrantService } from "./qdrant.service";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports:[ConfigModule],
  providers: [QdrantService],
  exports: [QdrantService]
})
export class QdrantModule {}