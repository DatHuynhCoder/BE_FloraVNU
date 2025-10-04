import { Module } from "@nestjs/common";
import { CloudinaryProvider } from "./cloudinary.provider";
import { CloudinaryService } from "./cloudinary.service";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports:[ConfigModule],
  providers: [CloudinaryProvider, CloudinaryService],
  exports: [CloudinaryProvider, CloudinaryService]
})
export class ClaudinaryModule {}